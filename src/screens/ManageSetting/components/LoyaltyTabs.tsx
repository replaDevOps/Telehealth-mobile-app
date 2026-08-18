/* components/Loyalty/LoyaltyTabs.tsx */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';

type Tab = 'consultation' | 'payment';

interface LoyaltyTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const LoyaltyTabs: React.FC<LoyaltyTabsProps> = ({
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

export const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.gray,
    borderRadius: 10,
    padding: 4,
  },
  cardContent: {
    backgroundColor: colors.gray,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.white,
  },
});
