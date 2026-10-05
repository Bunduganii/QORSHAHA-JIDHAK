from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .database import init_db
from .routes.plans import plans_bp
from .routes.questionnaires import questionnaires_bp
from .routes.payments import payments_bp
from .routes.admin import admin_bp
from .routes.articles import articles_bp
from .routes.subscriptions import subscriptions_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend (Vite default localhost:5173, etc.)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize Database Tables & Seed Default Data
    with app.app_context():
        try:
            init_db()
            print("[SERVER] PostgreSQL Database Initialized Successfully.")
        except Exception as e:
            print(f"[SERVER] Database initialization notice: {e}")

    # Register Blueprints
    app.register_blueprint(plans_bp)
    app.register_blueprint(questionnaires_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(articles_bp)
    app.register_blueprint(subscriptions_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "Qorshaha Jidhka API Backend",
            "status": "online",
            "engine": "Flask + PostgreSQL"
        }), 200

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy"}), 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=True) 
