import React, { Component, useState, useEffect, ErrorInfo, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { DigestConfig, Article, DigestHistoryItem } from './types';
import ApiKeyInput from './components/ApiKeyInput';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage';
import SavedPage from './pages/SavedPage';
import HistoryPage from './pages/HistoryPage';
import { useArticles } from './hooks/useArticles';
import { useHistory } from './hooks/useHistory';
import { useApiKey } from './hooks/useApiKey';
import { useSearch } from './hooks/useSearch';
import { generateId } from './utils/generateId';
import { FALLBACK_ARTICLES } from './constants';

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

// Main App Component
function AppContent() {
	// View state
	const [view, setView] = useState<'dashboard' | 'history' | 'result' | 'saved'>('dashboard');
	const [loading, setLoading] = useState(false);
	const [loadingMode, setLoadingMode] = useState<'feed' | 'url'>('feed');
	const [isFallbackMode, setIsFallbackMode] = useState(false);

	// Config state
	const [config, setConfig] = useState<DigestConfig>({
		level: 'Mid-Level',
		topics: ['Random/Surprise Me'],
		dateRange: 'Last Month'
	});

	// Custom hooks
	const { articles, setArticles, savedArticles, likedArticles, dislikedArticles, toggleSave, rateArticle } = useArticles();
	const { history, addHistoryItem } = useHistory();
	const { showKeyModal, isKeyMissing, saveKey, openKeyModal, closeKeyModal } = useApiKey();
	const { searchQuery, setSearchQuery, filterArticles, filterHistory } = useSearch();

	// Reset search when view changes
	useEffect(() => {
		setSearchQuery('');
	}, [view, setSearchQuery]);

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

			addHistoryItem(historyItem);
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

			addHistoryItem(historyItem);
		} catch (err: any) {
			console.error("Analysis failed:", err);
			toast.error(err.message || "URL Analysis failed", { duration: 5000 });
			setView('dashboard');
		} finally {
			setLoading(false);
		}
	};

	const handleSelectHistory = (item: DigestHistoryItem) => {
		setArticles(item.articles);
		setView('result');
	};

	// Get filtered data
	const filteredSavedArticles = filterArticles(savedArticles);
	const filteredHistory = filterHistory(history);

	// Get nav title based on view
	const getNavTitle = () => {
		if (view === 'saved') return 'Saved Articles';
		if (view === 'history') return 'History';
		return undefined;
	};

	return (
		<div className="min-h-screen font-sans text-charcoal selection:bg-stone-200 flex flex-col bg-transparent relative">
			<NavBar
				currentView={view}
				onViewChange={setView}
				savedCount={savedArticles.length}
				isKeyMissing={isKeyMissing}
				onOpenApiKey={openKeyModal}
				title={getNavTitle()}
			/>

			{/* API Key Modal */}
			{showKeyModal && (
				<ApiKeyInput onSave={saveKey} onClose={closeKeyModal} />
			)}

			<main className="max-w-6xl mx-auto px-4 flex-grow w-full pt-24 md:pt-32">
				{view === 'dashboard' && (
					<DashboardPage
						config={config}
						setConfig={setConfig}
						onGenerate={handleGenerateDigest}
						onAnalyze={handleAnalyzeUrl}
						loading={loading}
						isKeyMissing={isKeyMissing}
						onOpenApiKey={openKeyModal}
					/>
				)}

				{view === 'result' && (
					<ResultsPage
						articles={articles}
						loading={loading}
						loadingMode={loadingMode}
						isFallbackMode={isFallbackMode}
						savedArticles={savedArticles}
						likedArticles={likedArticles}
						dislikedArticles={dislikedArticles}
						onToggleSave={toggleSave}
						onRate={rateArticle}
					/>
				)}

				{view === 'saved' && (
					<SavedPage
						articles={filteredSavedArticles}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						onToggleSave={toggleSave}
						onRate={rateArticle}
						totalCount={savedArticles.length}
					/>
				)}

				{view === 'history' && (
					<HistoryPage
						history={filteredHistory}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						onSelectHistory={handleSelectHistory}
						totalCount={history.length}
					/>
				)}

				<Footer />
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