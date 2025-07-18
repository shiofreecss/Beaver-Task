const https = require('https');

console.log('🔍 Testing Convex Connection...\n');

// Test the Convex URL directly
const convexUrl = 'https://hallowed-trout-823.convex.cloud';

const options = {
  hostname: 'hallowed-trout-823.convex.cloud',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Convex Status: ${res.statusCode}`);
  
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ Convex deployment is accessible');
  } else {
    console.log('❌ Convex deployment might have issues');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check Netlify function logs for detailed error messages');
  console.log('2. Verify environment variables in Netlify dashboard');
  console.log('3. Test registration locally to ensure code works');
  
  console.log('\n🔧 To check Netlify logs:');
  console.log('- Go to: https://app.netlify.com/projects/beaver-task');
  console.log('- Navigate to Functions → Function logs');
  console.log('- Look for ___netlify-handler function logs');
});

req.on('error', (error) => {
  console.error('❌ Convex connection failed:', error.message);
});

req.end();