# NewsNow - A Modern News Website

## Overview
NewsNow is a full-stack news website featuring a dynamic React frontend and a Node.js/Express backend. It fetches live news from multiple APIs, prioritizes articles with images, and provides a beautiful, responsive user experience.

## Features
- Live news headlines by category (Business, Sports, Tech, etc.)
- Responsive, mobile-friendly design
- Dynamic image handling and fallbacks
- Search and AI-powered summaries
- Backend API with error handling and caching
- Secure secret management (no API keys in repo)
- Deployed frontend (Netlify) and backend (Railway)

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Setup

1. **Clone the repository:**
   ```
   git clone https://github.com/ByteWarrior23/NewNow---A-News-Tool.git
   cd react3
   ```

2. **Install dependencies:**
   - Frontend:
     ```
     cd my-app
     npm install
     ```
   - Backend:
     ```
     cd ../backend
     npm install
     ```

3. **Environment Variables:**
   - Create a `.env` file in `backend/` with your API keys:
     ```
     NEWSAPI_KEY=your_newsapi_key
     GNEWS_KEY=your_gnews_key
     ```
   - For local frontend-backend connection, set in `my-app/.env`:
     ```
     REACT_APP_BACKEND_URL=http://localhost:5000
     ```

4. **Run Locally:**
   - Backend:
     ```
     cd backend
     npm start
     ```
   - Frontend:
     ```
     cd ../my-app
     npm start
     ```

## Deployment

- **Frontend:** Deploy `my-app` to Netlify (see `QUICK_DEPLOY.md`)
- **Backend:** Deploy `backend` to Railway (set secrets in dashboard)

## Live Demo

- Frontend: [https://newsnow-a-news-tool.netlify.app](https://newsnow-a-news-tool.netlify.app)
- Backend: [(https://newsnow-a-news-tool-production.up.railway.app/)]

## License

MIT

---

*See `DEPLOYMENT.md` and `QUICK_DEPLOY.md` for more details.*
