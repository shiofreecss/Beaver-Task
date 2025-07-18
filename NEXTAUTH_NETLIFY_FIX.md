# NextAuth Session Fix for Netlify Deployment

## Issue Description

You're experiencing a NextAuth client fetch error where `/api/auth/session` returns HTML instead of JSON:

```
[next-auth][error][CLIENT_FETCH_ERROR] 
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This happens because the NextAuth API routes are not being handled correctly by Netlify's serverless functions.

## Root Cause

The issue occurs when:
1. NextAuth API routes are not properly routed to Netlify functions
2. Environment variables are missing or incorrect
3. The middleware is blocking API routes
4. Netlify redirects are interfering with API calls

## Solution

### 1. Updated Netlify Configuration

The `netlify.toml` file has been updated with proper API route handling:

```toml
# Critical: Handle NextAuth.js API routes properly
[[redirects]]
  from = "/api/auth/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
  force = true

# Handle NextAuth.js callback URLs
[[redirects]]
  from = "/api/auth/callback/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
  force = true

# Handle all other API routes
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
  force = true
```

### 2. Environment Variables

Ensure these environment variables are set in your Netlify dashboard:

**Required:**
- `NEXTAUTH_SECRET` - A random string (32+ characters)
- `NEXTAUTH_URL` - Your Netlify app URL (e.g., https://your-app.netlify.app)
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex production URL
- `CONVEX_DEPLOYMENT` - Your Convex deployment name

**Optional:**
- `NEXTAUTH_DEBUG` - Set to "true" for debugging

### 3. Verification Steps

#### Step 1: Check Environment Variables
```bash
npm run verify-netlify-env
```

#### Step 2: Test Deployment
```bash
npm run verify-deployment
```

#### Step 3: Manual Testing
1. Visit your deployed app
2. Open browser developer tools
3. Go to Network tab
4. Try to login
5. Check if `/api/auth/session` returns JSON (not HTML)

### 4. Deployment Commands

```bash
# Build and deploy
npm run build:prod

# Deploy to Netlify
netlify deploy --prod --dir=.next

# Verify deployment
npm run verify-deployment
```

## Troubleshooting

### If the issue persists:

1. **Check Netlify Function Logs:**
   - Go to Netlify dashboard
   - Navigate to Functions tab
   - Check for any errors in the `___netlify-handler` function

2. **Verify Build Output:**
   - Ensure `.next` directory contains the built files
   - Check that API routes are present in the build

3. **Test API Routes Directly:**
   ```bash
   curl -H "Accept: application/json" https://your-app.netlify.app/api/auth/session
   ```

4. **Check for Redirect Conflicts:**
   - Ensure no conflicting redirects in `netlify.toml`
   - Remove any custom redirects that might interfere with API routes

### Common Issues and Fixes

#### Issue: "Function not found" errors
**Fix:** Ensure the `@netlify/plugin-nextjs` plugin is properly configured

#### Issue: Environment variables not loading
**Fix:** Redeploy after setting environment variables in Netlify dashboard

#### Issue: CORS errors
**Fix:** Check that `NEXTAUTH_URL` matches your actual deployment URL

#### Issue: Session not persisting
**Fix:** Ensure cookies are enabled and `NEXTAUTH_SECRET` is set

## Prevention

To prevent this issue in future deployments:

1. Always run `npm run verify-netlify-env` before deploying
2. Use the provided verification scripts
3. Test authentication flow after each deployment
4. Keep environment variables up to date

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)

## Support

If you continue to experience issues:

1. Check the Netlify function logs
2. Run the verification scripts
3. Compare your configuration with the provided examples
4. Ensure all environment variables are correctly set 