#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Setting up Netlify Environment Variables...\n');

// Environment variables from .env copy.bk
const envVars = {
  'NEXTAUTH_URL': 'https://task.beaver.foundation',
  'NEXTAUTH_SECRET': 'BhJXVmECh0eVX5wIy8FVC+mY1r5fmcadHZPz9bVNx/8=',
  'NEXT_PUBLIC_CONVEX_URL': 'https://sensible-alpaca-390.convex.cloud',
  'CONVEX_DEPLOYMENT': 'prod:sensible-alpaca-3903',
  'CONVEX_URL': 'https://sensible-alpaca-390.convex.cloud',
  'CONVEX_DEPLOY_KEY': 'prod:sensible-alpaca-390|eyJ2MiI6IjExOGMxNDhjZDZmZjQyMmVhNTQ3NTJiODgxODg3Y2ViIn0=',
  'NODE_ENV': 'production'
};

// Set each environment variable
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`netlify env:set ${key} "${value}" --context production --force`, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.error(`❌ Failed to set ${key}:`, error.message);
  }
});

console.log('\n🎉 Environment variables setup complete!');
console.log('📝 Next steps:');
console.log('1. Redeploy your site: netlify deploy --prod');
console.log('2. Verify the deployment: npm run verify-deployment'); 