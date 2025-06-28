import { useState } from 'react';

export default function useSearchRateLimit() {
  const [error, setError] = useState('');

  function recordSearch() {
    const now = Date.now();
    const searches = JSON.parse(localStorage.getItem('searchTimestamps') || '[]').filter(ts => now - ts < 120000);
    if (searches.length >= 50) {
      setError('Too many searches, please wait a moment.');
      return false;
    }
    searches.push(now);
    localStorage.setItem('searchTimestamps', JSON.stringify(searches));
    setError('');
    return true;
  }

  return [error, recordSearch];
} 