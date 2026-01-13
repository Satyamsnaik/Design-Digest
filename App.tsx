import React, { Component, useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { DigestConfig, Article, DigestHistoryItem, UserPreferences } from './types.ts';
import DigestConfigurator from './components/DigestConfigurator.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import UrlAnalyzer from './components/UrlAnalyzer.tsx';
import SkeletonLoader from './components/SkeletonLoader.tsx';
import { Newspaper, History, Clock, Bookmark, Quote, Home, Shuffle, Sparkles, AlertTriangle, Link, Tag, ChevronRight, Filter } from 'lucide-react';
import { DESIGN_QUOTES, FALLBACK_ARTICLES } from './constants.ts';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SimpleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
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
        <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-cream">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h2>
          <p className="text-stone-600 mb-4">Please try refreshing the page.</p>
          <pre className="text-xs bg-white border border-stone-200 p-4 rounded text-left overflow-auto max-w-lg w-full">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-charcoal text-white rounded-full hover:bg-black transition-colors"
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
  const [view, setView] = useState<'dashboard' | 'history' | 'result' | 'saved'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'feed' | 'url'>('feed');
  const [articles, setArticles] = useState<Article[]>([]);
  const [history, setHistory] = useState<DigestHistoryItem[]>([]);
  
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [dislikedArticles, setDislikedArticles] = useState<Article[]>([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const [config, setConfig] = useState<DigestConfig>({
    level: 'Mid-Level',
    topics: ['Random/Surprise Me'],
    dateRange: 'Last Month'
  });

  const [currentQuote, setCurrentQuote] = useState(DESIGN_QUOTES[0]);

  useEffect(() => {
    setCurrentQuote(DESIGN_QUOTES[Math.floor(Math.random() * DESIGN_QUOTES.length)]);
    
    // Load local data
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
      console.error("Storage error:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ddd_history', JSON.stringify(history));
    localStorage.setItem('ddd_saved', JSON.stringify(savedArticles));
    localStorage.setItem('ddd_liked', JSON.stringify(likedArticles));
    localStorage.setItem('ddd_disliked', JSON.stringify(dislikedArticles));
  }, [history, savedArticles, likedArticles, dislikedArticles]);

  const handleNewQuote = () => {
    setCurrentQuote(DESIGN_QUOTES[Math.floor(Math.random() * DESIGN_QUOTES.length)]);
  };

  const handleGenerateDigest = async () => {
    setLoading(true);
    setLoadingMode('feed');
    setView('result');
    setArticles([]); 
    setIsFallbackMode(false);

    try {
      const { fetchLiveDigest } = await import('./services/geminiService.ts');
      const results = await fetchLiveDigest(config, { likedArticles, dislikedArticles });
      
      if (results === FALLBACK_ARTICLES) {
        setIsFallbackMode(true);
      }

      setArticles(results);
      
      const historyItem: DigestHistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        config,
        articles: results,
        type: 'feed'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Fetch failed:", err);
      alert("Briefing generation failed. Please check your internet connection or verify your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setLoading(true);
    setLoadingMode('url');
    setView('result');
    setArticles([]);
    setIsFallbackMode(false);

    try {
      const { analyzeUrl } = await import('./services/geminiService.ts');
      const result = await analyzeUrl(url);
      setArticles([result]);

      const historyItem: DigestHistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        config: { level: config.level, topics: [], dateRange: 'Any Time' }, 
        articles: [result],
        type: 'url'
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("URL Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (article: Article) => {
    setSavedArticles(prev => prev.some(a => a.url === article.url) 
      ? prev.filter(a => a.url !== article.url) 
      : [article, ...prev]
    );
  };

  const handleRate = (article: Article, rating: 'up' | 'down' | null) => {
    setLikedArticles(prev => prev.filter(a => a.url !== article.url));
    setDislikedArticles(prev => prev.filter(a => a.url !== article.url));
    if (rating === 'up') setLikedArticles(prev => [article, ...prev]);
    else if (rating === 'down') setDislikedArticles(prev => [article, ...prev]);
  };

  const renderNavBar = () => (
    <nav className="fixed top-0 inset-x-0 z-50 px-4 py-4 md:py-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left: Title for Saved/History */}
        <div className="pointer-events-auto min-w-[40px] min-h-[44px] flex items-center">
             {(view === 'saved' || view === 'history') && (
               <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal tracking-tight capitalize animate-in fade-in slide-in-from-left-4 duration-500">
                 {view === 'saved' ? 'Saved Articles' : 'History'}
               </h1>
             )}
        </div>

        {/* Right: Navigation Tabs */}
        <div className="pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white/90 backdrop-blur-xl p-1.5 rounded-full border border-stone-200/50 flex gap-1 items-center">
             <button
                onClick={() => setView('dashboard')}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  view === 'dashboard' 
                    ? 'bg-stone-100 text-charcoal shadow-inner' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                }`}
                title="Home"
            >
                 <Home className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('saved')}
              className={`relative p-2.5 rounded-full transition-all duration-300 ${
                view === 'saved' 
                  ? 'bg-amber-50 text-amber-900 shadow-inner' 
                  : 'text-stone-400 hover:text-amber-700 hover:bg-amber-50/50'
              }`}
              title="Saved Articles"
            >
              <Bookmark className={`w-5 h-5 ${view === 'saved' ? 'fill-current' : ''}`} />
              {savedArticles.length > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full ring-1 ring-white"></span>
              )}
            </button>
            <button 
              onClick={() => setView('history')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                view === 'history' 
                  ? 'bg-stone-100 text-charcoal shadow-inner' 
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
              title="History"
            >
              <History className="w-5 h-5" />
            </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen font-sans text-charcoal selection:bg-stone-200 flex flex-col bg-cream relative">
      
      {renderNavBar()}
      
      <main className="max-w-6xl mx-auto px-4 flex-grow w-full pt-24 md:pt-32">
        {view === 'dashboard' && (
          <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
            <section className="text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center justify-center p-2 bg-stone-100 rounded-full mb-2">
                  <Sparkles className="w-4 h-4 text-stone-400" />
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-charcoal leading-[0.9] pt-2 tracking-tight">
                Daily Design <br/>
                <span className="text-stone-400 font-light">Digest</span>
              </h1>
              <p className="text-stone-500 text-lg md:text-xl font-sans font-light max-w-lg mx-auto leading-relaxed px-4">
                Curated intelligence for product designers, strategists, and engineers.
              </p>
            </section>
            <DigestConfigurator config={config} setConfig={setConfig} onGenerate={handleGenerateDigest} isLoading={loading} />
            <UrlAnalyzer onAnalyze={handleAnalyzeUrl} isLoading={loading} />
          </div>
        )}

        {view === 'result' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {isFallbackMode && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                <div className="p-2 bg-amber-100 rounded-full mr-4 flex-shrink-0 text-amber-600">
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-amber-900 font-bold text-sm uppercase tracking-wide mb-1">AI Connection Unavailable</h4>
                   <p className="text-amber-800 text-sm leading-relaxed">
                     We couldn't connect to the live intelligence feed (Check your API Key or Network). 
                     <br className="hidden md:block"/>
                     Showing <strong>curated sample data</strong> so you can still experience the interface.
                   </p>
                </div>
              </div>
            )}

            {loading ? <SkeletonLoader mode={loadingMode} /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-20">
                {articles.map(article => (
                  <ArticleCard 
                    key={article.url} 
                    article={article} 
                    isSaved={savedArticles.some(a => a.url === article.url)}
                    rating={likedArticles.some(a => a.url === article.url) ? 'up' : dislikedArticles.some(a => a.url === article.url) ? 'down' : null}
                    onToggleSave={handleToggleSave}
                    onRate={handleRate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(view === 'saved' || view === 'history') && (
           <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
             
             {view === 'saved' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-20">
                 {savedArticles.length === 0 ? <p className="col-span-full text-center py-20 text-stone-400">No saved articles yet.</p> : 
                   savedArticles.map(article => (
                     <ArticleCard key={article.url} article={article} isSaved={true} onToggleSave={handleToggleSave} onRate={handleRate} />
                   ))
                 }
               </div>
             )}

             {view === 'history' && (
                <div className="space-y-4 md:space-y-6 pb-20">
                  {history.length === 0 ? <p className="text-center py-20 text-stone-400">History is empty.</p> : 
                    history.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {setArticles(item.articles); setView('result');}} 
                        className="bg-white p-5 md:p-6 rounded-2xl border border-stone-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-stone-300 cursor-pointer transition-all group relative overflow-hidden"
                      >
                        {/* Hover Indicator Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-charcoal transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                        
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                                {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {item.type === 'feed' && (
                                 <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-1 rounded-md border border-stone-200 uppercase tracking-widest flex items-center gap-1">
                                    <Filter className="w-3 h-3" />
                                    {item.config.level}
                                 </span>
                              )}
                           </div>
                           <div className="p-2 bg-stone-50 rounded-full group-hover:bg-charcoal group-hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                           </div>
                        </div>

                        <h3 className="font-sans text-xl md:text-2xl font-bold text-charcoal mb-4 group-hover:text-black transition-colors leading-tight">
                          {item.type === 'url' ? (
                            <span className="flex items-center gap-2">
                               <Link className="w-5 h-5 text-stone-400 flex-shrink-0" />
                               {item.articles[0]?.title || "URL Analysis"}
                            </span>
                          ) : (
                            `${item.articles.length} Articles Briefing`
                          )}
                        </h3>
                        
                        {item.type === 'feed' && item.config.topics && (
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {item.config.topics.map((topic, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                 <Tag className="w-3 h-3 mr-1 opacity-50" />
                                 {topic}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {item.type === 'url' && (
                            <div className="text-sm text-stone-500 line-clamp-1 font-sans">
                                {item.articles[0]?.summary?.[0] || "No summary available."}
                            </div>
                        )}
                      </div>
                    ))
                  }
                </div>
             )}
           </div>
        )}
      </main>

      <footer className="mt-12 md:mt-24 pb-12 text-center text-stone-400 group/footer px-4">
        <div className="max-w-2xl mx-auto border-t border-stone-200/50 pt-12 relative">
          <Quote className="w-5 h-5 opacity-40 text-stone-400 mx-auto mb-6" />
          <p className="font-sans text-lg md:text-xl text-stone-600 mb-3">"{currentQuote.text}"</p>
          <p className="text-xs font-bold uppercase tracking-widest">— {currentQuote.author}</p>
          <button onClick={handleNewQuote} className="mt-6 p-2 rounded-full text-stone-300 hover:text-stone-500 opacity-0 group-hover/footer:opacity-100 transition-all">
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SimpleErrorBoundary>
      <AppContent />
    </SimpleErrorBoundary>
  );
}