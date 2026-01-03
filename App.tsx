import React, { useState, useEffect, useMemo } from 'react';
import { DigestConfig, Article, DigestHistoryItem, UserPreferences } from './types';
import { fetchLiveDigest, analyzeUrl } from './services/geminiService';
import DigestConfigurator from './components/DigestConfigurator';
import ArticleCard from './components/ArticleCard';
import UrlAnalyzer from './components/UrlAnalyzer';
import SkeletonLoader from './components/SkeletonLoader';
import { Newspaper, History, Clock, ArrowLeft, Bookmark, Quote, Home } from 'lucide-react';
import { DESIGN_QUOTES } from './constants';

// Main App Component
function App() {
  // State
  const [view, setView] = useState<'dashboard' | 'history' | 'result' | 'saved'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'feed' | 'url'>('feed'); // Track loading context
  const [articles, setArticles] = useState<Article[]>([]);
  const [history, setHistory] = useState<DigestHistoryItem[]>([]);
  
  // Interaction State
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [dislikedArticles, setDislikedArticles] = useState<Article[]>([]);

  // Configuration State
  const [config, setConfig] = useState<DigestConfig>({
    level: 'Mid-Senior',
    topics: ['Random/Surprise Me'],
    dateRange: 'Last Month'
  });

  // Memoized Daily Quote
  const dailyQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DESIGN_QUOTES.length);
    return DESIGN_QUOTES[randomIndex];
  }, []);

  // Load persistence
  useEffect(() => {
    const loadState = () => {
      try {
        const h = localStorage.getItem('ddd_history');
        if (h) setHistory(JSON.parse(h));
        
        const s = localStorage.getItem('ddd_saved');
        if (s) setSavedArticles(JSON.parse(s));
        
        const l = localStorage.getItem('ddd_liked');
        if (l) setLikedArticles(JSON.parse(l));
        
        const d = localStorage.getItem('ddd_disliked');
        if (d) setDislikedArticles(JSON.parse(d));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    };
    loadState();
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('ddd_history', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    localStorage.setItem('ddd_saved', JSON.stringify(savedArticles));
  }, [savedArticles]);
  
  useEffect(() => {
    localStorage.setItem('ddd_liked', JSON.stringify(likedArticles));
  }, [likedArticles]);
  
  useEffect(() => {
    localStorage.setItem('ddd_disliked', JSON.stringify(dislikedArticles));
  }, [dislikedArticles]);

  // Handlers
  const handleGenerateDigest = async () => {
    setLoading(true);
    setLoadingMode('feed');
    setView('result');
    setArticles([]); // Clear previous

    try {
      const prefs: UserPreferences = {
        likedArticles,
        dislikedArticles
      };

      const results = await fetchLiveDigest(config, prefs);
      setArticles(results);
      
      // Save to history
      const historyItem: DigestHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        config: config,
        articles: results,
        type: 'feed'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Failed to generate digest", err);
      // In a real app, show toast. Here fallback logic in service should prevent full crash.
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setLoading(true);
    setLoadingMode('url');
    setView('result');
    setArticles([]);

    try {
      const result = await analyzeUrl(url);
      setArticles([result]);

      const historyItem: DigestHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        config: { level: config.level, topics: [], dateRange: 'Any Time' }, // Empty topics for URL
        articles: [result],
        type: 'url'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Failed to analyze URL", err);
    } finally {
      setLoading(false);
    }
  };

  const restoreHistoryItem = (item: DigestHistoryItem) => {
    setArticles(item.articles);
    setView('result');
  };

  // Interaction Handlers
  const handleToggleSave = (article: Article) => {
    setSavedArticles(prev => {
      const exists = prev.some(a => a.url === article.url);
      if (exists) {
        return prev.filter(a => a.url !== article.url);
      } else {
        return [article, ...prev];
      }
    });
  };

  const handleRate = (article: Article, rating: 'up' | 'down' | null) => {
    // Remove from both lists first to ensure clean slate
    const cleanLiked = likedArticles.filter(a => a.url !== article.url);
    const cleanDisliked = dislikedArticles.filter(a => a.url !== article.url);
    
    setLikedArticles(cleanLiked);
    setDislikedArticles(cleanDisliked);

    if (rating === 'up') {
      setLikedArticles([article, ...cleanLiked]);
    } else if (rating === 'down') {
      setDislikedArticles([article, ...cleanDisliked]);
    }
  };

  const getArticleRating = (article: Article): 'up' | 'down' | null => {
    if (likedArticles.some(a => a.url === article.url)) return 'up';
    if (dislikedArticles.some(a => a.url === article.url)) return 'down';
    return null;
  };

  const isArticleSaved = (article: Article): boolean => {
    return savedArticles.some(a => a.url === article.url);
  };

  // Render Helpers
  const renderFloatingControls = () => (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <div className="flex gap-2 pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-stone-200/50 hover:shadow-xl transition-shadow duration-300">
        <button
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-full transition-all duration-300 hover:bg-stone-100 active:scale-95 ${view === 'dashboard' ? 'text-charcoal bg-stone-50' : 'text-stone-400'}`}
            title="Home"
        >
             <Home className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-stone-200 my-auto"></div>
        <button 
          onClick={() => setView(view === 'saved' ? 'dashboard' : 'saved')}
          className={`relative p-3 rounded-full transition-all duration-300 hover:bg-stone-100 active:scale-95 ${view === 'saved' ? 'text-amber-600 bg-amber-50' : 'text-stone-500'}`}
          title="Read Later"
        >
          <Bookmark className={`w-5 h-5 ${view === 'saved' ? 'fill-current' : ''}`} />
          {savedArticles.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>
          )}
        </button>
        
        <button 
          onClick={() => setView(view === 'history' ? 'dashboard' : 'history')}
          className={`p-3 rounded-full transition-all duration-300 hover:bg-stone-100 active:scale-95 ${view === 'history' ? 'text-charcoal bg-stone-100' : 'text-stone-500'}`}
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-16 animate-in fade-in duration-700 pt-32">
      {/* Hero Title - Replaces Top Nav */}
      <section className="text-center space-y-4">
        <h1 className="font-serif text-5xl md:text-7xl text-charcoal tracking-tight">
          Daily Design Digest
        </h1>
        <p className="text-stone-500 text-lg md:text-xl font-serif italic max-w-xl mx-auto">
          Your curated intellectual briefing for product design, strategy, and engineering.
        </p>
      </section>

      <section>
        <h2 className="text-center font-sans text-xs font-bold tracking-widest text-stone-400 uppercase mb-8">
          Configure today's briefing
        </h2>
        <DigestConfigurator 
          config={config} 
          setConfig={setConfig} 
          onGenerate={handleGenerateDigest} 
          isLoading={loading}
        />
      </section>

      <section className="border-t border-stone-200 border-dashed pt-16">
        <UrlAnalyzer onAnalyze={handleAnalyzeUrl} isLoading={loading} />
      </section>
    </div>
  );

  const renderArticleList = (list: Article[], emptyMessage: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
      {list.length === 0 ? (
         <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
            <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">{emptyMessage}</p>
         </div>
      ) : (
        list.map((article) => (
          <ArticleCard 
            key={article.url} // Use URL as key for stability across lists
            article={article} 
            isSaved={isArticleSaved(article)}
            rating={getArticleRating(article)}
            onToggleSave={handleToggleSave}
            onRate={handleRate}
          />
        ))
      )}
    </div>
  );

  const renderResults = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium group bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <span className="text-stone-400 text-sm font-serif italic">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {loading ? (
        <SkeletonLoader mode={loadingMode} />
      ) : (
        renderArticleList(articles, "No articles generated.")
      )}
    </div>
  );

  const renderSaved = () => (
    <div className="animate-in fade-in duration-300 pt-24">
       <div className="mb-8">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium group mb-6 bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h2 className="font-serif text-4xl mb-2 text-charcoal">Read Later</h2>
        <p className="text-stone-500">Your personal library of saved insights.</p>
      </div>
      {renderArticleList(savedArticles, "No articles saved yet. Bookmark them from your daily digest.")}
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-300 pt-24">
      <div className="mb-8">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium group mb-6 bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h2 className="font-serif text-4xl mb-2 text-charcoal">Archive</h2>
        <p className="text-stone-500">Previous briefings and analyses.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
          <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No digests generated yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => restoreHistoryItem(item)}
              className="bg-white p-6 rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-md cursor-pointer transition-all duration-300 flex justify-between items-center group active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center text-xs text-stone-400 mb-2 uppercase tracking-wider">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(item.timestamp).toLocaleString()}
                  {item.type === 'url' && <span className="ml-2 bg-stone-100 text-stone-600 px-2 rounded-full">URL Analysis</span>}
                </div>
                <h3 className="font-serif text-lg text-stone-800 group-hover:text-charcoal font-medium">
                  {item.type === 'url' 
                    ? item.articles[0]?.title || 'Analyzed URL' 
                    : `${item.articles.length} Articles • ${item.config.level}`}
                </h3>
                {item.type === 'feed' && (
                  <div className="flex flex-wrap gap-2 mt-2">
                     <span className="text-xs bg-amber-50 px-2 py-1 rounded-md text-amber-700 font-medium">
                        {item.config.dateRange}
                     </span>
                    {item.config.topics.map(t => (
                      <span key={t} className="text-xs bg-stone-50 px-2 py-1 rounded-md text-stone-500">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ArrowLeft className="rotate-180 text-stone-300 group-hover:text-stone-900 transition-colors group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFooter = () => (
    <footer className="mt-24 pb-12 text-center text-stone-400 px-4">
      <div className="max-w-2xl mx-auto border-t border-stone-200 pt-8">
        <Quote className="w-6 h-6 mx-auto mb-4 opacity-50 text-stone-300" />
        <p className="font-serif text-lg md:text-xl text-stone-600 mb-2 italic">
          "{dailyQuote.text}"
        </p>
        <p className="text-sm font-medium uppercase tracking-widest text-stone-400">
          — {dailyQuote.author}
        </p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen font-sans text-charcoal selection:bg-stone-200 selection:text-black flex flex-col">
      {renderFloatingControls()}
      
      <main className="max-w-6xl mx-auto px-4 flex-grow w-full">
        {view === 'dashboard' && renderDashboard()}
        {view === 'result' && renderResults()}
        {view === 'history' && renderHistory()}
        {view === 'saved' && renderSaved()}
      </main>

      {renderFooter()}
    </div>
  );
}

export default App;