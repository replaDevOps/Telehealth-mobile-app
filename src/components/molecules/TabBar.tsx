import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';

export interface TabItem {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: (TabItem | string)[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => {
        const key = typeof tab === 'string' ? tab : tab.key;
        const label = typeof tab === 'string' ? tab : tab.label;
        const isActive = activeTab === key;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, isActive && styles.activeTabText]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray,
    padding: 4,
    borderRadius: 10,
    marginHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: colors.secondaryText,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
});
