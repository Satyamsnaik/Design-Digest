import React, { Component, useState, useEffect, ErrorInfo, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { DigestConfig, Article, DigestHistoryItem } from './types';
import DigestConfigurator from './components/DigestConfigurator';
import ArticleCard from './components/ArticleCard';
import UrlAnalyzer from './components/UrlAnalyzer';
import SkeletonLoader from './components/SkeletonLoader';
import ApiKeyInput from './components/ApiKeyInput';
import { History, Bookmark, Home, AlertTriangle, Link, Tag, ChevronRight, Filter, RefreshCw, Search, X, Settings } from 'lucide-react';
import { FALLBACK_ARTICLES, DESIGN_QUOTES } from './constants';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
	children?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class SimpleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = {
		hasError: false,
		error: null
	};

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-[#FEFBF6]">
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
	const [showKeyModal, setShowKeyModal] = useState(false);

	// Quote State
	const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * DESIGN_QUOTES.length));

	// Search State
	const [searchQuery, setSearchQuery] = useState('');

	const [config, setConfig] = useState<DigestConfig>({
		level: 'Mid-Level',
		topics: ['Random/Surprise Me'],
		dateRange: 'Last Month'
	});

	useEffect(() => {
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

	// Reset search when view changes
	useEffect(() => {
		setSearchQuery('');
	}, [view]);

	const nextQuote = () => {
		setQuoteIndex(prev => {
			let next = Math.floor(Math.random() * DESIGN_QUOTES.length);
			// Try to get a new one, but don't loop forever if there's only 1 quote
			if (DESIGN_QUOTES.length > 1) {
				while (next === prev) {
					next = Math.floor(Math.random() * DESIGN_QUOTES.length);
				}
			}
			return next;
		});
	};

	const handleGenerateDigest = async () => {
		setLoading(true);
		setLoadingMode('feed');
		setView('result');
		setArticles([]);
		setIsFallbackMode(false);

		try {
			const { fetchLiveDigest } = await import('./services/geminiService');
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

			// Limit history to last 50 items to prevent storage overflow
			setHistory(prev => [historyItem, ...prev].slice(0, 50));
		} catch (err: any) {
			console.error("Fetch failed:", err);
			toast.error(err.message || "Something went wrong", { duration: 5000 });
			setIsFallbackMode(true);
			setArticles(FALLBACK_ARTICLES);
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
			const { analyzeUrl } = await import('./services/geminiService');
			const result = await analyzeUrl(url);
			setArticles([result]);

			const historyItem: DigestHistoryItem = {
				id: generateId(),
				timestamp: Date.now(),
				config: { level: config.level, topics: [], dateRange: 'Any Time' },
				articles: [result],
				type: 'url'
			};

			// Limit history to last 50 items
			setHistory(prev => [historyItem, ...prev].slice(0, 50));
		} catch (err: any) {
			console.error("Analysis failed:", err);
			toast.error(err.message || "URL Analysis failed", { duration: 5000 });
			setView('dashboard');
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

	const handleSaveKey = (key: string) => {
		sessionStorage.setItem("GEMINI_API_KEY", key);
		setShowKeyModal(false);
		alert("API Key saved for this session.");
	};

	const getFilteredSavedArticles = () => {
		if (!searchQuery) return savedArticles;
		const lower = searchQuery.toLowerCase();
		return savedArticles.filter(a =>
			a.title.toLowerCase().includes(lower) ||
			a.summary.some(s => s.toLowerCase().includes(lower)) ||
			a.category.toLowerCase().includes(lower)
		);
	};

	const getFilteredHistory = () => {
		if (!searchQuery) return history;
		const lower = searchQuery.toLowerCase();
		return history.filter(item => {
			// Search in config level/topics (safe checks for legacy data)
			if (item.config?.level?.toLowerCase().includes(lower)) return true;
			if (item.config?.topics?.some(t => t.toLowerCase().includes(lower))) return true;

			// Search in articles
			return item.articles.some(a =>
				a.title.toLowerCase().includes(lower) ||
				a.summary.some(s => s.toLowerCase().includes(lower))
			);
		});
	};

	const renderNavBar = () => (
		<nav className="fixed top-0 inset-x-0 z-50 px-4 py-4 md:py-6 pointer-events-none">
			<div className="max-w-6xl mx-auto flex items-center justify-between">

				{/* Left: Title for Saved/History */}
				<div className="pointer-events-auto min-w-[40px] min-h-[44px] flex items-center">
					{(view === 'saved' || view === 'history') ? (
						<h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal tracking-tight capitalize animate-in fade-in slide-in-from-left-4 duration-500">
							{view === 'saved' ? 'Saved Articles' : 'History'}
						</h1>
					) : null}
				</div>

				{/* Right: Navigation Tabs - iOS Glassmorphism Style */}
				<div className="pointer-events-auto shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] bg-white/40 backdrop-blur-2xl p-1.5 rounded-full border border-white/50 flex gap-1 items-center transition-all duration-300 hover:bg-white/50">

					<button
						onClick={() => setView('dashboard')}
						className={`p-2.5 rounded-full transition-all duration-300 ${view === 'dashboard'
							? 'bg-white/80 text-charcoal shadow-sm ring-1 ring-black/5'
							: 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
							}`}
						title="Home"
					>
						<Home className="w-5 h-5" />
					</button>
					<button
						onClick={() => setView('saved')}
						className={`relative p-2.5 rounded-full transition-all duration-300 ${view === 'saved'
							? 'bg-amber-100/80 text-amber-900 shadow-sm ring-1 ring-amber-200'
							: 'text-stone-500 hover:text-amber-700 hover:bg-amber-50/50'
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
						className={`p-2.5 rounded-full transition-all duration-300 ${view === 'history'
							? 'bg-white/80 text-charcoal shadow-sm ring-1 ring-black/5'
							: 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
							}`}
						title="History"
					>
						<History className="w-5 h-5" />
					</button>

					{/* Separator */}
					<div className="w-px h-4 bg-stone-300/30 mx-0.5"></div>

					{/* Settings Button */}
					<button
						onClick={() => setShowKeyModal(true)}
						className="p-2.5 rounded-full transition-all duration-300 text-stone-400 hover:text-charcoal hover:bg-white/40"
						title="API Settings"
					>
						<Settings className="w-5 h-5" />
					</button>
				</div>
			</div>
		</nav>
	);

	const renderSearch = () => (
		<div className="mb-6 relative max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-4 w-4 text-stone-400" />
			</div>
			<input
				type="text"
				className="block w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 focus:border-stone-400 sm:text-sm transition-all"
				placeholder={`Search ${view === 'saved' ? 'saved articles' : 'history'}...`}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			{searchQuery && (
				<button
					onClick={() => setSearchQuery('')}
					className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-charcoal cursor-pointer"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);

	return (
		<div className="min-h-screen font-sans text-charcoal selection:bg-stone-200 flex flex-col bg-transparent relative">

			{renderNavBar()}

			{/* API Key Modal */}
			{showKeyModal && (
				<ApiKeyInput onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />
			)}

			<main className="max-w-6xl mx-auto px-4 flex-grow w-full pt-24 md:pt-32">
				{view === 'dashboard' && (
					<div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
						<section className="text-center space-y-4 md:space-y-6">
							<h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-charcoal leading-tight pt-2 tracking-tight">
								Daily Design Digest
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
										We couldn't connect to the live intelligence feed.
										<br className="hidden md:block" />
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

						{/* Search Bar */}
						{renderSearch()}

						{view === 'saved' && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-20">
								{getFilteredSavedArticles().length === 0 ? (
									<p className="col-span-full text-center py-20 text-stone-400">
										{savedArticles.length === 0 ? "No saved articles yet." : "No matching articles found."}
									</p>
								) : (
									getFilteredSavedArticles().map(article => (
										<ArticleCard key={article.url} article={article} isSaved={true} onToggleSave={handleToggleSave} onRate={handleRate} />
									))
								)}
							</div>
						)}

						{view === 'history' && (
							<div className="space-y-4 md:space-y-6 pb-20">
								{getFilteredHistory().length === 0 ? (
									<p className="text-center py-20 text-stone-400">
										{history.length === 0 ? "History is empty." : "No matching history found."}
									</p>
								) : (
									getFilteredHistory().map(item => (
										<div
											key={item.id}
											onClick={() => { setArticles(item.articles); setView('result'); }}
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
								)}
							</div>
						)}
					</div>
				)}

				{/* Minimal Design Quotes Footer */}
				<footer className="py-12 pb-16 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
					<div className="max-w-2xl mx-auto flex flex-col items-center gap-3 group">
						<blockquote className="font-display text-lg md:text-xl text-stone-400 italic leading-relaxed transition-colors duration-300 group-hover:text-stone-500">
							"{DESIGN_QUOTES[quoteIndex].text}"
						</blockquote>
						<div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
							<cite className="not-italic text-xs font-bold uppercase tracking-widest text-stone-300">
								— {DESIGN_QUOTES[quoteIndex].author}
							</cite>
							<button
								onClick={nextQuote}
								className="p-1.5 rounded-full text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all"
								title="Next Quote"
							>
								<RefreshCw className="w-3 h-3" />
							</button>
						</div>
					</div>
				</footer>
			</main>
			<Toaster position="bottom-right" toastOptions={{
				className: '!bg-stone-900 !text-white !font-sans !rounded-lg',
				style: { border: '1px solid #333' }
			}} />
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