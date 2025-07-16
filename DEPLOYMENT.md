# Deployment Guide: Netlify + Convex

This guide explains how to deploy the Beaver Task Manager to Netlify with Convex as the database.

## Prerequisites

1. Node.js 20 or later
2. Netlify account
3. Convex account
4. Git repository

## Step 1: Set up Convex

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

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local`:
   - `NEXTAUTH_SECRET`: Generate a random secret key
   - `NEXTAUTH_URL`: Your Netlify app URL (e.g., https://your-app.netlify.app)
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex production URL from step 1
   - `CONVEX_DEPLOYMENT`: Your Convex deployment name from step 1

## Step 3: Deploy to Netlify

### Option A: Connect Git Repository

1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`

### Option B: Manual Deploy

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

3. Login to Netlify:
   ```bash
   netlify login
   ```

4. Deploy:
   ```bash
   netlify deploy --prod --dir=.next
   ```

## Step 4: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to use your custom domain

## Step 5: Test Deployment

1. Visit your deployed app
2. Try registering a new account
3. Test creating tasks, projects, and other features
4. Verify data persistence

## Troubleshooting

### Build Errors

- Ensure all environment variables are set
- Check Convex deployment is successful
- Verify Node.js version is 20+

### Authentication Issues

- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployed URL
- Ensure cookies are enabled

### Database Connection

- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex deployment status
- Review Convex function logs

## Monitoring

- Use Netlify's built-in analytics
- Monitor Convex function performance in Convex dashboard
- Set up error tracking (optional)

## Updates

To update the deployed app:

1. Push changes to your Git repository (if using Git deployment)
2. Or run `netlify deploy --prod --dir=.next` for manual deployment
3. For database schema changes, run `npx convex deploy --prod`

## Security Considerations

- Use strong `NEXTAUTH_SECRET`
- Enable HTTPS (automatic with Netlify)
- Regularly update dependencies
- Monitor access logs 