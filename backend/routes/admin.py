from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from sqlalchemy import or_, and_
from ..database import SessionLocal, hash_password
from ..models import AdminUser, Payment, Questionnaire, Plan, CoachingAccess, EmailSubscription
from .payments import grant_coaching_access

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter_by(email=email).first()
        hashed = hash_password(password)

        if not admin or admin.password_hash != hashed:
            return jsonify({"error": "Email ama password waa khalad"}), 401

        return jsonify({
            "success": True,
            "user": {
                "id": admin.id,
                "email": admin.email,
                "full_name": admin.full_name,
                "role": admin.role
            }
        }), 200
    finally:
        db.close()

@admin_bp.route("/stats", methods=["GET"])
def get_admin_stats():
    """
    Returns dashboard overview stats: revenue, client counts, plan distributions.
    """
    db = SessionLocal()
    try:
        payments = db.query(Payment).all()
        questionnaires_count = db.query(Questionnaire).count()
        active_coaching_count = db.query(CoachingAccess).filter_by(status="ACTIVE").count()

        total_usd = sum([float(p.amount) for p in payments if p.payment_status == "PAID" and p.currency == "USD"])
        total_cash = sum([float(p.amount) for p in payments if p.payment_status == "PAID" and p.currency == "SLSH"])
        paid_clients = len([p for p in payments if p.payment_status == "PAID"])
        pending_payments = len([p for p in payments if p.payment_status == "PENDING"])
        review_payments = len([p for p in payments if p.payment_status == "PAYMENT_REVIEW"])

        plan_counts = {}
        for p in payments:
            name = p.plan.name if p.plan else "Custom"
            plan_counts[name] = plan_counts.get(name, 0) + 1

        method_counts = {}
        for p in payments:
            method_counts[p.payment_method] = method_counts.get(p.payment_method, 0) + 1

        return jsonify({
            "totalRevenueUSD": total_usd,
            "totalRevenueCash": total_cash,
            "totalClients": questionnaires_count,
            "paidClients": paid_clients,
            "activeCoaching": active_coaching_count,
            "pendingPayments": pending_payments,
            "reviewPayments": review_payments,
            "planCounts": plan_counts,
            "methodCounts": method_counts
        }), 200
    finally:
        db.close()

@admin_bp.route("/payments", methods=["GET"])
def get_payments():
    """
    Multi-field searchable payments list.
    Query params:
      q: searches Order ID, Access Code, Payment Phone, Customer Name, or Provider Tx ID
      status: filter by PAID, PENDING, PAYMENT_REVIEW, FAILED, ALL
      method: filter by payment method
    """
    search = request.args.get("q", "").strip()
    status_filter = request.args.get("status", "ALL").strip().upper()
    method_filter = request.args.get("method", "ALL").strip()

    db = SessionLocal()
    try:
        query = db.query(Payment)

        # Apply Status Filter
        if status_filter and status_filter != "ALL":
            query = query.filter(Payment.payment_status == status_filter)

        # Apply Method Filter
        if method_filter and method_filter != "ALL":
            query = query.filter(Payment.payment_method.ilike(f"%{method_filter}%"))

        # Apply Multi-Field Search
        if search:
            query = query.outerjoin(CoachingAccess, Payment.id == CoachingAccess.payment_id).filter(
                or_(
                    Payment.order_id.ilike(f"%{search}%"),
                    Payment.customer_name.ilike(f"%{search}%"),
                    Payment.payment_phone.ilike(f"%{search}%"),
                    Payment.whatsapp_phone.ilike(f"%{search}%"),
                    Payment.provider_transaction_id.ilike(f"%{search}%"),
                    CoachingAccess.access_code.ilike(f"%{search}%")
                )
            )

        payments = query.order_by(Payment.created_at.desc()).limit(100).all()
        return jsonify([p.to_dict() for p in payments]), 200
    finally:
        db.close()

@admin_bp.route("/coach-access/<access_code>", methods=["GET"])
def get_coach_client_by_access_code(access_code):
    """
    Coach Quick Lookup: Coach Naasir enters customer access code and gets full customer profile,
    questionnaire answers, and payment details.
    """
    clean_code = (access_code or "").strip().upper()
    if not clean_code:
        return jsonify({"error": "Access code is required"}), 400

    db = SessionLocal()
    try:
        coaching = db.query(CoachingAccess).filter_by(access_code=clean_code).first()
        if not coaching:
            return jsonify({"error": "Access code not found or invalid"}), 404

        return jsonify(coaching.to_dict()), 200
    finally:
        db.close()

