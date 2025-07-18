# Authentication Troubleshooting Guide

This guide helps resolve authentication issues, particularly the redirect to `/api/auth/error` in production.

## Problem Description

When logging in with correct credentials in production, users are redirected to `https://task.beaver.foundation/api/auth/error` instead of the dashboard.

## Root Cause Analysis

The most common cause is incorrect environment variable configuration, specifically:

1. **NEXTAUTH_URL** not set correctly for production
2. **NEXTAUTH_SECRET** missing or incorrect
3. **NEXT_PUBLIC_CONVEX_URL** pointing to wrong deployment
4. **Cookie domain issues** in production

## Solution Steps

### 1. Check Environment Variables in Netlify

Go to your Netlify dashboard → Site Settings → Environment Variables and verify:

```bash
# Required for production
NEXTAUTH_URL=https://task.beaver.foundation
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Optional for debugging
NEXTAUTH_DEBUG=true
```

### 2. Verify NEXTAUTH_URL Format

The `NEXTAUTH_URL` must:
- Include the full protocol (`https://`)
- Match your production domain exactly
- Not have trailing slashes

**Correct:**
```
NEXTAUTH_URL=https://task.beaver.foundation
```

**Incorrect:**
```
NEXTAUTH_URL=http://task.beaver.foundation
NEXTAUTH_URL=https://task.beaver.foundation/
NEXTAUTH_URL=task.beaver.foundation
```

### 3. Generate a New NEXTAUTH_SECRET

If you're unsure about your secret, generate a new one:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Check Convex Deployment

Verify your Convex deployment is active:

```bash
npx convex deploy --prod
```

Check the deployment URL matches `NEXT_PUBLIC_CONVEX_URL`.

### 5. Test Environment Variables

Run the deployment verification script:

```bash
npm run verify-deployment
```

### 6. Clear Browser Data

In production, clear:
- Cookies for your domain
- Local storage
- Session storage

### 7. Check Netlify Function Logs

1. Go to Netlify dashboard → Functions
2. Look for any errors in the `api/auth/[...nextauth]` function
3. Check for timeout or memory issues

## Debugging Steps

### Enable Debug Mode

Add to your Netlify environment variables:
```bash
NEXTAUTH_DEBUG=true
```

This will provide detailed logs in the Netlify function logs.

### Check Authentication Flow

1. Open browser developer tools
2. Go to Network tab
3. Try to login
4. Look for requests to `/api/auth/callback/credentials`
5. Check the response status and headers

### Verify Cookie Settings

Check that cookies are being set correctly:
1. Open browser developer tools
2. Go to Application/Storage tab
3. Look for `next-auth.session-token` cookie
4. Verify domain and secure flags

## Common Error Codes

### Configuration Error
- **Cause**: Missing or incorrect `NEXTAUTH_URL`
- **Solution**: Set `NEXTAUTH_URL=https://task.beaver.foundation`

### AccessDenied Error
- **Cause**: User not found or invalid credentials
- **Solution**: Check user exists in database and password is correct

### Verification Error
- **Cause**: Expired or invalid verification token
- **Solution**: Clear browser data and try again

### Default Error
- **Cause**: Generic authentication failure
- **Solution**: Check all environment variables and Convex connection

## Production Checklist

Before deploying to production, ensure:

- [ ] `NEXTAUTH_URL` is set to production domain
- [ ] `NEXTAUTH_SECRET` is a strong, random string
- [ ] `NEXT_PUBLIC_CONVEX_URL` points to production deployment
- [ ] Convex deployment is active and accessible
- [ ] Netlify functions have sufficient memory/timeout
- [ ] HTTPS is enabled (automatic with Netlify)
- [ ] Custom domain is properly configured

## Testing Authentication

### Manual Testing
1. Visit `https://task.beaver.foundation/login`
2. Enter valid credentials
3. Should redirect to dashboard, not error page

### Automated Testing
```bash
# Test the deployment
SITE_URL=https://task.beaver.foundation npm run verify-deployment
```

## Emergency Fixes

If authentication is completely broken:

1. **Rollback to previous deployment** in Netlify
2. **Check environment variables** haven't been changed
3. **Verify Convex deployment** is still active
4. **Clear all browser data** and test again

## Monitoring

Set up monitoring for:
- Authentication success/failure rates
- Error page visits
- API response times
- Convex function performance

## Support

If issues persist:
1. Check Netlify function logs
2. Verify all environment variables
3. Test with a fresh browser session
4. Contact support with error logs 