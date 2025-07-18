#!/usr/bin/env node

/**
 * Netlify Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set
 * for proper NextAuth.js authentication on Netlify.
 * 
 * Run this script before deploying to ensure authentication works correctly.
 */

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'CONVEX_DEPLOY_KEY',
  'CONVEX_URL',
  'DATABASE_URL',
  'EMAIL_SERVER_HOST',
  'EMAIL_SERVER_PORT',
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'EMAIL_FROM'
];

const optionalEnvVars = [
  'NEXTAUTH_DEBUG',
  'NODE_ENV'
];

function checkEnvVars() {
  console.log('🔍 Checking Netlify environment variables...\n');
  
  let allRequiredSet = true;
  const missingVars = [];
  const setVars = [];
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
      allRequiredSet = false;
      console.log(`❌ Missing: ${envVar}`);
    } else {
      setVars.push(envVar);
      console.log(`✅ Set: ${envVar}`);
    }
  }
  
  // Check optional variables
  console.log('\n📋 Optional variables:');
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ Set: ${envVar} = ${envVar === 'NEXTAUTH_SECRET' ? '[HIDDEN]' : process.env[envVar]}`);
    } else {
      console.log(`⚠️  Not set: ${envVar} (optional)`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (!allRequiredSet) {
    console.log('\n🚨 CRITICAL ISSUE: Missing required environment variables!');
    console.log('\nMissing variables:');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
    
    console.log('\n📝 To fix this:');
    console.log('1. Go to your Netlify dashboard');
    console.log('2. Navigate to Site settings > Environment variables');
    console.log('3. Add the missing variables listed above');
    console.log('4. Redeploy your site');
    
    console.log('\n🔧 Quick setup commands:');
    console.log('npm run setup:netlify-env');
    
    process.exit(1);
  } else {
    console.log('\n🎉 All required environment variables are set!');
    console.log('\n✅ Your Netlify deployment should work correctly.');
    
    // Additional checks
    console.log('\n🔍 Additional checks:');
    
    // Check NEXTAUTH_URL format
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl) {
      if (!nextAuthUrl.startsWith('https://')) {
        console.log('⚠️  Warning: NEXTAUTH_URL should use HTTPS in production');
      }
      if (nextAuthUrl.includes('localhost')) {
        console.log('⚠️  Warning: NEXTAUTH_URL should not use localhost in production');
      }
    }
    
    // Check NEXTAUTH_SECRET strength
    const secret = process.env.NEXTAUTH_SECRET;
    if (secret && secret.length < 32) {
      console.log('⚠️  Warning: NEXTAUTH_SECRET should be at least 32 characters long');
    }
    
    console.log('\n🚀 Ready for deployment!');
  }
}

// Run the check
checkEnvVars(); 