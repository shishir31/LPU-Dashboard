const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const dummyPdfPath = path.join(__dirname, 'real-dummy.pdf');
    // A completely minimal valid PDF
    const pdfContent = `%PDF-1.4
1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj
2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj
3 0 obj <</Type/Page/MediaBox[0 0 3 3]>> endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
trailer <</Size 4/Root 1 0 R>>
startxref
149
%%EOF`;
    
    fs.writeFileSync(dummyPdfPath, pdfContent);
    
    const fileBuffer = fs.readFileSync(dummyPdfPath);
    
    // Create raw multipart request
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="pdf"; filename="real-dummy.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    
    const endBoundary = `\r\n--${boundary}--\r\n`;
    
    const payload = Buffer.concat([
      Buffer.from(body, 'utf8'),
      fileBuffer,
      Buffer.from(endBoundary, 'utf8')
    ]);

    console.log('Sending request to http://localhost:5000/api/upload-pdf');
    
    const response = await fetch('http://localhost:5000/api/upload-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: payload
    });
    
    const data = await response.json().catch(() => null);
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
