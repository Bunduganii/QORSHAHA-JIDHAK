import uuid
from flask import Blueprint, jsonify, request
from ..database import SessionLocal
from ..models import Plan
from ..services.supabase_service import SupabaseService

plans_bp = Blueprint("plans", __name__, url_prefix="/api/plans")

@plans_bp.route("", methods=["GET"])
def get_plans():
    # 1. Try fetching from Supabase
    supabase_plans = SupabaseService.get_all_plans()
    if supabase_plans:
        return jsonify(supabase_plans), 200

    # 2. Fallback to local DB
    db = SessionLocal()
    try:
        plans = db.query(Plan).order_by(Plan.created_at.asc()).all()
        return jsonify([p.to_dict() for p in plans]), 200
    finally:
        db.close()

@plans_bp.route("/<plan_id>", methods=["GET"])
def get_plan(plan_id):
    # 1. Try Supabase
    s_plan = SupabaseService.get_plan(plan_id)
    if s_plan:
        return jsonify(s_plan), 200

    # 2. Try local DB
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter_by(id=plan_id).first()
        if not plan:
            return jsonify({"error": "Plan not found"}), 404
        return jsonify(plan.to_dict()), 200
    finally:
        db.close()

@plans_bp.route("", methods=["POST"])
def create_plan():
    data = request.get_json() or {}
    name = (data.get("name") or data.get("title") or "").strip()
    if not name:
        return jsonify({"error": "Plan name is required"}), 400

    tier = data.get("tier") or data.get("category") or "Standard"
    price_val = data.get("price")
    price_cash_val = data.get("price_cash")

    price = float(price_val) if price_val not in [None, ""] else None
    price_cash = float(price_cash_val) if price_cash_val not in [None, ""] else None

    # Must have at least one price (USD or SLSH)
    if price is None and price_cash is None:
        return jsonify({"error": "At least one price (USD or Shilling) is required"}), 400

    features = data.get("features") or []
    if isinstance(features, list):
        features = [f.strip() for f in features if isinstance(f, str) and f.strip()]

    plan_id = data.get("id") or str(uuid.uuid4())

    db = SessionLocal()
    try:
        existing = db.query(Plan).filter_by(id=plan_id).first()
        if existing:
            existing.name = name
            existing.tier = tier
            existing.price = price
            existing.price_cash = price_cash
            existing.duration = data.get("duration", "1 Bishii")
            existing.description = data.get("description", "")
            existing.features = features
            existing.popular = bool(data.get("popular", False))
            db.commit()
            db.refresh(existing)
            return jsonify(existing.to_dict()), 200
        else:
            new_plan = Plan(
                id=plan_id,
                name=name,
                tier=tier,
                price=price,
                price_cash=price_cash,
                currency="USD" if price else "SLSH",
                duration=data.get("duration", "1 Bishii"),
                description=data.get("description", ""),
                features=features,
                popular=bool(data.get("popular", False))
            )
            db.add(new_plan)
            db.commit()
            db.refresh(new_plan)
            return jsonify(new_plan.to_dict()), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@plans_bp.route("/<plan_id>", methods=["DELETE"])
def delete_plan(plan_id):
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter_by(id=plan_id).first()
        if not plan:
            return jsonify({"error": "Plan not found"}), 404
        db.delete(plan)
        db.commit()
        return jsonify({"success": True, "message": "Plan deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
