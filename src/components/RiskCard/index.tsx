import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { RiskItem } from '@/types';

interface RiskCardProps {
  risk: RiskItem;
  onClick?: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ risk, onClick }) => {
  const levelLabels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  };

  const trendLabels = {
    up: '↑ 上升',
    down: '↓ 下降',
    stable: '— 平稳'
  };

  return (
    <View
      className={classnames(
        styles.riskCard,
        styles[`${risk.level}Level`],
        risk.isRead && styles.isRead
      )}
      onClick={onClick}
    >
      <View className={styles.cardHeader}>
        <View className={classnames(styles.levelBadge, styles[risk.level])}>
          {levelLabels[risk.level]}
        </View>
        <View className={classnames(styles.trendTag, risk.trend)}>
          <Text className={styles.trendIcon}>{trendLabels[risk.trend]}</Text>
        </View>
      </View>

      <Text className={styles.title}>{risk.title}</Text>

      <Text className={styles.changeType}>{risk.changeType}</Text>

      <Text className={styles.description}>{risk.description}</Text>

      <View className={styles.cardFooter}>
        <Text className={styles.newsCount}>
          相关报道 <Text className={styles.count}>{risk.newsCount}</Text> 篇
        </Text>
        <Text className={styles.updateTime}>{risk.updateTime}</Text>
      </View>
    </View>
  );
};

export default RiskCard;
