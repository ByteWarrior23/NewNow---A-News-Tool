import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MenuContext } from '../App';

const PAGE_SIZE = 12;

const SECTION_DISPLAY = {
  headlines: {
    title: 'Headlines',
    description: 'Top stories and breaking news from around the world.'
  },
  news: {
    title: 'Headlines',
    description: 'Top stories and breaking news from around the world.'
  },
  sport: {
    title: 'Sport',
    description: 'Latest sports news, curated for you.'
  },
  sports: {
    title: 'Sport',
    description: 'Latest sports news, curated for you.'
  },
  business: {
    title: 'Business',
    description: 'Latest business news, curated for you.'
  },
  technology: {
    title: 'Technology',
    description: 'Latest technology news, curated for you.'
  },
  entertainment: {
    title: 'Entertainment',
    description: 'Latest entertainment news, curated for you.'
  },
  science: {
    title: 'Science',
    description: 'Latest science news, curated for you.'
  },
  travel: {
    title: 'Travel',
    description: 'Latest travel news, curated for you.'
  },
  environment: {
    title: 'Environment',
    description: 'Latest environment news, curated for you.'
  },
  media: {
    title: 'Media',
    description: 'Latest media news, curated for you.'
  },
  world: {
    title: 'World',
    description: 'Latest world news, curated for you.'
  },
};

const NewsList = () => {
  const { section } = useParams();
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState(null);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const topRef = useRef(null);
  const { menuOpen } = useContext(MenuContext);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      let success = false;
      let articles = [];
      let totalResults = 0;
      try {
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: section, page }),
        });
        const data = await res.json();
        if (data.status === 'ok' && data.articles) {
          articles = data.articles;
          totalResults = data.totalResults;
          success = true;
        }
      } catch {}
      const sorted = success ? [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)) : [];
      setArticles(sorted);
      setTotalResults(success ? totalResults : 0);
      setLiveStatus(success ? 'LIVE' : 'OFFLINE');
      setLoading(false);
    };
    fetchNews();
  }, [section, page]);

  useEffect(() => {
    if (!loading && articles.length === 0) {
      const fetchAI = async () => {
        setChatbotLoading(true);
        try {
          // Try OpenAI first for enhanced search results
          const res = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a helpful news assistant. Provide informative, accurate summaries of current events and news topics. If asked about specific topics, give relevant context and recent developments.' 
                },
                { 
                  role: 'user', 
                  content: `Provide a comprehensive summary of recent ${section} news and developments. Include key events, trends, and important context. If this is a search query, explain what's happening in this area.` 
                },
              ],
              max_tokens: 300,
              temperature: 0.7,
            }),
          });
          const data = await res.json();
          const summary = data.choices?.[0]?.message?.content?.trim();
          if (summary) setChatbotResponse(summary);
        } catch {
          try {
            // Fallback to Gemini
            const res = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ 
                  parts: [{ 
                    text: `Provide a comprehensive summary of recent ${section} news and developments. Include key events, trends, and important context. If this is a search query, explain what's happening in this area.` 
                  }] 
                }],
              }),
            });
            const data = await res.json();
            const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (summary) setChatbotResponse(summary);
          } catch {
            setChatbotResponse(`Our AI assistant is analyzing the latest ${section} news for you. Please try refreshing or check back later for updates.`);
          }
        }
        setChatbotLoading(false);
      };
      fetchAI();
    }
  }, [loading, articles, section]);

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  const display = SECTION_DISPLAY[section?.toLowerCase()] || {
    title: section.charAt(0).toUpperCase() + section.slice(1),
    description: `Latest ${section.toLowerCase()} news, curated for you.`
  };

  return (
    <main ref={topRef} className="container mx-auto px-4 pt-32 font-sans bg-white dark:bg-zinc-900 min-h-screen">
      {liveStatus && window.localStorage.getItem('showDebug') === 'true' && (
        <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
          <span style={{
            background: liveStatus === 'LIVE' ? '#22c55e' : '#f59e42',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            opacity: 0.85,
          }}>{liveStatus}</span>
        </div>
      )}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-3 text-dark dark:text-white">
          {display.title}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {display.description}
        </p>
      </section>

      {loading && <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse">Loading...</div>}
      {chatbotLoading && <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse mb-4">🤖 AI is analyzing the latest news...</div>}
      {chatbotResponse && articles.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-6 rounded-lg mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">AI News Analysis: {display.title}</h3>
              <div className="text-sm leading-relaxed">{chatbotResponse}</div>
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-300">
                💡 This AI-powered summary provides context and insights about your search query.
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, idx) => (
          <article
            key={article.url + idx}
            className="rounded-2xl shadow-md overflow-hidden bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex flex-col"
          >
            <div className="w-full h-48 overflow-hidden">
              <img src={article.urlToImage || '/logo192.png'} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase mb-1">{article.source?.name}</div>
              <h3 className="text-lg font-semibold mb-2 text-dark dark:text-white line-clamp-2">{article.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-auto text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Read More
              </a>
            </div>
          </article>
        ))}
      </section>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2 bg-gray-200 dark:bg-zinc-700 rounded">
            Previous
          </button>
          <span className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="px-5 py-2 bg-gray-200 dark:bg-zinc-700 rounded">
            Next
          </button>
        </div>
      )}
      {showTop && !menuOpen && (
        <button
          onClick={() => topRef.current.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </main>
  );
};

export default NewsList;
