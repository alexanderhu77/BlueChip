import random, time
from hl7.client import MLLPClient
from hl7apy.core import Message, Segment   # if you still want to build messages via hl7apy

HOST, PORT = 'localhost', 6661  # MockEKG server
INTERVAL_MS = 5000

def make_oru_r01(spo2, hr, bp_sys, bp_dia, temp_celsius, rr):
    msg = Message("ORU_R01")

    # MSH Segment
    msg.msh.msh_1 = '|'
    msg.msh.msh_2 = '^~\&'
    msg.msh.msh_3 = 'EKG_MACHINE'
    msg.msh.msh_4 = 'CardiologyDept'
    msg.msh.msh_5 = 'HIS'
    msg.msh.msh_6 = 'MainHospital'
    msg.msh.msh_7 = time.strftime('%Y%m%d%H%M%S')
    msg.msh.msh_9 = 'ORU^R01'
    msg.msh.msh_10 = str(random.randint(100000, 999999))
    msg.msh.msh_11 = 'P'
    msg.msh.msh_12 = '2.5'

    # PID Segment
    pid = Segment('PID', msg)
    pid.pid_1 = '1'
    pid.pid_5 = 'Doe^John'
    pid.pid_7 = '19800101'
    pid.pid_8 = 'M'

    # OBR Segment
    obr = Segment('OBR', msg)
    obr.obr_1 = '1'
    obr.obr_4 = 'EKG^Electrocardiogram'

    # OBX - Heart Rate
    obx_hr = Segment('OBX', msg)
    obx_hr.obx_1 = '1'
    obx_hr.obx_2 = 'NM'
    obx_hr.obx_3 = 'HR^Heart Rate'
    obx_hr.obx_5 = str(hr)
    obx_hr.obx_6 = 'bpm'
    obx_hr.obx_7 = '60-100'

    # OBX - SpO2
    obx_spo2 = Segment('OBX', msg)
    obx_spo2.obx_1 = '2'
    obx_spo2.obx_2 = 'NM'
    obx_spo2.obx_3 = 'SpO2^Oxygen Saturation'
    obx_spo2.obx_5 = str(spo2)
    obx_spo2.obx_6 = '%'
    obx_spo2.obx_7 = '95-100'

    # OBX - Blood Pressure Systolic
    obx_bp_sys = Segment('OBX', msg)
    obx_bp_sys.obx_1 = '3'
    obx_bp_sys.obx_2 = 'NM'
    obx_bp_sys.obx_3 = 'BP_SYS^Systolic Blood Pressure'
    obx_bp_sys.obx_5 = str(bp_sys)
    obx_bp_sys.obx_6 = 'mmHg'
    obx_bp_sys.obx_7 = '90-120'

    # OBX - Blood Pressure Diastolic
    obx_bp_dia = Segment('OBX', msg)
    obx_bp_dia.obx_1 = '4'
    obx_bp_dia.obx_2 = 'NM'
    obx_bp_dia.obx_3 = 'BP_DIA^Diastolic Blood Pressure'
    obx_bp_dia.obx_5 = str(bp_dia)
    obx_bp_dia.obx_6 = 'mmHg'
    obx_bp_dia.obx_7 = '60-80'

    # OBX - Body Temperature
    obx_temp = Segment('OBX', msg)
    obx_temp.obx_1 = '5'
    obx_temp.obx_2 = 'NM'
    obx_temp.obx_3 = 'TEMP^Body Temperature'
    obx_temp.obx_5 = str(temp_celsius)
    obx_temp.obx_6 = 'C'
    obx_temp.obx_7 = '36.0-37.5'

    # OBX - Respiratory Rate
    obx_rr = Segment('OBX', msg)
    obx_rr.obx_1 = '6'
    obx_rr.obx_2 = 'NM'
    obx_rr.obx_3 = 'RR^Respiratory Rate'
    obx_rr.obx_5 = str(rr)
    obx_rr.obx_6 = 'breaths/min'
    obx_rr.obx_7 = '12-20'

    return msg.to_er7().encode('utf-8')


def main():
    client = MLLPClient(HOST, PORT)
    while True:
        spo2 = random.randint(94, 100)
        hr = random.randint(59, 100)
        bp_sys = random.randint(89, 120)
        bp_dia = random.randint(59, 80)
        temp_celsius = round(random.uniform(35.8, 37.5), 1)
        rr = random.randint(11, 20)

        hl7_packet = make_oru_r01(spo2, hr, bp_sys, bp_dia, temp_celsius, rr)
        ack = client.send_message(hl7_packet)
        print(f"Sent SpO₂={spo2}%, HR={hr}, BP={bp_sys}/{bp_dia}, Temp={temp_celsius}C, RR={rr} → ACK: {ack.strip()}")
        time.sleep(INTERVAL_MS / 1000.0)

if __name__ == "__main__":
    main()