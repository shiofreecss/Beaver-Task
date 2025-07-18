#!/usr/bin/env node

/**
 * Authentication Issue Fix Script
 * 
 * This script helps diagnose and fix the authentication redirect issue
 * where users are redirected to /api/auth/error in production.
 */

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
        'User-Agent': 'Beaver-Task-Auth-Fix/1.0',
        ...options.headers
      },
      timeout: 15000
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

async function checkAuthEndpoint() {
  console.log('🔍 Checking authentication endpoint...');
  
  try {
    const response = await makeRequest(`${SITE_URL}/api/auth/session`);
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Auth endpoint is working');
      return true;
    } else {
      console.log('   ❌ Auth endpoint returned error status');
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function checkNextAuthConfiguration() {
  console.log('\n🔧 Checking NextAuth configuration...');
  
  try {
    // Test the NextAuth configuration endpoint
    const response = await makeRequest(`${SITE_URL}/api/auth/providers`);
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ NextAuth providers endpoint accessible');
      return true;
    } else {
      console.log('   ❌ NextAuth providers endpoint error');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testLoginFlow() {
  console.log('\n🔐 Testing login flow...');
  
  try {
    // Test the signin endpoint
    const response = await makeRequest(`${SITE_URL}/api/auth/signin`);
    console.log(`   Signin endpoint status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Signin endpoint accessible');
      return true;
    } else {
      console.log('   ❌ Signin endpoint error');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

function generateEnvironmentChecklist() {
  console.log('\n📋 Environment Variables Checklist');
  console.log('='.repeat(50));
  console.log('Please verify these environment variables in your Netlify dashboard:');
  console.log('');
  console.log('✅ NEXTAUTH_URL=https://task.beaver.foundation');
  console.log('✅ NEXTAUTH_SECRET=<your-secret-key>');
  console.log('✅ NEXT_PUBLIC_CONVEX_URL=<your-convex-url>');
  console.log('✅ CONVEX_DEPLOYMENT=<your-deployment-name>');
  console.log('');
  console.log('Optional for debugging:');
  console.log('🔍 NEXTAUTH_DEBUG=true');
  console.log('');
  console.log('To generate a new NEXTAUTH_SECRET:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
}

function generateFixSteps() {
  console.log('\n🛠️  Fix Steps');
  console.log('='.repeat(50));
  console.log('1. Go to Netlify Dashboard → Site Settings → Environment Variables');
  console.log('2. Verify NEXTAUTH_URL is set to: https://task.beaver.foundation');
  console.log('3. Ensure NEXTAUTH_SECRET is a strong, random string');
  console.log('4. Check NEXT_PUBLIC_CONVEX_URL points to your production Convex deployment');
  console.log('5. Add NEXTAUTH_DEBUG=true temporarily for debugging');
  console.log('6. Redeploy the site');
  console.log('7. Clear browser cookies and test again');
  console.log('');
  console.log('If the issue persists:');
  console.log('1. Check Netlify Function logs for detailed error messages');
  console.log('2. Verify Convex deployment is active');
  console.log('3. Test with a fresh browser session');
}

async function main() {
  console.log('🚀 Beaver Task Authentication Issue Diagnoser');
  console.log(`📍 Testing site: ${SITE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  const results = {
    authEndpoint: await checkAuthEndpoint(),
    nextAuthConfig: await checkNextAuthConfiguration(),
    loginFlow: await testLoginFlow()
  };
  
  console.log('\n📊 Diagnosis Results');
  console.log('='.repeat(60));
  console.log(`Auth Endpoint: ${results.authEndpoint ? '✅ Working' : '❌ Failed'}`);
  console.log(`NextAuth Config: ${results.nextAuthConfig ? '✅ Working' : '❌ Failed'}`);
  console.log(`Login Flow: ${results.loginFlow ? '✅ Working' : '❌ Failed'}`);
  
  if (!results.authEndpoint || !results.nextAuthConfig) {
    console.log('\n❌ Authentication configuration issue detected!');
    generateEnvironmentChecklist();
    generateFixSteps();
  } else {
    console.log('\n✅ Authentication appears to be working correctly.');
    console.log('If you\'re still experiencing issues, try:');
    console.log('1. Clearing browser cookies and cache');
    console.log('2. Testing in an incognito/private window');
    console.log('3. Checking for browser extensions that might interfere');
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 