import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [heartRate, setHeartRate] = useState(60);
  const [bpDia, setBpDia] = useState(60);
  const [bpSys, setBpSys] = useState(90);

  const [gain, setGain] = useState(50);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      sendVitalSigns();
    }, 1000);
    return () => clearInterval(interval);
  }, [heartRate, bpDia, bpSys]);

  const sendVitalSigns = async () => {
    try {
      await axios.post('http://localhost:5000/vital-signs', {
        heartRate,
        bpDia,
        bpSys
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to send vital signs:', error.response ? error.response.data : error.message);
    }
  };

  const beatSpeedMs = heartRate > 0 ? (60000 / heartRate) : 1000;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#00FF00',
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
        <h2>Vitals</h2>
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
            padding: '10px'
          }}>
            <EKGLine beatSpeedMs={beatSpeedMs} heartRate={heartRate} />
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
            padding: '20px'
          }}>
            <h3>Patient Monitor</h3>
            <div>❤️ HR: {heartRate} bpm</div>
            <div>🩸 BP: {bpSys}/{bpDia} mmHg</div>
            <div>📶 Gain: {gain}</div>
            <div>☀️ Brightness: {brightness}</div>
            <div>🌓 Contrast: {contrast}</div>
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
          <Knob label="Gain" value={gain} setValue={setGain} />
          <Knob label="Brightness" value={brightness} setValue={setBrightness} />
          <Knob label="Contrast" value={contrast} setValue={setContrast} />
        </div>

      </div>
    </div>
  );
}

// Small components
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
      <div style={{ marginTop: '10px' }}>{label}: {value}</div>
    </div>
  );
}

function Knob({ label, value, setValue }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <label>{label}</label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: '100px',
          height: '100px',
          transform: 'rotate(-90deg)',
          accentColor: '#00FF00',
        }}
      />
      <div>{value}</div>
    </div>
  );
}

function EKGLine({ beatSpeedMs, heartRate }) {
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    if (heartRate > 0) {
      const interval = setInterval(() => {
        setBeat(prev => !prev);
      }, beatSpeedMs);
      return () => clearInterval(interval);
    } else {
      setBeat(false);
    }
  }, [beatSpeedMs, heartRate]);

  return (
    <svg width="100%" height="100">
      <polyline
        points={beat ? "0,50 50,50 70,20 90,80 110,50 1000,50" : "0,50 1000,50"}
        stroke="#00FF00"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export default App;