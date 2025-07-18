const https = require('https');

console.log('🔍 Testing Environment Variables...\n');

const options = {
  hostname: 'task.beaver.foundation',
  port: 443,
  path: '/api/test-env',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✅ Environment variables test successful!');
        console.log('Environment variables:', response.environment);
        
        // Check if critical variables are set
        const env = response.environment;
        if (env.NEXTAUTH_SECRET === 'Set' && 
            env.NEXT_PUBLIC_CONVEX_URL !== 'Missing' &&
            env.CONVEX_URL !== 'Missing') {
          console.log('\n🎉 All critical environment variables are set!');
          console.log('The 500 error is likely a code issue, not an environment issue.');
        } else {
          console.log('\n⚠️  Some environment variables are missing:');
          console.log('NEXTAUTH_SECRET:', env.NEXTAUTH_SECRET);
          console.log('NEXT_PUBLIC_CONVEX_URL:', env.NEXT_PUBLIC_CONVEX_URL);
          console.log('CONVEX_URL:', env.CONVEX_URL);
        }
      } catch (error) {
        console.log('❌ Failed to parse JSON response');
        console.log('Raw response:', data);
      }
    } else {
      console.log(`⚠️  Environment test returned status ${res.statusCode}`);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end(); 