from backend.app import app
from backend.config import Config

if __name__ == "__main__":
    print(f"Starting Qorshaha Jidhka Backend on http://localhost:{Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)
