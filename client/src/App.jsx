import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(response.data);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🎙️ Upload Audio File (Test Mode)</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <br/><br/>
      <button onClick={handleUpload}>Upload</button>

      {message && (
        <div style={{ marginTop: '40px' }}>
          <h2>Status:</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default App;