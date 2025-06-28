import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Fallback static images
const fallbackStaticImages = {
  Home: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  News: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80',
  Sport: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
  Business: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
  Innovation: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
  Culture: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=900&q=80',
  Arts: 'https://images.unsplash.com/photo-1465101053361-7630c8c1dc96?auto=format&fit=crop&w=900&q=80',
  Travel: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=900&q=80',
  Earth: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
  Audio: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  Video: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80',
  Live: 'https://images.unsplash.com/photo-1465101062946-4377e57745c3?auto=format&fit=crop&w=900&q=80',
};

const NewsCard = ({ section, interval = 3500 }) => {
  const cardRef = useRef();
  const [visible, setVisible] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [showDynamic, setShowDynamic] = useState(false);

  const staticImages =
    section.staticImages || section.images || [fallbackStaticImages[section.name] || fallbackStaticImages['News']];

  const dynamicImages = section?.apiImages?.length > 0 ? section.apiImages : [];
  const hasDynamicImages = dynamicImages.length > 0;

  // Watch for component visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Switch to dynamic images after visible and data loaded
  useEffect(() => {
    if (visible && hasDynamicImages && dynamicImages.length > 0) {
      setShowDynamic(true);
    }
  }, [visible, hasDynamicImages, dynamicImages]);

  // Carousel logic
  useEffect(() => {
    if (!visible) return;

    const arr = showDynamic && hasDynamicImages ? dynamicImages : staticImages;
    if (!arr || arr.length === 0) return;

    const intv = setInterval(() => {
      setCarouselIdx((idx) => (idx + 1) % arr.length);
    }, interval);

    return () => clearInterval(intv);
  }, [visible, showDynamic, dynamicImages, staticImages, hasDynamicImages, interval]);

  // Loading skeleton (before visible)
  if (!visible) {
    return (
      <div ref={cardRef} className="rounded-3xl shadow-lg bg-gray-200 dark:bg-zinc-700 animate-pulse h-96 flex flex-col">
        <div className="w-full h-48 bg-gray-300 dark:bg-zinc-600 rounded-t-3xl" />
        <div className="p-5 flex-1 flex flex-col">
          <div className="h-4 w-1/3 bg-gray-300 dark:bg-zinc-600 rounded mb-2" />
          <div className="h-6 w-2/3 bg-gray-300 dark:bg-zinc-600 rounded mb-2" />
          <div className="h-4 w-full bg-gray-300 dark:bg-zinc-600 rounded mb-2" />
          <div className="h-4 w-5/6 bg-gray-300 dark:bg-zinc-600 rounded mb-2" />
          <div className="h-10 w-full bg-gray-300 dark:bg-zinc-600 rounded mt-auto" />
        </div>
      </div>
    );
  }

  const imagesToShow = showDynamic && hasDynamicImages ? dynamicImages : staticImages;

  return (
    <article
      ref={cardRef}
      className="rounded-3xl shadow-lg card-hover overflow-hidden bg-white dark:bg-zinc-800 border-4 border-blue-400/60 transition-all flex flex-col min-h-[22rem] h-auto hover:shadow-2xl hover:-translate-y-1 duration-200"
    >
      <div className="w-full h-48 overflow-hidden flex-shrink-0 relative">
        {imagesToShow.map((img, imgIdx) => (
          <img
            key={imgIdx}
            src={img}
            alt={`${section.name} news`}
            className={`w-full h-full object-cover rounded-t-3xl transition-transform duration-1000 ease-in-out absolute inset-0 ${
              carouselIdx === imgIdx ? 'translate-x-0 z-10' : imgIdx < carouselIdx ? '-translate-x-full z-0' : 'translate-x-full z-0'
            }`}
            style={{ transitionProperty: 'transform' }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase mb-1 tracking-wider">
          {section.name}
        </div>
        <h3 className="text-lg font-bold mb-1 text-dark dark:text-white leading-tight">{section.title || section.name}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-6 text-sm">
          {section.description || `Some descriptive text about ${section.name.toLowerCase()} news.`}
        </p>
        <div className="border-t border-gray-200 dark:border-zinc-700 my-2"></div>
        <Link
          to={`/news/${section.query}`}
          className="mt-auto w-full text-white bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-b-3xl text-base py-2 text-center transition-all duration-300 ease-out border border-transparent hover:border-blue-500 shadow-lg mb-2"
          aria-label={`Read more about ${section.name}`}
        >
          Read More
        </Link>
      </div>
    </article>
  );
};

export default NewsCard;
