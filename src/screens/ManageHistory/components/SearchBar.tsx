/* components/history/SearchBar.tsx */
import React from 'react';
import { View, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { styles } from '../style';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={colors.secondaryText} />
      <TextInput
        style={styles.searchInput}
        placeholder={t('search_doctor_clinic')}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};
