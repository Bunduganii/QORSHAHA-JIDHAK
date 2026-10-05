import random
import string
from flask import Blueprint, jsonify, request
from ..database import SessionLocal
from ..models import Questionnaire

questionnaires_bp = Blueprint("questionnaires", __name__, url_prefix="/api/questionnaires")

def generate_client_code():
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"CLI-{chars}"

@questionnaires_bp.route("", methods=["POST"])
def save_questionnaire():
    data = request.get_json() or {}
    
    name = (data.get("name") or "").strip()
    whatsapp = (data.get("whatsapp") or "").strip()
    email = (data.get("email") or "").strip()
    
    if not name:
        return jsonify({"error": "Magaca waa khasab (Name is required)"}), 400
    if not whatsapp:
        return jsonify({"error": "Lambarka WhatsApp-ka waa khasab (WhatsApp number is required)"}), 400
    
    db = SessionLocal()
    try:
        # Check if an existing questionnaire with the same client_id or questionnaire_id was passed to update
        existing_id = data.get("questionnaire_id") or data.get("id")
        q = None
        if existing_id:
            q = db.query(Questionnaire).filter_by(id=existing_id).first()
        
        if not q:
            client_id = generate_client_code()
            while db.query(Questionnaire).filter_by(client_id=client_id).first() is not None:
                client_id = generate_client_code()
                
            q = Questionnaire(
                client_id=client_id,
                name=name,
                whatsapp=whatsapp,
                email=email or None,
                gender=data.get("gender"),
                goal=data.get("goal"),
                weight=data.get("weight"),
                unit=data.get("unit", "kg"),
                height=data.get("height"),
                height_unit=data.get("height_unit", "cm"),
                challenge=data.get("challenge"),
                birth_date=data.get("birth_date")
            )
            db.add(q)
        else:
            q.name = name
            q.whatsapp = whatsapp
            if email:
                q.email = email
            q.gender = data.get("gender", q.gender)
            q.goal = data.get("goal", q.goal)
            q.weight = data.get("weight", q.weight)
            q.unit = data.get("unit", q.unit)
            q.height = data.get("height", q.height)
            q.height_unit = data.get("height_unit", q.height_unit)
            q.challenge = data.get("challenge", q.challenge)
            q.birth_date = data.get("birth_date", q.birth_date)
        
        db.commit()
        db.refresh(q)
        
        return jsonify({
            "success": True,
            "questionnaire_id": q.id,
            "client_id": q.client_id,
            "data": q.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@questionnaires_bp.route("/<q_id>", methods=["GET"])
def get_questionnaire(q_id):
    db = SessionLocal()
    try:
        q = db.query(Questionnaire).filter((Questionnaire.id == q_id) | (Questionnaire.client_id == q_id)).first()
        if not q:
            return jsonify({"error": "Questionnaire not found"}), 404
        return jsonify(q.to_dict()), 200
    finally:
        db.close()
