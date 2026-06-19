import { RiskItem, TimelineNode } from '@/types';

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
    isRead: false,
    timeline: [
      { id: 'r1-t1', time: '2024-01-14 08:00', type: 'news', title: '地方媒体首次报道质量投诉', detail: '消费者投诉文章见报' },
      { id: 'r1-t2', time: '2024-01-14 14:00', type: 'news', title: '3家媒体跟进报道', detail: '报道角度从产品变质转向品牌信任' },
      { id: 'r1-t3', time: '2024-01-15 09:00', type: 'news', title: '华东8家地方媒体集中报道', detail: '负面占比升至65%' },
      { id: 'r1-t4', time: '2024-01-15 16:30', type: 'risk', title: '系统识别为高风险预警' }
    ] as TimelineNode[],
    recommendation: '建议华东区域经理立即走访涉事门店，准备产品质量说明函，同步总部公关部统一口径'
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
    isRead: false,
    timeline: [
      { id: 'r2-t1', time: '2024-01-13 10:00', type: 'news', title: '首篇竞品对比评测发布' },
      { id: 'r2-t2', time: '2024-01-14 11:30', type: 'news', title: '消费评测发布横向对比', detail: '悦活综合排名第4' },
      { id: 'r2-t3', time: '2024-01-15 14:00', type: 'risk', title: '竞品对比升温预警' }
    ] as TimelineNode[],
    recommendation: '准备竞品差异化话术，突出鲜榨工艺和口感优势，避免直接对比价格'
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
    isRead: true,
    timeline: [
      { id: 'r3-t1', time: '2024-01-10 09:00', type: 'news', title: '零星投诉出现' },
      { id: 'r3-t2', time: '2024-01-12 15:00', type: 'news', title: '投诉量周环比增长150%' },
      { id: 'r3-t3', time: '2024-01-15 12:00', type: 'risk', title: '投诉量增长300%触发预警' }
    ] as TimelineNode[],
    recommendation: '建议客服团队增派人手，准备退款和补偿方案，同步发布质量保障声明'
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
    isRead: false,
    timeline: [
      { id: 'r4-t1', time: '2024-01-11 16:00', type: 'news', title: '暗访报道首发', detail: '代工厂卫生问题曝光' },
      { id: 'r4-t2', time: '2024-01-12 08:00', type: 'news', title: '5家媒体跟进' },
      { id: 'r4-t3', time: '2024-01-12 18:30', type: 'news', title: '深度调查报道发布', detail: '悦活回应启动调查' },
      { id: 'r4-t4', time: '2024-01-13 12:00', type: 'news', title: '话题登上微博热搜' },
      { id: 'r4-t5', time: '2024-01-13 20:00', type: 'risk', title: '15家媒体跟进，风险升级' }
    ] as TimelineNode[],
    recommendation: '建议总部立即发布正式声明并公布整改措施，考虑召开媒体沟通会'
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
    isRead: false,
    timeline: [
      { id: 'r5-t1', time: '2024-01-10 10:00', type: 'news', title: '门店开始5折促销' },
      { id: 'r5-t2', time: '2024-01-11 09:30', type: 'news', title: '消费者质疑促销原因', detail: '北京消费指南报道' },
      { id: 'r5-t3', time: '2024-01-11 18:00', type: 'risk', title: '消费者疑虑监测预警' }
    ] as TimelineNode[],
    recommendation: '建议门店明确促销原因，准备"节前常规促销"话术卡片，避免与质量问题关联'
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
    isRead: true,
    timeline: [
      { id: 'r6-t1', time: '2024-01-11 10:00', type: 'news', title: '元气森林新品发布消息' },
      { id: 'r6-t2', time: '2024-01-12 10:00', type: 'news', title: '鲜榨坊系列正式上市' },
      { id: 'r6-t3', time: '2024-01-12 11:00', type: 'risk', title: '竞品动态风险提示' }
    ] as TimelineNode[],
    recommendation: '准备竞品应对方案，梳理自身差异化优势（工艺/口感/渠道），关注后续市场反应'
  }
];

export const getRiskById = (id: string): RiskItem | undefined => {
  return riskList.find(risk => risk.id === id);
};

export const getUnreadRiskCount = (): number => {
  return riskList.filter(risk => !risk.isRead).length;
};
