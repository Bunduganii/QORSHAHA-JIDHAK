import re
import uuid
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from ..database import SessionLocal
from ..models import EmailSubscription, Questionnaire, Payment

subscriptions_bp = Blueprint("subscriptions", __name__, url_prefix="/api")

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

@subscriptions_bp.route("/subscriptions", methods=["POST"])
def subscribe():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Fadlan geli email-kaaga (Email is required)"}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Fadlan geli email sax ah (Invalid email address)"}), 400

    db = SessionLocal()
    try:
        existing = db.query(EmailSubscription).filter_by(email=email).first()
        if existing:
            if existing.status == "unsubscribed":
                existing.status = "subscribed"
                existing.subscribed_at = datetime.now(timezone.utc)
                db.commit()
                return jsonify({
                    "success": True,
                    "message": "Waad ku mahadsan tahay! Diiwaangelintaada dib ayaa loo howlgaliyay."
                }), 200
            return jsonify({
                "success": True,
                "message": "Horey ayaad isu diiwaangelisay! Waad ku mahadsan tahay ku xirnaantaada."
            }), 200

        new_sub = EmailSubscription(
            id=f"sub-{uuid.uuid4().hex[:8]}",
            email=email,
            status="subscribed",
            subscribed_at=datetime.now(timezone.utc)
        )
        db.add(new_sub)
        db.commit()

        # Send welcome confirmation email
        try:
            from ..services.email_service import EmailService
            EmailService.send_welcome_email(email)
        except Exception as welcome_err:
            print(f"[WELCOME EMAIL] Notice: {welcome_err}")

        return jsonify({
            "success": True,
            "message": "Waad ku guuleysatay diiwaangelinta newsletter-ka! 🎉 Eeg email-kaaga."
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@subscriptions_bp.route("/subscriptions", methods=["GET"])
def get_subscribers():
    status = request.args.get("status", "all")
    search = request.args.get("q", "").strip().lower()

    db = SessionLocal()
    try:
        query = db.query(EmailSubscription)
        if status != "all":
            query = query.filter(EmailSubscription.status == status)
        if search:
            query = query.filter(EmailSubscription.email.ilike(f"%{search}%"))

        subs = query.order_by(EmailSubscription.subscribed_at.desc()).all()
        return jsonify([s.to_dict() for s in subs]), 200
    finally:
        db.close()

@subscriptions_bp.route("/admin/all-emails", methods=["GET"])
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
