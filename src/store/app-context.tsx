import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import {
  NewsItem,
  RiskItem,
  Keyword,
  MarkType,
  MarkedRecord,
  SentimentType,
  SortMode
} from '@/types';
import { newsList as initialNewsList } from '@/data/news';
import { riskList as initialRiskList } from '@/data/risk';
import { keywordList as initialKeywordList } from '@/data/keywords';

const MARK_LABELS: Record<MarkType, string> = {
  read: '已读',
  headquarters: '需总部回应',
  region: '交区域核实'
};

interface AppContextType {
  newsList: NewsItem[];
  riskList: RiskItem[];
  keywordList: Keyword[];
  subscribedKeywordNames: string[];
  subscribedKeywordsByCategory: Record<string, Keyword[]>;

  markNews: (id: string, markType: MarkType) => void;
  markRisk: (id: string, markType: MarkType) => void;
  toggleKeyword: (id: string) => void;

  filterNewsByKeywords: (list: NewsItem[]) => NewsItem[];
  filterRisksByKeywords: (list: RiskItem[]) => RiskItem[];
  sortNews: (list: NewsItem[], mode: SortMode) => NewsItem[];

  getUnreadRiskCount: () => number;
  getTodayStats: () => { total: number; positive: number; neutral: number; negative: number };
  getMarkStats: () => {
    news: { read: number; headquarters: number; region: number };
    risk: { read: number; headquarters: number; region: number };
    total: { read: number; headquarters: number; region: number };
  };
  getMarkedRecords: (filter?: MarkType | 'all') => MarkedRecord[];

  newsSentiments: SentimentType[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsList);
  const [riskList, setRiskList] = useState<RiskItem[]>(initialRiskList);
  const [keywordList, setKeywordList] = useState<Keyword[]>(initialKeywordList);

  const subscribedKeywords = useMemo(
    () => keywordList.filter(k => k.isSubscribed),
    [keywordList]
  );

  const subscribedKeywordNames = useMemo(
    () => subscribedKeywords.map(k => k.name),
    [subscribedKeywords]
  );

  const subscribedKeywordsByCategory = useMemo(() => {
    const result: Record<string, Keyword[]> = {};
    subscribedKeywords.forEach(k => {
      if (!result[k.category]) result[k.category] = [];
      result[k.category].push(k);
    });
    return result;
  }, [subscribedKeywords]);

