import base64
import requests
from ..config import Config

class SifaloService:
    @staticmethod
    def get_auth_header() -> str:
        creds = f"{Config.SIFALO_USER}:{Config.SIFALO_KEY}"
        b64 = base64.b64encode(creds.encode("utf-8")).decode("utf-8")
        return f"Basic {b64}"

    @staticmethod
    def normalize_gateway(raw: str = "") -> str:
        if not raw:
            return "waafi"
        g = raw.lower().replace(" ", "").replace("-", "").replace("_", "")
        # waafi handles Zaad, EVC Plus, Sahal, Premier Wallet
        if any(x in g for x in ["zaad", "evc", "evcplus", "sahal", "waafi", "premier"]):
            return "waafi"
        if "edahab" in g:
            return "edahab"
        if "card" in g or "visa" in g or "mastercard" in g:
            return "card"
        return g

    @staticmethod
    def clean_phone_account(account: str) -> str:
        cleaned = "".join([c for c in str(account) if c.isdigit()])
        if cleaned.startswith("0"):
            cleaned = cleaned[1:]
        if not cleaned.startswith("252") and len(cleaned) <= 10:
            cleaned = "252" + cleaned
        return cleaned

    @classmethod
    def initiate_payment(cls, account: str, gateway: str, amount: str, currency: str, order_id: str) -> dict:
        """
        Sends payment request to Sifalo Pay Gateway API.
        """
        norm_gateway = cls.normalize_gateway(gateway)
        clean_acc = cls.clean_phone_account(account) if norm_gateway != "card" else str(account).replace(" ", "")

        payload = {
            "account": clean_acc,
            "gateway": norm_gateway,
            "amount": str(amount),
            "currency": currency,
            "order_id": order_id
        }

        headers = {
            "Authorization": cls.get_auth_header(),
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        try:
            # Sifalo may hold open connection for USSD PIN entry (up to 120s)
            response = requests.post(
                Config.SIFALO_URL,
                json=payload,
                headers=headers,
                timeout=120
            )
            response_data = response.json() if response.content else {}
            code = str(response_data.get("code", ""))
            resp_msg = str(response_data.get("response", ""))
            sid = response_data.get("sid") or response_data.get("transactionId") or response_data.get("requestId")

            is_paid = (code == "601") or (code == "200") or ("processed" in resp_msg.lower())
            is_pending = (code == "0") or (code == "603") or ("pending" in resp_msg.lower())

            if is_paid:
                return {
                    "success": True,
                    "status": "PAID",
                    "code": code,
                    "sid": sid,
                    "message": resp_msg or "Payment completed successfully",
                    "raw": response_data
                }
            elif is_pending:
                return {
                    "success": False,
                    "status": "PENDING",
                    "code": code,
                    "sid": sid,
                    "message": "Codsiga waxaa loo diray talifoonkaaga. Fadlan geli PIN-kaaga.",
                    "raw": response_data
                }
            else:
                return {
                    "success": False,
                    "status": "FAILED",
                    "code": code or "600",
                    "sid": sid,
                    "message": resp_msg or "Lacag bixinta waa ku guuldareysatay.",
                    "raw": response_data
                }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "status": "PAYMENT_REVIEW",
                "code": "TIMEOUT",
                "message": "Codsiga lacag bixinta wuxuu qaatay wakhti dheer. Waxaa lagu hubin doonaa nidaamka.",
                "raw": {"error": "timeout"}
            }
        except Exception as e:
            return {
                "success": False,
                "status": "FAILED",
                "code": "ERROR",
                "message": str(e),
                "raw": {"error": str(e)}
            }

    @classmethod
    def check_payment_status(cls, order_id: str, sid: str = None, account: str = None, gateway: str = "waafi", amount: str = "10", currency: str = "USD") -> dict:
        """
        Polls or checks transaction status with Sifalo Pay.
        """
        norm_gateway = cls.normalize_gateway(gateway)
        clean_acc = cls.clean_phone_account(account) if account else "252630000000"

        payload = {
            "account": clean_acc,
            "gateway": norm_gateway,
            "amount": str(amount),
            "currency": currency,
            "order_id": order_id
        }
        if sid:
            payload["sid"] = sid

        headers = {
            "Authorization": cls.get_auth_header(),
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        try:
            response = requests.post(
                Config.SIFALO_URL,
                json=payload,
                headers=headers,
                timeout=15
            )
            response_data = response.json() if response.content else {}
            code = str(response_data.get("code", ""))
            resp_msg = str(response_data.get("response", ""))
            res_sid = response_data.get("sid") or sid

            is_paid = (code == "601") or (code == "200") or ("processed" in resp_msg.lower())
            is_pending = (code == "0") or (code == "603")

            if is_paid:
                return {
                    "success": True,
                    "status": "PAID",
                    "code": code,
                    "sid": res_sid,
                    "message": resp_msg or "Payment confirmed",
                    "raw": response_data
                }
            elif is_pending:
                return {
                    "success": False,
                    "status": "PENDING",
                    "code": code,
                    "sid": res_sid,
                    "message": "Waiting for PIN authorization",
                    "raw": response_data
                }
            else:
                return {
                    "success": False,
                    "status": "FAILED",
                    "code": code,
                    "sid": res_sid,
                    "message": resp_msg or "Payment failed or cancelled",
                    "raw": response_data
                }
        except Exception as e:
            return {
                "success": False,
                "status": "PENDING",
                "message": str(e),
                "raw": {"error": str(e)}
            }
