# Authentication Error Fix Guide

## Problem
When logging in with correct credentials on the deployed Netlify app, users are redirected to `/api/auth/error` instead of the dashboard.

## Root Cause
This error typically occurs when required environment variables are missing or incorrectly configured in the Netlify deployment.

## Solution

### 1. Check Current Environment Variables

Run the debug script to identify missing variables:

```bash
npm run debug-auth
```

### 2. Required Environment Variables

You need to set these variables in your Netlify dashboard:

#### NEXTAUTH_SECRET
- **Purpose**: Secret key for JWT token signing
- **How to generate**: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### NEXTAUTH_URL
- **Purpose**: Your production URL for NextAuth.js
- **Value**: Your Netlify domain (e.g., `https://task.beaver.foundation`)
- **Important**: Must include `https://` protocol

#### NEXT_PUBLIC_CONVEX_URL
- **Purpose**: Your Convex deployment URL
- **How to get**: 
  1. Go to [Convex Dashboard](https://dashboard.convex.dev)
  2. Select your project
  3. Copy the deployment URL
- **Example**: `https://your-project.convex.cloud`

### 3. Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to **Site Settings** > **Environment Variables**
3. Add each variable:
   - Key: `NEXTAUTH_SECRET`, Value: [generated secret]
   - Key: `NEXTAUTH_URL`, Value: `https://task.beaver.foundation`
   - Key: `NEXT_PUBLIC_CONVEX_URL`, Value: [your convex URL]

### 4. Redeploy

After setting the environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** > **Deploy site**
3. Wait for the deployment to complete

### 5. Verify the Fix

1. Visit your deployed app
2. Try logging in with valid credentials
3. You should be redirected to the dashboard instead of `/api/auth/error`

## Troubleshooting

### If the error persists:

1. **Check Netlify logs**:
   - Go to **Deploys** > **Latest deploy** > **Functions** tab
   - Look for any error messages

2. **Verify Convex connection**:
   ```bash
   npm run debug-auth
   ```

3. **Check browser console**:
   - Open browser dev tools
   - Look for any JavaScript errors

4. **Clear browser cache**:
   - Clear cookies and local storage
   - Try in incognito/private mode

### Common Issues:

1. **Wrong NEXTAUTH_URL**:
   - Must match your exact domain
   - Must include `https://`
   - No trailing slash

2. **Invalid NEXTAUTH_SECRET**:
   - Must be a random string
   - At least 32 characters recommended

3. **Convex URL issues**:
   - Must be the production URL, not development
   - Check if Convex deployment is active

## Local vs Production

The reason it works locally but not in production:

- **Local**: Environment variables are loaded from `.env.local`
- **Production**: Environment variables must be set in Netlify dashboard
- **Missing variables**: NextAuth.js fails to initialize properly

## Prevention

To prevent this in future deployments:

1. Always run `npm run debug-auth` before deploying
2. Use the deployment verification script: `npm run deploy:verify`
3. Set up environment variables immediately after creating a new Netlify site

## Support

If you're still experiencing issues:

1. Check the [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT.md)
2. Review the [Convex documentation](https://docs.convex.dev)
3. Check NextAuth.js [deployment guide](https://next-auth.js.org/configuration/options#deployment) 