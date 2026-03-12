import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
import asyncio
from dotenv import load_dotenv

# Try to load if not already in memory
load_dotenv()

logger = logging.getLogger("medichain")

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
if SMTP_PASSWORD:
    # Remove any spaces provided by the user just in case
    SMTP_PASSWORD = SMTP_PASSWORD.replace(" ", "")

async def send_otp_email(to_email: str, otp: str):
    # Re-evaluate in case they were injected later
    current_email = os.getenv("SMTP_EMAIL", SMTP_EMAIL)
    current_pass = os.getenv("SMTP_PASSWORD", SMTP_PASSWORD)

    if not current_email or not current_pass:
        logger.error("SMTP credentials not configured. Cannot send OTP.")
        raise Exception("Email service not configured on server (missing SMTP_EMAIL/PASSWORD in .env).")

    # Clean the password just in case
    clean_pass = current_pass.replace(" ", "")

    # Using thread pool to avoid blocking the async event loop during SMTP communication
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_email_sync, to_email, otp, current_email, clean_pass)

def _send_email_sync(to_email: str, otp: str, email_user: str, email_pass: str):
    msg = MIMEMultipart()
    msg['From'] = f"MediChain <{email_user}>"
    msg['To'] = to_email
    msg['Subject'] = f"{otp} is your MediChain verification code"

    html = f"""
    <html>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
        <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 5px solid #0d9488;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">MediChain Login</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">Please use the following single-use verification code to log in to your account:</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center; border: 1px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0d9488; display: inline-block;">
              {otp}
            </span>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 14px;">If you did not request this code, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© {datetime.now().year if 'datetime' in globals() else '2025'} MediChain — AI Health Council</p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(html, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_user, email_pass)
        server.send_message(msg)
        server.quit()
        logger.info(f"OTP successfully sent to {{to_email}}")
    except Exception as e:
        logger.error(f"Failed to send email to {{to_email}}: {{e}}")
        raise e
