// src/components/SearchBarRow.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors'; // keep your own path

interface SearchBarRowProps {
  /** Placeholder text inside the input */
  placeholder?: string;
  /** Called when the whole search area is tapped */
  onSearchPress?: () => void;
  /** Called when the QR/Filter button is tapped */
  onQRPress?: () => void;
}

export const SearchBarRow: React.FC<SearchBarRowProps> = ({
  placeholder = 'Search clinic',
  onSearchPress,
  onQRPress,
}) => {
  return (
    <View style={styles.searchRow}>
      {/* SEARCH INPUT (non-editable, just a tap target) */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={onSearchPress}
        activeOpacity={0.8}
      >
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          pointerEvents="none" // blocks native editing
          // editable={false}          // optional – kept for clarity
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

/* -------------------------------------------------
   Styles – copied verbatim from your original file
   ------------------------------------------------- */
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
  qrButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
