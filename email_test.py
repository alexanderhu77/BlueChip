import smtplib
from email.mime.text import MIMEText

subject = "Email Subject"
body = "This is the body of the text message"
sender = "bluechipnotifs@gmail.com"
receivers = ["[email addresses]"]
password = "[Password]"

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