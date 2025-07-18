#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Netlify Environment Configuration...\n');

// Check if we're in a Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
console.log(`📍 Environment: ${isNetlify ? 'Netlify' : 'Local'}`);

// Required environment variables for NextAuth
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_CONVEX_URL',
  'CONVEX_DEPLOYMENT'
];

console.log('\n📋 Required Environment Variables:');
let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const status = isPresent ? '✅' : '❌';
  
  console.log(`${status} ${varName}: ${isPresent ? 'Set' : 'Missing'}`);
  
  if (isPresent && varName === 'NEXTAUTH_URL') {
    console.log(`   Value: ${value}`);
  }
  
  if (!isPresent) {
    allPresent = false;
  }
});

// Check for common issues
console.log('\n🔧 Common Issues Check:');

// Check NEXTAUTH_URL format
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  try {
    new URL(nextAuthUrl);
    console.log('✅ NEXTAUTH_URL is a valid URL');
  } catch (e) {
    console.log('❌ NEXTAUTH_URL is not a valid URL');
    allPresent = false;
  }
} else {
  console.log('❌ NEXTAUTH_URL is missing');
  allPresent = false;
}

// Check if NEXTAUTH_SECRET is strong enough
const secret = process.env.NEXTAUTH_SECRET;
if (secret) {
  if (secret.length >= 32) {
    console.log('✅ NEXTAUTH_SECRET is sufficiently long');
  } else {
    console.log('⚠️  NEXTAUTH_SECRET might be too short (recommend 32+ characters)');
  }
} else {
  console.log('❌ NEXTAUTH_SECRET is missing');
  allPresent = false;
}

// Check Convex URL
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (convexUrl) {
  if (convexUrl.includes('convex.cloud')) {
    console.log('✅ NEXT_PUBLIC_CONVEX_URL appears to be a valid Convex URL');
  } else {
    console.log('⚠️  NEXT_PUBLIC_CONVEX_URL might not be a valid Convex URL');
  }
} else {
  console.log('❌ NEXT_PUBLIC_CONVEX_URL is missing');
  allPresent = false;
}

// Netlify-specific checks
if (isNetlify) {
  console.log('\n🌐 Netlify-Specific Checks:');
  
  const netlifyUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (netlifyUrl) {
    console.log(`✅ Netlify URL detected: ${netlifyUrl}`);
    
    // Check if NEXTAUTH_URL matches Netlify URL
    if (nextAuthUrl && nextAuthUrl !== netlifyUrl) {
      console.log(`⚠️  NEXTAUTH_URL (${nextAuthUrl}) doesn't match Netlify URL (${netlifyUrl})`);
      console.log('   Consider updating NEXTAUTH_URL to match your Netlify URL');
    }
  } else {
    console.log('❌ Netlify URL not detected');
  }
}

// Summary
console.log('\n📊 Summary:');
if (allPresent) {
  console.log('✅ All required environment variables are present');
  console.log('🎉 Your environment should be ready for deployment!');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('🔧 Please set the missing variables in your Netlify dashboard');
}

// Instructions for fixing
if (!allPresent) {
  console.log('\n🔧 How to fix:');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site settings > Environment variables');
  console.log('3. Add the missing variables:');
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`   - ${varName}: [set appropriate value]`);
    }
  });
  
  console.log('\n4. Redeploy your site after adding the variables');
}

console.log('\n📝 Additional Notes:');
console.log('- NEXTAUTH_SECRET should be a random string (32+ characters)');
console.log('- NEXTAUTH_URL should match your deployed site URL');
console.log('- NEXT_PUBLIC_CONVEX_URL should be your Convex production URL');
console.log('- CONVEX_DEPLOYMENT should be your Convex deployment name');

process.exit(allPresent ? 0 : 1); 