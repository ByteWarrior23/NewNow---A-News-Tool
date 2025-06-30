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
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (reduced for more dynamic content)

// NewsAPI keys rotation - using more reliable keys
const NEWSAPI_KEYS = [
  'cef746d60bcb472495f74deff9156436',
  '2479479084c04b4d8278c0c474687c0e',
  '3befea5a207042ada2bc0c15e097eb8b',
  '29b19221c70c4d6eaf44479bdca67d0b',
];
let newsApiKeyIndex = 0;
const GNEWS_API_KEY = 'a1111e26000d8f62f6362c05a5d01052';

// Credible news sources (higher priority)
const CREDIBLE_SOURCES = [
  'reuters', 'associated press', 'ap', 'bbc', 'cnn', 'nbc news', 'abc news', 
  'cbs news', 'fox news', 'usa today', 'wall street journal', 'new york times',
  'washington post', 'los angeles times', 'chicago tribune', 'boston globe',
  'the guardian', 'the independent', 'sky news', 'al jazeera', 'npr',
  'pbs', 'time', 'newsweek', 'the economist', 'bloomberg', 'cnbc',
  'forbes', 'techcrunch', 'ars technica', 'wired', 'the verge'
];

// Spam/clickbait keywords to filter out
const SPAM_KEYWORDS = [
  'click here', 'you won\'t believe', 'shocking', 'amazing', 'incredible',
  'mind-blowing', 'viral', 'trending', 'must see', 'breaking now',
  'exclusive', 'insider', 'secret', 'hidden', 'revealed', 'exposed'
];

// Helper: get next NewsAPI key
function getNextNewsApiKey() {
  const key = NEWSAPI_KEYS[newsApiKeyIndex];
  newsApiKeyIndex = (newsApiKeyIndex + 1) % NEWSAPI_KEYS.length;
  return key;
}

// Enhanced content quality filter
function filterQualityContent(articles, currentApiImages = []) {
  return articles.filter(article => {
    if (!article.title || !article.urlToImage) return false;
    
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const source = (article.source?.name || '').toLowerCase();
    
    // Check for spam/clickbait
    const hasSpamKeywords = SPAM_KEYWORDS.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    if (hasSpamKeywords) return false;
    
    // Image quality checks
    const hasValidImage = article.urlToImage && 
      article.urlToImage.includes('https://') && 
      !article.urlToImage.includes('null') &&
      !article.urlToImage.includes('undefined') &&
      article.urlToImage.length > 20 &&
      !currentApiImages.includes(article.urlToImage);
    
    if (!hasValidImage) return false;
    
    // Content quality checks
    const hasGoodTitle = title.length > 15 && title.length < 150;
    const hasGoodDescription = description.length > 30 && description.length < 300;
    const hasValidUrl = article.url && article.url.includes('http');
    const hasRecentDate = article.publishedAt && 
      new Date(article.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Within 7 days
    
    return hasGoodTitle && hasGoodDescription && hasValidUrl && hasRecentDate;
  });
}

// Source credibility scoring
function getSourceCredibilityScore(sourceName) {
  const source = sourceName.toLowerCase();
  if (CREDIBLE_SOURCES.some(credible => source.includes(credible))) {
    return 10; // Highest credibility
  }
  if (source.includes('news') || source.includes('times') || source.includes('post')) {
    return 7; // Medium credibility
  }
  return 3; // Lower credibility
}

// Sort articles by credibility and recency
function sortByCredibilityAndRecency(articles) {
  return articles.sort((a, b) => {
    const aScore = getSourceCredibilityScore(a.source?.name || '');
    const bScore = getSourceCredibilityScore(b.source?.name || '');
    
    // If credibility is similar, sort by date
    if (Math.abs(aScore - bScore) <= 2) {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
    
    return bScore - aScore;
  });
}

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'News Backend API is running!',
    version: '2.0',
    features: ['Enhanced content filtering', 'Source credibility scoring', 'Dynamic caching']
  });
});

