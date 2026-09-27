# Environment Configuration Guide

## Development (.env.local)
Used when running locally with `npm run dev`
```
VITE_API_URL=http://localhost:8081
```

## Production (.env.production)
Used when deployed to Vercel
```
VITE_API_URL=https://your-backend-domain.com
```

## Setup Steps

1. **Local Development:**
   - Make sure your backend is running on `http://localhost:8081`
   - Run `npm run dev` in the Maintenance folder
   - Login page will use `.env.local` configuration

2. **Production (Vercel):**
   - Update `.env.production` with your actual backend URL
   - Once you deploy your backend (Railway, Render, etc.), add that URL
   - Example: `VITE_API_URL=https://maintenance-backend.railway.app`

3. **Redeploy on Vercel:**
   - After updating `.env.production`, push to GitHub
   - Vercel will automatically redeploy
   - Or manually redeploy from Vercel dashboard

## Backend Deployment Options

Since your backend is currently local, you can deploy it to:
- **Railway** (recommended for Node.js) - railway.app
- **Render** - render.com
- **Heroku** - heroku.com
- **AWS EC2** - aws.amazon.com

Would you like help setting up backend deployment?
