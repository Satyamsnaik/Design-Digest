
import React, { useState, useRef } from 'react';
import { Search, ArrowRight, Link, Video, FileText, X, Loader2 } from 'lucide-react';

interface UrlAnalyzerProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUrl('');
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const isValidUrl = url.trim().length > 3;

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 relative z-10">
      
      {/* Context Label */}
      <div className="flex items-center justify-center gap-2 mb-4 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
         <div className="h-px w-8 bg-stone-300"></div>
         <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Deep Dive Analysis</span>
         <div className="h-px w-8 bg-stone-300"></div>
      </div>

      <div 
        className={`
            relative group transition-all duration-500 ease-out transform
            ${isFocused ? 'scale-[1.01]' : 'hover:scale-[1.005]'}
        `}
        onClick={handleContainerClick}
      >
        {/* Glow Effect */}
        <div className={`
            absolute -inset-0.5 bg-gradient-to-r from-stone-200 via-charcoal/5 to-stone-200 rounded-[2rem] blur opacity-0 transition-opacity duration-500
            ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}
        `}></div>

        <div className="relative bg-white rounded-[1.8rem] shadow-xl border border-stone-100 overflow-hidden">
            <div className="flex flex-col md:flex-row p-3 md:p-4 gap-3 md:gap-4 items-stretch">
                
                {/* Reactive Icon Box */}
                <div className={`
                    hidden md:flex flex-shrink-0 items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500
                    ${isFocused || url.length > 0 
                        ? 'bg-charcoal text-white rotate-0 shadow-lg' 
                        : 'bg-stone-50 text-stone-300 -rotate-3 scale-95'
                    }
                `}>
                    {isLoading ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                    ) : url.length > 0 ? (
                        <Link className="w-7 h-7" />
                    ) : (
                        <Search className="w-7 h-7" />
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-grow flex flex-col justify-center relative min-h-[4rem] px-2">
                     <form onSubmit={handleSubmit} className="w-full">
                         <div className="relative h-10 flex items-center">
                            {/* Floating Label */}
                            <div className={`
                                absolute left-0 pointer-events-none transition-all duration-300 ease-out origin-left
                                ${isFocused || url.length > 0
                                    ? '-top-3 text-[9px] font-bold tracking-widest uppercase text-stone-400' 
                                    : 'top-1/2 -translate-y-1/2 text-lg text-stone-400 font-medium'
                                }
                            `}>
                                {isFocused || url.length > 0 ? 'Target URL' : 'Paste article or video link...'}
                            </div>

                            <input
                                ref={inputRef}
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                disabled={isLoading}
                                className="w-full bg-transparent border-none p-0 text-xl md:text-2xl font-sans font-medium text-charcoal placeholder-transparent focus:ring-0 focus:outline-none"
                                autoComplete="off"
                            />
                         </div>
                     </form>
                     
                     {/* Supported Types Indicators */}
                     <div className={`
                        flex items-center gap-3 mt-1 overflow-hidden transition-all duration-300
                        ${isFocused || url.length === 0 ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'}
                     `}>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                             <FileText className="w-3 h-3" /> Articles
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                             <Video className="w-3 h-3" /> YouTube
                        </div>
                     </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 mt-2 md:mt-0 justify-end">
                    
                    {/* Clear Button */}
                    <div className={`transition-all duration-300 ${url.length > 0 && !isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-75 w-0 overflow-hidden'}`}>
                         <button 
                            onClick={handleClear}
                            className="p-3 rounded-full hover:bg-stone-100 text-stone-300 hover:text-stone-500 transition-colors"
                            type="button"
                            title="Clear"
                         >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Analyze Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !isValidUrl}
                        className={`
                            relative group/btn flex items-center justify-center h-14 md:h-16 rounded-2xl font-bold tracking-wide transition-all duration-500 ease-out shadow-sm overflow-hidden
                            ${isValidUrl 
                                ? 'bg-charcoal text-white hover:shadow-xl hover:scale-105 px-8 w-full md:w-auto' 
                                : 'bg-stone-100 text-stone-300 px-4 w-full md:w-16 cursor-not-allowed'
                            }
                        `}
                    >
                        {isLoading ? (
                             <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isValidUrl ? (
                            <div className="flex items-center gap-2">
                                <span>Analyze</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        ) : (
                            <ArrowRight className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UrlAnalyzer;
