import requests
import urllib3
import time
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ====== CONFIGURATION =======

load_dotenv('config.env')

MIRTH_SERVER = os.getenv('MIRTH_SERVER')
USERNAME = os.getenv('MIRTH_USERNAME')
PASSWORD = os.getenv('MIRTH_PASSWORD')
CHANNEL_ID = os.getenv('CHANNEL_ID')

# ====== CONNECTION SETUP =======
session = requests.Session()
session.auth = (USERNAME, PASSWORD)
session.verify = False  # Disable SSL certificate checking


def get_message_count():
    url = f"{MIRTH_SERVER}/api/channels/statistics"
    headers = {
        "Content-Type": "application/json",
        "X-Requested-With": "OpenAPI",
        "Accept": "application/json"
    }

    response = session.get(url, json={}, headers=headers)
    response.raise_for_status()

    stats = response.json()  # returns {"list": {"channelStatistics": [ { ... }, { ... } ] }}
    channels = stats.get("list", {}).get("channelStatistics", [])

    for ch in channels:
        if ch.get("channelId") == CHANNEL_ID:
            return ch.get("received", 0)
    
    return 0  # If channelId not found


def get_latest_message():
    url = f"{MIRTH_SERVER}/api/channels/{CHANNEL_ID}/messages"
    headers = {
        "X-Requested-With": "OpenAPI",
        "Accept": "application/json"
    }
    params = {
        "limit": 1,
        "offset": 0,
        "sortField": "receivedDate",
        "sortOrder": "DESCENDING",
        "includeContent": "true"  # Include raw content in the response
    }

    response = session.get(url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()
    message_obj = data.get("list", {}).get("message", {})
    if message_obj:
        # Now safely access "connectorMessages" to get the HL7 content
        connector_messages = message_obj.get("connectorMessages", {}).get("entry", [])
        for entry in connector_messages:
            connector_message = entry.get("connectorMessage", {})
            raw_content = connector_message.get("raw", {}).get("content")
            if raw_content:
                return raw_content
    print("No HL7 message found in the latest message.")
    return None

def send_email(subject, body, sender, receivers, password):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(receivers)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, receivers, msg.as_string())
    print("Message sent!")

def send_push_notification(message):
    #Will also send email notification with push_notification
    pushover_token = os.getenv('PUSHOVER_TOKEN')
    pushover_user = os.getenv('PUSHOVER_USER')
    
    payload = {
        "token": pushover_token,
        "user": pushover_user,
        "message": message
    }
    
    response = requests.post("https://api.pushover.net/1/messages.json", data=payload)
    if response.status_code == 200:
        print("Push notification sent!")
    else:
        print(f"Failed to send notification: {response.text}")

    #Send Email Portion

    EMAIL_SENDER = os.getenv("EMAIL_SENDER", "").strip()
    EMAIL_RECEIVERS = os.getenv("EMAIL_RECEIVERS", "").strip().strip()
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "").strip()

    subject = "ALERT: Abnormal Vitals Detected"
    body = f"ALERT: {message}"
    sender = EMAIL_SENDER
    receivers = [email.strip() for email in EMAIL_RECEIVERS.split(',')]
    password = EMAIL_PASSWORD

    send_email(subject, body, sender, receivers, password)



def parse_vitals(hl7_message):
    results = []
    lines = hl7_message.replace('\n', '\r').strip().split('\r') 
    patient_name = "Unknown Patient"  # default in case not found

    for line in lines:
        fields = line.split('|')

        if fields[0] == 'PID' and len(fields) > 5:
            raw_name = fields[5]  # PID-5
            name_parts = raw_name.split('^')
            if len(name_parts) >= 2:
                patient_name = f"{name_parts[1]} {name_parts[0]}"  # John Doe format
            else:
                patient_name = raw_name  # fallback

    for line in lines:
        fields = line.split('|')
        if fields[0] == 'OBX':
            test_name = fields[3]      # e.g., "HR^Heart Rate"
            value = fields[5]          # e.g., "78"
            units = fields[6]          # e.g., "bpm"
            normal_range = fields[7]   # e.g., "60-100"

            # Now check if value is within normal range
            if '-' in normal_range:
                low, high = normal_range.split('-')
                try:
                    low = float(low)
                    high = float(high)
                    value_num = float(value)

                    if value_num < low or value_num > high:
                        status = "ALERT"
                        print(f"ALERT: {patient_name}: {test_name} is {value} {units} (Normal: {normal_range})")
                        send_push_notification(f"{patient_name} - ABNORMAL VITALS: {test_name} is {value} {units} (Normal: {normal_range})")
                        
                    else:
                        status = "Normal"
                        print(f"Normal: {patient_name}: {test_name} is {value} {units} (Normal: {normal_range})")
                except ValueError:
                    status = "Invalid Number Format"
            else:
                status = "No Range Info"

            results.append({
                "Test": test_name,
                "Value": value,
                "Units": units,
                "Normal Range": normal_range,
                "Status": status
            })

    return results



# ====== MAIN LOOP =======
last_count = get_message_count()
print(f"Starting message count: {last_count}")


while True:
    time.sleep(5)  # Check every 5 seconds
    current_count = get_message_count()
    if current_count > last_count:
        print(f"\n New message detected on MockEKG! (Total received: {current_count}) \n")

        # Fetch the latest HL7 message
        hl7_message = get_latest_message()
        vitals = parse_vitals(hl7_message)
        last_count = current_count
    else:
        print("No new messages...")
