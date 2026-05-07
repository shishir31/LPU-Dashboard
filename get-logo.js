const https = require('https');

https.get('https://lpcps.org.in', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Look for image source links
    const matches = data.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    if (matches) {
      matches.forEach(m => {
        if (m.toLowerCase().includes('logo')) {
          console.log('Found:', m);
        }
      });
    } else {
      console.log('No matches');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
