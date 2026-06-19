import { RiskItem } from '@/types';

export const riskList: RiskItem[] = [
  {
    id: 'r1',
    title: '华东区域媒体集中报道质量问题',
    level: 'high',
    changeType: '地方媒体转向',
    description: '近24小时内，华东区域有8家地方媒体报道悦活果汁质量问题，报道角度从最初的产品变质转向品牌信任危机，负面占比从20%上升至65%。',
    newsCount: 12,
    trend: 'up',
    updateTime: '2024-01-15 16:30',
    keywords: ['华东', '质量问题', '媒体转向'],
    relatedNews: ['2', '8', '12'],
    isRead: false
  },
  {
    id: 'r2',
    title: '行业媒体开始对比竞品，悦活排名下滑',
    level: 'medium',
    changeType: '竞品对比升温',
    description: '近期多家行业媒体发布健康饮品对比评测，悦活在性价比、渠道覆盖等方面被竞品超越，综合排名从第2位下滑至第4位。',
    newsCount: 5,
    trend: 'up',
    updateTime: '2024-01-15 14:00',
    keywords: ['竞品对比', '评测', '排名'],
    relatedNews: ['5', '9'],
    isRead: false
  },
  {
    id: 'r3',
    title: '消费者投诉量持续上升，周环比增长300%',
    level: 'high',
    changeType: '投诉激增',
    description: '本周消费者投诉量较上周增长300%，主要集中在产品变质、客服响应慢、退款难等问题。社交媒体相关讨论热度持续攀升。',
    newsCount: 8,
    trend: 'up',
    updateTime: '2024-01-15 12:00',
    keywords: ['投诉', '消费者', '社交媒体'],
    relatedNews: ['2', '8'],
    isRead: true
  },
  {
    id: 'r4',
    title: '代工厂卫生问题持续发酵，多家媒体跟进',
    level: 'high',
    changeType: '负面发酵',
    description: '代工厂卫生问题曝光后，已有15家主流媒体跟进报道，话题登上微博热搜榜，阅读量超5000万，品牌声誉受损严重。',
    newsCount: 15,
    trend: 'up',
    updateTime: '2024-01-13 20:00',
    keywords: ['代工厂', '卫生', '热搜'],
    relatedNews: ['8', '12'],
    isRead: false
  },
  {
    id: 'r5',
    title: '北京区域促销引发质量猜测',
    level: 'low',
    changeType: '消费者疑虑',
    description: '北京区域多家门店大力度促销引发消费者对产品质量的猜测，社交媒体出现相关讨论，但尚未形成大规模负面舆情。',
    newsCount: 2,
    trend: 'stable',
    updateTime: '2024-01-11 18:00',
    keywords: ['北京', '促销', '消费者疑虑'],
    relatedNews: ['11'],
    isRead: false
  },
  {
    id: 'r6',
    title: '元气森林新品上市，竞争格局生变',
    level: 'medium',
    changeType: '竞品动态',
    description: '元气森林推出果汁新品直接对标悦活，凭借其品牌和渠道优势，可能对悦活鲜萃果汁的市场份额造成冲击。',
    newsCount: 3,
    trend: 'up',
    updateTime: '2024-01-12 11:00',
    keywords: ['元气森林', '竞品', '市场份额'],
    relatedNews: ['9'],
    isRead: true
  }
];

export const getRiskById = (id: string): RiskItem | undefined => {
  return riskList.find(risk => risk.id === id);
};

export const getUnreadRiskCount = (): number => {
  return riskList.filter(risk => !risk.isRead).length;
};
