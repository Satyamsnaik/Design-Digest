import React, { useState } from 'react';
import { Search, ArrowRight, Link, Video, FileText } from 'lucide-react';

interface UrlAnalyzerProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <div className="bg-stone-100 text-stone-800 rounded-2xl shadow-sm border border-stone-200 max-w-4xl mx-auto overflow-hidden transition-transform hover:scale-[1.002] duration-500">
      <div className="p-8 md:p-12 relative">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3 text-stone-500 text-xs font-bold tracking-widest uppercase">
              <Link className="w-3 h-3" />
              <span>Deep Dive Analysis</span>
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3 leading-tight">
              Analyze any resource
            </h3>
            <p className="text-stone-600 text-base leading-relaxed max-w-lg">
              Found a long article or video? Paste the link below to extract key mental models, summary, and actionable tips instantly.
            </p>
          </div>
          
          {/* Visual indicators of supported content */}
          <div className="flex -space-x-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105">
             <div className="w-12 h-12 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center z-10 shadow-sm">
                <FileText className="w-5 h-5 text-stone-600" />
             </div>
             <div className="w-12 h-12 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center z-20 shadow-sm">
                <Video className="w-5 h-5 text-stone-600" />
             </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="relative group z-10">
          <div className="relative flex items-center">
            <div className="absolute left-6 text-stone-400 group-focus-within:text-stone-600 transition-colors duration-300">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="url"
              placeholder="Paste a URL from Medium, YouTube, NNGroup..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              className="w-full pl-16 pr-24 py-5 bg-white border border-stone-300 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all duration-300 shadow-sm font-sans text-base"
            />
            <button
              type="submit"
              disabled={isLoading || !url}
              className="absolute right-3 top-3 bottom-3 aspect-square flex items-center justify-center bg-charcoal text-white rounded-xl hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UrlAnalyzer;