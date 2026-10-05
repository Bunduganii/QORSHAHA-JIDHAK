import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from ..config import Config

class EmailService:
    @staticmethod
    def is_brevo_configured() -> bool:
        return bool(Config.BREVO_API_KEY and Config.BREVO_API_KEY.strip())

    @staticmethod
    def is_smtp_configured() -> bool:
        return bool(Config.GMAIL_USER and Config.GMAIL_PASS)

    @classmethod
    def send_notification(cls, to_email: str, subject: str, html_content: str, text_content: str = "") -> dict:
        """
        Sends an email via Brevo REST API (preferred) or SMTP fallback.
        Returns status dictionary: { success: bool, provider: str, message/error: str }.
        """
        if not to_email or "@" not in to_email:
            return {"success": False, "provider": "NONE", "error": "Invalid recipient email address"}

        # 1. Try Brevo API first if configured
        if cls.is_brevo_configured():
            try:
                brevo_url = "https://api.brevo.com/v3/smtp/email"
                headers = {
                    "api-key": Config.BREVO_API_KEY.strip(),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
                sender_email = Config.BREVO_SENDER_EMAIL or Config.GMAIL_USER or "info@qorshahajidhka.com"
                sender_name = Config.BREVO_SENDER_NAME or "Coach Naasir | Qorshaha Jidhka"

                payload = {
                    "sender": {
                        "name": sender_name,
                        "email": sender_email
                    },
                    "to": [
                        {"email": to_email.strip()}
                    ],
                    "subject": subject,
                    "htmlContent": html_content,
                    "textContent": text_content or subject
                }

                res = requests.post(brevo_url, headers=headers, json=payload, timeout=10)
                if res.status_code in [200, 201, 202]:
                    res_data = res.json() if res.content else {}
                    message_id = res_data.get("messageId", "ok")
                    return {
                        "success": True,
                        "provider": "BREVO",
                        "message_id": message_id,
                        "message": f"Delivered via Brevo to {to_email}"
                    }
                else:
                    err_msg = res.text
                    print(f"[BREVO] Delivery failed ({res.status_code}): {err_msg}")
                    # Attempt SMTP fallback below
            except Exception as b_err:
                print(f"[BREVO] Exception sending to {to_email}: {b_err}")
                # Attempt SMTP fallback below

        # 2. Try SMTP fallback if configured
        if cls.is_smtp_configured():
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                sender_email = Config.GMAIL_USER
                sender_name = Config.COACH_NAME or "Coach Naasir"
                msg["From"] = f"{sender_name} <{sender_email}>"
                msg["To"] = to_email

                if text_content:
                    msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                server = smtplib.SMTP("smtp.gmail.com", 587, timeout=12)
                server.starttls()
                server.login(Config.GMAIL_USER, Config.GMAIL_PASS)
                server.sendmail(Config.GMAIL_USER, to_email, msg.as_string())
                server.quit()

                return {
                    "success": True,
                    "provider": "SMTP",
                    "message": f"Email delivered via SMTP to {to_email}"
                }
            except Exception as s_err:
                print(f"[SMTP] Delivery error to {to_email}: {s_err}")
                return {
                    "success": False,
                    "provider": "SMTP",
                    "error": str(s_err)
                }

        # 3. Neither Brevo nor SMTP configured — log simulated delivery gracefully
        print(f"[EMAIL SERVICE] Simulated dispatch to {to_email} (Subject: '{subject}') — configured Brevo or SMTP in .env for live dispatch.")
        return {
            "success": True,
            "simulated": True,
            "provider": "SIMULATED",
            "message": "Email delivery queued/recorded (Add BREVO_API_KEY in .env for live Brevo delivery)"
        }

    @classmethod
    def notify_subscribers_about_article(cls, subscribers: list, article: dict, db=None) -> dict:
        """
        Sends a new article notification email to a list of subscribers.
        Logs each dispatch to the PostgreSQL notification_logs table.
        """
        from ..models import NotificationLog

        site_url = Config.SITE_URL.rstrip("/")
        slug = article.get("slug", "")
        article_url = f"{site_url}/blog/{slug}"
        title = article.get("title", "")
        excerpt = article.get("excerpt", "")

        subject = f"Maqaal Cusub: {title} — Qorshaha Jidhka"

        # Content formatted strictly according to Section 19 of Master Instructions:
        # Qorshaha Jidhka / New article published / [Article title] / [Short excerpt] / Read Article
        html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>{title}</title></head>
<body style="margin: 0; padding: 0; background-color: #070b14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e2eaf2;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b14; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0d1c29; border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          <!-- HEADER -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(180deg, rgba(0,217,255,0.08), transparent); border-bottom: 1px solid rgba(0,217,255,0.1);">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #00d9ff; text-transform: uppercase;">Qorshaha Jidhka</h1>
              <p style="margin: 6px 0 0; font-size: 11px; font-weight: 700; color: #00ffa6; letter-spacing: 2px; text-transform: uppercase;">Performance Journal • New Article Published</p>
            </td>
          </tr>
          <!-- BODY -->
          <tr>
            <td style="padding: 32px;">
              <span style="display: inline-block; background: rgba(0,217,255,0.1); border: 1px solid rgba(0,217,255,0.3); color: #00d9ff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">
                Cilmi Jimicsi & Cunto
              </span>
              <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.4;">
                {title}
              </h2>
              <p style="margin: 0 0 24px; font-size: 14.5px; color: #9ab4c4; line-height: 1.65;">
                {excerpt}
              </p>
              <!-- CTA BUTTON -->
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00d9ff, #00ffa6);">
                    <a href="{article_url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 900; color: #070b14; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                      Read Article →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 32px; background-color: #07111a; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #4a5568; line-height: 1.5;">
                Waxaad fariintan ku heshay sababtoo ah waxaad iska diiwaangelisay <strong>Qorshaha Jidhka Dispatch</strong>.<br>
                © 2026 Qorshaha Jidhka High Performance. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

        text_body = f"""QORSHAHA JIDHKA
New Article Published

{title}

{excerpt}

Read Article: {article_url}
"""

        results = []
        for sub in subscribers:
            email_addr = sub.get("email") if isinstance(sub, dict) else (sub.email if hasattr(sub, "email") else str(sub))
            sub_id = sub.get("id") if isinstance(sub, dict) else (sub.id if hasattr(sub, "id") else None)

            if email_addr and "@" in email_addr:
                res = cls.send_notification(email_addr, subject, html_body, text_body)
                results.append({"email": email_addr, "status": res})

                # Record in PostgreSQL notification_logs
                if db:
                    try:
                        log_entry = NotificationLog(
                            article_id=article.get("id"),
                            subscriber_id=sub_id,
                            recipient_email=email_addr,
                            provider=res.get("provider", "BREVO"),
                            status="sent" if res.get("success") else "failed",
                            sent_at=datetime.now(timezone.utc) if res.get("success") else None,
                            error=res.get("error")
                        )
                        db.add(log_entry)
                        db.commit()
                    except Exception as log_err:
                        db.rollback()
                        print(f"[NOTIFICATION LOG] Error logging dispatch: {log_err}")

        return {
            "total": len(subscribers),
            "dispatched": len(results),
            "results": results
        }

    @classmethod
    def send_welcome_email(cls, to_email: str) -> dict:
        """
        Sends an automated confirmation/welcome email to new newsletter subscribers.
        """
        site_url = Config.SITE_URL.rstrip("/")
        blog_url = f"{site_url}/blog"
        subject = "Ku Soo Dhawoow Qorshaha Jidhka Newsletter! 🎉"

        html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: #070b14; color: #e2eaf2; font-family: sans-serif; padding: 25px;">
  <div style="max-width: 560px; margin: 0 auto; background: #0d1c29; border: 1px solid rgba(0,217,255,0.25); border-radius: 14px; padding: 28px;">
    <h2 style="color: #00d9ff; margin-top: 0;">QORSHAHA JIDHKA</h2>
    <h3 style="color: #00ffa6;">Waad ku mahadsan tahay inaad is diiwaangelisay! ✅</h3>
    <p style="color: #9ab4c4; font-size: 14px; line-height: 1.6;">
      Diiwaangelintaada newsletter-ka waa la xaqiijiyay. Waxaad hadda wixii ka dambeeya si toos ah email-kaaga ugu heli doontaa:
    </p>
    <ul style="color: #c8d4dc; font-size: 13.5px; line-height: 1.8;">
      <li>Protocols-ka ugu dambeeyay ee dhismaha murqaha (Hypertrophy)</li>
      <li>Xisaabinta protein-ka iyo qorsheynta cuntada saxda ah</li>
      <li>Cilmiga nasashada, hurdada iyo soo kabashada</li>
    </ul>
    <div style="margin-top: 24px;">
      <a href="{blog_url}" style="background: linear-gradient(135deg, #00d9ff, #00ffa6); color: #020d14; font-weight: 800; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; display: inline-block;">
        Booqo Blog-ka & Protocols-ka →
      </a>
    </div>
  </div>
</body>
</html>"""

        text_body = f"Ku soo dhawoow Qorshaha Jidhka Newsletter!\n\nDiiwaangelintaada waa la xaqiijiyay.\nBooqo blog-ka: {blog_url}"
        return cls.send_notification(to_email, subject, html_body, text_body)

    @classmethod
    def send_payment_confirmation(cls, to_email: str, customer_name: str, plan_name: str, access_code: str, amount: float, currency: str, coach_whatsapp: str) -> dict:
        """
        Sends an automated payment confirmation and coaching access code to the client.
        """
        if not to_email or "@" not in to_email:
            return {"success": False, "error": "No valid email"}

        subject = f"Lacag Bixintaada Waa La Xaqiijiyay — {plan_name} | Qorshaha Jidhka"
        price_str = f"${amount}" if currency == "USD" else f"{int(amount):,} SLSH"
        wa_url = f"https://wa.me/{coach_whatsapp}?text=Salaan%20Coach%20Naasir%2C%20waxaan%20bixiyay%20lacagtii%20qorshaha%20{plan_name}.%20Access%20Code-kaygu%20waa%20{access_code}"

        html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: #070b14; color: #e2eaf2; font-family: sans-serif; padding: 25px;">
  <div style="max-width: 560px; margin: 0 auto; background: #0d1c29; border: 1px solid rgba(0,255,166,0.3); border-radius: 14px; padding: 28px;">
    <h2 style="color: #00d9ff; margin-top: 0;">QORSHAHA JIDHKA</h2>
    <h3 style="color: #00ffa6;">Lacag Bixintaadu Waa Guuleysatay! ✅</h3>
    <p style="color: #9ab4c4; font-size: 14px; line-height: 1.6;">
      Salaan <strong>{customer_name}</strong>, lacag bixintaadii qorshaha <strong>{plan_name}</strong> ({price_str}) waa la xaqiijiyay.
    </p>
    <div style="background: rgba(0,217,255,0.08); border: 1px solid rgba(0,217,255,0.25); border-radius: 10px; padding: 18px; margin: 20px 0; text-align: center;">
      <div style="font-size: 11px; color: #8f9ca7; text-transform: uppercase; letter-spacing: 1px;">Access Code-kaaga Gaarka Ah:</div>
      <div style="font-size: 28px; font-weight: 900; color: #00d9ff; font-family: monospace; letter-spacing: 4px; margin-top: 6px;">{access_code}</div>
    </div>
    <p style="color: #c8d4dc; font-size: 13.5px;">
      Guji badhanka hoose si aad toos ugu bilowdo tababarkaaga WhatsApp-ka Coach Naasir:
    </p>
    <div style="margin-top: 20px;">
      <a href="{wa_url}" style="background: #25d366; color: #ffffff; font-weight: 800; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block;">
        📱 La Xiriir Coach WhatsApp-ka →
      </a>
    </div>
  </div>
</body>
</html>"""

        text_body = f"Salaan {customer_name},\n\nLacag bixintaada {plan_name} ({price_str}) waa la xaqiijiyay.\nAccess Code: {access_code}\n\nLa xiriir Coach: {wa_url}"
        return cls.send_notification(to_email, subject, html_body, text_body)
