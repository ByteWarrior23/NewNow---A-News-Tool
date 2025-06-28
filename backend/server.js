const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache
const newsCache = {};
const aiCache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// NewsAPI keys rotation
const NEWSAPI_KEYS = [
  'cef746d60bcb472495f74deff9156436',
  '2479479084c04b4d8278c0c474687c0e',
  'c7d0ed6e8f834215b2f4f0f2f40443fa',
  '3befea5a207042ada2bc0c15e097eb8b',
  '29b19221c70c4d6eaf44479bdca67d0b',
];
let newsApiKeyIndex = 0;
const GNEWS_API_KEY = 'a1111e26000d8f62f6362c05a5d01052';

// Helper: get next NewsAPI key
function getNextNewsApiKey() {
  const key = NEWSAPI_KEYS[newsApiKeyIndex];
  newsApiKeyIndex = (newsApiKeyIndex + 1) % NEWSAPI_KEYS.length;
  return key;
}

// NewsAPI proxy with caching and fallback
app.post('/api/news', async (req, res) => {
  let { query, page = 1, sortBy = 'publishedAt', trending } = req.body;
  if (!query) query = 'India';
  const cacheKey = `newsapi-${query}-page${page}-sortBy${sortBy}-trending${trending || false}`;
  const now = Date.now();
  if (newsCache[cacheKey] && now - newsCache[cacheKey].ts < CACHE_DURATION) {
    return res.json(newsCache[cacheKey].data);
  }
  let data = null;
  for (let i = 0; i < NEWSAPI_KEYS.length; i++) {
    const apiKey = getNextNewsApiKey();
    let url;
    if (trending) {
      url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=12&page=${page}&sortBy=${sortBy}&apiKey=${apiKey}`;
    } else {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=12&page=${page}&sortBy=${sortBy}&apiKey=${apiKey}`;
    }
    try {
      const response = await fetch(url);
      data = await response.json();
      if (data.status === 'ok') {
        newsCache[cacheKey] = { data, ts: now };
        return res.json(data);
      }
      if (data.code === 'rateLimited' || data.code === 'apiKeyExhausted' || (data.message && data.message.includes('too many requests'))) {
        continue;
      } else {
        break;
      }
    } catch (err) {
      continue;
    }
  }
  // If NewsAPI fails, try GNews
  let gnewsUrl;
  if (trending) {
    gnewsUrl = `https://gnews.io/api/v4/top-headlines?country=in&max=12&page=${page}&apikey=${GNEWS_API_KEY}`;
  } else {
    gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=12&page=${page}&apikey=${GNEWS_API_KEY}`;
  }
  try {
    const response = await fetch(gnewsUrl);
    data = await response.json();
    if (data.articles) {
      const converted = {
        status: 'ok',
        totalResults: data.totalArticles || data.articles.length,
        articles: data.articles.map(a => ({
          ...a,
          urlToImage: a.image,
          publishedAt: a.publishedAt,
          source: { name: a.source?.name || 'GNews' },
        })),
      };
      newsCache[cacheKey] = { data: converted, ts: now };
      return res.json(converted);
    }
  } catch (err) {}
  // Fallback to local JSON
  try {
    const fallback = JSON.parse(fs.readFileSync(__dirname + '/fallbackNews.json', 'utf8'));
    return res.json(fallback);
  } catch (err) {
    return res.status(500).json({ error: 'All news sources failed and no fallback available.' });
  }
});

// GNews proxy (for direct use, also with fallback)
app.post('/api/gnews', async (req, res) => {
  const { query, page = 1 } = req.body;
  const cacheKey = `gnews-${query}-page${page}`;
  const now = Date.now();
  if (newsCache[cacheKey] && now - newsCache[cacheKey].ts < CACHE_DURATION) {
    return res.json(newsCache[cacheKey].data);
  }
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=12&page=${page}&apikey=${GNEWS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.articles) {
      newsCache[cacheKey] = { data, ts: now };
      return res.json(data);
    }
  } catch (err) {}
  // Fallback to local JSON
  try {
    const fallback = JSON.parse(fs.readFileSync(__dirname + '/fallbackNews.json', 'utf8'));
    return res.json(fallback);
  } catch (err) {
    return res.status(500).json({ error: 'All news sources failed and no fallback available.' });
  }
});

// OpenAI proxy with AI summary caching
app.post('/api/openai', async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  const now = Date.now();
  if (aiCache[cacheKey] && now - aiCache[cacheKey].ts < CACHE_DURATION) {
    return res.json(aiCache[cacheKey].data);
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    aiCache[cacheKey] = { data, ts: now };
    res.json(data);
  } catch (err) {
    // Fallback: return a friendly message
    res.json({ choices: [{ message: { content: 'Our AI assistant is temporarily unavailable. Please check back soon!' } }] });
  }
});

// Gemini proxy with AI summary caching
app.post('/api/gemini', async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  const now = Date.now();
  if (aiCache[cacheKey] && now - aiCache[cacheKey].ts < CACHE_DURATION) {
    return res.json(aiCache[cacheKey].data);
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    aiCache[cacheKey] = { data, ts: now };
    res.json(data);
  } catch (err) {
    // Fallback: return a friendly message
    res.json({ candidates: [{ content: { parts: [{ text: 'Our AI assistant is temporarily unavailable. Please check back soon!' }] } }] });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend proxy server running on port ${PORT}`);
}); 