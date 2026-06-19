import { Keyword, DailyStats } from '@/types';

export const keywordList: Keyword[] = [
  {
    id: 'k1',
    name: '悦活',
    category: 'company',
    categoryLabel: '公司品牌',
    isSubscribed: true
  },
  {
    id: 'k2',
    name: '鲜萃果汁',
    category: 'product',
    categoryLabel: '产品线',
    isSubscribed: true
  },
  {
    id: 'k3',
    name: '气泡水系列',
    category: 'product',
    categoryLabel: '产品线',
    isSubscribed: true
  },
  {
    id: 'k4',
    name: '元气森林',
    category: 'competitor',
    categoryLabel: '竞品',
    isSubscribed: true
  },
  {
    id: 'k5',
    name: '农夫山泉',
    category: 'competitor',
    categoryLabel: '竞品',
    isSubscribed: true
  },
  {
    id: 'k6',
    name: '华东区域',
    category: 'region',
    categoryLabel: '区域',
    isSubscribed: true
  },
  {
    id: 'k7',
    name: '华南区域',
    category: 'region',
    categoryLabel: '区域',
    isSubscribed: true
  },
  {
    id: 'k8',
    name: '华北区域',
    category: 'region',
    categoryLabel: '区域',
    isSubscribed: false
  },
  {
    id: 'k9',
    name: '西部区域',
    category: 'region',
    categoryLabel: '区域',
    isSubscribed: false
  },
  {
    id: 'k10',
    name: '统一',
    category: 'competitor',
    categoryLabel: '竞品',
    isSubscribed: false
  },
  {
    id: 'k11',
    name: '康师傅',
    category: 'competitor',
    categoryLabel: '竞品',
    isSubscribed: false
  },
  {
    id: 'k12',
    name: '茶饮系列',
    category: 'product',
    categoryLabel: '产品线',
    isSubscribed: false
  }
];

export const dailyStats: DailyStats = {
  total: 12,
  positive: 4,
  neutral: 4,
  negative: 4,
  date: '2024-01-15'
};

export const getSubscribedKeywords = (): Keyword[] => {
  return keywordList.filter(k => k.isSubscribed);
};

export const getKeywordsByCategory = (category: string): Keyword[] => {
  return keywordList.filter(k => k.category === category);
};
