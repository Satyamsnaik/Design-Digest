import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { DigestConfig, Article, DigestHistoryItem, UserPreferences } from './types.ts';
// Removed static import of geminiService to prevent startup crashes if SDK fails
// import { fetchLiveDigest, analyzeUrl } from './services/geminiService.ts'; 
import DigestConfigurator from './components/DigestConfigurator.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import UrlAnalyzer from './components/UrlAnalyzer.tsx';
import SkeletonLoader from './components/SkeletonLoader.tsx';
import ApiKeyInput from './components/ApiKeyInput.tsx';
import { Newspaper, History, Clock, ArrowLeft, Bookmark, Quote, Home, Shuffle, LogOut } from 'lucide-react';
import { DESIGN_QUOTES } from './constants.ts';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SimpleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h2>
          <p className="text-stone-600 mb-4">Please try refreshing the page.</p>
          <pre className="text-xs bg-stone-100 p-4 rounded text-left overflow-auto max-w-lg w-full">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-charcoal text-white rounded-full hover:bg-black"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ID Generator Helper
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Main App Component
function AppContent() {
  // State
  const [hasApiKey, setHasApiKey] = useState(false);
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
    level: 'Mid-Level',
    topics: ['Random/Surprise Me'],
    dateRange: 'Last Month'
  });

  // Daily Quote State
  const [currentQuote, setCurrentQuote] = useState(DESIGN_QUOTES[0]);

  // Check for API Key on mount - Safe Access
  useEffect(() => {
    try {
      const key = localStorage.getItem('ddd_api_key');
      if (key) {
        setHasApiKey(true);
      }
    } catch (e) {
      console.warn("Local storage access failed", e);
    }
  }, []);

  // Initialize random quote on mount
  useEffect(() => {
    setCurrentQuote(DESIGN_QUOTES[Math.floor(Math.random() * DESIGN_QUOTES.length)]);
  }, []);

  const handleSaveApiKey = (key: string) => {
    try {
      localStorage.setItem('ddd_api_key', key);
    } catch (e) {
       console.warn("Could not save key to storage", e);
    }
    setHasApiKey(true);
  };

  const handleResetApiKey = () => {
    try {
      localStorage.removeItem('ddd_api_key');
    } catch (e) {
      console.error("Error removing key from storage", e);
    }
    setHasApiKey(false);
    setView('dashboard');
    setArticles([]); 
  };

  const handleNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * DESIGN_QUOTES.length);
    } while (DESIGN_QUOTES[newIndex].text === currentQuote.text && DESIGN_QUOTES.length > 1);
    
    setCurrentQuote(DESIGN_QUOTES[newIndex]);
  };

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

  // Save persistence with error handling
  useEffect(() => {
    try {
      localStorage.setItem('ddd_history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to local storage", e);
    }
  }, [history]);
  
  useEffect(() => {
    try {
      localStorage.setItem('ddd_saved', JSON.stringify(savedArticles));
    } catch (e) {
      console.error("Failed to save saved articles to local storage", e);
    }
  }, [savedArticles]);
  
  useEffect(() => {
    try {
      localStorage.setItem('ddd_liked', JSON.stringify(likedArticles));
    } catch (e) {
      console.error("Failed to save liked articles", e);
    }
  }, [likedArticles]);
  
  useEffect(() => {
    try {
      localStorage.setItem('ddd_disliked', JSON.stringify(dislikedArticles));
    } catch (e) {
      console.error("Failed to save disliked articles", e);
    }
  }, [dislikedArticles]);

  // Handlers
  const handleGenerateDigest = async () => {
    setLoading(true);
    setLoadingMode('feed');
    setView('result');
    setArticles([]); // Clear previous

    try {
      // Dynamic import to prevent app crash if SDK is unavailable at startup
      const { fetchLiveDigest } = await import('./services/geminiService.ts');
      
      const prefs: UserPreferences = {
        likedArticles,
        dislikedArticles
      };

      const results = await fetchLiveDigest(config, prefs);
      setArticles(results);
      
      // Save to history
      const historyItem: DigestHistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        config: config,
        articles: results,
        type: 'feed'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Failed to generate digest", err);
      if (err instanceof Error && err.message.includes("API Key")) {
         alert("API Key missing or invalid. Please re-enter.");
         setHasApiKey(false);
      } else {
        alert("Failed to connect to AI service. Please check your network or API key.");
      }
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
      // Dynamic import
      const { analyzeUrl } = await import('./services/geminiService.ts');

      const result = await analyzeUrl(url);
      setArticles([result]);

      const historyItem: DigestHistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        config: { level: config.level, topics: [], dateRange: 'Any Time' }, // Empty topics for URL
        articles: [result],
        type: 'url'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Failed to analyze URL", err);
      if (err instanceof Error && err.message.includes("API Key")) {
        alert("API Key missing or invalid. Please re-enter.");
        setHasApiKey(false);
     } else {
        alert("Failed to analyze URL.");
     }
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
      <div className="flex gap-2 pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-stone-200/50 hover:shadow-xl transition-all duration-300">
        <button
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-full transition-all duration-200 active:scale-90 ${view === 'dashboard' ? 'text-charcoal bg-stone-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
            title="Home"
        >
             <Home className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-stone-200 my-auto"></div>
        <button 
          onClick={() => setView(view === 'saved' ? 'dashboard' : 'saved')}
          className={`relative p-3 rounded-full transition-all duration-200 active:scale-90 ${view === 'saved' ? 'text-amber-600 bg-amber-50' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          title="Read Later"
        >
          <Bookmark className={`w-5 h-5 ${view === 'saved' ? 'fill-current' : ''}`} />
          {savedArticles.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>
          )}
        </button>
        
        <button 
          onClick={() => setView(view === 'history' ? 'dashboard' : 'history')}
          className={`p-3 rounded-full transition-all duration-200 active:scale-90 ${view === 'history' ? 'text-charcoal bg-stone-100' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-stone-200 my-auto"></div>
        
        <button 
          onClick={handleResetApiKey}
          className="p-3 rounded-full transition-all duration-200 hover:bg-red-50 hover:text-red-600 text-stone-400 active:scale-90 group"
          title="Sign Out / Reset Key"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-16 animate-in fade-in duration-700 pt-32">
      {/* Hero Title */}
      <section className="text-center space-y-4">
        <h1 className="font-serif text-5xl md:text-7xl text-charcoal tracking-tight">
          Daily Design Digest
        </h1>
        <p className="text-stone-500 text-lg md:text-xl font-serif italic max-w-xl mx-auto">
          Curated intelligence for product designers, strategists, and engineers.
        </p>
      </section>

      <section>
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
            <p className="text-stone-500 font-medium">{emptyMessage}</p>
         </div>
      ) : (
        list.map((article) => (
          <ArticleCard 
            key={article.url}
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
          className="flex items-center text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium group bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
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
          className="flex items-center text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium group mb-6 bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200 w-fit active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h2 className="font-serif text-4xl mb-2 text-charcoal">Reading List</h2>
        <p className="text-stone-500">Your personal library of saved insights.</p>
      </div>
      {renderArticleList(savedArticles, "Your reading list is empty.")}
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-300 pt-24">
      <div className="mb-8">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium group mb-6 bg-white/50 px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-stone-200 w-fit active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h2 className="font-serif text-4xl mb-2 text-charcoal">Archive</h2>
        <p className="text-stone-500">Previous briefings.</p>
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
                  {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {item.type === 'url' && <span className="ml-2 bg-stone-100 text-stone-600 px-2 rounded-full">URL</span>}
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
                    {item.config.topics.slice(0, 3).map(t => (
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
    <footer className="mt-24 pb-12 text-center text-stone-400 px-4 group/footer">
      <div className="max-w-2xl mx-auto border-t border-stone-200 pt-8 relative">
        <div className="flex items-center justify-center gap-2 mb-4">
            <Quote className="w-6 h-6 opacity-50 text-stone-300" />
            <button 
                onClick={handleNewQuote}
                className="p-2 rounded-full text-stone-300 hover:text-stone-500 hover:bg-stone-100 opacity-0 group-hover/footer:opacity-100 transition-all duration-300 active:rotate-180"
                title="Shuffle Quote"
            >
                <Shuffle className="w-4 h-4" />
            </button>
        </div>
        <div className="min-h-[6rem] flex flex-col justify-center animate-in fade-in duration-500 key={currentQuote.text}">
            <p className="font-serif text-lg md:text-xl text-stone-600 mb-2 italic">
            "{currentQuote.text}"
            </p>
            <p className="text-sm font-medium uppercase tracking-widest text-stone-400">
            — {currentQuote.author}
            </p>
        </div>
      </div>
    </footer>
  );

  // Initial State: No API Key - ROBUST MODAL RENDERING
  if (!hasApiKey) {
    return (
        <div style={{ 
            position: 'fixed', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100dvh', // Use dynamic viewport height for mobile
            zIndex: 9999, 
            backgroundColor: '#fafaf9', 
            display: 'flex', 
            flexDirection: 'column',
            overflowY: 'auto',
            overscrollBehavior: 'none'
        }}>
            <ApiKeyInput onSave={handleSaveApiKey} />
        </div>
    );
  }

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

// Default Export wrapping with Error Boundary
export default function App() {
  return (
    <SimpleErrorBoundary>
      <AppContent />
    </SimpleErrorBoundary>
  );
}