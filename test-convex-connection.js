const { ConvexHttpClient } = require("convex/browser");

// Function to test Convex connection
async function testConvexConnection() {
  console.log('🔍 Testing Convex connection...\n');

  // Try both environment variable names
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.error('❌ No Convex URL found in environment variables!');
    console.log('\nMissing both:');
    console.log('- CONVEX_URL');
    console.log('- NEXT_PUBLIC_CONVEX_URL');
    process.exit(1);
  }

  console.log(`📡 Attempting to connect to: ${convexUrl}`);

  try {
    const client = new ConvexHttpClient(convexUrl);
    
    // Try to make a simple query
    console.log('\n🔄 Testing query...');
    const result = await client.query('users:getUserByEmail')({ email: 'test@example.com' });
    
    console.log('\n✅ Convex connection successful!');
    console.log('Query result:', result);
    
  } catch (error) {
    console.error('\n❌ Convex connection failed!');
    console.error('Error details:', error);
    
    // Additional debugging info
    console.log('\n🔍 Debug Information:');
    console.log('- Node version:', process.version);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- CONVEX_URL set:', !!process.env.CONVEX_URL);
    console.log('- NEXT_PUBLIC_CONVEX_URL set:', !!process.env.NEXT_PUBLIC_CONVEX_URL);
    
    process.exit(1);
  }
}

// Run the test
testConvexConnection();