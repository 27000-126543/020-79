import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SentimentTag from '@/components/SentimentTag';
import SubscriptionBar from '@/components/SubscriptionBar';
import { useAppContext } from '@/store/app-context';
import { SentimentType, MarkType, SortMode, SceneMode, NewsItem } from '@/types';

type FilterType = 'all' | SentimentType;

const QuickReadPage: React.FC = () => {
  const {
    newsList,
    markNews,
    filterNewsByKeywords,
    sortNews,
    sortNewsByScene,
    subscribedKeywordNames
  } = useAppContext();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [sceneMode, setSceneMode] = useState<SceneMode>('meeting');

  const baseList = useMemo(
    () => filterNewsByKeywords(newsList),
    [newsList, filterNewsByKeywords]
  );

  const filteredList = useMemo(() => {
    let list = baseList;
    if (filter !== 'all') list = list.filter(n => n.sentiment === filter);
    if (sortMode === 'time') return sortNews(list, 'time');
    return sortNewsByScene(list, sceneMode);
  }, [baseList, filter, sortMode, sortNews, sortNewsByScene, sceneMode]);

  const counts = useMemo(() => {
    const total = baseList.length;
    const pos = baseList.filter(n => n.sentiment === 'positive').length;
    const neu = baseList.filter(n => n.sentiment === 'neutral').length;
    const neg = baseList.filter(n => n.sentiment === 'negative').length;
    const unread = baseList.filter(n => !n.isRead).length;
    const priority = baseList.filter(n => {
      const isNeg = n.sentiment === 'negative';
      const isUrgent = ['潜在负面', '持续发酵', '竞品对比', '竞品动态'].some(t =>
        n.keywords.some(k => k.includes(t)) || t === n.sentimentLabel
      );
      return !n.isRead || isNeg || isUrgent;
    }).length;
    return { total, positive: pos, neutral: neu, negative: neg, unread, priority };
  }, [baseList]);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'negative', label: '负面预警' },
    { key: 'neutral', label: '普通报道' },
    { key: 'positive', label: '正面宣传' }
  ];

  const isPriorityItem = useCallback((n: NewsItem, idx: number): boolean => {
    if (sortMode !== 'priority') return false;
    const isNeg = n.sentiment === 'negative';
    const isUrgent = ['潜在负面', '持续发酵', '竞品对比', '竞品动态'].some(
      t => n.keywords.some(k => k.includes(t)) || t === n.sentimentLabel
    );
    return (!n.isRead || isNeg || isUrgent) && idx < Math.min(5, counts.priority);
  }, [sortMode, counts.priority]);

  const handleMark = useCallback(
    (e: React.MouseEvent, id: string, markType: MarkType) => {
      e.stopPropagation();
      markNews(id, markType);
      const labels = {
        read: '已标记为已读',
        headquarters: '已提交总部回应',
        region: '已转交区域核实'
      };
      Taro.showToast({ title: labels[markType], icon: 'success' });
    },
    [markNews]
  );

  const goDetail = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
    },
    []
  );

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 600);
  });

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTitleRow}>
          <View className={styles.headerTitle}>
            <Text className={styles.title}>媒体快读</Text>
            <Text className={styles.aiBadge}>AI 摘要</Text>
          </View>
          <View
            className={styles.recordsLink}
            onClick={() => Taro.navigateTo({ url: '/pages/records/index' })}
          >
            <Text>处置记录</Text>
            <Text>›</Text>
          </View>
        </View>
        <Text className={styles.headerDesc}>
          智能提炼核心观点，{counts.unread} 条未读 · 共 {counts.total} 条报道
        </Text>

        <View className={styles.modeSwitch}>
          <View
            className={classnames(styles.modeItem, sortMode === 'priority' && styles.active)}
            onClick={() => setSortMode('priority')}
          >
            <View className={classnames(styles.flag, styles.high)} />
            <Text>今日重点</Text>
          </View>
          <View
            className={classnames(styles.modeItem, sortMode === 'time' && styles.active)}
            onClick={() => setSortMode('time')}
          >
            <View className={classnames(styles.flag, styles.time)} />
            <Text>按时间</Text>
          </View>
        </View>

        <View className={styles.sceneSwitch}>
          {([
            { key: 'meeting' as SceneMode, label: '🤝 客户会谈' },
            { key: 'exhibition' as SceneMode, label: '🎪 展会巡场' },
            { key: 'store' as SceneMode, label: '🏪 门店事件' }
          ]).map(s => (
            <View
              key={s.key}
              className={classnames(styles.sceneTag, sceneMode === s.key && styles.sceneActive)}
              onClick={() => setSceneMode(s.key)}
            >
              <Text>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.subscriptionWrap}>
        <SubscriptionBar />
      </View>

      {sortMode === 'priority' && counts.priority > 0 && (
        <View className={styles.sortHint}>
          <View className={styles.dot} />
          <Text>
            {sceneMode === 'meeting' && '已优先展示正面素材与竞品动态'}
            {sceneMode === 'exhibition' && '已优先展示新品发布与行业趋势'}
            {sceneMode === 'store' && '已优先展示风险预警与区域动态'}
          </Text>
        </View>
      )}

      <View className={styles.filterBar}>
        <ScrollView scrollX className={styles.inner}>
          {filterOptions.map(f => (
            <View
              key={f.key}
              className={classnames(styles.filterTag, filter === f.key && styles.active)}
              onClick={() => setFilter(f.key)}
            >
              <Text>{f.label}</Text>
              <Text className={styles.cnt}>
                {f.key === 'all'
                  ? counts.total
                  : counts[f.key as 'positive' | 'neutral' | 'negative']}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.listContainer}>
        {filteredList.length > 0 ? (
          filteredList.map((news, idx) => (
            <View
              key={news.id}
              className={classnames(
                styles.summaryCard,
                isPriorityItem(news, idx) && styles.priorityCard,
                news.isRead && styles.isRead
              )}
              onClick={(e) => goDetail(e, news.id)}
            >
              {isPriorityItem(news, idx) && (
                <View className={styles.priorityBadge}>重点</View>
              )}

              <View className={styles.cardHeader}>
                <View className={styles.sourceInfo}>
                  <SentimentTag sentiment={news.sentiment} label={news.sentimentLabel} />
                  <Text className={styles.source}>{news.source}</Text>
                  <Text className={styles.time}>{news.publishTime}</Text>
                </View>
                {news.markLabel && (
                  <View
                    className={classnames(
                      styles.markStatus,
                      news.mark === 'headquarters' && styles.markHQ,
                      news.mark === 'region' && styles.markRegion,
                      news.mark === 'read' && styles.markRead
                    )}
                  >
                    {news.markLabel}
                  </View>
                )}
              </View>

              <Text className={styles.summaryTitle}>{news.title}</Text>

              <View className={styles.summarySection}>
                <View className={styles.sectionLabel}>
                  <View className={styles.labelIcon} />
                  <Text>核心观点</Text>
                </View>
                <Text className={styles.sectionContent}>{news.summary}</Text>
              </View>

              {(news.products.length > 0 || news.stores.length > 0) && (
                <View className={styles.summarySection}>
                  <View className={styles.sectionLabel}>
                    <View className={styles.labelIcon} />
                    <Text>涉及主体</Text>
                  </View>
                  <View className={styles.tagsRow}>
                    {news.products.map((p, i) => (
                      <Text key={`p-${i}`} className={styles.tagItem}>
                        {p}
                      </Text>
                    ))}
                    {news.stores.map((s, i) => (
                      <Text key={`s-${i}`} className={styles.tagItem}>
                        {s}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {news.quotes.length > 0 && (
                <View className={styles.summarySection}>
                  <View className={styles.sectionLabel}>
                    <View className={styles.labelIcon} />
                    <Text>引用说法</Text>
                  </View>
                  <View className={styles.quotesList}>
                    {news.quotes.slice(0, 2).map((quote, i) => {
                      const parts = quote.split('：');
                      return (
                        <View key={i} className={styles.quoteItem}>
                          {parts.length > 1 ? (
                            <>
                              <Text>{parts[1]}</Text>
                              <Text className={styles.quoteSource}>—— {parts[0]}</Text>
                            </>
                          ) : (
                            <Text>{quote}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              <View className={styles.cardFooter}>
                <View className={styles.footerBtns}>
                  <View
                    className={classnames(styles.actBtn, styles.btnRead)}
                    onClick={(e) => handleMark(e, news.id, 'read')}
                  >
                    已读
                  </View>
                  <View
                    className={classnames(styles.actBtn, styles.btnHQ)}
                    onClick={(e) => handleMark(e, news.id, 'headquarters')}
                  >
                    总部回应
                  </View>
                  <View
                    className={classnames(styles.actBtn, styles.btnRegion)}
                    onClick={(e) => handleMark(e, news.id, 'region')}
                  >
                    区域核实
                  </View>
                </View>
                <View
                  className={styles.detailBtn}
                  onClick={(e) => goDetail(e, news.id)}
                >
                  <Text>详情</Text>
                  <Text>→</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📖</View>
            <Text className={styles.emptyTitle}>
              {subscribedKeywordNames.length === 0
                ? '请先订阅关键词'
                : '暂无匹配当前筛选的报道'}
            </Text>
            <Text className={styles.emptyDesc}>
              调整筛选条件或订阅更多关键词查看更多内容
            </Text>
          </View>
        )}

        {filteredList.length > 0 && (
          <View className={styles.bottomTip}>
            AI 摘要仅供参考，请阅读原文了解详情
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default QuickReadPage;
