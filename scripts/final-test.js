const https = require('https');

console.log('🎯 Final Registration Test\n');

function testRegistration() {
  const testData = {
    name: 'Final Test User',
    email: `finaltest${Date.now()}@example.com`,
    password: 'FinalTest123!'
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
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201) {
        try {
          const response = JSON.parse(data);
          console.log('🎉 SUCCESS! Registration is working!');
          console.log('Response:', response);
          console.log('\n✅ Your Netlify deployment is fully functional!');
          console.log('Users can now register and use the application.');
          process.exit(0);
        } catch (error) {
          console.log('❌ Invalid JSON response');
          console.log('Raw response:', data.substring(0, 300));
        }
      } else if (res.statusCode === 500) {
        console.log('⚠️  Still getting 500 error');
        console.log('This indicates the API route is working but there\'s an internal error');
        console.log('\n🔧 Possible causes:');
        console.log('1. Environment variables not loaded correctly');
        console.log('2. Convex connection issues');
        console.log('3. Database schema mismatch');
        console.log('4. Code error in registration handler');
        
        console.log('\n💡 To debug further:');
        console.log('1. Check Netlify function logs in the dashboard');
        console.log('2. Verify all environment variables are set correctly');
        console.log('3. Test Convex connection directly');
        
        console.log('\n📝 Raw error response:');
        console.log(data.substring(0, 500));
      } else {
        console.log(`⚠️  Unexpected status: ${res.statusCode}`);
        console.log('Response:', data.substring(0, 300));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the test
testRegistration();

console.log('\n📋 Summary of what we accomplished:');
console.log('✅ Fixed Netlify build process');
console.log('✅ Set up all environment variables');
console.log('✅ Fixed API routing (no more 404 errors)');
console.log('✅ Updated Convex URL to match deployment');
console.log('⚠️  Need to resolve 500 error in registration logic'); 