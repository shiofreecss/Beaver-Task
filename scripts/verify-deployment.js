#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const SITE_URL = process.env.NETLIFY_URL || process.env.SITE_URL || 'https://your-app.netlify.app';
const TIMEOUT = 10000; // 10 seconds

// Test cases
const testCases = [
  {
    path: '/',
    description: 'Root path (should redirect to /login if not authenticated)',
    expectedStatus: [200, 302, 307],
  },
  {
    path: '/login',
    description: 'Login page (should be accessible)',
    expectedStatus: [200],
  },
  {
    path: '/register',
    description: 'Register page (should be accessible)',
    expectedStatus: [200],
  },
  {
    path: '/api/auth/signin',
    description: 'NextAuth signin API (should be accessible)',
    expectedStatus: [200, 405], // 405 for GET requests is normal
  },
  {
    path: '/calendar',
    description: 'Protected calendar page (should redirect if not authenticated)',
    expectedStatus: [200, 302, 307],
  },
  {
    path: '/nonexistent',
    description: 'Non-existent page (should return 404)',
    expectedStatus: [404],
  },
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Deployment-Verification-Script/1.0',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTest(testCase) {
  const url = `${SITE_URL}${testCase.path}`;
  
  try {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`   URL: ${url}`);
    
    const response = await makeRequest(url);
    const isExpected = testCase.expectedStatus.includes(response.statusCode);
    
    if (isExpected) {
      console.log(`   ✅ PASS - Status: ${response.statusCode}`);
      
      // Additional checks for specific paths
      if (testCase.path === '/' && response.statusCode === 302) {
        const location = response.headers.location;
        if (location && location.includes('/login')) {
          console.log(`   ✅ Correctly redirects to login: ${location}`);
        } else {
          console.log(`   ⚠️  Redirects to: ${location || 'unknown'}`);
        }
      }
      
      return { success: true, statusCode: response.statusCode };
    } else {
      console.log(`   ❌ FAIL - Expected: ${testCase.expectedStatus.join(' or ')}, Got: ${response.statusCode}`);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting Netlify Deployment Verification');
  console.log(`📍 Site URL: ${SITE_URL}`);
  console.log('=' .repeat(60));
  
  if (SITE_URL.includes('your-app.netlify.app')) {
    console.log('⚠️  WARNING: Please set SITE_URL environment variable to your actual Netlify URL');
    console.log('   Example: SITE_URL=https://your-app.netlify.app npm run verify-deployment');
  }
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your deployment looks good.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\nCommon fixes:');
    console.log('- Ensure all environment variables are set in Netlify');
    console.log('- Check that the build completed successfully');
    console.log('- Verify that the @netlify/plugin-nextjs plugin is installed');
    console.log('- Clear browser cache and try again');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

main();