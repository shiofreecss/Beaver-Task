# 🚨 EMERGENCY: Authentication Fix for Netlify Deployment

## Problem Summary
Users are being redirected to `/api/auth/error` after login on Netlify because **critical environment variables are missing**.

## Root Cause
NextAuth.js requires specific environment variables to function properly. Without them, authentication fails and redirects to the error page.

## ✅ IMMEDIATE FIX

### Step 1: Set Environment Variables on Netlify

Go to your Netlify dashboard → Site settings → Environment variables and add:

```bash
# CRITICAL - Authentication
NEXTAUTH_URL=https://task.beaver.foundation
NEXTAUTH_SECRET=your-32-character-secret-key-here

# Database & Convex
CONVEX_DEPLOY_KEY=your-convex-deploy-key
CONVEX_URL=your-convex-url
DATABASE_URL=your-database-url

# Email (for password reset)
EMAIL_SERVER_HOST=your-smtp-host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-user
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@beaver.foundation
```

### Step 2: Generate NEXTAUTH_SECRET

```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

### Step 3: Redeploy

1. Save all environment variables in Netlify
2. Go to Netlify dashboard
3. Click "Trigger deploy" → "Deploy site"
4. Wait for deployment to complete

### Step 4: Verify Fix

```bash
npm run verify-netlify-env
```

## 🔧 Files Modified

1. **`src/lib/auth-convex.ts`** - Added error handling and debugging
2. **`netlify.toml`** - Added NextAuth redirects
3. **`scripts/verify-netlify-env.js`** - Environment verification script
4. **`docs/NETLIFY_AUTH_FIX.md`** - Comprehensive fix guide

## 🎯 Expected Result

After setting environment variables and redeploying:
- ✅ Login should work correctly
- ✅ Users should redirect to dashboard, not error page
- ✅ Authentication should persist across sessions

## 🚨 If Still Not Working

1. Check Netlify function logs for specific errors
2. Verify all environment variables are set correctly
3. Clear browser cache and cookies
4. Test with a fresh browser session

## 📞 Support

If you need help:
1. Check the logs in Netlify dashboard
2. Run `npm run verify-netlify-env` to check variables
3. Ensure NEXTAUTH_URL matches your exact domain

---

**Remember:** The key is having `NEXTAUTH_URL` and `NEXTAUTH_SECRET` correctly configured! 