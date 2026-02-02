# 🚀 Quick Deployment Reference

## Pre-Deployment Checklist

```bash
# 1. Check deployment readiness
npm run check-deploy

# 2. Install dependencies (if not already done)
npm install

# 3. Test build locally
npm run build

# 4. Preview production build
npm run preview
```

## Fastest Path to Production (Vercel)

### Option A: Via GitHub (Recommended)
1. Create GitHub repository
2. Push code: `git push origin main`
3. Visit [vercel.com/new](https://vercel.com/new)
4. Import repository
5. Add environment variable: `GEMINI_API_KEY`
6. Click Deploy ✅

### Option B: Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY

# Redeploy with env var
vercel --prod
```

## Environment Variable Required

**Name:** `GEMINI_API_KEY`  
**Get it from:** https://aistudio.google.com/app/apikey

## Custom Domain Setup

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

### Netlify
1. Site Settings → Domain Management
2. Add custom domain
3. Update DNS records as shown

## Build Configuration Summary

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | 24.x |
| Install Command | `npm install` |

## Deployment Files Created

- ✅ `vercel.json` - Vercel configuration
- ✅ `netlify.toml` - Netlify configuration
- ✅ `.env.example` - Environment template
- ✅ `DEPLOYMENT.md` - Full deployment guide
- ✅ `check-deployment.js` - Pre-deployment validator

## Common Issues & Solutions

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variable not working
- Verify exact name: `GEMINI_API_KEY`
- Redeploy after adding env vars
- Check platform-specific env var syntax

### 404 on page refresh
- Ensure SPA routing is configured
- Check `vercel.json` or `netlify.toml` redirects

## Support Links

- 📖 Full Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🔧 Vercel Docs: https://vercel.com/docs
- 🌐 Netlify Docs: https://docs.netlify.com
- ⚡ Vite Deploy: https://vitejs.dev/guide/static-deploy.html

---

**Estimated deployment time:** 5-10 minutes 🎉
