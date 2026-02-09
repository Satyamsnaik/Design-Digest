import { useState, useEffect, useMemo } from 'react';
import { Article, DigestHistoryItem } from '../types';

/**
 * Custom hook for search functionality
 * Provides search query state and filtering functions for articles and history
 */
export const useSearch = () => {
	const [searchQuery, setSearchQuery] = useState('');

	const filterArticles = (articles: Article[]): Article[] => {
		if (!searchQuery) return articles;
		const lower = searchQuery.toLowerCase();
		return articles.filter(a =>
			a.title.toLowerCase().includes(lower) ||
			a.summary.some(s => s.toLowerCase().includes(lower)) ||
			a.category.toLowerCase().includes(lower)
		);
	};

	const filterHistory = (history: DigestHistoryItem[]): DigestHistoryItem[] => {
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

	const clearSearch = () => {
		setSearchQuery('');
	};

	return {
		searchQuery,
		setSearchQuery,
		filterArticles,
		filterHistory,
		clearSearch,
	};
};
