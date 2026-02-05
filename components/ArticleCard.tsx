
import React, { useState, useEffect } from 'react';
import { ExternalLink, Lightbulb, Zap, BookOpen, PlayCircle, StopCircle, Bookmark, ThumbsUp, ThumbsDown, Twitter, Check, Calendar } from 'lucide-react';
import { Article } from '../types.ts';

interface ArticleCardProps {
	article: Article;
	isSaved?: boolean;
	rating?: 'up' | 'down' | null;
	onToggleSave?: (article: Article) => void;
	onRate?: (article: Article, rating: 'up' | 'down' | null) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
	article,
	isSaved = false,
	rating = null,
	onToggleSave,
	onRate
}) => {
	const [copied, setCopied] = useState(false);
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
			window.speechSynthesis.cancel(); // Safety clear

			const insightsText = article.insights.length > 0
				? `. Core Insights. ${article.insights.join('. ')}`
				: '';
			const tipsText = article.application_tips.length > 0
				? `. Action Plan. ${article.application_tips.join('. ')}`
				: '';

			const textToRead = `${article.title}. Summary. ${article.summary.join(' ')}${insightsText}${tipsText}`;

			const utterance = new SpeechSynthesisUtterance(textToRead);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			utterance.lang = "en-US";

			utterance.onend = () => setIsPlaying(false);
			utterance.onerror = () => setIsPlaying(false);

			window.speechSynthesis.speak(utterance);
			setIsPlaying(true);
		}
	};

	const handleCopyTweet = () => {
		// Tweet body only, no URL appending as per request
		const tweetBody = article.tweet_draft || `${article.title} by ${article.author}`;

		navigator.clipboard.writeText(tweetBody).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}).catch(err => {
			console.error("Failed to copy tweet", err);
		});
	};

	return (
		<article className="group bg-[#FEFBF6] border border-stone-200/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-stone-300 hover:-translate-y-1 flex flex-col h-full relative">
			{/* Header - Compact & High Contrast */}
			<div className="p-5 md:p-6 pb-2">
				<div className="flex justify-between items-start mb-3">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-stone-900 text-white border border-stone-900 uppercase tracking-widest shadow-sm">
							{article.category}
						</span>
						{article.date && (
							<span className="inline-flex items-center text-[10px] text-stone-400 font-semibold tracking-wide ml-1">
								<Calendar className="w-3 h-3 mr-1 opacity-50" />
								{article.date}
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<div className="p-1.5 bg-white border border-stone-100 rounded-full shadow-sm flex-shrink-0">
							{article.type === 'Video' ? (
								<PlayCircle className="w-4 h-4 text-stone-400 group-hover:text-charcoal transition-colors" />
							) : (
								<BookOpen className="w-4 h-4 text-stone-400 group-hover:text-charcoal transition-colors" />
							)}
						</div>

						<button
							onClick={handleToggleSpeech}
							className={`relative group/play overflow-hidden transition-all duration-500 active:scale-90 rounded-full border shadow-sm ${isPlaying
								? 'bg-amber-500 text-white border-amber-400 p-2 pr-4 pl-3'
								: 'bg-white text-stone-400 border-stone-100 hover:text-charcoal p-1.5'
								}`}
							title={isPlaying ? "Stop reading" : "Read summary"}
						>
							<div className="flex items-center gap-2">
								{isPlaying ? (
									<>
										<StopCircle className="w-4 h-4" />
										<div className="flex items-end gap-0.5 h-3 overflow-hidden">
											<div className="w-0.5 bg-white/60 animate-[bounce_1s_infinite_0ms]" style={{ height: '60%' }} />
											<div className="w-0.5 bg-white animate-[bounce_1s_infinite_200ms]" style={{ height: '100%' }} />
											<div className="w-0.5 bg-white/60 animate-[bounce_1s_infinite_400ms]" style={{ height: '40%' }} />
											<div className="w-0.5 bg-white animate-[bounce_1s_infinite_100ms]" style={{ height: '80%' }} />
										</div>
									</>
								) : (
									<PlayCircle className="w-4 h-4" />
								)}
							</div>
						</button>
					</div>
				</div>

				<h2 className="font-sans text-xl md:text-2xl font-bold leading-tight text-charcoal mb-3 group-hover:text-black transition-colors text-balance">
					<a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-stone-300 underline-offset-[6px] decoration-2">
						{article.title}
					</a>
				</h2>

				<div className="flex items-center text-xs text-stone-500 font-medium mt-3 pt-3 border-t border-stone-200/50">
					<span className="text-stone-800 mr-2 uppercase tracking-wider text-[10px]">{article.author}</span>
					<span className="mr-2 text-stone-300">•</span>
					<span className="font-sans truncate">{article.source}</span>
				</div>
			</div>

			{/* Summary - Integrated */}
			<div className="px-5 pb-5 md:px-6 md:pb-6 flex-grow">
				<div className="space-y-2">
					{article.summary.map((paragraph, idx) => (
						<p key={idx} className="text-stone-600 leading-relaxed font-sans text-sm">
							{paragraph}
						</p>
					))}
				</div>
			</div>

			{/* Insights & Tips Grid - Compacted */}
			<div className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200/60 bg-white/50">
				{/* Insights Section */}
				<div className="p-4 md:p-5 border-b md:border-b-0 md:border-r border-stone-200/60">
					<div className="flex items-center mb-3 text-amber-700 font-extrabold uppercase tracking-widest text-[10px]">
						<Lightbulb className="w-3.5 h-3.5 mr-2 text-amber-500 fill-amber-500/20" />
						Core Insights
					</div>
					<ul className="space-y-3">
						{article.insights.map((insight, idx) => (
							<li key={idx} className="flex items-start text-stone-700 text-sm leading-relaxed">
								<span className="mr-2 mt-1.5 w-1 h-1 bg-amber-400 rounded-full flex-shrink-0" />
								<span>{insight}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Action Plan Section */}
				<div className="p-4 md:p-5">
					<div className="flex items-center mb-3 text-charcoal font-extrabold uppercase tracking-widest text-[10px]">
						<Zap className="w-3.5 h-3.5 mr-2 text-stone-400 fill-stone-200" />
						Action Plan
					</div>
					<ul className="space-y-3">
						{article.application_tips.map((tip, idx) => (
							<li key={idx} className="flex items-start text-stone-600 text-sm leading-relaxed">
								<span className="mr-2 mt-1.5 w-1 h-1 bg-stone-300 rounded-full flex-shrink-0" />
								<span>{tip}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Footer */}
			{(onToggleSave || onRate) && (
				<div className="px-4 py-3 md:px-5 md:py-3 border-t border-stone-200/60 bg-white/60 flex justify-between items-center text-stone-400 backdrop-blur-sm">
					<div className="flex space-x-2 items-center">
						{onRate && (
							<>
								<button
									onClick={() => onRate(article, rating === 'up' ? null : 'up')}
									className={`p-1.5 rounded-full transition-all duration-300 active:scale-90 ${rating === 'up' ? 'text-green-600 bg-green-50 scale-110 shadow-sm ring-1 ring-green-100' : 'hover:bg-stone-100 hover:text-stone-600'}`}
									title="More like this"
								>
									<ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'fill-current' : ''}`} />
								</button>
								<button
									onClick={() => onRate(article, rating === 'down' ? null : 'down')}
									className={`p-1.5 rounded-full transition-all duration-300 active:scale-90 ${rating === 'down' ? 'text-red-600 bg-red-50 scale-110 shadow-sm ring-1 ring-red-100' : 'hover:bg-stone-100 hover:text-stone-600'}`}
									title="Less like this"
								>
									<ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'fill-current' : ''}`} />
								</button>
							</>
						)}
					</div>

					<div className="flex items-center space-x-2 md:space-x-3">
						{article.tweet_draft && (
							<button
								onClick={handleCopyTweet}
								className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 active:scale-95 border ${copied ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-stone-400 border-transparent hover:text-blue-500 hover:bg-blue-50/50 hover:border-blue-100'}`}
								title="Copy Tweet to Clipboard"
							>
								{copied ? <Check className="w-3 h-3" /> : <Twitter className="w-3 h-3" />}
								<span className="uppercase hidden sm:inline">{copied ? 'Copied' : 'Tweet'}</span>
							</button>
						)}

						{onToggleSave && (
							<button
								onClick={() => onToggleSave(article)}
								className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 active:scale-95 border ${isSaved ? 'text-charcoal bg-stone-100 border-stone-200 shadow-sm' : 'text-stone-500 border-transparent hover:bg-stone-100 hover:text-stone-900'}`}
								title={isSaved ? "Remove from saved" : "Save for later"}
							>
								<Bookmark className={`w-3 h-3 transition-all ${isSaved ? 'fill-current' : ''}`} />
								<span className="uppercase hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
							</button>
						)}
					</div>
				</div>
			)}
		</article >
	);
};

export default ArticleCard;
