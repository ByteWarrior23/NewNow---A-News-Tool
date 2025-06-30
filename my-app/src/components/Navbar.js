import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuContext } from '../App';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const { menuOpen, setMenuOpen } = useContext(MenuContext);
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, setMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/news/${search.trim().toLowerCase()}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-md z-50 font-sans border-b border-zinc-200 dark:border-zinc-700 fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-tight">NewsNow - https://newsnow-a-news-tool.netlify.app</div>
        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center w-48 md:w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all"
        >
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search full news topics..."
            className="flex-1 bg-transparent outline-none border-0 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 px-2 py-1 text-base"
            aria-label="Search news"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all"
            aria-label="Submit search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>
        </form>
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
          {['Home','World','Politics','Business','Tech','Sports'].map((item) => {
            let path = '/';
            if (item !== 'Home') path = `/news/${item.toLowerCase()}`;
            return (
              <Link
                key={item}
                to={path}
                className="relative text-zinc-900 dark:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full hover:text-blue-600 dark:hover:text-blue-200"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            );
          })}
          {/* Trending Button */}
          <Link to="/latest" className="flex items-center gap-1 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-zinc-700 transition text-blue-600 dark:text-blue-300 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Trending News
          </Link>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="ml-4 p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.136 2.664-7.64 6.418-9.093a.75.75 0 01.908.911A7.501 7.501 0 0016.5 19.5a7.48 7.48 0 004.432-1.424.75.75 0 01.82 1.226z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12H4.75m15.364 6.364l-1.591-1.591M6.227 6.227l-1.591-1.591m12.728 12.728l1.591 1.591M6.227 17.773l-1.591 1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            )}
          </button>
        </div>
        {/* Hamburger for Mobile */}
        <div className={`md:hidden flex items-center ml-2${menuOpen ? ' hidden' : ''}`}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Mobile Slide-in Drawer Menu */}
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
          style={{ pointerEvents: menuOpen ? 'auto' : 'none', background: menuOpen ? 'rgba(0,0,0,0.5)' : 'transparent' }}
        >
          <div className="absolute inset-0" onClick={() => setMenuOpen(false)}></div>
          <div ref={menuRef} className="absolute right-0 top-0 h-screen w-full sm:w-4/5 sm:max-w-xs bg-white dark:bg-zinc-900 shadow-2xl flex flex-col p-6 animate-fade-in-up border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="self-end mb-6 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Mobile Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all"
            >
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search full news topics..."
                className="flex-1 bg-transparent outline-none border-0 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 px-2 py-1 text-base"
                aria-label="Search news"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all"
                aria-label="Submit search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
            </form>
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2">
              {['Home','World','Politics','Business','Tech','Sports'].map((item) => {
                let path = '/';
                if (item !== 'Home') path = `/news/${item.toLowerCase()}`;
                return (
                  <Link
                    key={item}
                    to={path}
                    className="block w-full text-center py-3 text-lg text-zinc-900 dark:text-white hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>
            {/* Add Trending to mobile menu */}
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/latest" className="block w-full text-center py-3 text-lg text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all rounded-lg" onClick={() => setMenuOpen(false)}>
                <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Trending News
              </Link>
            </div>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
              className="mt-4 p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.136 2.664-7.64 6.418-9.093a.75.75 0 01.908.911A7.501 7.501 0 0016.5 19.5a7.48 7.48 0 004.432-1.424.75.75 0 01.82 1.226z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12H4.75m15.364 6.364l-1.591-1.591M6.227 6.227l-1.591-1.591m12.728 12.728l1.591 1.591M6.227 17.773l-1.591 1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
