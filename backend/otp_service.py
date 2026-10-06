import os
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone

def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"

def get_expiry_iso(minutes: int = 5) -> str:
    return (datetime.now(timezone.utc) + timedelta(minutes=minutes)).isoformat()

def send_otp_email(to_email: str, otp: str, purpose: str = "register") -> dict:
    smtp_email = os.environ.get("SMTP_EMAIL", "").strip()
    smtp_password = os.environ.get("SMTP_APP_PASSWORD", "").replace(" ", "").strip()
    
    action_text = "verify your email address and activate your account" if purpose == "register" else "reset your password"
    title_text = "Email Verification" if purpose == "register" else "Password Reset Request"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 24px; color: #172130; }}
        .card {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e1e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(20, 35, 59, 0.08); }}
        .header {{ background: #14233b; padding: 28px 24px; text-align: center; }}
        .brand {{ color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }}
        .badge {{ display: inline-block; background: #e9bd4f; color: #14233b; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-left: 6px; }}
        .content {{ padding: 32px 28px; }}
        h2 {{ margin: 0 0 12px; font-size: 22px; color: #14233b; }}
        p {{ margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #5a6a85; }}
        .otp-box {{ background: #f0f5fe; border: 2px dashed #2c6ee8; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-family: 'DM Mono', monospace, Consolas, Courier; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2c6ee8; }}
        .expiry-note {{ font-size: 12px; color: #8896ab; margin-top: 8px; }}
        .footer {{ background: #fafbfc; border-top: 1px solid #eef2f6; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">⚡ Digital Logic Simulation Suite <span class="badge">SECURE</span></div>
        </div>
        <div class="content">
          <h2>{title_text}</h2>
          <p>Hello,</p>
          <p>Use the following 6-digit One-Time Password (OTP) to {action_text}:</p>
          <div class="otp-box">
            <div class="otp-code">{otp}</div>
            <div class="expiry-note">⏱️ Valid for 5 minutes only. Do not share this code with anyone.</div>
          </div>
          <p>If you did not make this request, please safely ignore this email.</p>
        </div>
        <div class="footer">
          Digital Electronics Simulation Suite &copy; 2026
        </div>
      </div>
    </body>
    </html>
    """

    if not smtp_email or not smtp_password or "your-email" in smtp_email:
        # Fallback for development when SMTP credentials are not yet set
        print(f"\n=======================================================")
        print(f"[OTP SIMULATOR - NO SMTP CONFIGURED]")
        print(f"To: {to_email}")
        print(f"Purpose: {purpose}")
        print(f"Generated OTP: >>> {otp} <<< (Expires in 5 minutes)")
        print(f"=======================================================\n")
        return {"sent": False, "simulated": True, "otp": otp}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{otp}] Your Digital Electronics Lab Verification Code"
        msg["From"] = f"Digital Electronics Lab <{smtp_email}>"
        msg["To"] = to_email

        part_plain = MIMEText(f"Your verification code is: {otp}. It is valid for 5 minutes.", "plain")
        part_html = MIMEText(html_content, "html")

        msg.attach(part_plain)
        msg.attach(part_html)

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=6)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())
        server.quit()
        return {"sent": True, "simulated": False}
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
        # Return fallback status
        return {"sent": False, "error": str(e), "otp": otp}
