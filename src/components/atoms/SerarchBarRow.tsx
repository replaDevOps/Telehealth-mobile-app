import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';

interface SearchBarRowProps {
  placeholder?: string;

  onSearchPress?: () => void;
}

export const SearchBarRow: React.FC<SearchBarRowProps> = ({
  placeholder = 'Search clinic',
  onSearchPress,
}) => {
  return (
    <View style={styles.searchRow}>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={onSearchPress}
        activeOpacity={0.8}
      >
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onChangeText={onSearchPress}
        />
        <Ionicons
          name="search"
          size={22}
          color={colors.black}
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
});
