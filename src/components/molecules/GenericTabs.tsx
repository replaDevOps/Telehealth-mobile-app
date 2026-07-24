import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';

export interface TabItem<T extends string> {
  key: T;
  label: string;
}

interface GenericTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  translateLabels?: boolean;
}

export const GenericTabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  translateLabels = true,
}: GenericTabsProps<T>) => {
  const { t } = useTranslation();

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
          >
            {translateLabels ? t(label) : label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});
