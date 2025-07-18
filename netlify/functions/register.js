const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

// Initialize Convex client
const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password, name, role = 'MEMBER' } = body;

    // Basic validation
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Import the Convex API (this would need to be available)
    const { api } = require('../../convex/_generated/api');

    // Create user in Convex
    const userId = await convexHttp.mutation(api.users.createUser, {
      email,
      password: hashedPassword,
      name,
      role,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'User created successfully',
        userId
      })
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
}; 