import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DESIGN_QUOTES } from '../../constants';

export default function Footer() {
	const [quoteIndex, setQuoteIndex] = useState(() =>
		Math.floor(Math.random() * DESIGN_QUOTES.length)
	);

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

	return (
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
	);
}
