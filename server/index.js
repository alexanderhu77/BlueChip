const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup (for file uploads)
const storage = multer.diskStorage({
  destination: 'uploads/', // Make sure this folder exists!
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Test route: GET /
app.get('/', (req, res) => {
  res.send('Hello from backend 🚀');
});

// Upload route: POST /upload
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(`✅ Received file: ${req.file.originalname}`);
  res.json({ message: `File ${req.file.originalname} uploaded successfully.` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});