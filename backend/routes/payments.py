import random
import string
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from ..config import Config
from ..database import SessionLocal
from ..models import Plan, Questionnaire, Payment, CoachingAccess
from ..services.sifalo_service import SifaloService
from ..services.supabase_service import SupabaseService

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

def generate_order_id():
    year = datetime.now().year
    chars = "".join(random.choices("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", k=5))
    return f"FIT-{year}-{chars}"

def generate_access_code():
    chars = "".join(random.choices("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", k=6))
    return f"F{chars[:5]}"

def grant_coaching_access(db, payment, questionnaire, plan_name, plan_id=None):
    """
    Idempotently creates a CoachingAccess record when payment is confirmed PAID.
    """
    existing_access = db.query(CoachingAccess).filter_by(order_id=payment.order_id).first()
    if existing_access:
        return existing_access

    access_code = generate_access_code()
    while db.query(CoachingAccess).filter_by(access_code=access_code).first() is not None:
        access_code = generate_access_code()

    access = CoachingAccess(
        access_code=access_code,
        order_id=payment.order_id,
        payment_id=payment.id,
        questionnaire_id=questionnaire.id if questionnaire else None,
        plan_id=plan_id,
        status="ACTIVE"
    )
    db.add(access)
    db.commit()
    db.refresh(access)

    # Sync into Supabase payments table
    try:
        SupabaseService.insert_payment({
            "plan_name": plan_name,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "payment_method": payment.payment_method,
            "transaction_id": payment.order_id,
            "status": "success"
        })
    except Exception as s_err:
        print(f"[SUPABASE] Payment insert notice: {s_err}")

    return access

