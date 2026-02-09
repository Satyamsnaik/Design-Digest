import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
	return (
		<div className="mb-6 relative max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-4 w-4 text-stone-400" />
			</div>
			<input
				type="text"
				className="block w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 focus:border-stone-400 sm:text-sm transition-all"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{value && (
				<button
					onClick={() => onChange('')}
					className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-charcoal cursor-pointer"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
