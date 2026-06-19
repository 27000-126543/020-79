import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SentimentTag from '@/components/SentimentTag';
import { NewsItem } from '@/types';

interface NewsCardProps {
  news: NewsItem;
  showSummary?: boolean;
  onMark?: (id: string, type: 'read' | 'headquarters' | 'region') => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, showSummary = true, onMark }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    });
  };

  return (
    <View
      className={classnames(styles.newsCard, news.isRead && styles.isRead)}
      onClick={handleClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.sourceInfo}>
          <SentimentTag sentiment={news.sentiment} label={news.sentimentLabel} />
          <Text className={styles.source}>{news.source}</Text>
        </View>
        <Text className={styles.publishTime}>{news.publishTime.split(' ')[1]}</Text>
      </View>

      <Text className={styles.title}>{news.title}</Text>

      {showSummary && (
        <Text className={styles.summary}>{news.summary}</Text>
      )}

      <View className={styles.cardFooter}>
        <View className={styles.keywords}>
          {news.keywords.slice(0, 3).map((keyword, index) => (
            <Text key={index} className={styles.keywordTag}>
              {keyword}
            </Text>
          ))}
        </View>
        {news.markLabel && (
          <Text
            className={classnames(
              styles.markTag,
              news.mark === 'headquarters' && styles.markHeadquarters,
              news.mark === 'region' && styles.markRegion,
              news.mark === 'read' && styles.markRead
            )}
          >
            {news.markLabel}
          </Text>
        )}
      </View>
    </View>
  );
};

export default NewsCard;
