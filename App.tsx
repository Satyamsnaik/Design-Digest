import React, { useState, useEffect, useMemo } from 'react';
import { DigestConfig, Article, DigestHistoryItem, UserPreferences } from './types';
import { fetchLiveDigest, analyzeUrl } from './services/geminiService';
import DigestConfigurator from './components/DigestConfigurator';
import ArticleCard from './components/ArticleCard';
import UrlAnalyzer from './components/UrlAnalyzer';
import SkeletonLoader from './components/SkeletonLoader';
import { Newspaper, History, Clock, ArrowLeft, Bookmark, Quote } from 'lucide-react';
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
    topics: ['Random/Surprise Me']
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
        config: { level: config.level, topics: [] }, // Empty topics for URL
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
  const renderHeader = () => (
    <header className="py-4 md:py-6 border-b border-stone-200 mb-8 bg-cream sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
          <div className="bg-charcoal text-cream p-2 rounded-lg shadow-sm group-hover:bg-stone-800 group-hover:scale-105 transition-all">
            <Newspaper className="w-4 h-4" />
          </div>
          <h1 className="font-serif text-lg md:text-xl font-bold text-charcoal tracking-tight group-hover:text-stone-600 transition-colors">
            Daily Design Digest
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setView(view === 'saved' ? 'dashboard' : 'saved')}
            className={`p-2.5 rounded-full transition-all duration-200 text-stone-700 active:scale-90 ${view === 'saved' ? 'bg-stone-200 shadow-inner' : 'hover:bg-stone-200 hover:shadow-sm'}`}
            aria-label="Saved Articles"
            title="Read Later"
          >
            {view === 'saved' ? <ArrowLeft className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setView(view === 'history' ? 'dashboard' : 'history')}
            className={`p-2.5 rounded-full transition-all duration-200 text-stone-700 active:scale-90 ${view === 'history' ? 'bg-stone-200 shadow-inner' : 'hover:bg-stone-200 hover:shadow-sm'}`}
            aria-label="History"
            title="History"
          >
            {view === 'history' ? <ArrowLeft className="w-5 h-5" /> : <History className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="space-y-16 animate-in fade-in duration-700">
      <section>
        <h2 className="text-center font-serif text-2xl text-stone-800 mb-8 italic">
          Configure today's briefing
        </h2>
        <DigestConfigurator 
          config={config} 
          setConfig={setConfig} 
          onGenerate={handleGenerateDigest} 
          isLoading={loading}
        />
      </section>

      <section className="border-t border-stone-200 pt-16">
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
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium group"
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
    <div className="animate-in fade-in duration-300">
      <h2 className="font-serif text-3xl mb-8 text-charcoal">Read Later</h2>
      {renderArticleList(savedArticles, "No articles saved yet. Bookmark them from your daily digest.")}
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-300">
      <h2 className="font-serif text-3xl mb-8 text-charcoal">Archive</h2>
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
                  <div className="flex gap-2 mt-2">
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
    <div className="min-h-screen bg-cream font-sans text-charcoal selection:bg-stone-200 selection:text-black flex flex-col">
      {renderHeader()}
      
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