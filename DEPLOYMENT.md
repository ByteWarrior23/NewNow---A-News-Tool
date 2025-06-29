# 🚀 Deploy Your News App to Netlify

## Quick Deployment Steps

### 1. Frontend Deployment (Netlify)

1. **Go to [Netlify](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Connect your GitHub account**
4. **Select your repository**: `ByteWarrior23/NewNow---A-News-Tool`
5. **Configure build settings**:
   - **Base directory**: `my-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. **Click "Deploy site"**

### 2. Backend Deployment (Railway/Render)

Since Netlify is for frontend, you'll need to deploy your backend separately:

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Connect your GitHub account
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `NEWSAPI_KEYS` (comma-separated)
   - `GNEWS_API_KEY`

#### Option B: Render
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Add environment variables

### 3. Update Frontend API URLs

After deploying the backend, update the API URLs in your frontend:

1. Get your backend URL (e.g., `https://your-app.railway.app`)
2. Update `netlify.toml` with your backend URL
3. Redeploy the frontend

### 4. Environment Variables

Make sure to set these environment variables in your backend deployment:

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
NEWSAPI_KEYS=key1,key2,key3,key4,key5
GNEWS_API_KEY=your_gnews_key
```

### 5. Share Your Website

Once deployed, you'll get a URL like:
- Frontend: `https://your-app-name.netlify.app`
- Backend: `https://your-app.railway.app`

Share the frontend URL with your friends! 🎉

## Troubleshooting

- **Build fails**: Check if all dependencies are in `package.json`
- **API errors**: Verify environment variables are set correctly
- **CORS issues**: Make sure backend URL is correct in frontend

## Support

If you need help, check the Netlify and Railway documentation! 