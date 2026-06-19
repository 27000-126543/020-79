import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import {
  NewsItem,
  RiskItem,
  Keyword,
  MarkType,
  MarkedRecord,
  SentimentType,
  SortMode,
  SceneMode,
  SubscriptionPreset,
  TimelineNode
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
  applyKeywordIds: (ids: string[]) => void;

  filterNewsByKeywords: (list: NewsItem[]) => NewsItem[];
  filterRisksByKeywords: (list: RiskItem[]) => RiskItem[];
  sortNews: (list: NewsItem[], mode: SortMode) => NewsItem[];
  sortNewsByScene: (list: NewsItem[], scene: SceneMode) => NewsItem[];

  getUnreadRiskCount: () => number;
  getTodayStats: () => { total: number; positive: number; neutral: number; negative: number };
  getMarkStats: () => {
    news: { read: number; headquarters: number; region: number };
    risk: { read: number; headquarters: number; region: number };
    total: { read: number; headquarters: number; region: number };
  };
  getMarkedRecords: (filter?: MarkType | 'all') => MarkedRecord[];

  getBriefing: () => {
    positiveNews: NewsItem[];
    neutralNews: NewsItem[];
    potentialNegativeNews: NewsItem[];
    ongoingNegativeNews: NewsItem[];
    activeRisks: RiskItem[];
    recommendations: string[];
  };

  getRiskTimeline: (riskId: string) => TimelineNode[];

  presetList: SubscriptionPreset[];
  savePreset: (name: string) => void;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;

  newsSentiments: SentimentType[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsList);
  const [riskList, setRiskList] = useState<RiskItem[]>(initialRiskList);
  const [keywordList, setKeywordList] = useState<Keyword[]>(initialKeywordList);
  const [presetList, setPresetList] = useState<SubscriptionPreset[]>([]);

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

  const markNews = (id: string, markType: MarkType) => {
    setNewsList(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, isRead: true, mark: markType, markLabel: MARK_LABELS[markType] }
          : n
      )
    );
  };

  const markRisk = (id: string, markType: MarkType) => {
    setRiskList(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const actionNode: TimelineNode = {
          id: `${r.id}-act-${Date.now()}`,
          time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          type: 'action',
          title: `处置: ${MARK_LABELS[markType]}`,
          detail: markType === 'headquarters' ? '已提交总部回应' : markType === 'region' ? '已转交区域核实' : '已标记已读'
        };
        return {
          ...r,
          isRead: true,
          mark: markType,
          markLabel: MARK_LABELS[markType],
          timeline: [...r.timeline, actionNode]
        };
      })
    );
  };

  const toggleKeyword = (id: string) => {
    setKeywordList(prev =>
      prev.map(kw => (kw.id === id ? { ...kw, isSubscribed: !kw.isSubscribed } : kw))
    );
  };

  const applyKeywordIds = useCallback((ids: string[]) => {
    setKeywordList(prev =>
      prev.map(kw => ({ ...kw, isSubscribed: ids.includes(kw.id) }))
    );
  }, []);

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

  const sortNewsByScene = (list: NewsItem[], scene: SceneMode): NewsItem[] => {
    const sceneScore = (n: NewsItem): number => {
      let score = 0;
      if (!n.isRead) score += 60;
      const kw = n.keywords;
      if (scene === 'meeting') {
        if (n.sentiment === 'positive') score += 80;
        if (kw.some(k => ['竞品对比', '竞品动态'].includes(k))) score += 70;
        if (kw.some(k => ['销量', '战略合作', '新品上市'].includes(k))) score += 60;
        if (n.sentiment === 'negative') score += 30;
      } else if (scene === 'exhibition') {
        if (n.sentiment === 'positive') score += 70;
        if (kw.some(k => ['新品上市', '战略合作', '行业报告'].includes(k))) score += 80;
        if (kw.some(k => ['竞品对比', '竞品动态'].includes(k))) score += 50;
      } else {
        if (n.sentiment === 'negative') score += 90;
        if (kw.some(k => ['投诉', '质量问题', '召回', '卫生', '变质'].includes(k))) score += 70;
        if (n.stores.length > 0) score += 50;
        if (kw.some(k => ['华东', '北京', '华南', '区域'].includes(k))) score += 40;
        if (n.sentiment === 'positive') score += 20;
      }
      return score;
    };
    return [...list].sort((a, b) => sceneScore(b) - sceneScore(a));
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
      if (n.mark === 'headquarters') newsStats.headquarters++;
      else if (n.mark === 'region') newsStats.region++;
      else if (n.mark === 'read') newsStats.read++;
    });
    const riskStats = { read: 0, headquarters: 0, region: 0 };
    riskList.forEach(r => {
      if (r.mark === 'headquarters') riskStats.headquarters++;
      else if (r.mark === 'region') riskStats.region++;
      else if (r.mark === 'read') riskStats.read++;
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

  const getBriefing = () => {
    const filtered = filterNewsByKeywords(newsList);
    const filteredRisks = filterRisksByKeywords(riskList);
    const positiveNews = filtered.filter(n => n.sentiment === 'positive');
    const neutralNews = filtered.filter(n => n.sentiment === 'neutral');
    const potentialNegativeNews = filtered.filter(
      n => n.sentiment === 'negative' && n.sentimentLabel === '潜在负面'
    );
    const ongoingNegativeNews = filtered.filter(
      n => n.sentiment === 'negative' && n.sentimentLabel === '持续发酵'
    );
    const activeRisks = filteredRisks.filter(r => !r.mark || r.mark === 'read');
    const recommendations: string[] = [];
    activeRisks.forEach(r => {
      if (r.recommendation) recommendations.push(r.recommendation);
    });
    return { positiveNews, neutralNews, potentialNegativeNews, ongoingNegativeNews, activeRisks, recommendations };
  };

  const getRiskTimeline = (riskId: string): TimelineNode[] => {
    const risk = riskList.find(r => r.id === riskId);
    return risk ? risk.timeline : [];
  };

  const savePreset = useCallback((name: string) => {
    setKeywordList(prev => {
      const currentIds = prev.filter(k => k.isSubscribed).map(k => k.id);
      setPresetList(pp => [
        ...pp,
        {
          id: `preset-${Date.now()}`,
          name,
          keywordIds: currentIds,
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
        }
      ]);
      return prev;
    });
  }, []);

  const applyPreset = useCallback((id: string) => {
    const target = presetList.find(p => p.id === id);
    if (!target) return;
    setKeywordList(prev =>
      prev.map(kw => ({ ...kw, isSubscribed: target.keywordIds.includes(kw.id) }))
    );
  }, [presetList]);

  const deletePreset = useCallback((id: string) => {
    setPresetList(prev => prev.filter(p => p.id !== id));
  }, []);

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
        applyKeywordIds,
        filterNewsByKeywords,
        filterRisksByKeywords,
        sortNews,
        sortNewsByScene,
        getUnreadRiskCount,
        getTodayStats,
        getMarkStats,
        getMarkedRecords,
        getBriefing,
        getRiskTimeline,
        presetList,
        savePreset,
        applyPreset,
        deletePreset,
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
