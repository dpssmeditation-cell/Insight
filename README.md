<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Insight Sharing - Digital Library

A digital library interface exploring history, culture, and wisdom, featuring an AI-powered librarian for in-depth book analysis.

View your app in AI Studio: https://ai.studio/apps/drive/1vB1LNeZH7p_1cfYk7Vt_pYGrg8_cGqfZ

## Run Locally

**Prerequisites:** Node.js 24.x

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example env file
   copy .env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   # Get your key from: https://aistudio.google.com/app/apikey
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

1. **Run pre-deployment checks:**
   ```bash
   npm run check-deploy
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Deploy to a Domain

This app is ready to deploy to various hosting platforms! See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions on deploying to:

- ⭐ **Vercel** (Recommended - easiest setup)
- **Netlify** (Great alternative)
- **GitHub Pages** (Free for public repos)
- **Custom Server** (Full control)

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add `GEMINI_API_KEY` environment variable
4. Deploy! 🚀

## Project Structure

```
insight-sharing/
├── components/          # React components
├── services/           # API services
├── App.tsx             # Main app component
├── constants.ts        # App constants
├── types.ts            # TypeScript types
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel deployment config
├── netlify.toml        # Netlify deployment config
└── DEPLOYMENT.md       # Comprehensive deployment guide
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check-deploy` - Validate deployment readiness
- `npm run lint` - Run ESLint

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Google Gemini API](https://ai.google.dev/)

