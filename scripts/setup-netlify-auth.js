#!/usr/bin/env node

/**
 * Netlify Authentication Setup Script
 * This script helps configure the required environment variables for Netlify deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🦫 Setting up Netlify authentication configuration...');

// Generate a secure NEXTAUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Create .env.local template for Netlify
const createEnvTemplate = () => {
  const secret = generateSecret();
  const envTemplate = `# Netlify Production Environment Variables
# Copy these to your Netlify dashboard under Site settings > Environment variables

# NextAuth Configuration
NEXTAUTH_SECRET=${secret}
NEXTAUTH_URL=https://task.beaver.foundation

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://hallowed-trout-823.convex.cloud 
CONVEX_DEPLOYMENT=dev:hallowed-trout-823 # team: shiodev-yan, project: beaver-task-c18d9

# Optional for debugging
NEXTAUTH_DEBUG=true
`;

  fs.writeFileSync('.env.local.template', envTemplate);
  console.log('✅ Created .env.local.template with generated secrets');
};

// Update package.json with Netlify-specific scripts
const updatePackageJson = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add Netlify build script
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:prod': 'npm run build',
    'deploy:netlify': 'npm run build && netlify deploy --prod'
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with Netlify scripts');
};

// Create deployment verification script
const createVerificationScript = () => {
  const verificationScript = `#!/usr/bin/env node

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_CONVEX_URL'
];

console.log('🔍 Verifying Netlify deployment configuration...');

let hasErrors = false;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(\`❌ Missing environment variable: \${envVar}\`);
    hasErrors = true;
  } else {
    console.log(\`✅ \${envVar}: \${envVar === 'NEXTAUTH_SECRET' ? '***' : process.env[envVar]}\`);
  }
});

if (hasErrors) {
  console.error('\\n❌ Configuration incomplete. Please add missing environment variables.');
  process.exit(1);
} else {
  console.log('\\n✅ All required environment variables are configured!');
}
`;

  fs.writeFileSync('scripts/verify-netlify-env.js', verificationScript);
  fs.chmodSync('scripts/verify-netlify-env.js', '755');
  console.log('✅ Created deployment verification script');
};

// Main execution
try {
  createEnvTemplate();
  updatePackageJson();
  createVerificationScript();
  
  console.log('\n🎉 Netlify authentication setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy the variables from .env.local.template to your Netlify dashboard');
  console.log('2. Update NEXTAUTH_URL with your actual Netlify URL');
  console.log('3. Update Convex URLs with your actual deployment');
  console.log('4. Run: npm run deploy:netlify');
  console.log('5. Run: node scripts/verify-netlify-env.js to verify configuration');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}