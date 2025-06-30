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
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a knowledgeable news assistant. Provide comprehensive, accurate information about current events, news topics, and general knowledge. Include relevant context, recent developments, and helpful insights. Be informative and engaging.' 
            },
            { 
              role: 'user', 
              content: question 
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const summary = data.choices?.[0]?.message?.content?.trim();
      if (summary) setAnswer(summary);
      else setError('No answer from AI.');
    } catch {
      try {
        // Fallback to Gemini
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: question }] 
            }],
          }),
        });
        const data = await res.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (summary) setAnswer(summary);
        else setError('No answer from AI.');
      } catch {
        setError('AI service temporarily unavailable. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
      <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center">
        🤖 Ask AI About News & Current Events
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        Get comprehensive answers about current events, news topics, and general knowledge
      </p>
      <form onSubmit={askAI} className="flex gap-2 mb-6">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What's the latest on India's budget? Tell me about AI developments. What's happening in global politics?"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
          required
        />
        <button 
          type="submit" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold" 
          disabled={loading}
        >
          {loading ? '🤔 Thinking...' : 'Ask AI'}
        </button>
      </form>
      {answer && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">AI Response</h3>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AskNewsAI; 