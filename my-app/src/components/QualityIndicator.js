import React from 'react';

const QualityIndicator = ({ quality, totalResults }) => {
  if (!quality) return null;

  const getQualityColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
  };

  const getQualityText = (score) => {
    if (score >= 8) return 'High Quality';
    if (score >= 6) return 'Good Quality';
    return 'Basic Quality';
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Content Quality Metrics
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(quality.credibilityScore)}`}>
          {getQualityText(quality.credibilityScore)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {quality.filteredCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Quality Articles
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalResults}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Results
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {quality.credibilityScore}/10
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Credibility Score
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.round((quality.filteredCount / quality.totalCount) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Quality Rate
          </div>
        </div>
      </div>
      
      {quality.note && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Note:</span> {quality.note}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>🔄 Content updates every 10 minutes</span>
          <span>✅ Spam & clickbait filtered</span>
        </div>
      </div>
    </div>
  );
};

export default QualityIndicator; 