
import React, { useState, useRef } from 'react';
import { Search, ArrowRight, Link, Video, X, Loader2, Sparkles, Youtube, Globe, FileSearch } from 'lucide-react';

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
    if (isValidUrl) {
      onAnalyze(url);
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  // Simple validation check
  const isValidUrl = url.trim().length > 3 && (url.includes('.') || url.includes('localhost'));
  
  // Detect if it's likely a video
  const isVideo = url.toLowerCase().includes('youtube') || url.toLowerCase().includes('vimeo') || url.toLowerCase().includes('youtu.be');
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-20 relative z-20 px-4 md:px-0">
      
      {/* Minimal Header */}
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-charcoal mb-2">Deep Dive</h3>
        <p className="text-sm text-stone-500 font-medium">Analyze any article or video URL for insights.</p>
      </div>

      {/* Minimal Input Form */}
      <form 
        onSubmit={handleSubmit}
        className={`
          relative flex items-center p-2 bg-white rounded-full border shadow-sm transition-all duration-300
          ${isFocused 
            ? 'border-charcoal ring-2 ring-stone-100 shadow-md transform scale-[1.01]' 
            : 'border-stone-200 hover:border-stone-300'
          }
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Leading Icon */}
        <div className="pl-4 pr-3 text-stone-400">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
            isVideo ? <Youtube className="w-5 h-5 text-red-600" /> : 
            <Link className="w-5 h-5" />
            }
        </div>

        {/* Main Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste URL..."
          className="flex-grow bg-transparent border-none outline-none text-base text-charcoal placeholder:text-stone-400 font-sans h-10 w-full"
          disabled={isLoading}
          autoComplete="off"
        />

        {/* Actions Right Side */}
        <div className="flex items-center gap-2 pr-1">
          {/* Clear Button */}
          {url.length > 0 && !isLoading && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }} 
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
          )}

          {/* Analyze Button */}
          <button
              type="submit"
              disabled={!isValidUrl || isLoading}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                ${isValidUrl && !isLoading
                  ? 'bg-charcoal text-white shadow-md hover:scale-110 active:scale-95'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }
              `}
          >
              <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default UrlAnalyzer;
