#!/usr/bin/env node

/**
 * Netlify Environment Variables Setup Script
 * 
 * This script helps you set up the required environment variables
 * for proper NextAuth.js authentication on Netlify.
 */

const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🚀 Netlify Environment Variables Setup\n');
  console.log('This script will help you configure the required environment variables for your Netlify deployment.\n');

  // Generate a secure NEXTAUTH_SECRET
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  
  console.log('📋 Required Environment Variables:\n');

  // Get NEXTAUTH_URL
  const nextAuthUrl = await question('Enter your NEXTAUTH_URL (your Netlify domain, e.g., https://task.beaver.foundation): ');
  
  // Get Convex details
  const convexDeployKey = await question('Enter your CONVEX_DEPLOY_KEY: ');
  const convexUrl = await question('Enter your CONVEX_URL: ');
  
  // Get database details
  const databaseUrl = await question('Enter your DATABASE_URL: ');
  
  // Get email server details
  const emailServerHost = await question('Enter your EMAIL_SERVER_HOST (e.g., smtp.gmail.com): ');
  const emailServerPort = await question('Enter your EMAIL_SERVER_PORT (e.g., 587): ');
  const emailServerUser = await question('Enter your EMAIL_SERVER_USER: ');
  const emailServerPassword = await question('Enter your EMAIL_SERVER_PASSWORD: ');
  const emailFrom = await question('Enter your EMAIL_FROM (e.g., noreply@beaver.foundation): ');

  console.log('\n' + '='.repeat(60));
  console.log('🔧 Environment Variables for Netlify\n');
  console.log('Copy and paste these into your Netlify dashboard:\n');
  console.log('Go to: Site settings > Environment variables\n\n');

  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  console.log(`NEXTAUTH_URL=${nextAuthUrl}`);
  console.log(`CONVEX_DEPLOY_KEY=${convexDeployKey}`);
  console.log(`CONVEX_URL=${convexUrl}`);
  console.log(`DATABASE_URL=${databaseUrl}`);
  console.log(`EMAIL_SERVER_HOST=${emailServerHost}`);
  console.log(`EMAIL_SERVER_PORT=${emailServerPort}`);
  console.log(`EMAIL_SERVER_USER=${emailServerUser}`);
  console.log(`EMAIL_SERVER_PASSWORD=${emailServerPassword}`);
  console.log(`EMAIL_FROM=${emailFrom}`);

  console.log('\n' + '='.repeat(60));
  console.log('📝 Next Steps:\n');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site settings > Environment variables');
  console.log('3. Add each variable above');
  console.log('4. Click "Deploy site" to redeploy');
  console.log('5. Test authentication after deployment');

  console.log('\n⚠️  Important Notes:');
  console.log('- NEXTAUTH_SECRET must be kept secure and never shared');
  console.log('- NEXTAUTH_URL must match your exact Netlify domain');
  console.log('- All variables are case-sensitive');
  console.log('- Redeploy after adding variables');

  rl.close();
}

setupEnvironment().catch(console.error); 