export type SentimentType = 'positive' | 'neutral' | 'negative';

export type MarkType = 'read' | 'headquarters' | 'region';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishTime: string;
  summary: string;
  sentiment: SentimentType;
  sentimentLabel: string;
  keywords: string[];
  products: string[];
  stores: string[];
  quotes: string[];
  content: string;
  isRead: boolean;
  mark?: MarkType;
  markLabel?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  level: 'high' | 'medium' | 'low';
  changeType: string;
  description: string;
  newsCount: number;
  trend: 'up' | 'down' | 'stable';
  updateTime: string;
  keywords: string[];
  relatedNews: string[];
  isRead: boolean;
}

export interface Keyword {
  id: string;
  name: string;
  category: 'company' | 'product' | 'competitor' | 'region';
  categoryLabel: string;
  isSubscribed: boolean;
}

export interface DailyStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  date: string;
}
