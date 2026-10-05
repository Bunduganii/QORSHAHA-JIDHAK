import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import Config

# Public site URL — set SITE_URL in .env for production (e.g. https://qorshahajidhka.com)
SITE_URL = os.getenv("SITE_URL", "http://localhost:5173")

class EmailService:
    @staticmethod
    def is_configured() -> bool:
        return bool(Config.GMAIL_USER and Config.GMAIL_PASS)

    @classmethod
    def send_notification(cls, to_email: str, subject: str, html_content: str, text_content: str = "") -> dict:
        """
        Sends an email via SMTP if credentials are configured in .env.
        Returns status dictionary.
        """
        if not cls.is_configured():
            print(f"[EMAIL SERVICE] Simulation/Log: Notification to {to_email} with subject '{subject}' queued (SMTP not configured).")
            return {
                "success": True,
                "simulated": True,
                "message": "Email delivery queued/recorded (Add GMAIL_PASS in .env to enable live delivery)"
            }

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{Config.COACH_NAME} <{Config.GMAIL_USER}>"
            msg["To"] = to_email

            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)

            # Connect via SSL or TLS
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
            server.starttls()
            server.login(Config.GMAIL_USER, Config.GMAIL_PASS)
            server.sendmail(Config.GMAIL_USER, to_email, msg.as_string())
            server.quit()

            return {
                "success": True,
                "simulated": False,
                "message": f"Email delivered to {to_email}"
            }
        except Exception as e:
            print(f"[EMAIL SERVICE] Delivery error to {to_email}: {e}")
            return {
                "success": False,
                "simulated": False,
                "error": str(e)
            }

    @classmethod
    def notify_subscribers_about_article(cls, subscribers: list, article: dict) -> dict:
        """
        Sends a new article notification email to a list of subscribers.
        """
        subject = f"Maqaal Cusub: {article.get('title')} — Qorshaha Jidhka"
        title = article.get("title", "")
        excerpt = article.get("excerpt", "")
        slug = article.get("slug", "")
        article_url = f"http://localhost:5173/blog/{slug}"

        html_body = f"""
        <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #e6edf3; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #00d9ff; margin: 0;">Qorshaha Jidhka</h1>
                <p style="color: #8b949e; margin: 5px 0 0 0;">Fitness & Nutrition Insights</p>
            </div>
            <div style="background-color: #161b22; padding: 25px; border-radius: 8px; border: 1px solid #30363d;">
                <h2 style="color: #00ffa6; margin-top: 0;">{title}</h2>
                <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6;">{excerpt}</p>
                <div style="margin-top: 25px;">
                    <a href="{article_url}" style="background: linear-gradient(135deg, #00d9ff, #00ffa6); color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                        Akhri Maqaalka Buuxa →
                    </a>
                </div>
            </div>
            <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #8b949e;">
                Waxaad fariintan ku heshay sababtoo ah waxaad iska diiwaangelisay Qorshaha Jidhka Newsletter.
            </div>
        </div>
        """

        text_body = f"{title}\n\n{excerpt}\n\nAkhri maqaalka: {article_url}"

        results = []
        for sub in subscribers:
            email_addr = sub.get("email") if isinstance(sub, dict) else sub
            if email_addr:
                res = cls.send_notification(email_addr, subject, html_body, text_body)
                results.append({"email": email_addr, "status": res})

        return {
            "total": len(subscribers),
            "dispatched": len(results),
            "results": results
        }
