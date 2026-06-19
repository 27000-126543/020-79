import React, { createContext, useState, useContext, ReactNode } from 'react';
import { NewsItem, RiskItem, Keyword, MarkType } from '@/types';
import { newsList as initialNewsList } from '@/data/news';
import { riskList as initialRiskList } from '@/data/risk';
import { keywordList as initialKeywordList } from '@/data/keywords';

interface AppContextType {
  newsList: NewsItem[];
  riskList: RiskItem[];
  keywordList: Keyword[];
  markNews: (id: string, markType: MarkType) => void;
  markRiskRead: (id: string) => void;
  toggleKeyword: (id: string) => void;
  getUnreadRiskCount: () => number;
  getTodayStats: () => { total: number; positive: number; neutral: number; negative: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsList);
  const [riskList, setRiskList] = useState<RiskItem[]>(initialRiskList);
  const [keywordList, setKeywordList] = useState<Keyword[]>(initialKeywordList);

  const markNews = (id: string, markType: MarkType) => {
    const markLabels = {
      read: '已读',
      headquarters: '需总部回应',
      region: '交区域核实'
    };

    setNewsList(prev =>
      prev.map(news =>
        news.id === id
          ? { ...news, isRead: true, mark: markType, markLabel: markLabels[markType] }
          : news
      )
    );

    console.log(`[AppContext] 标记新闻 ${id}: ${markType}`);
  };

  const markRiskRead = (id: string) => {
    setRiskList(prev =>
      prev.map(risk =>
        risk.id === id ? { ...risk, isRead: true } : risk
      )
    );
  };

  const toggleKeyword = (id: string) => {
    setKeywordList(prev =>
      prev.map(kw =>
        kw.id === id ? { ...kw, isSubscribed: !kw.isSubscribed } : kw
      )
    );
  };

  const getUnreadRiskCount = () => {
    return riskList.filter(r => !r.isRead).length;
  };

  const getTodayStats = () => {
    const todayNews = newsList.filter(n => n.publishTime.startsWith('2024-01-15'));
    return {
      total: todayNews.length,
      positive: todayNews.filter(n => n.sentiment === 'positive').length,
      neutral: todayNews.filter(n => n.sentiment === 'neutral').length,
      negative: todayNews.filter(n => n.sentiment === 'negative').length
    };
  };

  return (
    <AppContext.Provider
      value={{
        newsList,
        riskList,
        keywordList,
        markNews,
        markRiskRead,
        toggleKeyword,
        getUnreadRiskCount,
        getTodayStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
