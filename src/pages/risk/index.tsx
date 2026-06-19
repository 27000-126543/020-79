import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SubscriptionBar from '@/components/SubscriptionBar';
import { useAppContext } from '@/store/app-context';
import { RiskItem, MarkType } from '@/types';

type FilterType = 'all' | 'high' | 'medium' | 'low';

const trendLabels = { up: '↑ 上升', down: '↓ 下降', stable: '— 平稳' };
const levelLabels = { high: '高风险', medium: '中风险', low: '低风险' };

const RiskPage: React.FC = () => {
  const {
    riskList,
    markRisk,
    getUnreadRiskCount,
    filterRisksByKeywords,
    getMarkStats
  } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showRead, setShowRead] = useState(true);

  const unreadCount = getUnreadRiskCount();
  const markStats = getMarkStats();

  const filteredByKeywords = useMemo(
    () => filterRisksByKeywords(riskList),
    [riskList, filterRisksByKeywords]
  );

  const stats = useMemo(
    () => ({
      total: filteredByKeywords.length,
      high: filteredByKeywords.filter(r => r.level === 'high').length,
      medium: filteredByKeywords.filter(r => r.level === 'medium').length,
      low: filteredByKeywords.filter(r => r.level === 'low').length
    }),
    [filteredByKeywords]
  );

  const filteredRisks = useMemo(() => {
    let list = filteredByKeywords;
    if (filter !== 'all') list = list.filter(r => r.level === filter);
    if (!showRead) list = list.filter(r => !r.isRead);
    return list;
  }, [filteredByKeywords, filter, showRead]);

  const showRiskDetail = useCallback(
    (risk: RiskItem) => {
      const wasUnread = !risk.isRead;
      const currentStatus = risk.markLabel ? `\n\n【当前处置】${risk.markLabel}` : '';
      const canChangeHQ = risk.mark !== 'headquarters';
      const canChangeRegion = risk.mark !== 'region';
      Taro.showModal({
        title: `${levelLabels[risk.level]} · ${risk.changeType}`,
        content: risk.description + currentStatus,
        showCancel: canChangeHQ,
        confirmText: canChangeRegion ? '交区域核实' : '已交区域',
        cancelText: canChangeHQ ? '需总部回应' : '已交总部',
        cancelColor: '#FF7D00',
        confirmColor: '#1E56A0',
        success: (res) => {
          if (res.confirm && canChangeRegion) {
            markRisk(risk.id, 'region');
            Taro.showToast({ title: '已转交区域核实', icon: 'success' });
          } else if (res.cancel && canChangeHQ) {
            markRisk(risk.id, 'headquarters');
            Taro.showToast({ title: '已提交总部回应', icon: 'success' });
          } else if (wasUnread) {
            markRisk(risk.id, 'read');
          }
        },
        fail: () => {
          if (wasUnread) markRisk(risk.id, 'read');
        }
      });
      if (wasUnread && !canChangeHQ && !canChangeRegion) {
        markRisk(risk.id, 'read');
      }
    },
    [markRisk]
  );

  const handleQuickMark = useCallback(
    (e: React.MouseEvent, id: string, type: MarkType) => {
      e.stopPropagation();
      markRisk(id, type);
      const labels = {
        read: '已标记为已读',
        headquarters: '已提交总部回应',
        region: '已转交区域核实'
      };
      Taro.showToast({ title: labels[type], icon: 'success' });
    },
    [markRisk]
  );

  const handleMarkAllRead = useCallback(() => {
    filteredRisks.forEach(r => {
      if (!r.isRead) markRisk(r.id, 'read');
    });
    Taro.showToast({ title: '已全部标记已读', icon: 'success' });
  }, [filteredRisks, markRisk]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 600);
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'high', label: '高风险' },
    { key: 'medium', label: '中风险' },
    { key: 'low', label: '低风险' }
  ];

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerRow1}>
          <Text className={styles.headerTitle}>风险提醒</Text>
          <View
            className={styles.recordsLink}
            onClick={() => Taro.navigateTo({ url: '/pages/records/index' })}
          >
            <Text>处置记录</Text>
            <Text>›</Text>
          </View>
        </View>
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

        <View className={styles.markRow}>
          <View className={classnames(styles.item, styles.hq)}>
            <Text>🏢 总部回应</Text>
            <Text className={styles.num}>{markStats.risk.headquarters}</Text>
          </View>
          <View className={classnames(styles.item, styles.rg)}>
            <Text>📍 区域核实</Text>
            <Text className={styles.num}>{markStats.risk.region}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.subscriptionArea}>
          <SubscriptionBar />
        </View>

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

        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>风险列表</Text>
          <View style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Text
              className={styles.markAll}
              style={{ color: showRead ? '#1E56A0' : '#86909C' }}
              onClick={() => setShowRead(!showRead)}
            >
              {showRead ? '隐藏已处理' : '显示全部'}
            </Text>
            <Text className={styles.markAll} onClick={handleMarkAllRead}>
              全部已读
            </Text>
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
              onClick={() => showRiskDetail(risk)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.badgeRow}>
                  <View className={classnames(styles.levelBadge, styles[risk.level])}>
                    {!risk.isRead && <View className={styles.unreadDot} />}
                    {levelLabels[risk.level]}
                  </View>
                  <View className={classnames(styles.trendBadge, risk.trend)}>
                    {trendLabels[risk.trend]}
                  </View>
                </View>
                {risk.markLabel && (
                  <View
                    className={classnames(
                      styles.markTag,
                      risk.mark === 'headquarters' && styles.markHQ,
                      risk.mark === 'region' && styles.markRegion,
                      risk.mark === 'read' && styles.markRead
                    )}
                  >
                    {risk.markLabel}
                  </View>
                )}
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
                <View className={styles.actionRow}>
                  <View
                    className={classnames(
                      styles.miniBtn,
                      styles.btnHQ,
                      risk.mark === 'headquarters' && styles.miniBtnActive
                    )}
                    onClick={(e) => handleQuickMark(e, risk.id, 'headquarters')}
                  >
                    {risk.mark === 'headquarters' ? '✓ 已交总部' : '总部回应'}
                  </View>
                  <View
                    className={classnames(
                      styles.miniBtn,
                      styles.btnRegion,
                      risk.mark === 'region' && styles.miniBtnActive
                    )}
                    onClick={(e) => handleQuickMark(e, risk.id, 'region')}
                  >
                    {risk.mark === 'region' ? '✓ 已交区域' : '区域核实'}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>🛡️</View>
            <Text className={styles.emptyTitle}>暂无匹配的风险提醒</Text>
            <Text className={styles.emptyDesc}>
              持续监测中，可调整筛选或订阅范围查看更多内容
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RiskPage;
