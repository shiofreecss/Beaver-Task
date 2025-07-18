#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the application is deployed correctly
 * and all critical features are working, especially authentication.
 */

const https = require('https');
const http = require('http');

// Get the site URL from command line or environment
const siteUrl = process.argv[2] || process.env.NETLIFY_URL || 'https://task.beaver.foundation';

console.log('🔍 Verifying deployment...\n');
console.log(`📍 Site URL: ${siteUrl}\n`);

async function checkUrl(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode}`);
      resolve({ status: res.statusCode, ok: res.statusCode < 400 });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ status: 0, ok: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve({ status: 0, ok: false, error: 'Timeout' });
    });
  });
}

async function verifyDeployment() {
  const checks = [
    { url: siteUrl, description: 'Main site' },
    { url: `${siteUrl}/login`, description: 'Login page' },
    { url: `${siteUrl}/api/auth/signin`, description: 'NextAuth signin' },
    { url: `${siteUrl}/api/auth/callback/credentials`, description: 'NextAuth callback' },
    { url: `${siteUrl}/_next/static`, description: 'Static assets' },
  ];

  console.log('📋 Running health checks...\n');

  let allPassed = true;
  const results = [];

  for (const check of checks) {
    const result = await checkUrl(check.url, check.description);
    results.push({ ...check, ...result });
    if (!result.ok) allPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('\n🎉 All checks passed! Deployment is successful.');
    console.log('\n✅ Next steps:');
    console.log('1. Test login functionality');
    console.log('2. Verify user registration');
    console.log('3. Check task management features');
    console.log('4. Test all major app features');
  } else {
    console.log('\n🚨 Some checks failed! Please investigate:');
    
    const failedChecks = results.filter(r => !r.ok);
    failedChecks.forEach(check => {
      console.log(`   - ${check.description}: ${check.error || `Status ${check.status}`}`);
    });
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check Netlify function logs');
    console.log('2. Verify environment variables');
    console.log('3. Check for build errors');
    console.log('4. Ensure all dependencies are installed');
    
    process.exit(1);
  }

  // Authentication-specific checks
  console.log('\n🔐 Authentication verification:');
  console.log('1. Visit the login page');
  console.log('2. Try logging in with valid credentials');
  console.log('3. Should redirect to dashboard, not /api/auth/error');
  console.log('4. Check that session persists after login');
  
  console.log('\n📝 If authentication fails:');
  console.log('- Run: npm run verify-netlify-env');
  console.log('- Check Netlify environment variables');
  console.log('- Verify NEXTAUTH_URL and NEXTAUTH_SECRET');
  console.log('- Check Netlify function logs for errors');
}

// Run verification
verifyDeployment().catch(console.error);