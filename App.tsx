import React, { useState, useEffect, ErrorInfo, Component } from 'react';
import { DigestConfig, Article, DigestHistoryItem, UserPreferences } from './types.ts';
import DigestConfigurator from './components/DigestConfigurator.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import UrlAnalyzer from './components/UrlAnalyzer.tsx';
import SkeletonLoader from './components/SkeletonLoader.tsx';
import { Newspaper, History, Clock, ArrowLeft, Bookmark, Quote, Home, Shuffle, Sparkles } from 'lucide-react';
import { DESIGN_QUOTES } from './constants.ts';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly use Component to ensure correct type resolution for props
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

    try {
      const { fetchLiveDigest } = await import('./services/geminiService.ts');
      const results = await fetchLiveDigest(config, { likedArticles, dislikedArticles });
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
      alert("Briefing generation failed. Ensure your Gemini API Key is configured correctly in the build environment.");
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

  const renderFloatingControls = () => (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <div className="flex gap-1 pointer-events-auto bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-lg border border-white/50 ring-1 ring-stone-900/5 transition-all">
        <button
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-full transition-all ${view === 'dashboard' ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-stone-600'}`}
        >
             <Home className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('saved')}
          className={`relative p-3 rounded-full transition-all ${view === 'saved' ? 'text-amber-700 bg-amber-50' : 'text-stone-400 hover:text-amber-600'}`}
        >
          <Bookmark className={`w-5 h-5 ${view === 'saved' ? 'fill-current' : ''}`} />
          {savedArticles.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>
          )}
        </button>
        <button 
          onClick={() => setView('history')}
          className={`p-3 rounded-full transition-all ${view === 'history' ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-charcoal selection:bg-stone-200 flex flex-col bg-cream">
      {renderFloatingControls()}
      <main className="max-w-6xl mx-auto px-4 flex-grow w-full">
        {view === 'dashboard' && (
          <div className="space-y-12 pt-24 md:pt-32 animate-in fade-in duration-700">
            <section className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-2 bg-stone-100 rounded-full mb-2">
                  <Sparkles className="w-4 h-4 text-stone-400" />
              </div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-charcoal tracking-tighter leading-[0.9]">
                Daily Design <br/>
                <span className="text-stone-400 italic font-light">Digest</span>
              </h1>
              <p className="text-stone-500 text-lg md:text-xl font-serif italic max-w-lg mx-auto leading-relaxed">
                Curated intelligence for product designers, strategists, and engineers.
              </p>
            </section>
            <DigestConfigurator config={config} setConfig={setConfig} onGenerate={handleGenerateDigest} isLoading={loading} />
            <UrlAnalyzer onAnalyze={handleAnalyzeUrl} isLoading={loading} />
          </div>
        )}

        {view === 'result' && (
          <div className="pt-24 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 flex items-center justify-between sticky top-6 z-30 bg-cream/90 backdrop-blur-md p-4 rounded-2xl border border-stone-100 shadow-sm">
              <button onClick={() => setView('dashboard')} className="flex items-center text-charcoal font-medium bg-white px-5 py-2.5 rounded-full border border-stone-200 shadow-sm hover:shadow-md transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <span className="text-stone-500 text-sm font-serif italic hidden md:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {loading ? <SkeletonLoader mode={loadingMode} /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
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
           <div className="pt-24 animate-in fade-in duration-300 max-w-4xl mx-auto">
             <button onClick={() => setView('dashboard')} className="flex items-center text-stone-500 hover:text-stone-900 transition-all font-medium mb-8">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Dashboard
             </button>
             <h2 className="font-serif text-5xl mb-12 text-charcoal tracking-tight capitalize">{view}</h2>
             
             {view === 'saved' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                 {savedArticles.length === 0 ? <p className="col-span-full text-center py-20 text-stone-400 italic">No saved articles yet.</p> : 
                   savedArticles.map(article => (
                     <ArticleCard key={article.url} article={article} isSaved={true} onToggleSave={handleToggleSave} onRate={handleRate} />
                   ))
                 }
               </div>
             )}

             {view === 'history' && (
                <div className="space-y-6 pb-20">
                  {history.length === 0 ? <p className="text-center py-20 text-stone-400 italic">History is empty.</p> : 
                    history.map(item => (
                      <div key={item.id} onClick={() => {setArticles(item.articles); setView('result');}} className="bg-white p-6 rounded-2xl border border-stone-200 hover:shadow-lg cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <h3 className="font-serif text-xl text-charcoal">{item.type === 'url' ? item.articles[0].title : `${item.articles.length} Articles Briefing`}</h3>
                        </div>
                        <ArrowLeft className="w-5 h-5 rotate-180 text-stone-300 group-hover:text-charcoal group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  }
                </div>
             )}
           </div>
        )}
      </main>

      <footer className="mt-24 pb-12 text-center text-stone-400 group/footer">
        <div className="max-w-2xl mx-auto border-t border-stone-200/50 pt-12 relative">
          <Quote className="w-5 h-5 opacity-40 text-stone-400 mx-auto mb-6" />
          <p className="font-serif text-xl text-stone-600 mb-3 italic">"{currentQuote.text}"</p>
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