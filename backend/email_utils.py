import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

class EmailUtils:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
            MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
            MAIL_FROM=os.getenv("MAIL_FROM"),
            MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
            MAIL_SERVER=os.getenv("MAIL_SERVER"),
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.fm = FastMail(self.conf)

    async def send_password_reset_email(self, email: EmailStr, token: str):
        frontend_url = os.getenv("CLIENT_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        html = f"""
        <p>Hello,</p>
        <p>You requested a password reset for your Smart Learning Platform account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Smart Learning Platform Team</p>
        """

        message = MessageSchema(
            subject="Password Reset Request",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        try:
            await self.fm.send_message(message)
            print(f"Email sent successfully to {email}")
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

email_utils = EmailUtils()
