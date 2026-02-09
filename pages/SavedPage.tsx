import React from 'react';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import SearchBar from '../components/layout/SearchBar';

interface SavedPageProps {
	articles: Article[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onToggleSave: (article: Article) => void;
	onRate: (article: Article, rating: 'up' | 'down' | null) => void;
	totalCount: number;
}

export default function SavedPage({
	articles,
	searchQuery,
	onSearchChange,
	onToggleSave,
	onRate,
	totalCount
}: SavedPageProps) {
	return (
		<div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
			<SearchBar
				placeholder="Search saved articles..."
				value={searchQuery}
				onChange={onSearchChange}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-20">
				{articles.length === 0 ? (
					<p className="col-span-full text-center py-20 text-stone-400">
						{totalCount === 0 ? "No saved articles yet." : "No matching articles found."}
					</p>
				) : (
					articles.map(article => (
						<ArticleCard
							key={article.url}
							article={article}
							isSaved={true}
							onToggleSave={onToggleSave}
							onRate={onRate}
						/>
					))
				)}
			</div>
		</div>
	);
}
