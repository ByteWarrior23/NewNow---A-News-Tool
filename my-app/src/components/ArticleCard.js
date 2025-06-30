import React from 'react';

// Credible news sources for credibility badges
const CREDIBLE_SOURCES = [
  'reuters', 'associated press', 'ap', 'bbc', 'cnn', 'nbc news', 'abc news', 
  'cbs news', 'fox news', 'usa today', 'wall street journal', 'new york times',
  'washington post', 'los angeles times', 'chicago tribune', 'boston globe',
  'the guardian', 'the independent', 'sky news', 'al jazeera', 'npr',
  'pbs', 'time', 'newsweek', 'the economist', 'bloomberg', 'cnbc',
  'forbes', 'techcrunch', 'ars technica', 'wired', 'the verge'
];

const ArticleCard = ({ article }) => {
  // Check if source is credible
  const isCredibleSource = CREDIBLE_SOURCES.some(credible => 
    (article.source?.name || '').toLowerCase().includes(credible)
  );

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get time ago for freshness indicator
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <article className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex flex-col hover:shadow-xl transition-all duration-300 group">
      <div className="w-full h-48 overflow-hidden relative">
        <img 
          src={article.urlToImage || '/logo192.png'} 
          alt={article.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          loading="lazy" 
          onError={e => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
        />
        
        {/* Freshness indicator */}
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          {getTimeAgo(article.publishedAt)}
        </div>
        
        {/* Credibility badge */}
        {isCredibleSource && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Verified
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase">
              {article.source?.name}
            </div>
            {isCredibleSource && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(article.publishedAt)}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm flex-1">
          {article.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300 flex-1 mr-2"
          >
            Read More
          </a>
          
          {/* Quality indicator */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Quality</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard; 