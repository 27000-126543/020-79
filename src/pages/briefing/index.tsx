import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';

const LEVEL_MAP: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低'
};

const BriefingPage: React.FC = () => {
  const { getBriefing } = useAppContext();

  const briefing = useMemo(() => getBriefing(), [getBriefing]);

  const {
    positiveNews,
    neutralNews,
    potentialNegativeNews,
    ongoingNegativeNews,
    activeRisks,
    recommendations
  } = briefing;

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const renderNewsSection = (
    emoji: string,
    title: string,
    newsList: typeof positiveNews,
    itemStyle: string
  ) => (
    <View className={styles.section}>
      <View className={styles.sectionHeader}>
        <View className={styles.sectionTitle}>
          {emoji} {title}
        </View>
        <View className={styles.sectionCount}>{newsList.length} 条</View>
      </View>
      {newsList.length > 0 ? (
        newsList.map(news => (
          <View
            key={news.id}
            className={classnames(styles.newsItem, styles[itemStyle])}
            onClick={() => goDetail(news.id)}
          >
            <Text className={styles.newsTitle}>{news.title}</Text>
            <Text className={styles.newsSummary}>{news.summary}</Text>
          </View>
        ))
      ) : (
        <View className={styles.emptySection}>暂无相关报道</View>
      )}
    </View>
  );

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>今日简报</Text>
        <Text className={styles.headerSubtitle}>一页掌握今日舆情要点</Text>
      </View>

      <View className={styles.content}>
        {renderNewsSection('🟢', '正面素材', positiveNews, 'newsItemPositive')}
        {renderNewsSection('⚪', '普通报道', neutralNews, 'newsItemNeutral')}
        {renderNewsSection('🟠', '潜在负面', potentialNegativeNews, 'newsItemPotentialNegative')}
        {renderNewsSection('🔴', '持续发酵', ongoingNegativeNews, 'newsItemOngoingNegative')}

        {activeRisks.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                ⚠️ 需要跟进的风险
              </View>
              <View className={styles.sectionCount}>{activeRisks.length} 条</View>
            </View>
            {activeRisks.map(risk => (
              <View
                key={risk.id}
                className={classnames(
                  styles.riskItem,
                  risk.level === 'high' && styles.riskItemHigh,
                  risk.level === 'medium' && styles.riskItemMedium,
                  risk.level === 'low' && styles.riskItemLow
                )}
              >
                <View className={styles.riskHeader}>
                  <Text className={styles.riskTitle}>{risk.title}</Text>
                  <View
                    className={classnames(
                      styles.levelTag,
                      risk.level === 'high' && styles.levelHigh,
                      risk.level === 'medium' && styles.levelMedium,
                      risk.level === 'low' && styles.levelLow
                    )}
                  >
                    {LEVEL_MAP[risk.level]}风险
                  </View>
                </View>
                {risk.recommendation && (
                  <View className={styles.riskRecommendation}>
                    <Text>💡 {risk.recommendation}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {recommendations.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                📋 推荐口径汇总
              </View>
            </View>
            {recommendations.map((rec, idx) => (
              <View key={idx} className={styles.recommendation}>
                <View className={styles.recommendationIndex}>
                  {idx + 1}
                </View>
                <Text className={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default BriefingPage;
