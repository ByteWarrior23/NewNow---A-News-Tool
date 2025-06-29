import React, { useRef, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsCard from './NewsCard';
import ContactUsForm from './ContactUsForm';
import { MenuContext } from '../App';

const sections = [
  { name: 'Headlines', query: 'news', images: ['/news1.jpeg', '/news2.jpg'], description: 'Stay updated with the latest headlines. Read more articles inside!' },
  { name: 'Sport', query: 'sports', images: ['/sports1.avif', '/sports2.jpg'], description: 'Catch all the action from the world of sports. Read more sports stories!' },
  { name: 'Business', query: 'business', images: ['/ai-business-processes.jpg', '/newspaper-collage.jpg'], description: 'Business trends and market updates. Read more business articles!' },
  { name: 'Technology', query: 'technology', images: ['/innovation1.jpeg', '/innovation2.jpeg'], description: 'Discover the latest in tech and innovation. Read more tech news!' },
  { name: 'Entertainment', query: 'entertainment', images: ['/culture1.jpeg', '/culture2.jpeg'], description: 'Movies, music, and more. Read more entertainment stories!' },
  { name: 'Science', query: 'science', images: ['/newspaper-collage.jpg', '/ai-business-processes.jpg'], description: 'Explore science breakthroughs. Read more science articles!' },
  { name: 'Travel', query: 'travel', images: ['/travel1.jpeg', '/travel2.webp'], description: 'Travel the world from your screen. Read more travel guides!' },
  { name: 'Environment', query: 'environment', images: ['/earth1.jpg', '/earth2.jpg'], description: 'Earth and environment news. Read more green stories!' },
  { name: 'Media', query: 'media', images: ['/video1.jpeg', '/news1.jpeg'], description: 'Media and journalism updates. Read more media news!' },
  { name: 'World', query: 'world', images: ['/live1.jpeg', '/live2.jpeg'], description: 'Global headlines and world events. Read more world news!' },
];

const NEWSAPI_KEYS = [
  'cef746d60bcb472495f74deff9156436',
  '2479479084c04b4d8278c0c474687c0e',
  'cef746d60bcb472495f74deff9156436',
  '3befea5a207042ada2bc0c15e097eb8b',
  '29b19221c70c4d6eaf44479bdca67d0b',
];

const NewspaperContainer = () => {
  const topRef = useRef(null);
  const [sectionData, setSectionData] = useState([]); // [{ name, images: [img1, img2], publishedAt: Date }]
  const [showTop, setShowTop] = useState(false);
  const [mobileCardIdx, setMobileCardIdx] = useState(0);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { menuOpen } = useContext(MenuContext);

  const categories = sections.map(s => s.name);

  // Fetch API images for all sections at once
  const fetchSections = async () => {
    const results = await Promise.all(
      sections.map(async (section, idx) => {
        let apiImages = [];
        let publishedAt = '';
        let success = false;
        
        // Define section-specific keywords for better filtering
        const sectionKeywords = {
          'Headlines': ['breaking', 'latest', 'news', 'headlines', 'top', 'main'],
          'Sport': ['sport', 'sports', 'football', 'basketball', 'tennis', 'cricket', 'olympics', 'championship', 'league', 'match', 'game', 'player', 'team'],
          'Business': ['business', 'economy', 'finance', 'market', 'stock', 'investment', 'company', 'corporate', 'trade', 'economic', 'financial', 'startup', 'entrepreneur'],
          'Technology': ['technology', 'tech', 'software', 'hardware', 'ai', 'artificial intelligence', 'digital', 'innovation', 'startup', 'app', 'mobile', 'computer', 'internet'],
          'Entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'hollywood', 'actor', 'actress', 'singer', 'artist', 'show', 'performance', 'award'],
          'Science': ['science', 'research', 'study', 'discovery', 'scientific', 'experiment', 'laboratory', 'medical', 'health', 'biology', 'chemistry', 'physics'],
          'Travel': ['travel', 'tourism', 'destination', 'vacation', 'hotel', 'airline', 'flight', 'trip', 'journey', 'adventure', 'explore', 'visit'],
          'Environment': ['environment', 'climate', 'weather', 'nature', 'green', 'sustainability', 'pollution', 'conservation', 'renewable', 'energy', 'earth'],
          'Media': ['media', 'journalism', 'news', 'press', 'broadcast', 'television', 'radio', 'publishing', 'reporter', 'journalist'],
          'World': ['world', 'global', 'international', 'foreign', 'country', 'nation', 'diplomatic', 'politics', 'government']
        };
        
        const keywords = sectionKeywords[section.name] || [section.query];
        
        // Try NewsAPI first with strict relevance filtering
        for (let i = 0; i < NEWSAPI_KEYS.length; i++) {
          const apiKey = NEWSAPI_KEYS[i];
          
          try {
            console.log(`📰 Trying NewsAPI key ${i + 1} for: ${section.name}`);
            const response = await fetch('/api/news', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query: section.query, 
                apiKey,
                trending: section.name === 'Headlines'
              }),
            });
            const data = await response.json();
            
            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
              // STRICT relevance filtering
              const filterRelevantArticles = (articles, currentApiImages) => {
                return articles.filter(article => {
                  if (!article.title || !article.urlToImage) return false;
                  
                  const title = article.title.toLowerCase();
                  const description = (article.description || '').toLowerCase();
                  const source = (article.source?.name || '').toLowerCase();
                  
                  // Check if image is valid
                  const hasValidImage = article.urlToImage && 
                    article.urlToImage.includes('https://') && 
                    !article.urlToImage.includes('null') &&
                    !article.urlToImage.includes('undefined') &&
                    article.urlToImage.length > 20;
                  
                  if (!hasValidImage) return false;
                  
                  // Check relevance using keywords
                  const isRelevant = keywords.some(keyword => 
                    title.includes(keyword) || 
                    description.includes(keyword) ||
                    source.includes(keyword)
                  );
                  
                  // Additional quality checks
                  const hasGoodTitle = title.length > 10 && title.length < 200;
                  const hasGoodDescription = description.length > 20;
                  const isNotDuplicate = !currentApiImages.includes(article.urlToImage);
                  
                  return isRelevant && hasGoodTitle && hasGoodDescription && isNotDuplicate;
                });
              };
              
              const relevantArticles = filterRelevantArticles(data.articles, apiImages);
              
              // Take only the best 3-5 relevant articles with images
              const bestArticles = relevantArticles
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 5);
              
              apiImages = bestArticles.map(a => a.urlToImage);
              publishedAt = bestArticles[0]?.publishedAt || '';
              sourceInfo = `NewsAPI (${bestArticles.length} relevant articles)`;
              
              if (apiImages.length > 0) {
                success = true;
                console.log(`✅ ${section.name}: Found ${apiImages.length} high-quality relevant images from ${sourceInfo}`);
                break;
              } else {
                console.log(`⚠️ ${section.name}: No relevant articles with valid images from NewsAPI key ${i + 1}`);
              }
            } else if (data.code === 'rateLimited' || data.message?.includes('too many requests')) {
              console.log(`⚠️ ${section.name}: NewsAPI key ${i + 1} rate limited`);
              continue;
            }
          } catch (err) {
            console.log(`❌ ${section.name}: NewsAPI key ${i + 1} error: ${err.message}`);
          }
        }
        
        // If NewsAPI fails, try GNews with same strict filtering
        if (!success) {
          try {
            console.log(`🌐 Trying GNews for: ${section.name}`);
            const res = await fetch('/api/gnews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: section.query }),
            });
            const data = await res.json();
            
            if (data.articles && data.articles.length > 0) {
              // Same strict filtering for GNews
              const filterRelevantGNewsArticles = (articles, currentApiImages) => {
                return articles.filter(article => {
                  if (!article.title || !article.image) return false;
                  
                  const title = article.title.toLowerCase();
                  const description = (article.description || '').toLowerCase();
                  const source = (article.source?.name || '').toLowerCase();
                  
                  // Check if image is valid
                  const hasValidImage = article.image && 
                    article.image.includes('https://') && 
                    !article.image.includes('null') &&
                    !article.image.includes('undefined') &&
                    article.image.length > 20;
                  
                  if (!hasValidImage) return false;
                  
                  // Check relevance using keywords
                  const isRelevant = keywords.some(keyword => 
                    title.includes(keyword) || 
                    description.includes(keyword) ||
                    source.includes(keyword)
                  );
                  
                  // Additional quality checks
                  const hasGoodTitle = title.length > 10 && title.length < 200;
                  const hasGoodDescription = description.length > 20;
                  const isNotDuplicate = !currentApiImages.includes(article.image);
                  
                  return isRelevant && hasGoodTitle && hasGoodDescription && isNotDuplicate;
                });
              };
              
              const relevantArticles = filterRelevantGNewsArticles(data.articles, apiImages);
              
              // Take only the best 3-5 relevant articles with images
              const bestArticles = relevantArticles
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 5);
              
              apiImages = bestArticles.map(a => a.image);
              publishedAt = bestArticles[0]?.publishedAt || '';
              sourceInfo = `GNews (${bestArticles.length} relevant articles)`;
              
              if (apiImages.length > 0) {
                success = true;
                console.log(`✅ ${section.name}: Found ${apiImages.length} high-quality relevant images from ${sourceInfo}`);
              } else {
                console.log(`⚠️ ${section.name}: No relevant articles with valid images from GNews`);
              }
            }
          } catch (err) {
            console.log(`❌ ${section.name}: GNews error: ${err.message}`);
          }
        }
        
        // If no relevant images found, use static images
        if (!success || apiImages.length === 0) {
          console.log(`📄 ${section.name}: Using static images (no relevant API images found)`);
          apiImages = [];
          sourceInfo = 'Static images';
        }
        
        return { ...section, staticImages: section.images, apiImages, publishedAt, sourceInfo };
      })
    );
    setSectionData(results);
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedCategory(null);
    const randomIndex = Math.floor(Math.random() * categories.length);
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedCategory(categories[randomIndex]);
    }, 2200);
  };

  const handleGoToCategory = () => {
    if (selectedCategory) {
      setShowWheelModal(false);
      navigate(`/news/${selectedCategory.toLowerCase()}`);
    }
  };

  return (
    <div ref={topRef}>
      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadein relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowSubscribeModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="mb-4">
              <svg className="mx-auto mb-2 w-12 h-12 text-blue-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
              <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">Coming Soon!</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">The Subscribe feature will be available soon as part of our premium features.<br/>Stay tuned for exciting updates!</p>
            </div>
            <button
              className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all"
              onClick={() => setShowSubscribeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Spin the Wheel Modal */}
      {showWheelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadein relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowWheelModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Spin the News Wheel!</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className={`w-44 h-44 rounded-full border-4 border-blue-400 flex items-center justify-center transition-transform duration-1000 ${isSpinning ? 'spin-animation' : ''}`} style={{background: 'conic-gradient(#60a5fa 0% 12.5%, #fbbf24 12.5% 25%, #34d399 25% 37.5%, #f472b6 37.5% 50%, #818cf8 50% 62.5%, #f87171 62.5% 75%, #38bdf8 75% 87.5%, #facc15 87.5% 100%)'}}>
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white"></span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(0deg) translateY(-90px)'}}>{categories[0]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(45deg) translateY(-90px)'}}>{categories[1]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(90deg) translateY(-90px)'}}>{categories[2]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(135deg) translateY(-90px)'}}>{categories[3]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(180deg) translateY(-90px)'}}>{categories[4]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(225deg) translateY(-90px)'}}>{categories[5]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(270deg) translateY(-90px)'}}>{categories[6]}</span>
                  <span className="absolute text-xs font-bold text-white" style={{transform: 'rotate(315deg) translateY(-90px)'}}>{categories[7]}</span>
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-3xl">▼</span>
              </div>
              <button
                className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                onClick={handleSpin}
                disabled={isSpinning}
              >
                {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
              </button>
            </div>
            {selectedCategory && (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">You got: {selectedCategory}!</h3>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all"
                  onClick={handleGoToCategory}
                >
                  Go to {selectedCategory} News
                </button>
              </div>
            )}
          </div>
          <style>{`
            .spin-animation { animation: spin 2s cubic-bezier(0.23, 1, 0.32, 1); }
            @keyframes spin { 100% { transform: rotate(1440deg); } }
          `}</style>
        </div>
      )}
      <main className="container mx-auto px-4 pt-32 font-sans fade-in bg-white dark:bg-zinc-900 transition-colors duration-300">
        {/* Headline Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-white">Stay Informed. Stay Ahead.</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-7">Your trusted source for the latest news, analysis, and insights from around the world. Curated by experts, delivered to you.</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              className="bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 rounded-md px-5 py-2 font-semibold shadow-sm dark:shadow-zinc-900/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ease-in-out"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              aria-label="Get Started"
            >
              Get Started
            </button>
            <button
              className="bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 rounded-md px-5 py-2 font-semibold shadow-sm dark:shadow-zinc-900/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ease-in-out"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              aria-label="Subscribe"
              onClick={() => setShowSubscribeModal(true)}
            >
              Subscribe
            </button>
          </div>
        </section>
        {/* News Sections */}
        {isMobile ? (
          <section className="w-full flex flex-col items-center">
            {sectionData.length > 0 && (
              <NewsCard section={sectionData[mobileCardIdx]} interval={3500} />
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setMobileCardIdx(idx => Math.max(0, idx - 1))}
                disabled={mobileCardIdx === 0}
                className="px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{mobileCardIdx + 1} of {sectionData.length}</span>
                <button
                onClick={() => setMobileCardIdx(idx => Math.min(sectionData.length - 1, idx + 1))}
                disabled={mobileCardIdx === sectionData.length - 1}
                className="px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-all"
              >
                Next
                </button>
              </div>
          </section>
        ) : (
          <section className="container mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {sectionData.map((section, idx) => (
              <NewsCard key={section.name} section={section} />
            ))}
          </section>
        )}
        {sectionData.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}
      </main>
      {/* Back to Top Button */}
      {showTop && !menuOpen && (
        <button
          onClick={() => topRef.current.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      {/* About Us & Contact Us Section */}
      <section className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 px-4 mt-0">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">About Us</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">NewsNow is your trusted source for the latest news, analysis, and insights from around the world. Our mission is to keep you informed, inspired, and ahead of the curve. We curate news from top sources and deliver it to you with speed, accuracy, and integrity.</p>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-8">Have questions, feedback, or partnership inquiries? Reach out to us below!</p>
          <ContactUsForm />
        </div>
      </section>
      {/* Ripple effect style */}
      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          background-color: rgba(255,255,255,0.7);
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
      <footer className="py-6 text-center text-sm bg-zinc-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
        © 2024 NewsNow. All rights reserved.
      </footer>
    </div>
  );
};

// Tailwind custom animation
// Add this to your global CSS (index.css):
// @keyframes fadein { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
// .animate-fadein { animation: fadein 1s ease; }

export default NewspaperContainer; 