// NewsAPI proxy with enhanced quality filtering
app.post('/api/news', async (req, res) => {
  try {
    let { query, page = 1, sortBy = 'publishedAt', trending, forceRefresh } = req.body;
    if (!query) query = 'India';
    const cacheKey = `newsapi-${query}-page${page}-sortBy${sortBy}-trending${trending || false}`;
    const now = Date.now();
    
    // Check cache first, unless forceRefresh is true
    if (!forceRefresh && newsCache[cacheKey] && now - newsCache[cacheKey].ts < CACHE_DURATION) {
      console.log(`📦 Serving cached data for: ${query}`);
      return res.json(newsCache[cacheKey].data);
    }

    console.log(`🔍 Fetching news for: ${query} (page ${page})`);
    
    // PRIORITY 1: Try NewsAPI with ALL keys first
    let data = null;
    let newsApiSuccess = false;
    let usedKey = null;
    
    for (let i = 0; i < NEWSAPI_KEYS.length; i++) {
      const apiKey = NEWSAPI_KEYS[i];
      let url;
      
      if (trending) {
          url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=30&page=${page}&sortBy=${sortBy}&apiKey=${apiKey}`;
      } else {
          url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=30&page=${page}&sortBy=relevancy&apiKey=${apiKey}`;
      }
      
      try {
        console.log(`📰 Trying NewsAPI key ${i + 1} for: ${query}`);
          const response = await fetch(url, { timeout: 10000 });
          
          if (!response.ok) {
            console.log(`❌ NewsAPI key ${i + 1} HTTP error: ${response.status}`);
            continue;
          }
          
        data = await response.json();
        
        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            // Enhanced quality filtering
            const qualityArticles = filterQualityContent(data.articles);
            
            if (qualityArticles.length > 0) {
              // Sort by credibility and recency
              const sortedArticles = sortByCredibilityAndRecency(qualityArticles);
              
              console.log(`✅ NewsAPI success with key ${i + 1}: ${sortedArticles.length} quality articles`);
            newsApiSuccess = true;
            usedKey = apiKey;
            
              // Return only the best articles
            const qualityData = {
              ...data,
                articles: sortedArticles.slice(0, 20), // Limit to 20 best articles
                totalResults: Math.min(data.totalResults || 1000, 1000),
                quality: {
                  filteredCount: qualityArticles.length,
                  totalCount: data.articles.length,
                  credibilityScore: sortedArticles[0] ? getSourceCredibilityScore(sortedArticles[0].source?.name || '') : 0
                }
            };
            
            newsCache[cacheKey] = { data: qualityData, ts: now };
            return res.json(qualityData);
          } else {
            console.log(`⚠️ NewsAPI key ${i + 1} returned articles but none met quality standards`);
            continue;
          }
        } else if (data.code === 'rateLimited' || data.code === 'apiKeyExhausted' || (data.message && data.message.includes('too many requests'))) {
          console.log(`⚠️ NewsAPI key ${i + 1} rate limited, trying next key`);
          continue;
        } else {
          console.log(`❌ NewsAPI key ${i + 1} failed: ${data.message || 'Unknown error'}`);
            continue;
        }
      } catch (err) {
        console.log(`❌ NewsAPI key ${i + 1} error: ${err.message}`);
        continue;
      }
    }

    // PRIORITY 2: If ALL NewsAPI keys failed, try GNews
    if (!newsApiSuccess) {
      console.log(`🌐 All NewsAPI keys failed, trying GNews for: ${query}`);
      let gnewsUrl;
      if (trending) {
          gnewsUrl = `https://gnews.io/api/v4/top-headlines?country=in&max=30&page=${page}&apikey=${GNEWS_API_KEY}`;
      } else {
          gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=30&page=${page}&apikey=${GNEWS_API_KEY}`;
      }
      
      try {
          const response = await fetch(gnewsUrl, { timeout: 10000 });
          
          if (!response.ok) {
            console.log(`❌ GNews HTTP error: ${response.status}`);
          } else {
        data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
              // Enhanced quality filtering for GNews
          const qualityArticles = data.articles.filter(article => {
            if (!article.title || !article.image) return false;
            
                const title = article.title.toLowerCase();
                const description = (article.description || '').toLowerCase();
                
                // Check for spam/clickbait
                const hasSpamKeywords = SPAM_KEYWORDS.some(keyword => 
                  title.includes(keyword) || description.includes(keyword)
                );
                if (hasSpamKeywords) return false;
                
                // Image quality checks
            const hasValidImage = article.image && 
              article.image.includes('https://') && 
              !article.image.includes('null') &&
              !article.image.includes('undefined') &&
              article.image.length > 20;
            
            if (!hasValidImage) return false;
            
                // Content quality checks
                const hasGoodTitle = title.length > 15 && title.length < 150;
                const hasGoodDescription = description.length > 30 && description.length < 300;
            const hasValidUrl = article.url && article.url.includes('http');
                const hasRecentDate = article.publishedAt && 
                  new Date(article.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
                return hasGoodTitle && hasGoodDescription && hasValidUrl && hasRecentDate;
          });
          
          if (qualityArticles.length > 0) {
                // Sort by credibility and recency
                const sortedArticles = qualityArticles.sort((a, b) => {
                  const aScore = getSourceCredibilityScore(a.source?.name || '');
                  const bScore = getSourceCredibilityScore(b.source?.name || '');
                  
                  if (Math.abs(aScore - bScore) <= 2) {
                    return new Date(b.publishedAt) - new Date(a.publishedAt);
                  }
                  return bScore - aScore;
                });
                
                console.log(`✅ GNews success: ${sortedArticles.length} quality articles`);
          const converted = {
            status: 'ok',
                totalResults: Math.min(data.totalResults || 1000, 1000),
                articles: sortedArticles.slice(0, 20).map(a => ({
              ...a,
              urlToImage: a.image,
              publishedAt: a.publishedAt,
              source: { name: a.source?.name || 'GNews' },
            })),
                quality: {
                  filteredCount: qualityArticles.length,
                  totalCount: data.articles.length,
                  credibilityScore: sortedArticles[0] ? getSourceCredibilityScore(sortedArticles[0].source?.name || '') : 0
                }
          };
          newsCache[cacheKey] = { data: converted, ts: now };
          return res.json(converted);
        } else {
          console.log(`❌ GNews returned articles but none met quality standards`);
        }
      } else {
        console.log(`❌ GNews failed: No articles returned`);
          }
      }
    } catch (err) {
      console.log(`❌ GNews error: ${err.message}`);
    }
  }

  // PRIORITY 3: If both news APIs failed, try AI chatbot for summary
  console.log(`🤖 Both news APIs failed, trying AI chatbot for: ${query}`);
  try {
    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
                content: 'You are a knowledgeable news assistant. Provide comprehensive, accurate information about current events, news topics, and general knowledge. Include relevant context, recent developments, and helpful insights. Be informative and engaging.' 
            },
            { 
              role: 'user', 
              content: `Provide a detailed summary of recent ${query} news and developments. Include key events, trends, important context, and any significant developments. If this is a search query, explain what's happening in this area and provide relevant insights.` 
            },
          ],
            max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const aiData = await aiResponse.json();
      
      if (aiData.choices && aiData.choices[0] && aiData.choices[0].message) {
        console.log(`✅ AI chatbot success: Generated comprehensive summary`);
        const aiSummary = aiData.choices[0].message.content.trim();
        const fallbackWithAI = {
          status: 'ok',
          totalResults: 1,
          articles: [{
            title: `AI Analysis: ${query.charAt(0).toUpperCase() + query.slice(1)} News & Developments`,
            description: aiSummary,
            url: '#',
            urlToImage: '/logo192.png',
            publishedAt: new Date().toISOString(),
            source: { name: 'AI News Assistant' },
          }],
            quality: {
              filteredCount: 1,
              totalCount: 1,
              credibilityScore: 8,
              note: 'AI-generated summary due to API limitations'
            }
        };
        newsCache[cacheKey] = { data: fallbackWithAI, ts: now };
        return res.json(fallbackWithAI);
      }
    }
  } catch (err) {
    console.log(`❌ AI chatbot error: ${err.message}`);
  }

  // PRIORITY 4: Final fallback to local JSON
  console.log(`📄 Using fallback data for: ${query}`);
  try {
    const fallback = JSON.parse(fs.readFileSync(__dirname + '/fallbackNews.json', 'utf8'));
      newsCache[cacheKey] = { data: fallback, ts: now };
    return res.json(fallback);
  } catch (err) {
    console.log(`❌ Fallback failed: ${err.message}`);
      // Ultimate fallback - return empty but valid response
      const ultimateFallback = {
        status: 'ok',
        totalResults: 0,
        articles: [],
        message: 'News services temporarily unavailable. Please try again later.',
        quality: {
          filteredCount: 0,
          totalCount: 0,
          credibilityScore: 0,
          note: 'Service unavailable'
        }
      };
      return res.json(ultimateFallback);
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error. Please try again later.',
      error: error.message 
    });
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

