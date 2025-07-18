#!/usr/bin/env node

const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'https://task.beaver.foundation';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Beaver-Task-Deployment-Verifier/1.0',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(path, expectedStatus = 200, description = '') {
  try {
    const url = `${SITE_URL}${path}`;
    console.log(`\n🔍 Testing: ${description || path}`);
    console.log(`   URL: ${url}`);
    
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      console.log(`   ✅ Status: ${response.statusCode} (Expected: ${expectedStatus})`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.statusCode} (Expected: ${expectedStatus})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testAuthenticationFlow() {
  console.log('\n🔐 Testing Authentication Flow...');
  
  // Test login page accessibility
  const loginAccessible = await testEndpoint('/login', 200, 'Login page accessibility');
  
  // Test that root redirects to login when not authenticated
  const rootRedirect = await testEndpoint('/', 200, 'Root path (should show login or redirect)');
  
  // Test API routes
  const apiAccessible = await testEndpoint('/api/auth/session', 200, 'Auth API accessibility');
  
  // Test that protected routes redirect properly
  const protectedRoute = await testEndpoint('/dashboard', 200, 'Protected route (should redirect to login)');
  
  return loginAccessible && rootRedirect && apiAccessible && protectedRoute;
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Testing Environment Variables...');
  
  try {
    // Test if NEXTAUTH_URL is accessible
    const authUrl = `${SITE_URL}/api/auth/session`;
    const response = await makeRequest(authUrl);
    
    if (response.statusCode === 200) {
      console.log('   ✅ NEXTAUTH_URL appears to be configured correctly');
      return true;
    } else {
      console.log(`   ⚠️  Auth endpoint returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error testing auth endpoint: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Beaver Task Deployment Verification');
  console.log(`📍 Testing site: ${SITE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  let allTestsPassed = true;
  
  // Test basic endpoints
  console.log('\n📋 Testing Basic Endpoints...');
  
  const tests = [
    { path: '/', expected: 200, desc: 'Root path' },
    { path: '/login', expected: 200, desc: 'Login page' },
    { path: '/register', expected: 200, desc: 'Register page' },
    { path: '/api/auth/session', expected: 200, desc: 'Auth API' },
    { path: '/api/tasks', expected: 401, desc: 'Protected API (should return 401)' },
    { path: '/nonexistent', expected: 404, desc: '404 handling' }
  ];
  
  for (const test of tests) {
    const passed = await testEndpoint(test.path, test.expected, test.desc);
    if (!passed) allTestsPassed = false;
  }
  
  // Test authentication flow
  const authFlowPassed = await testAuthenticationFlow();
  if (!authFlowPassed) allTestsPassed = false;
  
  // Test environment variables
  const envPassed = await testEnvironmentVariables();
  if (!envPassed) allTestsPassed = false;
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  
  if (allTestsPassed) {
    console.log('✅ All tests passed! Deployment appears to be working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the deployment configuration.');
    console.log('\n🔧 Common issues to check:');
    console.log('   1. NEXTAUTH_URL environment variable is set correctly');
    console.log('   2. NEXTAUTH_SECRET is configured');
    console.log('   3. NEXT_PUBLIC_CONVEX_URL is set');
    console.log('   4. Netlify functions are working properly');
    console.log('   5. Convex deployment is active');
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  
  process.exit(allTestsPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});