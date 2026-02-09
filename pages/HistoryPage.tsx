import React from 'react';
import { DigestHistoryItem } from '../types';
import SearchBar from '../components/layout/SearchBar';
import { Link, Tag, ChevronRight, Filter } from 'lucide-react';

interface HistoryPageProps {
	history: DigestHistoryItem[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onSelectHistory: (item: DigestHistoryItem) => void;
	totalCount: number;
}

export default function HistoryPage({
	history,
	searchQuery,
	onSearchChange,
	onSelectHistory,
	totalCount
}: HistoryPageProps) {
	return (
		<div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
			<SearchBar
				placeholder="Search history..."
				value={searchQuery}
				onChange={onSearchChange}
			/>

			<div className="space-y-4 md:space-y-6 pb-20">
				{history.length === 0 ? (
					<p className="text-center py-20 text-stone-400">
						{totalCount === 0 ? "History is empty." : "No matching history found."}
					</p>
				) : (
					history.map(item => (
						<div
							key={item.id}
							onClick={() => onSelectHistory(item)}
							className="bg-white p-5 md:p-6 rounded-2xl border border-stone-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-stone-300 cursor-pointer transition-all group relative overflow-hidden"
						>
							{/* Hover Indicator Line */}
							<div className="absolute left-0 top-0 bottom-0 w-1 bg-charcoal transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

							<div className="flex justify-between items-start mb-3">
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
										{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
									</span>
									{item.type === 'feed' && (
										<span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-1 rounded-md border border-stone-200 uppercase tracking-widest flex items-center gap-1">
											<Filter className="w-3 h-3" />
											{item.config.level}
										</span>
									)}
								</div>
								<div className="p-2 bg-stone-50 rounded-full group-hover:bg-charcoal group-hover:text-white transition-colors">
									<ChevronRight className="w-4 h-4" />
								</div>
							</div>

							<h3 className="font-sans text-xl md:text-2xl font-bold text-charcoal mb-4 group-hover:text-black transition-colors leading-tight">
								{item.type === 'url' ? (
									<span className="flex items-center gap-2">
										<Link className="w-5 h-5 text-stone-400 flex-shrink-0" />
										{item.articles[0]?.title || "URL Analysis"}
									</span>
								) : (
									`${item.articles.length} Articles Briefing`
								)}
							</h3>

							{item.type === 'feed' && item.config.topics && (
								<div className="flex flex-wrap gap-2 mt-auto">
									{item.config.topics.map((topic, i) => (
										<span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
											<Tag className="w-3 h-3 mr-1 opacity-50" />
											{topic}
										</span>
									))}
								</div>
							)}

							{item.type === 'url' && (
								<div className="text-sm text-stone-500 line-clamp-1 font-sans">
									{item.articles[0]?.summary?.[0] || "No summary available."}
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