@payments_bp.route("/create", methods=["POST"])
def create_payment():
    data = request.get_json() or {}
    
    plan_id = data.get("plan_id")
    questionnaire_id = data.get("questionnaire_id")
    payment_method = data.get("payment_method", "EVC Plus")
    payment_phone = data.get("payment_phone") or data.get("account") or ""
    requested_currency = (data.get("currency") or "USD").upper()

    if not plan_id:
        return jsonify({"error": "Fadlan dooro qorshe (Plan is required)"}), 400
    if not questionnaire_id:
        return jsonify({"error": "Fadlan buuxi su'aalaha (Questionnaire is required)"}), 400

    db = SessionLocal()
    try:
        # 1. Validate Questionnaire
        questionnaire = db.query(Questionnaire).filter_by(id=questionnaire_id).first()
        if not questionnaire:
            return jsonify({"error": "Questionnaire not found"}), 404

        # 2. Validate Plan (check local DB or Supabase)
        plan = db.query(Plan).filter_by(id=plan_id).first()
        plan_name = "Premium Elite"
        plan_price = None
        plan_price_cash = None

        if plan:
            plan_name = plan.name
            plan_price = plan.price
            plan_price_cash = plan.price_cash
        else:
            s_plan = SupabaseService.get_plan(plan_id)
            if s_plan:
                plan_name = s_plan.get("name", "Premium Plan")
                plan_price = s_plan.get("price")
                plan_price_cash = s_plan.get("price_cash")

        has_usd = plan_price is not None and float(plan_price) > 0
        has_slsh = plan_price_cash is not None and float(plan_price_cash) > 0

        if requested_currency == "SLSH" and has_slsh:
            amount = float(plan_price_cash)
            currency = "SLSH"
        elif requested_currency == "USD" and has_usd:
            amount = float(plan_price)
            currency = "USD"
        elif has_slsh:
            amount = float(plan_price_cash)
            currency = "SLSH"
        elif has_usd:
            amount = float(plan_price)
            currency = "USD"
        else:
            amount = 10.0
            currency = "USD"

        # 3. Generate unique Order ID
        order_id = generate_order_id()
        while db.query(Payment).filter_by(order_id=order_id).first() is not None:
            order_id = generate_order_id()

        # 4. Save Payment as PENDING in DB
        payment = Payment(
            order_id=order_id,
            questionnaire_id=questionnaire.id,
            plan_id=plan.id if plan else None,
            customer_name=questionnaire.name,
            whatsapp_phone=questionnaire.whatsapp,
            payment_phone=payment_phone,
            customer_email=questionnaire.email or data.get("email"),
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            provider="SIFALO",
            payment_status="PENDING"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # 5. Call Sifalo Pay Gateway API
        clean_account = payment_phone or questionnaire.whatsapp
        amount_to_send = str(int(amount)) if currency in ["SLSH", "SOS"] else f"{amount:.2f}".rstrip('0').rstrip('.')
        
        sifalo_res = SifaloService.initiate_payment(
            account=clean_account,
            gateway=payment_method,
            amount=amount_to_send,
            currency=currency,
            order_id=order_id
        )

        sid = sifalo_res.get("sid")
        status = sifalo_res.get("status", "PENDING")
        raw = sifalo_res.get("raw", {})

        payment.provider_transaction_id = sid
        payment.raw_response = raw

        if status == "PAID":
            payment.payment_status = "PAID"
            payment.paid_at = datetime.now(timezone.utc)
            db.commit()
            
            # Grant Coaching Access & sync to Supabase
            access = grant_coaching_access(db, payment, questionnaire, plan_name, plan.id if plan else None)

            return jsonify({
                "success": True,
                "status": "PAID",
                "order_id": order_id,
                "access_code": access.access_code,
                "plan_name": plan_name,
                "amount": amount,
                "currency": currency,
                "customer_name": questionnaire.name,
                "whatsapp_phone": questionnaire.whatsapp,
                "payment_phone": payment_phone,
                "coach_whatsapp": Config.COACH_WHATSAPP,
                "message": "Payment confirmed and coaching access granted!"
            }), 200

        elif status == "PENDING":
            payment.payment_status = "PENDING"
            db.commit()
            return jsonify({
                "success": False,
                "pending": True,
                "status": "PENDING",
                "order_id": order_id,
                "sid": sid,
                "message": sifalo_res.get("message", "Codsiga waxaa loo diray talifoonkaaga. Geli PIN-kaaga.")
            }), 200

        elif status == "PAYMENT_REVIEW":
            payment.payment_status = "PAYMENT_REVIEW"
            db.commit()
            return jsonify({
                "success": False,
                "status": "PAYMENT_REVIEW",
                "order_id": order_id,
                "sid": sid,
                "message": "Lacag bixintaada waxaa lagu hubinayaa nidaamka."
            }), 200

        else:
            payment.payment_status = "FAILED"
            db.commit()
            return jsonify({
                "success": False,
                "status": "FAILED",
                "order_id": order_id,
                "message": sifalo_res.get("message", "Lacag bixinta waa ku guuldareysatay.")
            }), 400

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@payments_bp.route("/verify", methods=["POST"])
def verify_payment():
    """
    Verifies payment status with Sifalo and grants coaching access upon confirmed PAID.
    """
    data = request.get_json() or {}
    order_id = data.get("order_id")
    sid = data.get("sid")

    if not order_id:
        return jsonify({"error": "order_id is required"}), 400

    db = SessionLocal()
    try:
        payment = db.query(Payment).filter_by(order_id=order_id).first()
        if not payment:
            return jsonify({"error": "Payment record not found"}), 404

        plan_name = payment.plan.name if payment.plan else "Fitness Plan"

        # If already marked PAID, return access code directly (Idempotent!)
        if payment.payment_status == "PAID":
            access = grant_coaching_access(db, payment, payment.questionnaire, plan_name, payment.plan_id)
            return jsonify({
                "success": True,
                "status": "PAID",
                "order_id": payment.order_id,
                "access_code": access.access_code,
                "plan_name": plan_name,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "customer_name": payment.customer_name,
                "whatsapp_phone": payment.whatsapp_phone,
                "payment_phone": payment.payment_phone,
                "coach_whatsapp": Config.COACH_WHATSAPP
            }), 200

        # Query Sifalo Pay for latest transaction status
        clean_account = payment.payment_phone or payment.whatsapp_phone
        amount_to_send = str(int(payment.amount)) if payment.currency in ["SLSH", "SOS"] else f"{float(payment.amount):.2f}".rstrip('0').rstrip('.')
        
        sifalo_res = SifaloService.check_payment_status(
            order_id=payment.order_id,
            sid=sid or payment.provider_transaction_id,
            account=clean_account,
            gateway=payment.payment_method,
            amount=amount_to_send,
            currency=payment.currency
        )

        status = sifalo_res.get("status")
        if sifalo_res.get("sid"):
            payment.provider_transaction_id = sifalo_res.get("sid")
        if sifalo_res.get("raw"):
            payment.raw_response = sifalo_res.get("raw")

        if status == "PAID":
            payment.payment_status = "PAID"
            payment.paid_at = datetime.now(timezone.utc)
            db.commit()

            access = grant_coaching_access(db, payment, payment.questionnaire, plan_name, payment.plan_id)
            return jsonify({
                "success": True,
                "status": "PAID",
                "order_id": payment.order_id,
                "access_code": access.access_code,
                "plan_name": plan_name,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "customer_name": payment.customer_name,
                "whatsapp_phone": payment.whatsapp_phone,
                "payment_phone": payment.payment_phone,
                "coach_whatsapp": Config.COACH_WHATSAPP
            }), 200

        elif status == "FAILED":
            payment.payment_status = "FAILED"
            db.commit()
            return jsonify({
                "success": False,
                "status": "FAILED",
                "order_id": payment.order_id,
                "message": sifalo_res.get("message", "Payment failed")
            }), 200

        else:
            return jsonify({
                "success": False,
                "pending": True,
                "status": payment.payment_status,
                "order_id": payment.order_id,
                "message": "Payment still pending"
            }), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@payments_bp.route("/status/<order_id>", methods=["GET"])
def get_payment_status(order_id):
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter_by(order_id=order_id).first()
        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        access_code = payment.coaching_access.access_code if payment.coaching_access else None

        return jsonify({
            "order_id": payment.order_id,
            "status": payment.payment_status,
            "plan_name": payment.plan.name if payment.plan else "",
            "amount": float(payment.amount),
            "currency": payment.currency,
            "payment_method": payment.payment_method,
            "access_code": access_code,
            "coach_whatsapp": Config.COACH_WHATSAPP,
            "created_at": payment.created_at.isoformat() if payment.created_at else None,
            "paid_at": payment.paid_at.isoformat() if payment.paid_at else None
        }), 200
    finally:
        db.close()

@payments_bp.route("/webhook", methods=["POST"])
def sifalo_webhook():
    """
    Webhook handler for asynchronous Sifalo callback notifications.
    """
    payload = request.get_json() or {}
    order_id = payload.get("order_id")
    code = str(payload.get("code", ""))
    sid = payload.get("sid") or payload.get("transactionId")

    if not order_id:
        return jsonify({"received": True, "note": "No order_id in payload"}), 200

    db = SessionLocal()
    try:
        payment = db.query(Payment).filter_by(order_id=order_id).first()
        if payment:
            is_paid = (code == "601") or (code == "200") or ("processed" in str(payload.get("response", "")).lower())
            if is_paid and payment.payment_status != "PAID":
                payment.payment_status = "PAID"
                payment.paid_at = datetime.now(timezone.utc)
                if sid:
                    payment.provider_transaction_id = sid
                payment.raw_response = payload
                db.commit()
                plan_name = payment.plan.name if payment.plan else "Fitness Plan"
                grant_coaching_access(db, payment, payment.questionnaire, plan_name, payment.plan_id)
        return jsonify({"received": True}), 200
    finally:
        db.close()
