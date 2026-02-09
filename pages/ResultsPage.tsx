import React from 'react';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { AlertTriangle } from 'lucide-react';

interface ResultsPageProps {
	articles: Article[];
	loading: boolean;
	loadingMode: 'feed' | 'url';
	isFallbackMode: boolean;
	savedArticles: Article[];
	likedArticles: Article[];
	dislikedArticles: Article[];
	onToggleSave: (article: Article) => void;
	onRate: (article: Article, rating: 'up' | 'down' | null) => void;
}

export default function ResultsPage({
	articles,
	loading,
	loadingMode,
	isFallbackMode,
	savedArticles,
	likedArticles,
	dislikedArticles,
	onToggleSave,
	onRate
}: ResultsPageProps) {
	return (
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
							onToggleSave={onToggleSave}
							onRate={onRate}
						/>
					))}
				</div>
			)}
		</div>
	);
}
