# Deployment Guide - Insight Sharing Digital Library

This guide covers multiple deployment options for your Insight Sharing app.

## Prerequisites

Before deploying, ensure you have:
- ✅ A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- ✅ Node.js 24.x installed locally (for testing)
- ✅ A domain name (optional, most platforms provide a free subdomain)

## Build Configuration Summary

Your app is now configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Dev Server**: `npm run dev` (runs on port 3000)
- **Production Optimizations**: Code splitting, minification, tree-shaking

---

## Option 1: Vercel (Recommended ⭐)

**Best for**: Easy deployment, automatic HTTPS, global CDN, generous free tier

### Steps:

1. **Install Vercel CLI** (optional, for command-line deployment):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub** (Recommended):
   - Push your code to a GitHub repository
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - Add `GEMINI_API_KEY` with your API key
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   cd d:\Insight
   vercel
   ```
   - Follow the prompts
   - Add environment variable when prompted: `GEMINI_API_KEY`

4. **Custom Domain**:
   - In Vercel dashboard, go to your project settings
   - Navigate to "Domains"
   - Add your custom domain and follow DNS configuration instructions

---

## Option 2: Netlify

**Best for**: Simple static hosting, form handling, serverless functions

### Steps:

1. **Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Add environment variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your API key
   - Click "Deploy"

2. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   cd d:\Insight
   netlify deploy --prod
   ```

3. **Custom Domain**:
   - In Netlify dashboard, go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS configuration instructions

---

## Option 3: GitHub Pages

**Best for**: Free hosting for public repositories

### Steps:

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json** - Add to scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts** - Change base path:
   ```typescript
   base: '/your-repo-name/',
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Configure GitHub**:
   - Go to your repository settings
   - Navigate to "Pages"
   - Set source to `gh-pages` branch
   - **Note**: Environment variables need to be handled differently (build-time only)

---

## Option 4: Custom Server (VPS/Cloud)

**Best for**: Full control, custom configurations

### Steps:

1. **Build the app locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Upload the `dist` folder** to your server

3. **Configure web server** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Set up HTTPS** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Variables Setup

All platforms require the `GEMINI_API_KEY` environment variable:

### Vercel:
- Dashboard → Project Settings → Environment Variables
- Or use CLI: `vercel env add GEMINI_API_KEY`

### Netlify:
- Dashboard → Site Settings → Environment Variables
- Or use CLI: `netlify env:set GEMINI_API_KEY your_key`

### GitHub Pages:
- Not recommended for sensitive API keys (client-side only)
- Consider using a backend proxy

### Custom Server:
- Set in your server's environment or use a `.env` file
- Ensure `.env` is not publicly accessible

---

## Testing Your Build Locally

Before deploying, test the production build:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

---

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test the AI librarian functionality
- [ ] Check that all images and assets load
- [ ] Test on mobile devices
- [ ] Verify HTTPS is working
- [ ] Test dark mode toggle
- [ ] Check browser console for errors
- [ ] Verify API key is working (not exposed in client)

---

## Troubleshooting

### Build Fails
- Ensure Node.js version 24.x is installed
- Run `npm install` to install all dependencies
- Check for TypeScript errors: `npm run build`

### API Key Not Working
- Verify the environment variable name is exactly `GEMINI_API_KEY`
- Check that the key is valid in [AI Studio](https://aistudio.google.com/app/apikey)
- Redeploy after adding environment variables

### 404 Errors on Refresh
- Ensure your hosting platform is configured for SPA routing
- Check that redirects are properly configured (see `vercel.json` or `netlify.toml`)

### Assets Not Loading
- Verify the `base` path in `vite.config.ts` matches your deployment path
- Check browser console for CORS or path errors

---

## Recommended Deployment Path

For most users, we recommend:

1. **Push code to GitHub** (free, version control)
2. **Deploy to Vercel** (easiest, best performance)
3. **Add custom domain** (optional)

Total time: ~10 minutes for first deployment!

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- GitHub Pages: https://pages.github.com

---

**Next Steps**: Choose your deployment platform and follow the steps above!
