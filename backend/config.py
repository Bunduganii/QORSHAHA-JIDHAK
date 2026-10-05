import os
from dotenv import load_dotenv

# Load .env file from project root or backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "qorshaha-jidhka-fitness-super-secret-2026-key")
    JWT_SECRET = os.getenv("JWT_SECRET", "qorshaha-jwt-secret-999")
    
    # PostgreSQL / Database URL
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        os.getenv("POSTGRES_URL", "sqlite:///qorshaha_jidhka.db")
    )

    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://carssqvvbepwooapmrge.supabase.co")
    SUPABASE_KEY = os.getenv(
        "SUPABASE_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcnNzcXZ2YmVwd29vYXBtcmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ2OTksImV4cCI6MjA5MDQzMDY5OX0.KsfynWXeK434uoHXBpshGZNiemCiuuypj2cCgP5hsAM"
    )
    
    # Sifalo Pay Credentials
    SIFALO_USER = os.getenv("SIFALO_USER", "su_ly1oib6u")
    SIFALO_KEY = os.getenv("SIFALO_KEY", "sp_srv5v0e3upvjknj539dkdekk0")
    SIFALO_URL = os.getenv("SIFALO_URL", "https://api.sifalopay.com/gateway/")
    
    # Coach WhatsApp Contact & Email
    COACH_WHATSAPP = os.getenv("COACH_WHATSAPP", "252672025632")
    COACH_NAME = os.getenv("COACH_NAME", "Coach Naasir")
    GMAIL_USER = os.getenv("GMAIL_USER", "hamsesaedsnm@gmail.com")
    GMAIL_PASS = os.getenv("GMAIL_PASS", "")
    
    # Server port
    PORT = int(os.getenv("PORT", 5000))
