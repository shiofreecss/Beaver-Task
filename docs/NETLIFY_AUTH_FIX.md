# Netlify Authentication Fix Guide

## 🚨 CRITICAL: Fix for "/api/auth/error" Redirect Issue

If you're experiencing redirects to `/api/auth/error` after login on Netlify, this guide will fix it immediately.

## Root Cause

The issue occurs when NextAuth.js environment variables are missing or incorrectly configured on Netlify. This causes authentication failures and redirects to the error page.

## Immediate Fix Steps

### 1. Set Required Environment Variables

Go to your Netlify dashboard → Site settings → Environment variables and add:

```bash
# CRITICAL - Must be set correctly
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your-32-character-secret-key-here

# Database and Convex
CONVEX_DEPLOY_KEY=your-convex-deploy-key
CONVEX_URL=your-convex-url
DATABASE_URL=your-database-url

# Email configuration
EMAIL_SERVER_HOST=your-smtp-host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-user
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Generate a Strong NEXTAUTH_SECRET

```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

### 3. Verify Your NEXTAUTH_URL

- Must use HTTPS in production
- Must match your exact Netlify domain
- No trailing slash
- Example: `https://beaver-task.netlify.app`

### 4. Redeploy Your Site

After setting environment variables:

1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

## Verification Commands

### Check Environment Variables

```bash
npm run verify-netlify-env
```

### Setup Environment Variables

```bash
npm run setup:netlify-env
```

## Common Issues and Solutions

### Issue: Still redirecting to /api/auth/error

**Solution:**
1. Check Netlify function logs for errors
2. Verify NEXTAUTH_SECRET is exactly 32+ characters
3. Ensure NEXTAUTH_URL matches your domain exactly
4. Clear browser cache and cookies

### Issue: Works locally but not on Netlify

**Solution:**
1. Local development uses different environment variables
2. Netlify needs production environment variables
3. Check that all variables are set in Netlify dashboard

### Issue: Authentication succeeds but redirects to error page

**Solution:**
1. Check the redirect callback in auth configuration
2. Verify middleware configuration
3. Check for conflicting redirects in netlify.toml

## Debug Mode

To enable debug logging, add to Netlify environment variables:

```bash
NEXTAUTH_DEBUG=true
```

This will show detailed authentication logs in Netlify function logs.

## Testing the Fix

1. Clear browser cache and cookies
2. Visit your Netlify site
3. Try logging in with valid credentials
4. Should redirect to dashboard, not error page

## Emergency Rollback

If the fix doesn't work:

1. Check Netlify function logs for specific errors
2. Verify all environment variables are set correctly
3. Try redeploying with debug mode enabled
4. Contact support with specific error messages

## Prevention

- Always run `npm run verify-netlify-env` before deployment
- Use the predeploy script: `npm run predeploy:netlify`
- Monitor Netlify function logs for authentication errors
- Test authentication flow after each deployment

## Support

If you're still experiencing issues:

1. Check Netlify function logs
2. Verify all environment variables
3. Test with debug mode enabled
4. Provide specific error messages for troubleshooting

---

**Remember:** The key is having `NEXTAUTH_URL` and `NEXTAUTH_SECRET` correctly configured for your Netlify domain! 