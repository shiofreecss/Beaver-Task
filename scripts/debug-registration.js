const https = require('https');

console.log('🔍 Debugging registration endpoint...\n');

// Test with a simple request first
const testData = {
  name: 'Debug User',
  email: `debug${Date.now()}@example.com`,
  password: 'DebugPass123!'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'task.beaver.foundation',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Debug-Script/1.0'
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
    console.log('\n📄 Full Response:');
    console.log(data);
    
    if (res.statusCode === 500) {
      console.log('\n🔧 Analysis:');
      console.log('- The API route is being reached (status 500 instead of 404)');
      console.log('- This means the Next.js app is running and handling the request');
      console.log('- The 500 error suggests an issue with:');
      console.log('  1. Environment variables not being loaded correctly');
      console.log('  2. Convex connection issues');
      console.log('  3. Database connection problems');
      console.log('  4. Code errors in the registration handler');
      
      console.log('\n💡 Next steps:');
      console.log('1. Check Netlify environment variables are set correctly');
      console.log('2. Verify Convex deployment is working');
      console.log('3. Check Netlify function logs for detailed error messages');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end(); 