@admin_bp.route("/payments/<order_id>/status", methods=["PATCH"])
def update_payment_status(order_id):
    """
    Manual payment status update by Admin (e.g. resolving PAYMENT_REVIEW to PAID).
    """
    data = request.get_json() or {}
    new_status = data.get("status", "").strip().upper()

    allowed = ["PAID", "PENDING", "PAYMENT_REVIEW", "FAILED", "CANCELLED"]
    if new_status not in allowed:
        return jsonify({"error": f"Invalid status. Must be one of {allowed}"}), 400

    db = SessionLocal()
    try:
        payment = db.query(Payment).filter_by(order_id=order_id).first()
        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        payment.payment_status = new_status
        if new_status == "PAID":
            if not payment.paid_at:
                payment.paid_at = datetime.now(timezone.utc)
            # Idempotently grant coaching access
            grant_coaching_access(db, payment, payment.questionnaire, payment.plan.name if payment.plan else "Fitness Plan", payment.plan_id)
        db.commit()

        return jsonify({
            "success": True,
            "order_id": payment.order_id,
            "payment_status": payment.payment_status,
            "access_code": payment.coaching_access.access_code if payment.coaching_access else None
        }), 200
    finally:
        db.close()

@admin_bp.route("/all-emails", methods=["GET"])
def get_all_collected_emails():
    """
    Returns aggregated distinct emails collected from:
    1. Subscriptions
    2. Questionnaires / Google Sign-ins
    3. Payments
    """
    search = request.args.get("q", "").strip().lower()
    source_filter = request.args.get("source", "all")

    db = SessionLocal()
    try:
        email_map = {}

        # 1. Questionnaire / Google auth emails
        q_records = db.query(Questionnaire).filter(Questionnaire.email.isnot(None)).all()
        for q in q_records:
            em = q.email.strip().lower() if q.email else ""
            if em and "@" in em:
                if em not in email_map or (q.created_at and email_map[em]["date"] < q.created_at.isoformat()):
                    email_map[em] = {
                        "email": em,
                        "name": q.name,
                        "whatsapp": q.whatsapp,
                        "source": "Questionnaire",
                        "date": q.created_at.isoformat() if q.created_at else None,
                        "is_subscriber": False
                    }

        # 2. Payment emails
        pay_records = db.query(Payment).filter(Payment.customer_email.isnot(None)).all()
        for p in pay_records:
            em = p.customer_email.strip().lower() if p.customer_email else ""
            if em and "@" in em:
                if em not in email_map:
                    email_map[em] = {
                        "email": em,
                        "name": p.customer_name,
                        "whatsapp": p.whatsapp_phone,
                        "source": "Payment Checkout",
                        "date": p.created_at.isoformat() if p.created_at else None,
                        "is_subscriber": False
                    }

        # 3. Subscriptions
        subs = db.query(EmailSubscription).all()
        for s in subs:
            em = s.email.strip().lower()
            if em:
                if em in email_map:
                    email_map[em]["is_subscriber"] = (s.status == "subscribed")
                    if email_map[em]["source"] != "Questionnaire":
                        email_map[em]["source"] = "Newsletter & Checkout"
                else:
                    email_map[em] = {
                        "email": em,
                        "name": "Subscriber",
                        "whatsapp": "—",
                        "source": "Newsletter Subscription",
                        "date": s.subscribed_at.isoformat() if s.subscribed_at else None,
                        "is_subscriber": (s.status == "subscribed")
                    }

        all_emails = list(email_map.values())

        # Filtering
        if source_filter != "all":
            all_emails = [e for e in all_emails if source_filter.lower() in e["source"].lower()]

        if search:
            all_emails = [
                e for e in all_emails 
                if search in e["email"] or search in (e["name"] or "").lower() or search in (e["whatsapp"] or "")
            ]

        # Sort newest first
        all_emails.sort(key=lambda x: x["date"] or "", reverse=True)

        return jsonify({
            "total_count": len(all_emails),
            "emails": all_emails
        }), 200
    finally:
        db.close()
