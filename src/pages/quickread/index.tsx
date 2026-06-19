import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SentimentTag from '@/components/SentimentTag';
import { useAppContext } from '@/store/app-context';
import { SentimentType, MarkType } from '@/types';

type FilterType = 'all' | SentimentType;

const QuickReadPage: React.FC = () => {
  const { newsList, markNews } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');

  const filters = [
    { key: 'all' as FilterType, label: '全部报道' },
    { key: 'positive' as FilterType, label: '正面宣传' },
    { key: 'neutral' as FilterType, label: '普通报道' },
    { key: 'negative' as FilterType, label: '负面预警' }
  ];

  const filteredNews = useMemo(() => {
    if (filter === 'all') return newsList;
    return newsList.filter(n => n.sentiment === filter);
  }, [newsList, filter]);

  const handleMark = useCallback((id: string, markType: MarkType) => {
    markNews(id, markType);
    const labels = {
      read: '已标记为已读',
      headquarters: '已提交总部回应',
      region: '已转交区域核实'
    };
    Taro.showToast({
      title: labels[markType],
      icon: 'success'
    });
  }, [markNews]);

  const handleViewDetail = useCallback((id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  }, []);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTitle}>
          <Text className={styles.title}>媒体快读</Text>
          <Text className={styles.aiBadge}>AI 摘要</Text>
        </View>
        <Text className={styles.headerDesc}>智能提炼核心观点，快速把握报道脉络</Text>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {filters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterTag, filter === f.key && styles.active)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.listContainer}>
        {filteredNews.length > 0 ? (
          filteredNews.map(news => (
            <View
              key={news.id}
              className={classnames(styles.summaryCard, news.isRead && styles.isRead)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.sourceInfo}>
                  <SentimentTag sentiment={news.sentiment} label={news.sentimentLabel} />
                  <Text className={styles.source}>{news.source}</Text>
                  <Text className={styles.time}>{news.publishTime}</Text>
                </View>
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
                      <Text key={`p-${i}`} className={styles.tagItem}>{p}</Text>
                    ))}
                    {news.stores.map((s, i) => (
                      <Text key={`s-${i}`} className={styles.tagItem}>{s}</Text>
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
                <View className={styles.footerLeft}>
                  <View
                    className={classnames(styles.actionBtn, styles.btnRead)}
                    onClick={() => handleMark(news.id, 'read')}
                  >
                    已读
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.btnHQ)}
                    onClick={() => handleMark(news.id, 'headquarters')}
                  >
                    总部回应
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.btnRegion)}
                    onClick={() => handleMark(news.id, 'region')}
                  >
                    区域核实
                  </View>
                </View>
                <View
                  className={styles.detailLink}
                  onClick={() => handleViewDetail(news.id)}
                >
                  详情 →
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无相关报道</Text>
          </View>
        )}

        {filteredNews.length > 0 && (
          <View className={styles.bottomTip}>
            <Text>AI 摘要仅供参考，请阅读原文了解详情</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuickReadPage;
