#!/usr/bin/env node

/**
 * Netlify Environment Variables Setup Script
 * 
 * This script helps you set up the required environment variables
 * for proper NextAuth.js authentication on Netlify.
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Netlify Environment Variables Setup\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('This script will help you set up the required environment variables for Netlify deployment.\n');
  
  // Generate a secure NEXTAUTH_SECRET
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  console.log(`✅ Generated NEXTAUTH_SECRET: ${nextAuthSecret}\n`);
  
  // Get user input
  const netlifyUrl = await question('Enter your Netlify app URL (e.g., https://your-app.netlify.app): ');
  const convexUrl = await question('Enter your Convex production URL (e.g., https://your-deployment.convex.cloud): ');
  const convexDeployment = await question('Enter your Convex deployment name: ');
  
  console.log('\n📋 Environment Variables to set in Netlify:\n');
  console.log('='.repeat(60));
  
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  console.log(`NEXTAUTH_URL=${netlifyUrl}`);
  console.log(`NEXT_PUBLIC_CONVEX_URL=${convexUrl}`);
  console.log(`CONVEX_DEPLOYMENT=${convexDeployment}`);
  
  console.log('\n' + '='.repeat(60));
  
  console.log('\n📝 Instructions:');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site settings > Environment variables');
  console.log('3. Add each variable above with its corresponding value');
  console.log('4. Click "Save"');
  console.log('5. Redeploy your site');
  
  console.log('\n🔧 Alternative: Use Netlify CLI');
  console.log('If you have Netlify CLI installed, you can set these variables with:');
  console.log(`netlify env:set NEXTAUTH_SECRET "${nextAuthSecret}"`);
  console.log(`netlify env:set NEXTAUTH_URL "${netlifyUrl}"`);
  console.log(`netlify env:set NEXT_PUBLIC_CONVEX_URL "${convexUrl}"`);
  console.log(`netlify env:set CONVEX_DEPLOYMENT "${convexDeployment}"`);
  
  console.log('\n✅ Setup complete! After setting these variables, your NextAuth should work correctly.');
  
  rl.close();
}

setupEnvironment().catch(console.error); 