import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';

const MinePage: React.FC = () => {
  const { keywordList, toggleKeyword, getMarkStats, getMarkedRecords, presetList, savePreset, applyPreset, deletePreset } = useAppContext();

  const [showSaveInput, setShowSaveInput] = useState(false);
  const [presetName, setPresetName] = useState('');

  const markStats = useMemo(() => getMarkStats().total, [getMarkStats]);

  const recordsCount = useMemo(() => getMarkedRecords().length, [getMarkedRecords]);

  const keywordCategories = useMemo(() => [
    {
      key: 'company',
      label: '公司品牌',
      keywords: keywordList.filter(k => k.category === 'company')
    },
    {
      key: 'product',
      label: '产品线',
      keywords: keywordList.filter(k => k.category === 'product')
    },
    {
      key: 'competitor',
      label: '竞  品',
      keywords: keywordList.filter(k => k.category === 'competitor')
    },
    {
      key: 'region',
      label: '区  域',
      keywords: keywordList.filter(k => k.category === 'region')
    }
  ], [keywordList]);

  const handleToggleKeyword = useCallback((id: string) => {
    toggleKeyword(id);
  }, [toggleKeyword]);

  const handleMenuClick = useCallback((menuName: string, route?: string) => {
    if (route) {
      Taro.navigateTo({ url: route });
      return;
    }
    Taro.showToast({
      title: `${menuName}功能开发中`,
      icon: 'none'
    });
  }, []);

  const menuItems = [
    {
      icon: '📋',
      label: '处置记录',
      badge: recordsCount > 0 ? String(recordsCount) : null,
      highlight: true,
      route: '/pages/records/index'
    },
    { icon: '📊', label: '数据报表', badge: null },
    { icon: '🔔', label: '消息通知', badge: '3' },
    { icon: '📱', label: '账号设置', badge: null },
    { icon: '❓', label: '帮助中心', badge: null },
    { icon: 'ℹ️', label: '关于我们', badge: null }
  ];

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>张</View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>张明华</Text>
            <Text className={styles.userRole}>品牌负责人</Text>
            <Text className={styles.userRegion}>华东区域</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>今日处理统计</Text>
        <View className={styles.statsGrid}>
          <View className={classnames(styles.statItem, styles.statRead)}>
            <Text className={styles.number}>{markStats.read}</Text>
            <Text className={styles.label}>已读</Text>
          </View>
          <View className={classnames(styles.statItem, styles.statHQ)}>
            <Text className={styles.number}>{markStats.headquarters}</Text>
            <Text className={styles.label}>需总部回应</Text>
          </View>
          <View className={classnames(styles.statItem, styles.statRegion)}>
            <Text className={styles.number}>{markStats.region}</Text>
            <Text className={styles.label}>交区域核实</Text>
          </View>
        </View>
      </View>

      <View className={styles.presetSection}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionIcon} />
            <Text>订阅方案</Text>
          </View>
          <Text
            className={styles.sectionAction}
            onClick={() => setShowSaveInput(!showSaveInput)}
          >
            {showSaveInput ? '取消' : '保存当前'}
          </Text>
        </View>

        {showSaveInput && (
          <View className={styles.saveRow}>
            <Input
              className={styles.saveInput}
              placeholder="输入方案名称，如：华东质量"
              value={presetName}
              onInput={(e) => setPresetName((e as any).detail.value || '')}
            />
            <View
              className={styles.saveBtn}
              onClick={() => {
                if (presetName.trim()) {
                  savePreset(presetName.trim());
                  setPresetName('');
                  setShowSaveInput(false);
                  Taro.showToast({ title: '方案已保存', icon: 'success' });
                }
              }}
            >
              保存
            </View>
          </View>
        )}

        {presetList.length > 0 ? (
          <View className={styles.presetList}>
            {presetList.map(p => (
              <View key={p.id} className={styles.presetItem}>
                <View className={styles.presetInfo} onClick={() => {
                  applyPreset(p.id);
                  Taro.showToast({ title: `已切换到"${p.name}"`, icon: 'success' });
                }}>
                  <Text className={styles.presetName}>{p.name}</Text>
                  <Text className={styles.presetCount}>{p.keywordIds.length}个关键词</Text>
                </View>
                <View
                  className={styles.presetDel}
                  onClick={() => {
                    deletePreset(p.id);
                    Taro.showToast({ title: '已删除', icon: 'success' });
                  }}
                >
                  ✕
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className={styles.presetEmpty}>暂无保存的方案，可点击"保存当前"将当前订阅组合存为方案</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionIcon} />
            <Text>关键词订阅</Text>
          </View>
          <Text className={styles.sectionAction}>管理</Text>
        </View>

        {keywordCategories.map(category => (
          <View key={category.key} className={styles.categoryGroup}>
            <View className={styles.categoryTitle}>
              <Text>{category.label}</Text>
              <Text className={styles.count}>
                已订阅 {category.keywords.filter(k => k.isSubscribed).length}/{category.keywords.length}
              </Text>
            </View>
            <View className={styles.tagsRow}>
              {category.keywords.map(kw => (
                <View
                  key={kw.id}
                  className={classnames(styles.tagItem, kw.isSubscribed && styles.active)}
                  onClick={() => handleToggleKeyword(kw.id)}
                >
                  {kw.name}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.menuList}>
        {menuItems.map((item: any, index) => (
          <View
            key={index}
            className={classnames(styles.menuItem, item.highlight && styles.menuHighlight)}
            onClick={() => handleMenuClick(item.label, item.route)}
          >
            <View className={styles.menuLeft}>
              <View className={classnames(styles.menuIcon, item.highlight && styles.menuIconHighlight)}>{item.icon}</View>
              <Text className={styles.menuText}>{item.label}</Text>
            </View>
            <View>
              {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;
