import { useState, useEffect } from 'react';
import { DigestHistoryItem } from '../types';

/**
 * Custom hook for managing digest history
 * Handles persistence with localStorage and limits to 50 items
 */
export const useHistory = () => {
	const [history, setHistory] = useState<DigestHistoryItem[]>([]);

	// Load from localStorage on mount
	useEffect(() => {
		try {
			const h = localStorage.getItem('ddd_history');
			if (h) setHistory(JSON.parse(h));
		} catch (e) {
			console.error("Storage error:", e);
		}
	}, []);

	// Persist to localStorage whenever history changes
	useEffect(() => {
		localStorage.setItem('ddd_history', JSON.stringify(history));
	}, [history]);

	const addHistoryItem = (item: DigestHistoryItem) => {
		// Limit history to last 50 items to prevent storage overflow
		setHistory(prev => [item, ...prev].slice(0, 50));
	};

	return {
		history,
		addHistoryItem,
	};
};
