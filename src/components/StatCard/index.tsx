import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  number: number;
  label: string;
  type: 'total' | 'positive' | 'neutral' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ number, label, type }) => {
  return (
    <View className={classnames(styles.statCard, styles[type])}>
      <Text className={styles.number}>{number}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
