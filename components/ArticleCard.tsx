
import React, { useState } from 'react';
import { ExternalLink, Lightbulb, Zap, BookOpen, PlayCircle, Bookmark, ThumbsUp, ThumbsDown, Twitter, Check } from 'lucide-react';
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

  const handleCopyTweet = () => {
    const tweetBody = article.tweet_draft || `${article.title} by ${article.author}`;
    const textToCopy = `${tweetBody}\n\n${article.url}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy tweet", err);
    });
  };

  return (
    <article className="group bg-white border border-stone-200/60 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-stone-300 hover:-translate-y-1 flex flex-col h-full relative">
      {/* Header - High Contrast Editorial Style */}
      <div className="p-5 pb-4 md:p-8 md:pb-6 bg-gradient-to-b from-white to-stone-50/20">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 border border-stone-200 uppercase tracking-[0.2em]">
            {article.category}
          </span>
          <div className="p-2 bg-stone-50 rounded-full">
            {article.type === 'Video' ? (
                <PlayCircle className="w-4 h-4 text-stone-300 group-hover:text-charcoal transition-colors" />
            ) : (
                <BookOpen className="w-4 h-4 text-stone-300 group-hover:text-charcoal transition-colors" />
            )}
          </div>
        </div>
        
        <h2 className="font-serif text-2xl md:text-3xl font-medium leading-[1.15] text-charcoal mb-4 group-hover:text-black transition-colors text-balance">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-stone-200 underline-offset-[12px] decoration-1">
            {article.title}
          </a>
        </h2>
        
        <div className="flex items-center text-xs text-stone-400 font-sans mt-4 md:mt-6 border-t border-stone-100 pt-4 md:pt-5">
          <span className="font-bold text-stone-700 mr-2 uppercase tracking-widest text-[10px]">{article.author}</span>
          <span className="mr-2 text-stone-200">•</span>
          <span className="italic font-serif text-stone-500 truncate max-w-[120px] md:max-w-none">{article.source}</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center text-stone-400 hover:text-stone-900 transition-colors group/link px-3 py-1.5 rounded-full hover:bg-stone-50">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-widest">Read</span>
            <ExternalLink className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* Summary - Improved Typography Spacing */}
      <div className="px-5 py-5 md:px-8 md:py-6 bg-white flex-grow border-t border-stone-100">
        <div className="space-y-3 md:space-y-4">
          {article.summary.map((paragraph, idx) => (
            <p key={idx} className="text-stone-600 leading-relaxed font-sans text-sm md:text-[15px]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Insights & Tips Grid - Clearer Distinction */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-100 text-xs">
        {/* Insights Section */}
        <div className="p-5 md:p-7 bg-[#FEFBF6]"> 
          <div className="flex items-center mb-3 md:mb-5 text-amber-800 font-bold uppercase tracking-[0.15em] text-[10px]">
            <Lightbulb className="w-3.5 h-3.5 mr-2 text-amber-500 fill-amber-500/10" />
            Core Insights
          </div>
          <ul className="space-y-2.5 md:space-y-3.5">
            {article.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-stone-700 leading-relaxed">
                <span className="mr-3 mt-1.5 w-1 h-1 bg-amber-400 rounded-full flex-shrink-0 shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plan Section */}
        <div className="p-5 md:p-7 bg-stone-50/50 md:border-l border-t md:border-t-0 border-stone-100">
          <div className="flex items-center mb-3 md:mb-5 text-stone-800 font-bold uppercase tracking-[0.15em] text-[10px]">
            <Zap className="w-3.5 h-3.5 mr-2 text-stone-400 fill-stone-200" />
            Action Plan
          </div>
          <ul className="space-y-2.5 md:space-y-3.5">
            {article.application_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start text-stone-600 leading-relaxed">
                <span className="mr-3 mt-1.5 w-1 h-1 bg-stone-300 rounded-full flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer - Clean and Minimal */}
      {(onToggleSave || onRate) && (
        <div className="px-5 py-3 md:px-6 md:py-4 border-t border-stone-100 bg-white flex justify-between items-center text-stone-400">
          <div className="flex space-x-2">
            {onRate && (
              <>
                <button 
                  onClick={() => onRate(article, rating === 'up' ? null : 'up')}
                  className={`p-2 rounded-full transition-all duration-300 active:scale-90 ${rating === 'up' ? 'text-green-600 bg-green-50 scale-110 shadow-sm ring-1 ring-green-100' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="More like this"
                >
                  <ThumbsUp className={`w-4 h-4 ${rating === 'up' ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={() => onRate(article, rating === 'down' ? null : 'down')}
                  className={`p-2 rounded-full transition-all duration-300 active:scale-90 ${rating === 'down' ? 'text-red-600 bg-red-50 scale-110 shadow-sm ring-1 ring-red-100' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="Less like this"
                >
                  <ThumbsDown className={`w-4 h-4 ${rating === 'down' ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
             {article.tweet_draft && (
                <button
                    onClick={handleCopyTweet}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all duration-300 active:scale-95 border ${copied ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-stone-400 border-transparent hover:text-blue-500 hover:bg-blue-50/50 hover:border-blue-100'}`}
                    title="Copy Tweet to Clipboard"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Twitter className="w-3.5 h-3.5" />}
                    <span className="uppercase hidden sm:inline">{copied ? 'Copied' : 'Tweet'}</span>
                </button>
             )}
          
            {onToggleSave && (
                <button 
                onClick={() => onToggleSave(article)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all duration-300 active:scale-95 border ${isSaved ? 'text-charcoal bg-stone-100 border-stone-200 shadow-sm' : 'text-stone-500 border-transparent hover:bg-stone-100 hover:text-stone-900'}`}
                title={isSaved ? "Remove from saved" : "Save for later"}
                >
                <Bookmark className={`w-3.5 h-3.5 transition-all ${isSaved ? 'fill-current' : ''}`} />
                <span className="uppercase hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticleCard;
