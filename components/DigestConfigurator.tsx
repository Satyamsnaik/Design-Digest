
import React from 'react';
import { DigestConfig, ExperienceLevel, Topic, DateRange } from '../types.ts';
import { AVAILABLE_TOPICS } from '../constants.ts';
import { RefreshCw, Check, Clock } from 'lucide-react';

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
    { id: 'Junior', title: 'Junior', subtitle: 'Foundations & Core Concepts' },
    { id: 'Mid-Level', title: 'Mid-Level', subtitle: 'Execution & Detailed Analysis' },
    { id: 'Senior', title: 'Senior', subtitle: 'Strategy, Systems & Leadership' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm max-w-4xl mx-auto mb-12 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-12">
        
        {/* Left Column: Level & Time */}
        <div className="flex-shrink-0 md:w-1/3 space-y-6 md:space-y-8">
          
          {/* Experience Level */}
          <div className="space-y-3 md:space-y-4">
            {levels.map((lvl) => {
              const isSelected = config.level === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelChange(lvl.id)}
                  className={`
                    w-full relative px-3 py-2.5 md:px-4 md:py-3 text-left rounded-xl text-sm font-medium transition-all duration-200 ease-out border active:scale-[0.98]
                    ${isSelected 
                      ? 'bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200 transform scale-[1.02] ring-2 ring-offset-2 ring-stone-900' 
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-base tracking-tight block mb-0.5">
                      {lvl.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-200" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wide opacity-80 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {lvl.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeframe */}
          <div>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 pl-1">
              <Clock className="w-3 h-3 mr-1.5" />
              Timeframe
            </div>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map((range) => {
                const isSelected = config.dateRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => handleDateRangeChange(range)}
                    className={`
                      px-3 py-2 rounded-lg text-[11px] md:text-xs font-medium border transition-all duration-200 active:scale-95
                      ${isSelected
                        ? 'bg-stone-800 border-stone-800 text-white shadow-md ring-2 ring-offset-1 ring-stone-800'
                        : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 hover:bg-stone-50'
                      }
                    `}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Topics */}
        <div className="flex-grow space-y-4 border-t pt-6 md:pt-0 md:border-t-0 md:border-l border-stone-100 pl-0 md:pl-10">
           <div className="flex items-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 pl-1 md:hidden">
              Topics
            </div>
          <div className="flex flex-wrap gap-2 md:gap-2.5">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = config.topics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`
                    px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-xs md:text-sm font-medium border transition-all duration-200 active:scale-95
                    ${isSelected
                      ? 'bg-stone-800 border-stone-800 text-white shadow-md ring-2 ring-offset-1 ring-stone-800'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {topic}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 italic mt-4 pl-1 border-t border-dashed border-stone-200 pt-4 hidden md:block">
            Customize your digest by selecting topics. Deselecting all will default to Random.
          </p>
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex justify-end pt-2 md:pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || config.topics.length === 0}
          className={`
            w-full md:w-auto group relative flex items-center justify-center px-8 py-4 rounded-full font-serif font-bold text-lg shadow-xl transition-all duration-300
            ${isLoading 
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed translate-y-0 shadow-none' 
              : 'bg-charcoal text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl hover:shadow-charcoal/20 active:translate-y-0 active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
              Synthesizing...
            </span>
          ) : (
            <>
              <span className="relative z-10">Generate Briefing</span>
              <RefreshCw className="ml-3 w-5 h-5 transition-transform group-hover:rotate-180" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DigestConfigurator;
