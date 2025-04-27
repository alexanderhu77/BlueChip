from flask import Flask, request, jsonify
from hl7.client import MLLPClient
from hl7apy.core import Message, Segment
import time
from flask_cors import CORS  

app = Flask(__name__)
CORS(app) 

HOST, PORT = 'localhost', 6661  # where MirthConnect TCP Listener is

def make_oru_r01(spo2, hr, bp_sys, bp_dia, temp_celsius, rr):
    msg = Message("ORU_R01")
    msg.msh.msh_1 = '|'
    msg.msh.msh_2 = '^~\\&'
    msg.msh.msh_3 = 'EKG_MACHINE'
    msg.msh.msh_4 = 'CardiologyDept'
    msg.msh.msh_5 = 'HIS'
    msg.msh.msh_6 = 'MainHospital'
    msg.msh.msh_7 = time.strftime('%Y%m%d%H%M%S')
    msg.msh.msh_9 = 'ORU^R01'
    msg.msh.msh_10 = str(int(time.time()))
    msg.msh.msh_11 = 'P'
    msg.msh.msh_12 = '2.5'

    pid = Segment('PID', msg)
    pid.pid_1 = '1'
    pid.pid_5 = 'Doe^John'
    pid.pid_7 = '19800101'
    pid.pid_8 = 'M'
    msg.add(pid)

    obr = Segment('OBR', msg)
    obr.obr_1 = '1'
    obr.obr_4 = 'EKG^Electrocardiogram'
    msg.add(obr)

    def obx(seq, name, val, units, normal):
        obx = Segment('OBX', msg)
        obx.obx_1 = str(seq)
        obx.obx_2 = 'NM'
        obx.obx_3 = name
        obx.obx_5 = str(val)
        obx.obx_6 = units
        obx.obx_7 = normal
        msg.add(obx)

    obx(1, 'HR^Heart Rate', hr, 'bpm', '60-100')
    obx(2, 'SpO2^Oxygen Saturation', spo2, '%', '95-100')
    obx(3, 'BP_SYS^Systolic Blood Pressure', bp_sys, 'mmHg', '90-120')
    obx(4, 'BP_DIA^Diastolic Blood Pressure', bp_dia, 'mmHg', '60-80')
    obx(5, 'TEMP^Body Temperature', temp_celsius, 'C', '36.0-37.5')
    obx(6, 'RR^Respiratory Rate', rr, 'breaths/min', '12-20')

    return msg.to_er7().encode('utf-8')

@app.route('/send-hl7', methods=['POST'])
def send_hl7():
    print("HEADERS:", request.headers)
    print("RAW BODY:", request.data)
    print("IS JSON:", request.is_json)

    if not request.is_json:
        return jsonify({'error': 'Request content type must be application/json'}), 400

    data = request.get_json()
    print("PARSED JSON:", data)

    required_fields = ['heartRate', 'bpSys', 'bpDia', 'spo2', 'temperature', 'respiratoryRate']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing fields'}), 400


    # Extract vitals from request
    spo2 = data['spo2']
    heart_rate = data['heartRate']
    bp_sys = data['bpSys']
    bp_dia = data['bpDia']
    temperature = data['temperature']
    respiratory_rate = data['respiratoryRate']

    print(f"Received Vitals: HR={heart_rate} bpm, BP={bp_sys}/{bp_dia} mmHg, SpO₂={spo2}%, Temp={temperature}°C, RR={respiratory_rate} bpm")

    hl7_packet = make_oru_r01(
        spo2,
        heart_rate,
        bp_sys,
        bp_dia,
        temperature,
        respiratory_rate
    )

    try:
        client = MLLPClient(HOST, PORT)
        ack = client.send_message(hl7_packet)
        print(f"HL7 message sent to MirthConnect successfully. ACK: {ack.decode(errors='ignore')}")
        return jsonify({'message': 'HL7 message sent!', 'ack': ack.decode(errors='ignore')})
    except Exception as e:
        print(f"Error sending HL7: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000)
