import React from 'react';
import { DigestConfig, ExperienceLevel, Topic, DateRange } from '../types.ts';
import { AVAILABLE_TOPICS } from '../constants.ts';
import { RefreshCw, Clock, Signal, Layers } from 'lucide-react';

interface DigestConfiguratorProps {
	config: DigestConfig;
	setConfig: React.Dispatch<React.SetStateAction<DigestConfig>>;
	onGenerate: () => void;
	isLoading: boolean;
}

const DigestConfigurator: React.FC<DigestConfiguratorProps> = ({ config, setConfig, onGenerate, isLoading }) => {

	const toggleTopic = (topic: Topic) => {
		setConfig(prev => {
			// If selecting Random, clear others and just set Random
			if (topic === 'Random/Surprise Me') {
				return { ...prev, topics: ['Random/Surprise Me'] };
			}

			// Filter out Random from the existing list (since we are interacting with specific topics)
			const currentTopicsWithoutRandom = prev.topics.filter(t => t !== 'Random/Surprise Me');

			if (prev.topics.includes(topic)) {
				// We are deselecting a topic
				const remaining = currentTopicsWithoutRandom.filter(t => t !== topic);

				// If nothing is left, default back to Random/Surprise Me
				if (remaining.length === 0) {
					return { ...prev, topics: ['Random/Surprise Me'] };
				}

				return { ...prev, topics: remaining };
			} else {
				// We are adding a topic
				return { ...prev, topics: [...currentTopicsWithoutRandom, topic] };
			}
		});
	};

	const handleLevelChange = (level: ExperienceLevel) => {
		setConfig(prev => ({ ...prev, level }));
	};

	const handleDateRangeChange = (dateRange: DateRange) => {
		setConfig(prev => ({ ...prev, dateRange }));
	};

	const dateRanges: DateRange[] = ['Last 24 Hours', 'Last Week', 'Last Month', 'Last 6 Months', 'Any Time'];

	const levels: { id: ExperienceLevel; title: string; subtitle: string }[] = [
		{ id: 'Junior', title: 'Junior', subtitle: 'Foundations & Concepts' },
		{ id: 'Mid-Level', title: 'Mid-Level', subtitle: 'Execution & Strategy' },
		{ id: 'Senior', title: 'Senior', subtitle: 'Systems & Leadership' },
	];

	const displayTopics = AVAILABLE_TOPICS;

	return (
		<div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-stone-100 max-w-xl mx-auto mb-12 relative overflow-hidden">

			<div className="space-y-8">

				{/* Experience Level Section - Tab Style */}
				<div>
					<div className="flex items-center text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-3">
						<Signal className="w-3 h-3 mr-1.5" />
						Experience Level
					</div>

					<div className="bg-stone-100/70 p-1.5 rounded-2xl flex relative">
						{levels.map((lvl) => {
							const isSelected = config.level === lvl.id;
							return (
								<button
									key={lvl.id}
									onClick={() => handleLevelChange(lvl.id)}
									className={`
                    flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 relative z-10
                    ${isSelected
											? 'bg-white text-charcoal shadow-sm ring-1 ring-black/5'
											: 'text-stone-400 hover:text-stone-600'
										}
                  `}
								>
									{lvl.title}
								</button>
							);
						})}
					</div>

					{/* Subtle Subtitle Display */}
					<div className="mt-2 px-1 text-center h-4">
						<p className="text-[10px] text-stone-400 font-medium animate-in fade-in duration-300">
							{levels.find(l => l.id === config.level)?.subtitle}
						</p>
					</div>
				</div>

				{/* Topics Section - Lighter Pills */}
				<div>
					<div className="flex items-center text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-3">
						<Layers className="w-3 h-3 mr-1.5" />
						Topics
					</div>

					<div className="flex flex-wrap gap-2 justify-center md:justify-start">
						{displayTopics.map((topic) => {
							const isSelected = config.topics.includes(topic);
							return (
								<button
									key={topic}
									onClick={() => toggleTopic(topic)}
									className={`
                      px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 border
                      ${isSelected
											? 'bg-stone-100 border-stone-200 text-charcoal'
											: 'bg-white border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50'
										}
                    `}
								>
									{topic}
								</button>
							);
						})}
					</div>
				</div>

				{/* Timeframe Section - Lighter Pills */}
				<div>
					<div className="flex items-center text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-3">
						<Clock className="w-3 h-3 mr-1.5" />
						Timeframe
					</div>

					<div className="flex flex-wrap gap-2 justify-center md:justify-start">
						{dateRanges.map((range) => {
							const isSelected = config.dateRange === range;

							let label: string = range;
							if (range === 'Last 24 Hours') label = '24h';
							else if (range === 'Last Week') label = '1 Week';
							else if (range === 'Last Month') label = '1 Month';
							else if (range === 'Last 6 Months') label = '6 Months';
							else if (range === 'Any Time') label = 'All';

							return (
								<button
									key={range}
									onClick={() => handleDateRangeChange(range)}
									className={`
                      px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 border
                      ${isSelected
											? 'bg-stone-100 text-charcoal border-stone-200'
											: 'bg-white text-stone-400 border-transparent hover:text-stone-600 hover:bg-stone-50'
										}
                    `}
								>
									{label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Generate Button */}
				<div className="pt-2">
					<button
						onClick={onGenerate}
						disabled={isLoading || config.topics.length === 0}
						className={`
                w-full group relative flex items-center justify-center px-8 py-4 rounded-full font-sans font-bold text-lg transition-all duration-500 ease-out border border-transparent
                ${isLoading
								? 'bg-stone-100 text-stone-400 cursor-not-allowed'
								: 'bg-stone-900 text-white hover:bg-black hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] active:scale-[0.98]'
							}
                `}
					>
						{isLoading ? (
							<span className="flex items-center animate-pulse">
								Synthesizing...
							</span>
						) : (
							<span>Generate Briefing</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DigestConfigurator;