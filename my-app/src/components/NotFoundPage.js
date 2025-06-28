import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
    <h1 className="text-5xl font-bold mb-4 text-blue-700 dark:text-blue-200">404</h1>
    <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">Looks like you're lost in the headlines!</p>
    <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Go Home</Link>
  </div>
);

export default NotFoundPage; 