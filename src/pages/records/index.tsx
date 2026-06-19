import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import { MarkType, MarkCategory, MarkedRecord } from '@/types';

type FilterMark = MarkType | 'all';
type FilterCategory = MarkCategory | 'all';

const RecordsPage: React.FC = () => {
  const { getMarkedRecords, getMarkStats } = useAppContext();
  const [filterMark, setFilterMark] = useState<FilterMark>('all');
  const [filterCat, setFilterCat] = useState<FilterCategory>('all');

  const stats = getMarkStats();

  const allRecords = useMemo(() => getMarkedRecords('all'), [getMarkedRecords]);

  const filtered = useMemo(() => {
    let list = allRecords;
    if (filterMark !== 'all') list = list.filter(r => r.mark === filterMark);
    if (filterCat !== 'all') list = list.filter(r => r.category === filterCat);
    return list;
  }, [allRecords, filterMark, filterCat]);

  const counts = useMemo(() => {
    const total = allRecords.length;
    const read = allRecords.filter(r => r.mark === 'read').length;
    const hq = allRecords.filter(r => r.mark === 'headquarters').length;
    const rg = allRecords.filter(r => r.mark === 'region').length;
    return { total, read, hq, rg };
  }, [allRecords]);

  const markFilters: { key: FilterMark; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'read', label: '已读' },
    { key: 'headquarters', label: '总部回应' },
    { key: 'region', label: '区域核实' }
  ];

  const catFilters: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: '全部类型' },
    { key: 'news', label: '报道处置' },
    { key: 'risk', label: '风险处置' }
  ];

  const getFilterCount = (k: FilterMark): number => {
    if (k === 'all') return counts.total;
    return counts[k as 'read' | 'hq' | 'rg'];
  };

  const handleView = useCallback((rec: MarkedRecord) => {
    const realId = rec.id.replace(/^[nr]-/, '');
    if (rec.category === 'news') {
      Taro.navigateTo({ url: `/pages/detail/index?id=${realId}` });
    } else {
      const statusText = rec.markLabel ? `\n\n【处置状态】${rec.markLabel}` : '';
      const levelLabel = rec.level === 'high' ? '高风险' : rec.level === 'medium' ? '中风险' : '低风险';
      Taro.showModal({
        title: `${levelLabel} · ${rec.source || ''}`,
        content: (rec.summary || '') + statusText,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  }, []);

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>处置记录</Text>
        <Text className={styles.headerDesc}>今日已处理报道与风险，方便会后复盘</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.num}>{stats.total.read}</Text>
            <Text className={styles.lbl}>已读</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.num}>{stats.total.headquarters}</Text>
            <Text className={styles.lbl}>总部回应</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.num}>{stats.total.region}</Text>
            <Text className={styles.lbl}>区域核实</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.filterTabs}>
          {markFilters.map(f => (
            <View
              key={f.key}
              className={classnames(styles.tabItem, filterMark === f.key && styles.active)}
              onClick={() => setFilterMark(f.key)}
            >
              {f.label}
              <Text className={styles.cnt}>{getFilterCount(f.key)}</Text>
            </View>
          ))}
        </View>

        <View className={styles.categoryBar}>
          {catFilters.map(f => (
            <View
              key={f.key}
              className={classnames(styles.catTag, filterCat === f.key && styles.active)}
              onClick={() => setFilterCat(f.key)}
            >
              {f.label}
            </View>
          ))}
        </View>

        <View className={styles.listHeader}>
          <Text className={styles.title}>记录列表</Text>
          <Text className={styles.count}>共 {filtered.length} 条</Text>
        </View>

        {filtered.length > 0 ? (
          filtered.map(rec => (
            <View
              key={rec.id}
              className={classnames(
                styles.recordCard,
                rec.category === 'news' ? styles.cardNews : styles.cardRisk
              )}
              onClick={() => handleView(rec)}
            >
              <View className={styles.cardTop}>
                <View
                  className={classnames(
                    styles.cardType,
                    rec.category === 'news' ? styles.typeNews : styles.typeRisk
                  )}
                >
                  {rec.category === 'news' ? '📰 报道' : '⚠️ 风险'}
                </View>
                <View
                  className={classnames(
                    styles.cardMark,
                    rec.mark === 'headquarters' && styles.markHQ,
                    rec.mark === 'region' && styles.markRegion,
                    rec.mark === 'read' && styles.markRead
                  )}
                >
                  {rec.markLabel}
                </View>
              </View>

              <Text className={styles.cardTitle}>{rec.title}</Text>

              <View className={styles.cardMeta}>
                {rec.sentimentLabel && (
                  <View
                    className={classnames(
                      styles.sentimentTag,
                      rec.sentiment === 'positive' && styles.positive,
                      rec.sentiment === 'neutral' && styles.neutral,
                      rec.sentiment === 'negative' && styles.negative
                    )}
                  >
                    {rec.sentimentLabel}
                  </View>
                )}
                {rec.level && (
                  <View
                    className={classnames(
                      styles.levelTag,
                      rec.level === 'high' && styles.high,
                      rec.level === 'medium' && styles.medium,
                      rec.level === 'low' && styles.low
                    )}
                  >
                    {rec.level === 'high' ? '高风险' : rec.level === 'medium' ? '中风险' : '低风险'}
                  </View>
                )}
                {rec.source && <Text className={styles.sourceTxt}>{rec.source}</Text>}
                <Text className={styles.timeTxt}>{rec.time}</Text>
              </View>

              {rec.summary && (
                <Text className={styles.summaryTxt}>{rec.summary}</Text>
              )}

              {rec.keywords.length > 0 && (
                <View className={styles.kwWrap}>
                  {rec.keywords.slice(0, 4).map((k, i) => (
                    <Text key={i} className={styles.kw}>#{k}</Text>
                  ))}
                </View>
              )}

              <View className={styles.cardFooter}>
                <View className={styles.viewLink}>
                  <Text>查看{rec.category === 'news' ? '原文' : '详情'}</Text>
                  <Text>›</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.icon}>📝</View>
            <Text className={styles.t}>暂无处置记录</Text>
            <Text className={styles.d}>
              处理报道或风险后，记录会出现在这里。可按标记类型筛选，方便会后复盘。
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
