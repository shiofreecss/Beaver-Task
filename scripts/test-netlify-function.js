const https = require('https');

console.log('🧪 Testing Netlify Function Directly...\n');

const testData = {
  name: 'Netlify Function Test',
  email: `netlifytest${Date.now()}@example.com`,
  password: 'NetlifyTest123!'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'task.beaver.foundation',
  port: 443,
  path: '/.netlify/functions/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 201) {
      try {
        const response = JSON.parse(data);
        console.log('🎉 SUCCESS! Netlify function is working!');
        console.log('Response:', response);
        console.log('\n✅ Registration is now working through Netlify function!');
      } catch (error) {
        console.log('❌ Invalid JSON response');
        console.log('Raw response:', data);
      }
    } else if (res.statusCode === 404) {
      console.log('❌ Netlify function not found (404)');
      console.log('This means the function deployment failed');
    } else {
      console.log(`⚠️  Netlify function returned status ${res.statusCode}`);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end(); 