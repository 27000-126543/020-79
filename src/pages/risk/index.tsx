import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import { RiskItem } from '@/types';

type FilterType = 'all' | 'high' | 'medium' | 'low';

const RiskPage: React.FC = () => {
  const { riskList, markRiskRead, getUnreadRiskCount } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = getUnreadRiskCount();

  const stats = useMemo(() => ({
    total: riskList.length,
    high: riskList.filter(r => r.level === 'high').length,
    medium: riskList.filter(r => r.level === 'medium').length,
    low: riskList.filter(r => r.level === 'low').length
  }), [riskList]);

  const filteredRisks = useMemo(() => {
    if (filter === 'all') return riskList;
    return riskList.filter(r => r.level === filter);
  }, [riskList, filter]);

  const handleViewDetail = useCallback((risk: RiskItem) => {
    Taro.showModal({
      title: risk.title,
      content: risk.description,
      showCancel: false,
      confirmText: '知道了'
    });
    if (!risk.isRead) {
      markRiskRead(risk.id);
    }
  }, [markRiskRead]);

  const handleMarkAllRead = useCallback(() => {
    filteredRisks.forEach(r => {
      if (!r.isRead) markRiskRead(r.id);
    });
    Taro.showToast({
      title: '已全部标记已读',
      icon: 'success'
    });
  }, [filteredRisks, markRiskRead]);

  const trendLabels = {
    up: '↑ 上升',
    down: '↓ 下降',
    stable: '— 平稳'
  };

  const levelLabels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  });

  const filters = [
    { key: 'all' as FilterType, label: '全部' },
    { key: 'high' as FilterType, label: '高风险' },
    { key: 'medium' as FilterType, label: '中风险' },
    { key: 'low' as FilterType, label: '低风险' }
  ];

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>风险提醒</Text>
        <Text className={styles.headerDesc}>
          {unreadCount > 0 ? `有 ${unreadCount} 条待处理风险预警` : '暂无待处理风险'}
        </Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.number}>{stats.total}</Text>
            <Text className={styles.label}>风险总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{stats.high}</Text>
            <Text className={styles.label}>高风险</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{stats.medium}</Text>
            <Text className={styles.label}>中风险</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{stats.low}</Text>
            <Text className={styles.label}>低风险</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.filterBar}>
          {filters.map(f => (
            <View
              key={f.key}
              className={classnames(styles.filterItem, filter === f.key && styles.active)}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <Text className={styles.count}>
                {f.key === 'all' ? stats.total : stats[f.key]}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView scrollY className={styles.listContainer}>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>风险列表</Text>
            <View className={styles.markAll} onClick={handleMarkAllRead}>
              全部已读
            </View>
          </View>

          {filteredRisks.length > 0 ? (
            filteredRisks.map(risk => (
              <View
                key={risk.id}
                className={classnames(
                  styles.riskCard,
                  styles[`${risk.level}Level`],
                  risk.isRead && styles.isRead
                )}
                onClick={() => handleViewDetail(risk)}
              >
                <View className={styles.cardHeader}>
                  <View className={classnames(styles.levelBadge, styles[risk.level])}>
                    {!risk.isRead && <View className={styles.unreadDot} />}
                    {levelLabels[risk.level]}
                  </View>
                  <View className={classnames(styles.trendBadge, risk.trend)}>
                    {trendLabels[risk.trend]}
                  </View>
                </View>

                <Text className={styles.riskTitle}>{risk.title}</Text>

                <Text className={styles.changeType}>{risk.changeType}</Text>

                <Text className={styles.riskDesc}>{risk.description}</Text>

                <View className={styles.keywordsRow}>
                  {risk.keywords.map((kw, i) => (
                    <Text key={i} className={styles.keywordTag}>#{kw}</Text>
                  ))}
                </View>

                <View className={styles.cardFooter}>
                  <View className={styles.footerLeft}>
                    <View className={styles.stat}>
                      <Text className={styles.num}>{risk.newsCount}</Text>
                      <Text>相关报道</Text>
                    </View>
                    <Text className={styles.updateTime}>{risk.updateTime}</Text>
                  </View>
                  {!risk.isRead && (
                    <View
                      className={classnames(styles.actionBtn, styles.btnRead)}
                      onClick={(e) => {
                        e.stopPropagation();
                        markRiskRead(risk.id);
                      }}
                    >
                      标记已读
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>🛡️</View>
              <Text className={styles.emptyTitle}>暂无风险提醒</Text>
              <Text className={styles.emptyDesc}>持续监测中，有风险会第一时间通知</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default RiskPage;
