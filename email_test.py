import smtplib
from email.mime.text import MIMEText

from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="config.env")

EMAIL_SENDER = os.getenv("EMAIL_SENDER", "").strip()
EMAIL_RECEIVERS = os.getenv("EMAIL_RECEIVERS", "").strip().strip()
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "").strip()

subject = "Email Subject"
body = "This is the body of the text message 3"
sender = EMAIL_SENDER
receivers = [email.strip() for email in EMAIL_RECEIVERS.split(',')]
password = EMAIL_PASSWORD

def send_email(subject, body, sender, receivers, password):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(receivers)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, receivers, msg.as_string())
    print("Message sent!")

send_email(subject, body, sender, receivers, password)