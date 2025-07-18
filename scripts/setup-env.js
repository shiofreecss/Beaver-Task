#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔧 Beaver Task Environment Setup');
  console.log('================================\n');

  console.log('This script will help you set up the required environment variables for Netlify deployment.\n');

  // Generate NEXTAUTH_SECRET
  const nextauthSecret = crypto.randomBytes(32).toString('hex');
  console.log('✅ Generated NEXTAUTH_SECRET:');
  console.log(nextauthSecret);
  console.log('');

  // Get NEXTAUTH_URL
  const nextauthUrl = await question('Enter your Netlify domain (e.g., https://task.beaver.foundation): ');
  console.log('');

  // Get NEXT_PUBLIC_CONVEX_URL
  const convexUrl = await question('Enter your Convex deployment URL (from Convex dashboard): ');
  console.log('');

  console.log('📋 Environment Variables for Netlify:');
  console.log('=====================================');
  console.log('');
  console.log('Copy these to your Netlify dashboard:');
  console.log('');
  console.log(`NEXTAUTH_SECRET=${nextauthSecret}`);
  console.log(`NEXTAUTH_URL=${nextauthUrl}`);
  console.log(`NEXT_PUBLIC_CONVEX_URL=${convexUrl}`);
  console.log('');

  console.log('📝 Instructions:');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site Settings > Environment Variables');
  console.log('3. Add each variable above');
  console.log('4. Redeploy your site');
  console.log('');

  const createLocalFile = await question('Would you like to create a .env.local file for local testing? (y/n): ');
  
  if (createLocalFile.toLowerCase() === 'y') {
    const envContent = `# Local development environment variables
NEXTAUTH_SECRET=${nextauthSecret}
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=${convexUrl}
NODE_ENV=development
`;

    const fs = require('fs');
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Created .env.local file');
  }

  console.log('');
  console.log('🎉 Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Set the environment variables in Netlify');
  console.log('2. Redeploy your site');
  console.log('3. Test the authentication');
  console.log('4. Run "npm run debug-auth" if you encounter issues');

  rl.close();
}

main().catch(console.error); 