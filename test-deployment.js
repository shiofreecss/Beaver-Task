const https = require('https');

console.log('🔍 Testing deployment status...\n');

// Test 1: Check if main site is accessible
console.log('1. Testing main site accessibility...');
const mainSiteOptions = {
  hostname: 'task.beaver.foundation',
  port: 443,
  path: '/',
  method: 'GET'
};

const mainReq = https.request(mainSiteOptions, (res) => {
  console.log(`   Main site status: ${res.statusCode}`);
  if (res.statusCode === 200 || res.statusCode === 307) {
    console.log('   ✅ Main site is accessible');
  } else {
    console.log('   ❌ Main site is not accessible');
  }
  
  // Test 2: Check registration endpoint
  console.log('\n2. Testing registration endpoint...');
  const testData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!'
  };

  const postData = JSON.stringify(testData);

  const apiOptions = {
    hostname: 'task.beaver.foundation',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(apiOptions, (apiRes) => {
    console.log(`   API endpoint status: ${apiRes.statusCode}`);
    
    let data = '';
    
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    
    apiRes.on('end', () => {
      if (apiRes.statusCode === 201) {
        try {
          const response = JSON.parse(data);
          console.log('   ✅ Registration endpoint is working!');
          console.log(`   Response: ${JSON.stringify(response)}`);
        } catch (error) {
          console.log('   ❌ Registration endpoint returned invalid JSON');
          console.log(`   Raw response: ${data.substring(0, 200)}...`);
        }
      } else if (apiRes.statusCode === 404) {
        console.log('   ❌ Registration endpoint not found (404)');
        console.log('   This suggests the API routes are not being handled correctly');
      } else {
        console.log(`   ⚠️  Registration endpoint returned status ${apiRes.statusCode}`);
        console.log(`   Raw response: ${data.substring(0, 200)}...`);
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('   ❌ API request failed:', error.message);
  });

  apiReq.write(postData);
  apiReq.end();
});

mainReq.on('error', (error) => {
  console.error('   ❌ Main site request failed:', error.message);
});

mainReq.end(); 