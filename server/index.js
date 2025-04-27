const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',    // your React app
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Vital Signs Route
app.post('/vital-signs', (req, res) => {
  console.log('✅ Received vital signs:', req.body);

  const { heartRate, bpDia, bpSys } = req.body;
  console.log(`Heart Rate: ${heartRate}, BP Dia: ${bpDia}, BP Sys: ${bpSys}`);

  res.json({ message: 'Vital signs received successfully!' });
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
