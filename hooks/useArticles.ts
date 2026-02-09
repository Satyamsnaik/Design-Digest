import { useState, useEffect } from 'react';
import { Article } from '../types';

/**
 * Custom hook for managing articles state
 * Handles saved, liked, and disliked articles with localStorage persistence
 */
export const useArticles = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [savedArticles, setSavedArticles] = useState<Article[]>([]);
	const [likedArticles, setLikedArticles] = useState<Article[]>([]);
	const [dislikedArticles, setDislikedArticles] = useState<Article[]>([]);

	// Load from localStorage on mount
	useEffect(() => {
		try {
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

	// Persist to localStorage whenever state changes
	useEffect(() => {
		localStorage.setItem('ddd_saved', JSON.stringify(savedArticles));
		localStorage.setItem('ddd_liked', JSON.stringify(likedArticles));
		localStorage.setItem('ddd_disliked', JSON.stringify(dislikedArticles));
	}, [savedArticles, likedArticles, dislikedArticles]);

	const toggleSave = (article: Article) => {
		setSavedArticles(prev => prev.some(a => a.url === article.url)
			? prev.filter(a => a.url !== article.url)
			: [article, ...prev]
		);
	};

	const rateArticle = (article: Article, rating: 'up' | 'down' | null) => {
		setLikedArticles(prev => prev.filter(a => a.url !== article.url));
		setDislikedArticles(prev => prev.filter(a => a.url !== article.url));
		if (rating === 'up') setLikedArticles(prev => [article, ...prev]);
		else if (rating === 'down') setDislikedArticles(prev => [article, ...prev]);
	};

	return {
		articles,
		setArticles,
		savedArticles,
		likedArticles,
		dislikedArticles,
		toggleSave,
		rateArticle,
	};
};
