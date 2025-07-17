# Netlify Deployment Guide for Beaver Task

This guide explains how to deploy the Beaver Task Manager to Netlify with Convex as the database.

---

## Prerequisites

- Node.js 20 or later
- Netlify account
- Convex account
- Git repository

---

## 1. Set up Convex

1. Install Convex CLI globally:
   ```bash
   npm install -g convex
   ```
2. Login to Convex:
   ```bash
   npx convex login
   ```
3. Initialize Convex (if not already done):
   ```bash
   npx convex dev
   ```
   Follow the prompts to create a new project.
4. Deploy to Convex production:
   ```bash
   npx convex deploy --prod
   ```

---

## 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update the values in `.env.local`:
   - `NEXTAUTH_SECRET`: Generate a random secret key
   - `NEXTAUTH_URL`: Your Netlify app URL (e.g., https://your-app.netlify.app)
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex production URL from step 1
   - `CONVEX_DEPLOYMENT`: Your Convex deployment name from step 1

> **Tip:** You can also set these variables in the Netlify dashboard under Site Settings > Environment Variables.

---

## 3. Deploy to Netlify

### Option A: Connect Git Repository

1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build:prod`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`

### Option B: Manual Deploy

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Deploy using the convenience script:
   ```bash
   npm run deploy:netlify
   ```
   Or manually:
   ```bash
   npm run build:prod
   netlify deploy --prod --dir=.next
   ```

### Option C: Deploy and Verify

Use the combined script to deploy and automatically verify the deployment:
```bash
SITE_URL=https://your-app.netlify.app npm run deploy:verify
```

---

## 4. Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to use your custom domain

---

## 5. Test Deployment

### Automated Testing
1. Run the deployment verification script:
   ```bash
   SITE_URL=https://your-app.netlify.app npm run verify-deployment
   ```
   This script will test:
   - Root path routing (should redirect to /login if not authenticated)
   - Login and register page accessibility
   - API routes functionality
   - Protected routes behavior
   - 404 handling

### Manual Testing
1. Visit your deployed app
2. Test the authentication flow:
   - Not logged in users should be redirected to `/login`
   - After login, users should see the dashboard at `/`
3. Try registering a new account
4. Test creating tasks, projects, and other features
5. Verify data persistence
6. Test navigation between different pages
7. Check that protected routes require authentication

---

## 6. Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check Convex deployment is successful
- Verify Node.js version is 20+

### Authentication Issues
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployed URL
- Ensure cookies are enabled
- Clear browser cache and cookies

### Routing Issues
- Ensure `@netlify/plugin-nextjs` is installed and configured
- Check that middleware is properly configured for Netlify
- Verify that the build command uses `npm run build:prod`
- Make sure no custom redirect rules conflict with Next.js routing

### Database Connection
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex deployment status
- Review Convex function logs

### Common Netlify-specific Issues
- **Subdomain routing not working**: Ensure the `@netlify/plugin-nextjs` plugin is properly configured
- **Authentication redirects failing**: Check that `NEXTAUTH_URL` includes the correct protocol (https://)
- **API routes not working**: Verify that API routes are not being cached by adding proper headers
- **Static files not loading**: Check that the publish directory is set to `.next`

---

## 7. Monitoring & Updates

- Use Netlify's built-in analytics
- Monitor Convex function performance in Convex dashboard
- Set up error tracking (optional)
- To update the deployed app:
  1. Push changes to your Git repository (if using Git deployment)
  2. Or run `netlify deploy --prod --dir=.next` for manual deployment
  3. For database schema changes, run `npx convex deploy --prod`

---

## 8. Security Considerations

- Use a strong `NEXTAUTH_SECRET`
- Enable HTTPS (automatic with Netlify)
- Regularly update dependencies
- Monitor access logs 