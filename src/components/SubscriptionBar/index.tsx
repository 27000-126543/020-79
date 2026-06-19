import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/app-context';

const categoryShort: Record<string, string> = {
  company: '品',
  product: '产',
  competitor: '竞',
  region: '区'
};

const SubscriptionBar: React.FC = () => {
  const { subscribedKeywordNames, subscribedKeywordsByCategory, keywordList } = useAppContext();

  const totalCount = keywordList.length;
  const activeCount = subscribedKeywordNames.length;

  const flatTags = useMemo(() => {
    const arr: { cat: string; name: string }[] = [];
    Object.entries(subscribedKeywordsByCategory).forEach(([cat, list]) => {
      list.slice(0, 2).forEach(k => {
        arr.push({ cat: categoryShort[cat] || cat, name: k.name });
      });
    });
    return arr;
  }, [subscribedKeywordsByCategory]);

  return (
    <View className={styles.subscriptionBar}>
      <View className={styles.barHeader}>
        <View className={styles.barTitle}>
          <View className={styles.icon}>✓</View>
          <Text>当前订阅范围</Text>
        </View>
        <Text className={styles.countLabel}>
          {activeCount}/{totalCount} 个关键词
        </Text>
      </View>
      {flatTags.length > 0 ? (
        <View className={styles.tagsWrap}>
          {flatTags.map((t, i) => (
            <View key={i} className={styles.tag}>
              <Text className={styles.cat}>{t.cat}</Text>
              <Text>{t.name}</Text>
            </View>
          ))}
          {Object.keys(subscribedKeywordsByCategory).some(
            k => subscribedKeywordsByCategory[k].length > 2
          ) && (
            <View
              className={styles.tag}
              onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}
            >
              <Text>管理…</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          className={styles.emptyHint}
          onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}
        >
          暂未订阅关键词，
          <Text className={styles.manageLink}>去我的 →</Text>
        </View>
      )}
    </View>
  );
};

export default SubscriptionBar;