  const _doMarkNews = (id: string, markType: MarkType, isReadValue = true) => {
    setNewsList(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              isRead: isReadValue,
              mark: markType,
              markLabel: MARK_LABELS[markType]
            }
          : n
      )
    );
    console.log(`[AppContext] 标记新闻 ${id}: ${markType}`);
  };

  const markNews = (id: string, markType: MarkType) => {
    _doMarkNews(id, markType, true);
  };

  const markRisk = (id: string, markType: MarkType) => {
    setRiskList(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              isRead: true,
              mark: markType,
              markLabel: MARK_LABELS[markType]
            }
          : r
      )
    );
    console.log(`[AppContext] 标记风险 ${id}: ${markType}`);
  };

  const toggleKeyword = (id: string) => {
    setKeywordList(prev =>
      prev.map(kw => (kw.id === id ? { ...kw, isSubscribed: !kw.isSubscribed } : kw))
    );
  };

  const _matchKeywords = (itemKeywords: string[]): boolean => {
    if (subscribedKeywordNames.length === 0) return true;
    for (const kw of subscribedKeywordNames) {
      if (itemKeywords.some(k => k.includes(kw) || kw.includes(k))) {
        return true;
      }
    }
    return false;
  };

  const filterNewsByKeywords = (list: NewsItem[]): NewsItem[] => {
    return list.filter(n => _matchKeywords(n.keywords));
  };

  const filterRisksByKeywords = (list: RiskItem[]): RiskItem[] => {
    return list.filter(r => _matchKeywords(r.keywords));
  };

  const sortNews = (list: NewsItem[], mode: SortMode): NewsItem[] => {
    if (mode === 'time') {
      return [...list].sort(
        (a, b) =>
          new Date(b.publishTime.replace(' ', 'T')).getTime() -
          new Date(a.publishTime.replace(' ', 'T')).getTime()
      );
    }
    const priorityScore = (n: NewsItem): number => {
      let score = 0;
      if (!n.isRead) score += 100;
      if (n.sentiment === 'negative') {
        score += 80;
        if (n.sentimentLabel === '持续发酵') score += 30;
        if (n.sentimentLabel === '潜在负面') score += 20;
      }
      if (n.keywords.some(k => ['竞品对比', '竞品动态'].includes(k))) score += 50;
      if (n.keywords.some(k => ['投诉', '质量问题', '召回', '卫生'].includes(k))) score += 40;
      return score;
    };
    return [...list].sort((a, b) => priorityScore(b) - priorityScore(a));
  };

  const getUnreadRiskCount = () => riskList.filter(r => !r.isRead).length;

  const getTodayStats = () => {
    const todayNews = filterNewsByKeywords(
      newsList.filter(n => n.publishTime.startsWith('2024-01-15'))
    );
    return {
      total: todayNews.length,
      positive: todayNews.filter(n => n.sentiment === 'positive').length,
      neutral: todayNews.filter(n => n.sentiment === 'neutral').length,
      negative: todayNews.filter(n => n.sentiment === 'negative').length
    };
  };

  const getMarkStats = () => {
    const newsStats = { read: 0, headquarters: 0, region: 0 };
    newsList.forEach(n => {
      if (n.mark === 'headquarters') {
        newsStats.headquarters++;
      } else if (n.mark === 'region') {
        newsStats.region++;
      } else if (n.mark === 'read') {
        newsStats.read++;
      }
    });
    const riskStats = { read: 0, headquarters: 0, region: 0 };
    riskList.forEach(r => {
      if (r.mark === 'headquarters') {
        riskStats.headquarters++;
      } else if (r.mark === 'region') {
        riskStats.region++;
      } else if (r.mark === 'read') {
        riskStats.read++;
      }
    });
    return {
      news: newsStats,
      risk: riskStats,
      total: {
        read: newsStats.read + riskStats.read,
        headquarters: newsStats.headquarters + riskStats.headquarters,
        region: newsStats.region + riskStats.region
      }
    };
  };

  const getMarkedRecords = (filter: MarkType | 'all' = 'all'): MarkedRecord[] => {
    const records: MarkedRecord[] = [];
    newsList.forEach(n => {
      if (n.mark && (filter === 'all' || filter === n.mark)) {
        records.push({
          id: `n-${n.id}`,
          category: 'news',
          title: n.title,
          source: n.source,
          time: n.publishTime,
          mark: n.mark,
          markLabel: n.markLabel!,
          sentiment: n.sentiment,
          sentimentLabel: n.sentimentLabel,
          keywords: n.keywords,
          summary: n.summary
        });
      }
    });
    riskList.forEach(r => {
      if (r.mark && (filter === 'all' || filter === r.mark)) {
        records.push({
          id: `r-${r.id}`,
          category: 'risk',
          title: r.title,
          source: r.changeType,
          time: r.updateTime,
          mark: r.mark,
          markLabel: r.markLabel!,
          level: r.level,
          keywords: r.keywords,
          summary: r.description
        });
      }
    });
    return records.sort(
      (a, b) =>
        new Date(b.time.replace(' ', 'T')).getTime() -
        new Date(a.time.replace(' ', 'T')).getTime()
    );
  };

  return (
    <AppContext.Provider
      value={{
        newsList,
        riskList,
        keywordList,
        subscribedKeywordNames,
        subscribedKeywordsByCategory,
        markNews,
        markRisk,
        toggleKeyword,
        filterNewsByKeywords,
        filterRisksByKeywords,
        sortNews,
        getUnreadRiskCount,
        getTodayStats,
        getMarkStats,
        getMarkedRecords,
        newsSentiments: ['positive', 'neutral', 'negative']
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
