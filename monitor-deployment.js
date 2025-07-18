const https = require('https');

console.log('🔍 Monitoring Netlify deployment...\n');

function testRegistration() {
  console.log('Testing registration endpoint...');
  
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
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201) {
        try {
          const response = JSON.parse(data);
          console.log('✅ SUCCESS! Registration endpoint is working!');
          console.log('Response:', response);
          console.log('\n🎉 Your Netlify deployment is working correctly!');
          console.log('Users can now register successfully.');
          process.exit(0);
        } catch (error) {
          console.log('❌ Failed to parse JSON response');
          console.log('Raw response:', data.substring(0, 200));
        }
      } else if (res.statusCode === 404) {
        console.log('❌ Registration endpoint still returning 404');
        console.log('The deployment might still be in progress or there are still issues.');
      } else {
        console.log(`⚠️  Registration endpoint returned status ${res.statusCode}`);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test immediately
testRegistration();

// Then test every 30 seconds for up to 5 minutes
let attempts = 0;
const maxAttempts = 10;

const interval = setInterval(() => {
  attempts++;
  console.log(`\n--- Attempt ${attempts}/${maxAttempts} ---`);
  
  testRegistration();
  
  if (attempts >= maxAttempts) {
    console.log('\n⏰ Timeout reached. Please check the Netlify dashboard for deployment status.');
    clearInterval(interval);
    process.exit(1);
  }
}, 30000); 