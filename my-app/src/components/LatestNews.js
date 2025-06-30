import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';

const TrendingNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 12; // Backend returns 12 articles per page

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
<<<<<<< HEAD
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/news`, {
=======
        const res = await fetch('/api/news', {
>>>>>>> 7628423ccd79f0cd25debbd4f53acd848ac373d6
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: 'India',
            sortBy: 'publishedAt',
            page: currentPage
          }),
        });
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
          setTotalPages(Math.ceil(data.totalResults / articlesPerPage));
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error('Error fetching trending news:', error);
        setArticles([]);
      }
      setLoading(false);
    };
    fetchTrending();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <div className="text-center text-blue-500 text-xl">Loading trending news...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <div className="text-center text-gray-500 text-xl">No trending news available.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Trending News
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (currentPage <= 2) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? 'text-white bg-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingNews; 