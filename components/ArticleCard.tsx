import React from 'react';
import { ExternalLink, Lightbulb, Zap, BookOpen, PlayCircle, Bookmark, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Article } from '../types';

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
  return (
    <article className="group bg-paper hover:bg-paper-hover border border-stone-200 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full relative">
      {/* Header */}
      <div className="p-8 border-b border-stone-100">
        <div className="flex justify-between items-start mb-5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 uppercase tracking-widest">
            {article.category}
          </span>
          {article.type === 'Video' ? (
            <PlayCircle className="w-6 h-6 text-stone-300 group-hover:text-stone-500 transition-colors" />
          ) : (
            <BookOpen className="w-6 h-6 text-stone-300 group-hover:text-stone-500 transition-colors" />
          )}
        </div>
        
        <h2 className="font-serif text-3xl font-medium leading-tight text-charcoal mb-3 group-hover:text-black transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-stone-300 underline-offset-4 decoration-2">
            {article.title}
          </a>
        </h2>
        
        <div className="flex items-center text-sm text-stone-500 font-sans mt-4">
          <span className="font-semibold text-stone-900 mr-2">{article.author}</span>
          <span className="mr-2 text-stone-300">•</span>
          <span className="italic">{article.source}</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center text-stone-400 hover:text-stone-900 transition-colors group/link">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider">Read Original</span>
            <ExternalLink className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="p-8 bg-cream/30 flex-grow">
        <div className="space-y-4">
          {article.summary.map((paragraph, idx) => (
            <p key={idx} className="text-stone-700 leading-relaxed font-sans text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Insights & Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 border-t border-stone-200 text-sm">
        {/* Insights */}
        <div className="p-6 bg-amber-50/40">
          <div className="flex items-center mb-4 text-stone-900 font-bold uppercase tracking-widest text-xs">
            <Lightbulb className="w-4 h-4 mr-2 text-amber-600 fill-amber-600" />
            Key Mental Models
          </div>
          <ul className="space-y-3">
            {article.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-stone-700 leading-relaxed">
                <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Tips */}
        <div className="p-6 bg-stone-50/60">
          <div className="flex items-center mb-4 text-stone-900 font-bold uppercase tracking-widest text-xs">
            <Zap className="w-4 h-4 mr-2 text-stone-600 fill-stone-600" />
            Actionable Application
          </div>
          <ul className="space-y-3">
            {article.application_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start text-stone-700 leading-relaxed">
                <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-stone-400 rounded-full flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      {(onToggleSave || onRate) && (
        <div className="px-6 py-4 border-t border-stone-200 bg-white flex justify-between items-center text-stone-400">
          <div className="flex space-x-2">
            {onRate && (
              <>
                <button 
                  onClick={() => onRate(article, rating === 'up' ? null : 'up')}
                  className={`p-2 rounded-full transition-all duration-200 active:scale-90 ${rating === 'up' ? 'text-green-600 bg-green-50 shadow-inner' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="More like this"
                >
                  <ThumbsUp className={`w-4 h-4 ${rating === 'up' ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={() => onRate(article, rating === 'down' ? null : 'down')}
                  className={`p-2 rounded-full transition-all duration-200 active:scale-90 ${rating === 'down' ? 'text-red-600 bg-red-50 shadow-inner' : 'hover:bg-stone-50 hover:text-stone-600'}`}
                  title="Less like this"
                >
                  <ThumbsDown className={`w-4 h-4 ${rating === 'down' ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>
          
          {onToggleSave && (
            <button 
              onClick={() => onToggleSave(article)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${isSaved ? 'text-charcoal bg-stone-100 shadow-inner' : 'hover:bg-stone-50 hover:text-stone-900'}`}
              title={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default ArticleCard;