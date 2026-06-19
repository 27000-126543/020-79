import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import { NewsItem, MarkType } from '@/types';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const { newsList, markNews } = useAppContext();
  const [news, setNews] = useState<NewsItem | null>(null);

  const id = router.params.id;

  useEffect(() => {
    if (id) {
      const found = newsList.find(n => n.id === id);
      if (found) {
        setNews(found);
        Taro.setNavigationBarTitle({ title: found.sentimentLabel });
      }
    }
  }, [id, newsList]);

  const handleMark = useCallback((markType: MarkType) => {
    if (!news) return;
    markNews(news.id, markType);
    const labels = {
      read: '已标记为已读',
      headquarters: '已提交总部回应',
      region: '已转交区域核实'
    };
    Taro.showToast({
      title: labels[markType],
      icon: 'success'
    });
    console.log(`[DetailPage] 标记新闻 ${news.id}: ${markType}`);
  }, [news, markNews]);

  if (!news) {
    return (
      <View className={styles.pageContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.articleHeader}>
        <Text className={styles.title}>{news.title}</Text>
        <View className={styles.metaRow}>
          <View className={styles.metaLeft}>
            <Text
              className={classnames(styles.sentimentTag, styles[news.sentiment])}
            >
              {news.sentimentLabel}
            </Text>
            <Text className={styles.source}>{news.source}</Text>
          </View>
          <Text className={styles.publishTime}>{news.publishTime}</Text>
        </View>
      </View>

      <View className={styles.aiSummary}>
        <View className={styles.summaryHeader}>
          <Text className={styles.aiBadge}>AI 摘要</Text>
          <Text className={styles.summaryLabel}>智能分析</Text>
        </View>

        <View className={styles.summarySection}>
          <View className={styles.sectionTitle}>
            <View className={styles.dot} />
            <Text>核心观点</Text>
          </View>
          <Text className={styles.sectionContent}>{news.summary}</Text>
        </View>

        {(news.products.length > 0 || news.stores.length > 0) && (
          <View className={styles.summarySection}>
            <View className={styles.sectionTitle}>
              <View className={styles.dot} />
              <Text>涉及主体</Text>
            </View>
            <View className={styles.tagsList}>
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
            <View className={styles.sectionTitle}>
              <View className={styles.dot} />
              <Text>引用说法</Text>
            </View>
            <View className={styles.quotesList}>
              {news.quotes.map((quote, i) => {
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
      </View>

      <View className={styles.keywordsSection}>
        <Text className={styles.keywordsTitle}>关键词</Text>
        <View className={styles.keywordsTags}>
          {news.keywords.map((kw, i) => (
            <Text key={i} className={styles.keywordTag}>#{kw}</Text>
          ))}
        </View>
      </View>

      <View className={styles.articleContent}>
        <Text className={styles.contentTitle}>报道原文</Text>
        <Text className={styles.contentText}>{news.content}</Text>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.actionBtn, styles.btnRead)}
          onClick={() => handleMark('read')}
        >
          已读
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnHQ)}
          onClick={() => handleMark('headquarters')}
        >
          需总部回应
        </View>
        <View
          className={classnames(styles.actionBtn, styles.btnRegion)}
          onClick={() => handleMark('region')}
        >
          交区域核实
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailPage;
