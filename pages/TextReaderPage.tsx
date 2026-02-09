import React, { useState, useEffect } from 'react';
import { PlayCircle, StopCircle, Trash2, Headphones, Type } from 'lucide-react';

export default function TextReaderPage() {
	const [text, setText] = useState('');
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		return () => {
			window.speechSynthesis.cancel();
		};
	}, []);

	const handleToggleSpeech = () => {
		if (isPlaying) {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		} else {
			if (!text.trim()) return;

			window.speechSynthesis.cancel(); // Safety clear

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			utterance.lang = "en-US";

			utterance.onend = () => setIsPlaying(false);
			utterance.onerror = () => setIsPlaying(false);

			window.speechSynthesis.speak(utterance);
			setIsPlaying(true);
		}
	};

	const handleClear = () => {
		window.speechSynthesis.cancel();
		setIsPlaying(false);
		setText('');
	};

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="bg-white rounded-3xl border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
				{/* Header Section */}
				<div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-charcoal text-white rounded-2xl flex items-center justify-center shadow-lg shadow-charcoal/10">
							<Headphones className="w-6 h-6 text-black" />
						</div>
						<div>
							<h1 className="text-2xl font-display font-bold text-charcoal tracking-tight">
								Article Reader
							</h1>
							<p className="text-stone-500 text-sm font-medium">
								Paste any text to listen to it aloud
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{text && (
							<button
								onClick={handleClear}
								className="flex items-center gap-2 px-4 py-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 text-sm font-bold uppercase tracking-widest"
							>
								<Trash2 className="w-4 h-4" />
								Clear
							</button>
						)}

						<button
							onClick={handleToggleSpeech}
							disabled={!text.trim()}
							className={`relative overflow-hidden text-black transition-all duration-500 active:scale-95 rounded-full border shadow-md flex items-center gap-3 px-6 py-2.5 font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying
								? 'bg-amber-500 text-white border-amber-400'
								: 'bg-charcoal text-white border-charcoal hover:bg-black'
								}`}
						>
							{isPlaying ? (
								<>
									<StopCircle className="w-4 h-4" />
									<span>Stop Reading</span>
									<div className="flex items-end gap-0.5 h-3 overflow-hidden ml-1">
										<div className="w-0.5 bg-white/60 animate-[bounce_1s_infinite_0ms]" style={{ height: '60%' }} />
										<div className="w-0.5 bg-white animate-[bounce_1s_infinite_200ms]" style={{ height: '100%' }} />
										<div className="w-0.5 bg-white/60 animate-[bounce_1s_infinite_400ms]" style={{ height: '40%' }} />
									</div>
								</>
							) : (
								<>
									<PlayCircle className="w-4 h-4" />
									<span>Read Aloud</span>
								</>
							)}
						</button>
					</div>
				</div>

				{/* Input Section */}
				<div className="p-1">
					<div className="relative group">
						<div className="absolute top-6 left-6 text-stone-300 pointer-events-none group-focus-within:text-stone-400 transition-colors">
							<Type className="w-5 h-5" />
						</div>
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Paste your article or any text here..."
							className="w-full min-h-[400px] p-8 pl-14 bg-transparent outline-none font-sans text-stone-700 text-lg leading-relaxed placeholder:text-stone-300 resize-none transition-all"
						/>
					</div>
				</div>

				{/* Footer Info */}
				<div className="px-8 py-4 border-t border-stone-100 bg-stone-50/30 flex justify-between items-center">
					<span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
						{text.length} characters
					</span>
					<span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
						{text.split(/\s+/).filter(Boolean).length} words
					</span>
				</div>
			</div>

			<div className="mt-8 p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
				<div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
					<PlayCircle className="w-4 h-4" />
				</div>
				<div>
					<h4 className="text-amber-900 font-bold text-sm uppercase tracking-wide mb-1">How it works</h4>
					<p className="text-amber-800/80 text-sm leading-relaxed">
						This reader uses your browser's native intelligence to synthesize speech. For the best experience,
						ensure your system volume is up and you're using a modern browser like Chrome or Safari.
					</p>
				</div>
			</div>
		</div>
	);
}
