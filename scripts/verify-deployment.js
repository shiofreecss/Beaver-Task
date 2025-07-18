#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Verifying Netlify Deployment...\n');

// Get the deployment URL from environment or use a default
const deploymentUrl = process.env.NETLIFY_URL || process.env.URL || process.argv[2];

if (!deploymentUrl) {
  console.log('❌ No deployment URL provided');
  console.log('Usage: node scripts/verify-deployment.js [URL]');
  console.log('Or set NETLIFY_URL environment variable');
  process.exit(1);
}

console.log(`🌐 Testing deployment at: ${deploymentUrl}\n`);

// Test endpoints
const endpoints = [
  { path: '/', name: 'Home Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/api/auth/session', name: 'NextAuth Session' },
  { path: '/api/auth/providers', name: 'NextAuth Providers' },
];

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const contentType = res.headers['content-type'] || '';
        
        let result = {
          name,
          url,
          status,
          contentType,
          isJson: contentType.includes('application/json'),
          isHtml: contentType.includes('text/html'),
          data: data.substring(0, 200) // First 200 chars for debugging
        };
        
        resolve(result);
      });
    });
    
    req.on('error', (err) => {
      resolve({
        name,
        url,
        error: err.message,
        status: 'ERROR'
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name,
        url,
        error: 'Timeout',
        status: 'TIMEOUT'
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Running endpoint tests...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = `${deploymentUrl}${endpoint.path}`;
    console.log(`Testing ${endpoint.name}...`);
    
    const result = await testEndpoint(url, endpoint.name);
    results.push(result);
    
    // Display result immediately
    if (result.error) {
      console.log(`❌ ${endpoint.name}: ${result.error}`);
    } else if (result.status === 200) {
      if (result.isJson) {
        console.log(`✅ ${endpoint.name}: JSON response (${result.status})`);
      } else if (result.isHtml) {
        console.log(`⚠️  ${endpoint.name}: HTML response (${result.status}) - Expected JSON for API endpoints`);
      } else {
        console.log(`✅ ${endpoint.name}: Response (${result.status})`);
      }
    } else {
      console.log(`❌ ${endpoint.name}: HTTP ${result.status}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  
  let allGood = true;
  
  results.forEach(result => {
    const status = result.error ? '❌ ERROR' : 
                   result.status === 200 ? '✅ OK' : 
                   `❌ HTTP ${result.status}`;
    
    console.log(`${status} ${result.name}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
      allGood = false;
    } else if (result.status !== 200) {
      console.log(`   Status: ${result.status}`);
      allGood = false;
    } else if (result.name.includes('Session') && !result.isJson) {
      console.log(`   Issue: Expected JSON but got ${result.contentType}`);
      console.log(`   Data preview: ${result.data}`);
      allGood = false;
    }
  });
  
  // Specific checks for NextAuth
  const sessionResult = results.find(r => r.name.includes('Session'));
  if (sessionResult && !sessionResult.error && sessionResult.status === 200) {
    if (sessionResult.isJson) {
      console.log('\n✅ NextAuth session endpoint is working correctly!');
    } else {
      console.log('\n❌ NextAuth session endpoint is returning HTML instead of JSON');
      console.log('This is the main issue you reported.');
      console.log('\n🔧 Possible fixes:');
      console.log('1. Check your netlify.toml configuration');
      console.log('2. Verify environment variables are set correctly');
      console.log('3. Ensure the NextAuth plugin is properly configured');
      console.log('4. Check if there are any redirect rules interfering');
    }
  }
  
  // Environment check
  console.log('\n🔧 Environment Check:');
  const envVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_CONVEX_URL',
    'CONVEX_DEPLOYMENT'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
    
    if (!value) {
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('\n🎉 All tests passed! Your deployment should be working correctly.');
  } else {
    console.log('\n🚨 Some issues were found. Please check the details above.');
    console.log('\n📝 Next steps:');
    console.log('1. Fix any missing environment variables');
    console.log('2. Check your Netlify configuration');
    console.log('3. Redeploy after making changes');
    console.log('4. Run this script again to verify the fix');
  }
  
  return allGood;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});