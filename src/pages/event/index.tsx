import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatCard from '@/components/StatCard';
import NewsCard from '@/components/NewsCard';
import SubscriptionBar from '@/components/SubscriptionBar';
import { useAppContext } from '@/store/app-context';
import { SentimentType, MarkType } from '@/types';

type TabType = 'all' | SentimentType;

const EventPage: React.FC = () => {
  const {
    newsList,
    getTodayStats,
    markNews,
    filterNewsByKeywords,
    subscribedKeywordNames
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const stats = getTodayStats();

  const todayNews = useMemo(() => {
    return filterNewsByKeywords(
      newsList.filter(n => n.publishTime.startsWith('2024-01-15'))
    );
  }, [newsList, filterNewsByKeywords]);

  const filteredNews = useMemo(() => {
    if (activeTab === 'all') return todayNews;
    return todayNews.filter(n => n.sentiment === activeTab);
  }, [todayNews, activeTab]);

  const tabCounts = useMemo(
    () => ({
      all: todayNews.length,
      positive: todayNews.filter(n => n.sentiment === 'positive').length,
      neutral: todayNews.filter(n => n.sentiment === 'neutral').length,
      negative: todayNews.filter(n => n.sentiment === 'negative').length
    }),
    [todayNews]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleMarkAll = useCallback(
    (markType: MarkType) => {
      if (filteredNews.length === 0) {
        Taro.showToast({ title: '没有可操作的内容', icon: 'none' });
        return;
      }
      filteredNews.forEach(n => markNews(n.id, markType));
      Taro.showToast({
        title: `已标记${filteredNews.length}条`,
        icon: 'success'
      });
    },
    [filteredNews, markNews]
  );

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 600);
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'positive', label: '正面' },
    { key: 'neutral', label: '中性' },
    { key: 'negative', label: '负面' }
  ];

  const goToMine = () => {
    Taro.switchTab({ url: '/pages/mine/index' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.greetingWrap}>
            <Text className={styles.greeting}>今日舆情概览</Text>
            <Text className={styles.date}>2024年1月15日 · 星期一</Text>
          </View>
          <View className={styles.headerActions}>
            <View
              className={styles.briefingBtn}
              onClick={() => Taro.navigateTo({ url: '/pages/briefing/index' })}
            >
              <Text>📋 简报</Text>
            </View>
            <View className={styles.refreshBtn}>
              <Text>●</Text>
              <Text>实时更新</Text>
            </View>
          </View>
        </View>
        <Text className={styles.statsTitle}>今日新增报道（基于订阅关键词）</Text>
        <View className={styles.statsRow}>
          <StatCard number={stats.total} label="总报道" type="total" />
          <StatCard number={stats.positive} label="正面" type="positive" />
          <StatCard number={stats.neutral} label="中性" type="neutral" />
          <StatCard number={stats.negative} label="负面" type="negative" />
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.filterHint}>
          <SubscriptionBar />
        </View>

        <View className={styles.tabBar}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              <Text className={styles.tabCount}>{tabCounts[tab.key]}</Text>
            </View>
          ))}
        </View>

        <ScrollView scrollY className={styles.listContainer}>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>报道列表</Text>
            <Text className={styles.listCount}>
              {filteredNews.length} 条
              {subscribedKeywordNames.length > 0 &&
                ` · 匹配 ${subscribedKeywordNames.length} 个订阅`}
            </Text>
          </View>

          {filteredNews.length > 0 ? (
            filteredNews.map(news => <NewsCard key={news.id} news={news} />)
          ) : (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📭</View>
              <Text className={styles.emptyTitle}>
                {subscribedKeywordNames.length === 0
                  ? '请先订阅关键词'
                  : '暂无匹配当前筛选的报道'}
              </Text>
              <Text className={styles.emptyDesc}>
                {subscribedKeywordNames.length === 0
                  ? '前往"我的"页面订阅公司、产品线、竞品或区域关键词'
                  : '可以尝试切换倾向分类，或调整订阅范围'}
              </Text>
              <View className={styles.emptyAction} onClick={goToMine}>
                去订阅关键词
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <View className={styles.actionBar}>
        <View
          className={classnames(styles.actionBtn, styles.btnRead)}
          onClick={() => handleMarkAll('read')}
        >
          <Text className={styles.icon}>✓</Text>
          <Text>全部已读</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnHQ)}
          onClick={() => handleMarkAll('headquarters')}
        >
          <Text className={styles.icon}>🏢</Text>
          <Text>需总部回应</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnRegion)}
          onClick={() => handleMarkAll('region')}
        >
          <Text className={styles.icon}>📍</Text>
          <Text>交区域核实</Text>
        </View>
      </View>
    </View>
  );
};

export default EventPage;
