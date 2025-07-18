const https = require('https');

console.log('🧪 Testing registration endpoint on live site...\n');

const testData = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'TestPass123!'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'task.beaver.foundation',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n✅ Registration successful!');
      console.log('Response:', response);
    } catch (error) {
      console.log('\n❌ Failed to parse JSON response');
      console.log('Raw response:', data);
      console.log('This might indicate the endpoint is returning HTML instead of JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end(); 