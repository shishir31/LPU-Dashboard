import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  const dummyPdfPath = path.join(__dirname, 'real-dummy.pdf');
  
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('\\n--- Test 3: No header specified (current api.js) ---');
  try {
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(dummyPdfPath));
    const response = await api.post('/upload-pdf', formData);
    console.log('Test 3 Success:', response.status);
  } catch (err) {
    console.log('Test 3 Error:', err.response?.status);
  }
}

testUpload();
