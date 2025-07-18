#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");

console.log('🔍 Beaver Task Authentication Debug Script');
console.log('==========================================\n');

// Check environment variables
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');
console.log('NEXT_PUBLIC_CONVEX_URL:', process.env.NEXT_PUBLIC_CONVEX_URL ? '✅ Set' : '❌ Not set');
console.log('CONVEX_DEPLOYMENT:', process.env.CONVEX_DEPLOYMENT ? '✅ Set' : '❌ Not set');

console.log('\n🔗 Testing Convex Connection...');

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL is not set. Cannot test connection.');
  process.exit(1);
}

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Test basic connection
async function testConnection() {
  try {
    console.log('Testing connection to Convex...');
    
    // Try to query a simple function to test connection
    const result = await client.query('users:getUserByEmail', { email: 'test@example.com' });
    console.log('✅ Convex connection successful');
    console.log('Query result:', result);
    
  } catch (error) {
    console.error('❌ Convex connection failed:', error.message);
    
    if (error.message.includes('401')) {
      console.error('   This might be an authentication issue with Convex');
    } else if (error.message.includes('404')) {
      console.error('   The Convex URL might be incorrect');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   Network connectivity issue or incorrect URL');
    }
  }
}

testConnection().then(() => {
  console.log('\n📋 Summary:');
  console.log('If you see ❌ for any environment variables, set them in your Netlify dashboard:');
  console.log('1. Go to Site Settings > Environment Variables');
  console.log('2. Add the missing variables');
  console.log('3. Redeploy your site');
  
  console.log('\nFor NEXTAUTH_SECRET, generate a random string:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  
  console.log('\nFor NEXTAUTH_URL, use your Netlify domain:');
  console.log('   https://your-app.netlify.app');
  
  console.log('\nFor NEXT_PUBLIC_CONVEX_URL, get it from your Convex dashboard');
}); 