// OpenAI proxy with AI summary caching (PRIORITY 1)
app.post('/api/openai', async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  const now = Date.now();
  
  if (aiCache[cacheKey] && now - aiCache[cacheKey].ts < CACHE_DURATION) {
    console.log('📦 Serving cached OpenAI response');
    return res.json(aiCache[cacheKey].data);
  }

  console.log('🤖 Trying OpenAI API...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not configured, trying Gemini...');
    // Try Gemini as fallback
    try {
      const geminiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const geminiData = await geminiResponse.json();
      return res.json(geminiData);
    } catch (err) {
      console.log('❌ Gemini also failed, using fallback message');
      return res.json({ choices: [{ message: { content: 'Our AI assistant is temporarily unavailable. Please check back soon!' } }] });
    }
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
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ OpenAI API success');
      aiCache[cacheKey] = { data, ts: now };
      return res.json(data);
    } else if (data.error) {
      console.log(`❌ OpenAI API error: ${data.error.message}`);
      // Try Gemini as fallback
      try {
        const geminiResponse = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        });
        const geminiData = await geminiResponse.json();
        return res.json(geminiData);
      } catch (err) {
        console.log('❌ Gemini also failed, using fallback message');
        return res.json({ choices: [{ message: { content: 'Our AI assistant is temporarily unavailable. Please check back soon!' } }] });
      }
    }
  } catch (err) {
    console.log(`❌ OpenAI API error: ${err.message}`);
    // Try Gemini as fallback
    try {
      const geminiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const geminiData = await geminiResponse.json();
      return res.json(geminiData);
    } catch (err) {
      console.log('❌ Gemini also failed, using fallback message');
      return res.json({ choices: [{ message: { content: 'Our AI assistant is temporarily unavailable. Please check back soon!' } }] });
    }
  }
});

// Gemini proxy with AI summary caching (PRIORITY 2)
app.post('/api/gemini', async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  const now = Date.now();
  
  if (aiCache[cacheKey] && now - aiCache[cacheKey].ts < CACHE_DURATION) {
    console.log('📦 Serving cached Gemini response');
    return res.json(aiCache[cacheKey].data);
  }

  console.log('🧠 Trying Gemini API...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Gemini API key not configured, using fallback message');
    return res.json({ candidates: [{ content: { parts: [{ text: 'Our AI assistant is temporarily unavailable. Please check back soon!' }] } }] });
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
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log('✅ Gemini API success');
      aiCache[cacheKey] = { data, ts: now };
      return res.json(data);
    } else if (data.error) {
      console.log(`❌ Gemini API error: ${data.error.message}`);
      return res.json({ candidates: [{ content: { parts: [{ text: 'Our AI assistant is temporarily unavailable. Please check back soon!' }] } }] });
    }
  } catch (err) {
    console.log(`❌ Gemini API error: ${err.message}`);
    return res.json({ candidates: [{ content: { parts: [{ text: 'Our AI assistant is temporarily unavailable. Please check back soon!' }] } }] });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend proxy server running on port ${PORT}`);
}); 