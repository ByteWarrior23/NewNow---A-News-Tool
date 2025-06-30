import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';

const PAGE_SIZE = 12;

const WorldNews = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      let articles = [];
      let totalResults = 0;
      let success = false;
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'world', page }),
        });
        const data = await res.json();
        if (data.status === 'ok' && data.articles) {
          articles = data.articles;
          totalResults = data.totalResults;
          success = true;
        } else {
          setError(data.message || 'Failed to fetch news');
        }
      } catch (err) {
        setError('Failed to fetch news');
      }
      if (!success) {
        setArticles([]);
        setTotalResults(0);
      } else {
        const sortedArticles = [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setArticles(sortedArticles);
        setTotalResults(totalResults);
      }
      setLoading(false);
    };
    fetchNews();
  }, [page]);

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  return (
    <main className="container mx-auto px-4 pt-32 font-sans fade-in bg-white dark:bg-zinc-900 transition-colors duration-300 min-h-screen">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-dark dark:text-white">World News</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-7">Latest world news, curated for you. Powered by NewsAPI.org.</p>
      </section>
      {loading && <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse">Loading...</div>}
      {error && <div className="text-center text-red-500 mb-6">{error}</div>}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, idx) => (
          <ArticleCard key={article.url + idx} article={article} />
        ))}
      </section>
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-5 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-all"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Page {page} of {totalPages || 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="px-5 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default WorldNews; 