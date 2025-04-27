const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.post('/vital-signs', (req, res) => {
  const { heartRate, bpDia, bpSys, spo2, temperature, respiratoryRate } = req.body;

  console.log('✅ Received vital signs:');
  console.log(`HR: ${heartRate} bpm`);
  console.log(`BP: ${bpSys}/${bpDia} mmHg`);
  console.log(`SpO₂: ${spo2}%`);
  console.log(`Temperature: ${temperature} °C`);
  console.log(`Respiratory Rate: ${respiratoryRate} bpm`);

  res.json({ message: 'Vitals received successfully!' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));