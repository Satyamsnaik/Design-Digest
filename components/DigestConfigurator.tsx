import React from 'react';
import { DigestConfig, ExperienceLevel, Topic } from '../types';
import { AVAILABLE_TOPICS } from '../constants';
import { Sparkles, Layers, RefreshCw, Check } from 'lucide-react';

interface DigestConfiguratorProps {
  config: DigestConfig;
  setConfig: React.Dispatch<React.SetStateAction<DigestConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const DigestConfigurator: React.FC<DigestConfiguratorProps> = ({ config, setConfig, onGenerate, isLoading }) => {
  
  const toggleTopic = (topic: Topic) => {
    setConfig(prev => {
      // If selecting Random, clear others. If selecting others, clear Random.
      if (topic === 'Random/Surprise Me') {
        return { ...prev, topics: ['Random/Surprise Me'] };
      }
      
      const newTopics = prev.topics.filter(t => t !== 'Random/Surprise Me');
      if (prev.topics.includes(topic)) {
        return { ...prev, topics: newTopics.filter(t => t !== topic) };
      } else {
        return { ...prev, topics: [...newTopics, topic] };
      }
    });
  };

  const handleLevelChange = (level: ExperienceLevel) => {
    setConfig(prev => ({ ...prev, level }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto mb-12 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
        
        {/* Experience Level */}
        <div className="flex-shrink-0 md:w-1/3 space-y-4">
          <label className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Layers className="w-3 h-3 mr-2" />
            Curatorial Depth
          </label>
          <div className="flex flex-col gap-3">
            {(['Beginner-Mid', 'Mid-Senior'] as ExperienceLevel[]).map((level) => {
              const isSelected = config.level === level;
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`
                    relative px-5 py-4 text-left rounded-xl text-sm font-medium transition-all duration-200 ease-out border
                    ${isSelected 
                      ? 'bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200 transform scale-[1.02]' 
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-lg tracking-tight block mb-0.5">
                      {level === 'Beginner-Mid' ? 'Foundations' : 'Strategic'}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-200" />}
                  </div>
                  <span className={`text-xs ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                    {level === 'Beginner-Mid' ? 'Best for Junior to Mid-level' : 'Best for Senior & Leads'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="flex-grow space-y-4">
          <label className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 mr-2" />
            Editorial Focus
          </label>
          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = config.topics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 active:scale-95
                    ${isSelected
                      ? 'bg-stone-800 border-stone-800 text-white shadow-md'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {topic}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 italic mt-2 pl-1">
            * Select multiple topics or choose "Surprise Me" for an AI-curated mix.
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-end pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || config.topics.length === 0}
          className={`
            group relative flex items-center px-8 py-4 rounded-full font-serif font-bold text-lg shadow-xl transition-all duration-300
            ${isLoading 
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed translate-y-0 shadow-none' 
              : 'bg-charcoal text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
              Synthesizing Briefing...
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