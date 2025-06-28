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
  const sectionKey = `${section.toLowerCase()}-${page}`;
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
      let isLive = false;
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
          isLive = true;
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
          const res = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'You are a helpful news assistant.' },
                { role: 'user', content: `Summarize today's ${section} news in 2-3 sentences.` },
              ],
              max_tokens: 150,
              temperature: 0.7,
            }),
          });
          const data = await res.json();
          const summary = data.choices?.[0]?.message?.content?.trim();
          if (summary) setChatbotResponse(summary);
        } catch {
          try {
            const res = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize today's ${section} news in 2-3 sentences.` }] }],
              }),
            });
            const data = await res.json();
            const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (summary) setChatbotResponse(summary);
          } catch {
            setChatbotResponse('Our AI assistant is temporarily unavailable.');
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
      {chatbotLoading && <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse mb-4">AI is summarizing...</div>}
      {chatbotResponse && articles.length === 0 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 p-4 rounded mb-6">
          <b>AI Summary:</b> <div>{chatbotResponse}</div>
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
