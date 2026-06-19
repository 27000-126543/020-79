import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatCard from '@/components/StatCard';
import NewsCard from '@/components/NewsCard';
import { useAppContext } from '@/store/app-context';
import { SentimentType, MarkType } from '@/types';

type TabType = 'all' | SentimentType;

const EventPage: React.FC = () => {
  const { newsList, getTodayStats, markNews } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const stats = getTodayStats();

  const todayNews = useMemo(() => {
    return newsList.filter(n => n.publishTime.startsWith('2024-01-15'));
  }, [newsList]);

  const filteredNews = useMemo(() => {
    if (activeTab === 'all') return todayNews;
    return todayNews.filter(n => n.sentiment === activeTab);
  }, [todayNews, activeTab]);

  const tabCounts = useMemo(() => ({
    all: todayNews.length,
    positive: todayNews.filter(n => n.sentiment === 'positive').length,
    neutral: todayNews.filter(n => n.sentiment === 'neutral').length,
    negative: todayNews.filter(n => n.sentiment === 'negative').length
  }), [todayNews]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSelectedIds([]);
  }, []);

  const handleMarkAll = useCallback((markType: MarkType) => {
    const targetIds = selectedIds.length > 0 ? selectedIds : filteredNews.map(n => n.id);
    targetIds.forEach(id => markNews(id, markType));
    setSelectedIds([]);
    Taro.showToast({
      title: `已标记${targetIds.length}条`,
      icon: 'success'
    });
  }, [selectedIds, filteredNews, markNews]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  });

  const tabs = [
    { key: 'all' as TabType, label: '全部' },
    { key: 'positive' as TabType, label: '正面' },
    { key: 'neutral' as TabType, label: '中性' },
    { key: 'negative' as TabType, label: '负面' }
  ];

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.greeting}>今日舆情概览</Text>
            <Text className={styles.date}>2024年1月15日 星期一</Text>
          </View>
          <View className={styles.refreshBtn}>实时更新</View>
        </View>
        <Text className={styles.statsTitle}>今日新增报道</Text>
        <View className={styles.statsRow}>
          <StatCard number={stats.total} label="总报道" type="total" />
          <StatCard number={stats.positive} label="正面" type="positive" />
          <StatCard number={stats.neutral} label="中性" type="neutral" />
          <StatCard number={stats.negative} label="负面" type="negative" />
        </View>
      </View>

      <View className={styles.content}>
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
            <Text className={styles.listCount}>共 {filteredNews.length} 条</Text>
          </View>

          {filteredNews.length > 0 ? (
            filteredNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无相关报道</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View className={styles.actionBar}>
        <View
          className={classnames(styles.actionBtn, styles.btnRead)}
          onClick={() => handleMarkAll('read')}
        >
          全部已读
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnHQ)}
          onClick={() => handleMarkAll('headquarters')}
        >
          需总部回应
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnRegion)}
          onClick={() => handleMarkAll('region')}
        >
          交区域核实
        </View>
      </View>
    </View>
  );
};

export default EventPage;
