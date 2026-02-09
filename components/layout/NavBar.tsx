import React from 'react';
import { Home, Bookmark, History, Settings, Headphones } from 'lucide-react';

interface NavBarProps {
	currentView: 'dashboard' | 'history' | 'result' | 'saved' | 'reader';
	onViewChange: (view: 'dashboard' | 'history' | 'result' | 'saved' | 'reader') => void;
	savedCount: number;
	isKeyMissing: boolean;
	onOpenApiKey: () => void;
	title?: string;
}

export default function NavBar({
	currentView,
	onViewChange,
	savedCount,
	isKeyMissing,
	onOpenApiKey,
	title
}: NavBarProps) {
	return (
		<nav className="fixed top-0 inset-x-0 z-50 px-4 py-4 md:py-6 pointer-events-none">
			<div className="max-w-6xl mx-auto flex items-center justify-between">

				{/* Left: Title for Saved/History */}
				<div className="pointer-events-auto min-w-[40px] min-h-[44px] flex items-center">
					{title && (
						<h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal tracking-tight capitalize animate-in fade-in slide-in-from-left-4 duration-500">
							{title}
						</h1>
					)}
				</div>

				{/* Right: Navigation Tabs - iOS Glassmorphism Style */}
				<div className="pointer-events-auto shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] bg-white/40 backdrop-blur-2xl p-1.5 rounded-full border border-white/50 flex gap-1 items-center transition-all duration-300 hover:bg-white/50">

					<button
						onClick={() => onViewChange('dashboard')}
						className={`p-2.5 rounded-full transition-all duration-300 ${currentView === 'dashboard'
							? 'bg-white/80 text-charcoal shadow-sm ring-1 ring-black/5'
							: 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
							}`}
						title="Home"
					>
						<Home className="w-5 h-5" />
					</button>
					<button
						onClick={() => onViewChange('reader')}
						className={`p-2.5 rounded-full transition-all duration-300 ${currentView === 'reader'
							? 'bg-white/80 text-charcoal shadow-sm ring-1 ring-black/5'
							: 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
							}`}
						title="Article Reader"
					>
						<Headphones className="w-5 h-5" />
					</button>
					<button
						onClick={() => onViewChange('saved')}
						className={`relative p-2.5 rounded-full transition-all duration-300 ${currentView === 'saved'
							? 'bg-amber-100/80 text-amber-900 shadow-sm ring-1 ring-amber-200'
							: 'text-stone-500 hover:text-amber-700 hover:bg-amber-50/50'
							}`}
						title="Saved Articles"
					>
						<Bookmark className={`w-5 h-5 ${currentView === 'saved' ? 'fill-current' : ''}`} />
						{savedCount > 0 && (
							<span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full ring-1 ring-white"></span>
						)}
					</button>
					<button
						onClick={() => onViewChange('history')}
						className={`p-2.5 rounded-full transition-all duration-300 ${currentView === 'history'
							? 'bg-white/80 text-charcoal shadow-sm ring-1 ring-black/5'
							: 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
							}`}
						title="History"
					>
						<History className="w-5 h-5" />
					</button>

					{/* Separator */}
					<div className="w-px h-4 bg-stone-300/30 mx-0.5"></div>

					{/* Settings Button */}
					<div className="relative group">
						<button
							onClick={onOpenApiKey}
							className={`p-2.5 rounded-full transition-all duration-300 ${isKeyMissing
								? 'text-amber-500 bg-amber-50/50 hover:bg-amber-100 animate-pulse'
								: 'text-stone-400 hover:text-charcoal hover:bg-white/40'
								}`}
							title="API Settings"
						>
							<Settings className="w-5 h-5" />
						</button>

						{isKeyMissing && (
							<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
								<div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg shadow-amber-200/50 animate-bounce">
									SETUP REQUIRED
									<div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-amber-500" />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

