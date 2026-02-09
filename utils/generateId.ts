/**
 * Generate a unique ID for digest history items
 * Uses crypto.randomUUID if available, falls back to timestamp + random
 */
export const generateId = (): string => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
