import React from 'react';

const ArticleCard = ({ article }) => {
  return (
    <article className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex flex-col hover:shadow-xl transition-shadow duration-300">
      <div className="w-full h-48 overflow-hidden relative">
        <img 
          src={article.urlToImage || '/logo192.png'} 
          alt={article.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          loading="lazy" 
          onError={e => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase">
            {article.source?.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(article.publishedAt).toLocaleDateString()}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white line-clamp-2 leading-tight">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm flex-1">
          {article.description}
        </p>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-auto text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300"
        >
          Read More
        </a>
      </div>
    </article>
  );
};

export default ArticleCard; 