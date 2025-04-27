import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [heartRate, setHeartRate] = useState(60);
  const [bpDia, setBpDia] = useState(60);
  const [bpSys, setBpSys] = useState(90);

  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState(37);
  const [respiratoryRate, setRespiratoryRate] = useState(16);

  useEffect(() => {
    const interval = setInterval(() => {
      sendVitalSigns();
    }, 1000);
    return () => clearInterval(interval);
  }, [heartRate, bpDia, bpSys, spo2, temperature, respiratoryRate]);

  const sendVitalSigns = async () => {
    try {
      await axios.post('http://localhost:5000/vital-signs', {
        heartRate,
        bpDia,
        bpSys,
        spo2,
        temperature,
        respiratoryRate,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to send vital signs:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#00FF00',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
    }}>
      
      {/* Left Sidebar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '300px',
        backgroundColor: '#000000',
        padding: '20px',
        borderRight: '2px solid #00FF00',
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Vitals</h2>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '30px',
          gap: '20px'
        }}>
          <Slider label="HR" value={heartRate} setValue={setHeartRate} min={0} max={200} />
          <Slider label="BP Dia" value={bpDia} setValue={setBpDia} min={0} max={150} />
          <Slider label="BP Sys" value={bpSys} setValue={setBpSys} min={0} max={250} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '20px',
      }}>
        
        {/* EKG + Patient Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          gap: '20px',
        }}>
          {/* EKG Section */}
          <div style={{
            flex: 3,
            backgroundColor: '#111111',
            border: '2px solid #00FF00',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            overflow: 'hidden'
          }}>
            <EKGLine heartRate={heartRate} />
          </div>

          {/* Patient Monitor Section */}
          <div style={{
            flex: 1,
            backgroundColor: '#111111',
            border: '2px solid #00FF00',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '20px',
            fontSize: '1.3rem'
          }}>
            <h3 style={{ fontSize: '1.8rem' }}>Patient Monitor</h3>
            <div>❤️ HR: {heartRate} bpm</div>
            <div>🩸 BP: {bpSys}/{bpDia} mmHg</div>
            <div>🫁 SpO₂: {spo2}%</div>
            <div>🌡️ Temp: {temperature}°C</div>
            <div>💨 RR: {respiratoryRate} bpm</div>
          </div>
        </div>

        {/* Knobs Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: '#111111',
          padding: '20px',
          border: '2px solid #00FF00',
          borderRadius: '10px',
          flexWrap: 'wrap',
          gap: '40px',
        }}>
          <Knob label="SpO₂" value={spo2} setValue={setSpo2} min={50} max={100} />
          <Knob label="Temperature" value={temperature} setValue={setTemperature} min={30} max={42} />
          <Knob label="Respiratory Rate" value={respiratoryRate} setValue={setRespiratoryRate} min={5} max={50} />
        </div>

      </div>
    </div>
  );
}

// --------- Components ---------------
function Slider({ label, value, setValue, min, max }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          writingMode: 'bt-lr',
          transform: 'rotate(270deg)',
          height: '150px',
          accentColor: '#00FF00',
        }}
      />
      <div style={{ marginTop: '10px', fontSize: '1.2rem' }}>{label}: {value}</div>
    </div>
  );
}

function Knob({ label, value, setValue, min, max }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <label style={{ fontSize: '1.2rem' }}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: '100px',
          height: '100px',
          transform: 'rotate(-90deg)',
          accentColor: '#00FF00',
        }}
      />
      <div style={{ fontSize: '1.2rem' }}>{value}</div>
    </div>
  );
}

// 🧠 New Moving Realistic EKG Line
function EKGLine({ heartRate }) {
  const [points, setPoints] = useState(generateFlatline());
  const [lastBeatTime, setLastBeatTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let newPoints = points.map(([x, y]) => [x - 5, y]).filter(([x]) => x >= 0);

      const beatInterval = heartRate > 0 ? (60000 / heartRate) : Infinity;

      if (now - lastBeatTime >= beatInterval && heartRate > 0) {
        const pqrst = generatePQRST(heartRate);
        newPoints = newPoints.concat(pqrst.map(([x, y]) => [x + 1000, y]));
        setLastBeatTime(now);
      } else {
        newPoints.push([1000, 50]);
      }

      setPoints(newPoints);
    }, 50);

    return () => clearInterval(interval);
  }, [heartRate, points, lastBeatTime]);

  return (
    <svg width="100%" height="100">
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        stroke="#00FF00"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

// Realistic PQRST waveform with dynamic R amplitude
function generatePQRST(heartRate) {
  const rPeak = Math.min(80 + (heartRate - 60) * 0.5, 110); // cap max

  return [
    [0, 50],   // baseline
    [10, 45],  // P wave up
    [20, 50],  // back to baseline
    [30, 55],  // small bump before Q
    [40, 30],  // Q dip
    [50, rPeak],  // dynamic R peak
    [60, 20],  // S dip
    [70, 50],  // baseline
    [80, 60],  // T wave
    [90, 50],  // baseline after T
  ];
}

// Initial flatline
function generateFlatline() {
  const pts = [];
  for (let i = 0; i < 200; i++) {
    pts.push([i * 5, 50]);
  }
  return pts;
}

export default App;
