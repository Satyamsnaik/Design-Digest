import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing API key state
 * Handles key validation, modal display, and sessionStorage persistence
 */
export const useApiKey = () => {
	const [showKeyModal, setShowKeyModal] = useState(false);
	const [isKeyMissing, setIsKeyMissing] = useState(false);

	// Check for API key on mount
	useEffect(() => {
		const sessionKey = sessionStorage.getItem("GEMINI_API_KEY");
		if (!sessionKey) {
			setIsKeyMissing(true);
		}
	}, []);

	const saveKey = (key: string) => {
		sessionStorage.setItem("GEMINI_API_KEY", key);
		setIsKeyMissing(false);
		setShowKeyModal(false);
		toast.success("API Key saved for this session.");
	};

	const openKeyModal = () => {
		setShowKeyModal(true);
	};

	const closeKeyModal = () => {
		setShowKeyModal(false);
	};

	return {
		showKeyModal,
		isKeyMissing,
		saveKey,
		openKeyModal,
		closeKeyModal,
	};
};
