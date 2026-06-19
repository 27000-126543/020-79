import React from 'react';
import { Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface SentimentTagProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  label: string;
}

const SentimentTag: React.FC<SentimentTagProps> = ({ sentiment, label }) => {
  return (
    <Text className={classnames(styles.sentimentTag, styles[sentiment])}>
      {label}
    </Text>
  );
};

export default SentimentTag;
