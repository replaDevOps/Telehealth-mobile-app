/* components/history/HistoryTabs.tsx */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../style';

type Tab = 'consultation' | 'payment';

interface HistoryTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'consultation', label: t('consultation') },
    { key: 'payment', label: t('payment') },
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tab, activeTab === key && styles.activeTab]}
          onPress={() => onTabChange(key)}
        >
          <Text
            style={[styles.tabText, activeTab === key && styles.activeTabText]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
