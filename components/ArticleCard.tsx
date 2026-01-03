
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
    // We compose the final tweet text here. 
    // The AI generates the "content" (hook + insight), and we append the link securely.
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
    <article className="group bg-white hover:bg-white border border-stone-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 flex flex-col h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-stone-50">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-50 text-stone-500 border border-stone-100 uppercase tracking-widest">
            {article.category}
          </span>
          {article.type === 'Video' ? (
            <PlayCircle className="w-5 h-5 text-stone-300 group-hover:text-stone-400 transition-colors" />
          ) : (
            <BookOpen className="w-5 h-5 text-stone-300 group-hover:text-stone-400 transition-colors" />
          )}
        </div>
        
        <h2 className="font-serif text-2xl font-medium leading-snug text-charcoal mb-2 group-hover:text-black transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-stone-200 underline-offset-4 decoration-2">
            {article.title}
          </a>
        </h2>
        
        <div className="flex items-center text-xs text-stone-400 font-sans mt-3">
          <span className="font-semibold text-stone-600 mr-2">{article.author}</span>
          <span className="mr-2 text-stone-200">•</span>
          <span className="italic">{article.source}</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center text-stone-300 hover:text-stone-600 transition-colors group/link">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider">Source</span>
            <ExternalLink className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* Summary - Lighter, cleaner background */}
      <div className="px-6 py-5 bg-white flex-grow">
        <div className="space-y-3">
          {article.summary.map((paragraph, idx) => (
            <p key={idx} className="text-stone-600 leading-relaxed font-sans text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Insights & Tips Grid - Subtler tints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-100 border-t border-stone-100 text-xs">
        {/* Insights */}
        <div className="p-5 bg-amber-50/20">
          <div className="flex items-center mb-3 text-stone-800 font-bold uppercase tracking-widest text-[10px]">
            <Lightbulb className="w-3.5 h-3.5 mr-2 text-amber-500/80 fill-amber-500/20" />
            Insights
          </div>
          <ul className="space-y-2.5">
            {article.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-stone-600 leading-relaxed">
                <span className="mr-2.5 mt-1.5 w-1 h-1 bg-amber-300 rounded-full flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plan */}
        <div className="p-5 bg-stone-50/30">
          <div className="flex items-center mb-3 text-stone-800 font-bold uppercase tracking-widest text-[10px]">
            <Zap className="w-3.5 h-3.5 mr-2 text-stone-400 fill-stone-200" />
            Action Plan
          </div>
          <ul className="space-y-2.5">
            {article.application_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start text-stone-600 leading-relaxed">
                <span className="mr-2.5 mt-1.5 w-1 h-1 bg-stone-300 rounded-full flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      {(onToggleSave || onRate) && (
        <div className="px-5 py-3 border-t border-stone-50 bg-white flex justify-between items-center text-stone-400">
          <div className="flex space-x-1">
            {onRate && (
              <>
                <button 
                  onClick={() => onRate(article, rating === 'up' ? null : 'up')}
                  className={`p-1.5 rounded-full transition-all duration-200 active:scale-75 ${rating === 'up' ? 'text-green-600 bg-green-50 shadow-inner scale-105' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="More like this"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={() => onRate(article, rating === 'down' ? null : 'down')}
                  className={`p-1.5 rounded-full transition-all duration-200 active:scale-75 ${rating === 'down' ? 'text-red-600 bg-red-50 shadow-inner scale-105' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="Less like this"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
             {article.tweet_draft && (
                <button
                    onClick={handleCopyTweet}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-200 active:scale-90 ${copied ? 'text-blue-600 bg-blue-50' : 'text-stone-400 hover:text-blue-500 hover:bg-stone-50'}`}
                    title="Copy Tweet to Clipboard"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Twitter className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Tweet'}</span>
                </button>
             )}
          
            {onToggleSave && (
                <button 
                onClick={() => onToggleSave(article)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-200 active:scale-90 ${isSaved ? 'text-charcoal bg-stone-100 shadow-inner' : 'hover:bg-stone-50 hover:text-stone-900'}`}
                title={isSaved ? "Remove from saved" : "Save for later"}
                >
                <Bookmark className={`w-3.5 h-3.5 transition-all ${isSaved ? 'fill-current scale-110' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticleCard;
