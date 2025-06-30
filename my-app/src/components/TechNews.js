import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';

const PAGE_SIZE = 12;

const TechNews = () => {
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
          body: JSON.stringify({ query: 'tech', page }),
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <div className="text-center text-blue-500 text-xl">Loading tech news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <div className="text-center text-red-500 text-xl mb-6">{error}</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <div className="text-center text-gray-500 text-xl">No tech news available.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Tech News
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {articles.map((article, idx) => (
          <ArticleCard key={article.url + idx} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mb-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (page <= 2) {
              pageNum = i + 1;
            } else if (page >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  page === pageNum
                    ? 'text-white bg-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TechNews; 