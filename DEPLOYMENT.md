# Deployment Guide - Vercel

This guide explains how to deploy the Vite React SPA to Vercel.

## Overview

The application is now a pure Vite + React SPA that can be deployed to Vercel with automatic build detection and configuration.

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

Vercel will automatically detect the Vite configuration and deploy correctly.

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository (`Juaconsio/masterclass-frontend`)
   - Select the branch: `copilot/convert-astro-app-to-spa` (or main after merge)

2. **Configure Project** (Auto-detected)
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   Add the following environment variable in Vercel dashboard:
   ```
   PUBLIC_BACKEND_API_URL=your_backend_api_url_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Deployment usually takes 1-2 minutes

### Option 2: Vercel CLI Deployment

Install Vercel CLI and deploy from command line:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### Option 3: Manual Configuration

If you need to manually configure, create/update `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This file is already included in the repository.

## Build Process

The build process includes automatic markdown conversion:

1. `npm run build` executes:
   - `npm run convert:content` - Converts markdown files to JSON
   - `tsc` - TypeScript compilation
   - `vite build` - Production build

2. Build artifacts:
   - `dist/` directory with optimized assets
   - ~628KB JS (195KB gzipped)
   - ~181KB CSS (29KB gzipped)

## Environment Variables

### Required Variables

- `PUBLIC_BACKEND_API_URL`: Backend API endpoint URL

### Setting Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add variables for each environment:
   - Production
   - Preview
   - Development

3. Click "Save"

**Note**: In Vite, environment variables must be prefixed with `PUBLIC_` to be accessible in the browser.

## Deployment Verification

After deployment, verify the following:

### 1. Routes Working
- ✅ `/` - Landing page
- ✅ `/about` - About page
- ✅ `/courses` - Courses listing
- ✅ `/ingresar` - Student login
- ✅ `/registrar` - Student registration
- ✅ `/admin/ingresar` - Admin login
- ✅ `/app/*` - Protected student routes
- ✅ `/admin/*` - Protected admin routes

### 2. Content Loading
- ✅ Featured courses display on landing page (4 courses)
- ✅ Reviews carousel shows on landing page (6 reviews)
- ✅ All courses page shows all 5 courses
- ✅ Course cards display correctly with:
  - Department badges
  - Level badges
  - Prerequisites (collapsible)
  - Images (if available)

### 3. Features Working
- ✅ Navigation links work
- ✅ React Router client-side routing
- ✅ USAL animations trigger on scroll
- ✅ Lucide icons display
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Login/registration forms accessible

### 4. Performance
Check Vercel deployment metrics:
- Build time: ~6-8 seconds
- Cold start: < 1 second
- Time to Interactive: < 2 seconds
- Lighthouse score: 90+ recommended

## Troubleshooting

### Issue: Routes return 404
**Solution**: Verify `vercel.json` has the rewrites configuration to route all paths to `index.html` for client-side routing.

### Issue: Environment variables not working
**Solution**: 
1. Ensure variables are prefixed with `PUBLIC_`
2. Redeploy after adding/changing environment variables
3. Check that variables are set for the correct environment (Production/Preview)

### Issue: Build fails
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify Node.js version compatibility (should use Node 18+)
3. Ensure all dependencies are in `package.json`
4. Try building locally: `npm run build`

### Issue: Courses/Reviews not displaying
**Solution**:
1. Check that markdown files exist in `src/data/courses/` and `src/data/reviews/`
2. Verify conversion script runs: `npm run convert:content`
3. Check that JSON files are generated in `src/data/`
4. Verify `src/lib/content.ts` imports JSON correctly

### Issue: Images not loading
**Solution**:
1. Verify images are in `public/images/` directory
2. Check image paths in course markdown frontmatter
3. Use absolute paths: `/images/filename.png`

## Continuous Deployment

Vercel automatically sets up continuous deployment:

1. **Push to Branch**
   ```bash
   git push origin copilot/convert-astro-app-to-spa
   ```

2. **Automatic Build**
   - Vercel detects the push
   - Triggers build automatically
   - Deploys to preview URL

3. **Production Deployment**
   - Merge PR to main branch
   - Vercel builds and deploys to production domain
   - Previous deployment becomes a rollback point

## Custom Domain

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `salvaramos.cl`)
3. Follow DNS configuration instructions:
   - Add A record: `76.76.21.21`
   - Add CNAME record: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)
5. Enable HTTPS (automatic with Vercel)

## Rollback

To rollback to a previous deployment:

1. Go to Deployments tab
2. Find the deployment you want to rollback to
3. Click "..." menu → "Promote to Production"

## Monitoring

Vercel provides monitoring features:

### Analytics
- Page views
- Unique visitors
- Top pages
- Performance metrics

### Logs
- Build logs
- Runtime logs (if using API routes)
- Error tracking

### Performance
- Core Web Vitals
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

## Best Practices

### 1. Environment Management
- Use different API endpoints for production/preview
- Never commit secrets to git
- Use Vercel environment variables

### 2. Performance Optimization
- Enable Vercel Speed Insights
- Use Image Optimization API for course images
- Consider code splitting for large routes

### 3. Security
- Enable HTTPS (automatic with Vercel)
- Set up CORS properly on backend
- Use Vercel Firewall for DDoS protection

### 4. Monitoring
- Enable Vercel Analytics
- Set up error tracking (e.g., Sentry)
- Monitor Core Web Vitals

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/
- **React Router**: https://reactrouter.com/
- **Vercel Community**: https://github.com/vercel/vercel/discussions

## Quick Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (with CLI)
vercel --prod

# Check deployment status
vercel list

# View logs
vercel logs
```

## Checklist Before Deployment

- [ ] Update environment variables in Vercel
- [ ] Test build locally: `npm run build`
- [ ] Verify all routes work in preview build: `npm run preview`
- [ ] Check that courses and reviews load correctly
- [ ] Test on mobile devices (responsive design)
- [ ] Verify authentication flows work
- [ ] Check backend API connectivity
- [ ] Review Vercel deployment settings
- [ ] Set up custom domain (if applicable)
- [ ] Enable Vercel Analytics
- [ ] Configure error monitoring

## Post-Deployment

After successful deployment:

1. **Test All Routes**
   - Navigate through all pages
   - Test authentication flows
   - Verify protected routes
   - Check mobile responsiveness

2. **Monitor Performance**
   - Check Vercel Analytics dashboard
   - Review Core Web Vitals
   - Monitor error rates

3. **Update Documentation**
   - Update README with production URL
   - Document any environment-specific configurations
   - Note any deployment issues encountered

4. **Communicate**
   - Notify team of deployment
   - Share production URL
   - Document any breaking changes

---

**Deployment Status**: ✅ Ready for Production

**Estimated Deployment Time**: 1-2 minutes

**Framework**: Vite + React + React Router

**Hosting**: Vercel (Serverless)
