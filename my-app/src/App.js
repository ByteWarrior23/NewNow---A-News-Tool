import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import NewspaperContainer from './components/NewspaperContainer';
import NewsList from './components/NewsList';
import TrendingNews from './components/LatestNews';
import AskNewsAI from './components/AskNewsAI';
import NotFoundPage from './components/NotFoundPage';

export const MenuContext = React.createContext();

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <BrowserRouter>
      <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
        <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<NewspaperContainer />} />
            <Route path="/news/:section" element={<NewsList />} />
            <Route path="/latest" element={<TrendingNews />} />
            <Route path="/ask" element={<AskNewsAI />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </MenuContext.Provider>
    </BrowserRouter>
  );
}

export default App;
