
export type ExperienceLevel = 'Beginner-Mid' | 'Mid-Senior';

export type DateRange = 'Last 24 Hours' | 'Last Week' | 'Last Month' | 'Last 6 Months' | 'Any Time';

export type Topic = 
  | 'Product Thinking' 
  | 'AI in UX' 
  | 'Visual Design' 
  | 'Strategy' 
  | 'Design Systems' 
  | 'Research' 
  | 'Product Design Case Studies'
  | 'UX Design Case Studies'
  | 'Random/Surprise Me';

export interface Article {
  id: string;
  title: string;
  author: string;
  source: string;
  type: 'Article' | 'Video';
  category: string;
  url: string;
  summary: string[];
  insights: string[];
  application_tips: string[];
}

export interface DigestConfig {
  level: ExperienceLevel;
  topics: Topic[];
  dateRange: DateRange;
}

export interface DigestHistoryItem {
  id: string;
  timestamp: number;
  config: DigestConfig;
  articles: Article[];
  type: 'feed' | 'url'; // Whether it was generated from feed or single URL
}

export interface UserPreferences {
  likedArticles: Article[];
  dislikedArticles: Article[];
}
