import requests
from ..config import Config

class SupabaseService:
    @staticmethod
    def get_headers():
        return {
            "apikey": Config.SUPABASE_KEY,
            "Authorization": f"Bearer {Config.SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    @classmethod
    def get_plan(cls, plan_id: str):
        try:
            url = f"{Config.SUPABASE_URL}/rest/v1/plans?id=eq.{plan_id}"
            res = requests.get(url, headers=cls.get_headers(), timeout=5)
            if res.status_code == 200 and res.json():
                return res.json()[0]
        except Exception as e:
            print(f"[SUPABASE] Error fetching plan {plan_id}: {e}")
        return None

    @classmethod
    def get_all_plans(cls):
        try:
            url = f"{Config.SUPABASE_URL}/rest/v1/plans?select=*"
            res = requests.get(url, headers=cls.get_headers(), timeout=5)
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            print(f"[SUPABASE] Error fetching all plans: {e}")
        return []

    @classmethod
    def insert_payment(cls, payload: dict):
        try:
            url = f"{Config.SUPABASE_URL}/rest/v1/payments"
            res = requests.post(url, headers=cls.get_headers(), json=payload, timeout=5)
            if res.status_code in [200, 201]:
                return res.json()
        except Exception as e:
            print(f"[SUPABASE] Error inserting payment: {e}")
        return None
