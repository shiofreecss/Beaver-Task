# Netlify Deployment Fix for Authentication

## Issue Summary
When deploying to Netlify, users cannot login and get stuck at `/login` page.

## Root Cause
The authentication system is not properly configured for production deployment. Missing environment variables and incorrect redirect URLs.

## Solution

### 1. Required Environment Variables in Netlify

Add these environment variables in your Netlify dashboard:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-app.netlify.app

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Optional for debugging
NEXTAUTH_DEBUG=true
```

### 2. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Update Authentication Configuration

Replace the current auth configuration with the Netlify-optimized version:

1. Update `src/lib/auth-convex.ts` to use the new configuration
2. Ensure all redirect URLs use the production domain

### 4. Netlify Configuration

The `netlify.toml` file is already configured with proper redirects and headers.

### 5. Testing Steps

1. Deploy to Netlify
2. Check browser console for any authentication errors
3. Verify login functionality works correctly
4. Test logout and re-login

## Common Issues and Fixes

### Issue: "Invalid URL" errors
**Fix**: Ensure NEXTAUTH_URL matches your actual Netlify URL exactly

### Issue: "Convex connection failed"
**Fix**: Verify Convex deployment URL is correct and accessible

### Issue: Infinite redirect loop
**Fix**: Check that all redirect URLs in the auth configuration use absolute URLs

## Verification Checklist

- [ ] Environment variables set in Netlify
- [ ] NEXTAUTH_SECRET generated and added
- [ ] NEXTAUTH_URL matches actual deployment URL
- [ ] Convex URL is accessible
- [ ] Login functionality tested
- [ ] Logout functionality tested
- [ ] No console errors in browser