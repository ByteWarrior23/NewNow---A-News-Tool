import React, { useState } from 'react';

const AskNewsAI = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAI = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful news assistant.' },
            { role: 'user', content: question },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const summary = data.choices?.[0]?.message?.content?.trim();
      if (summary) setAnswer(summary);
      else setError('No answer from AI.');
    } catch {
      setError('AI service unavailable.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200">Ask a Question About the News</h2>
      <form onSubmit={askAI} className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What's the latest on India's budget?"
          className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-zinc-700 focus:outline-none"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>
      {answer && <div className="bg-blue-50 dark:bg-zinc-900 p-4 rounded text-blue-800 dark:text-blue-200">{answer}</div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default AskNewsAI; 