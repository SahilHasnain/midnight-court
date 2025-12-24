/**
 * SearchInput Component
 * 
 * Specialized input component for search functionality.
 * Features:
 * - Integrated search icon
 * - Clear button when text is present
 * - Proper focus states and accessibility
 * - Consistent styling with design system
 */

import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const SearchInput = ({
  value = '',
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    onChangeText?.('');
  };

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused,
      style
    ]}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <SearchIcon />
      </View>

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={lightColors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never" // We'll handle clear button manually
        accessibilityLabel="Search templates"
        accessibilityHint="Enter text to search templates"
        {...props}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <ClearIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Search Icon Component
const SearchIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.searchIconCircle} />
    <View style={styles.searchIconHandle} />
  </View>
);

// Clear Icon Component  
const ClearIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.clearIconLine1} />
    <View style={styles.clearIconLine2} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.background.primary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
    paddingHorizontal: spacing.md, // 16px
    minHeight: sizing.touchTarget, // 44px
  },

  containerFocused: {
    borderWidth: sizing.borderMedium, // 2px
    borderColor: lightColors.accent.gold,
    paddingHorizontal: spacing.md - 1, // Adjust for thicker border
  },

  searchIcon: {
    marginRight: spacing.sm, // 8px
  },

  input: {
    flex: 1,
    ...typography.body,
    color: lightColors.text.primary,
    paddingVertical: 0, // Remove default padding
    minHeight: 24, // Ensure proper touch target
  },

  clearButton: {
    marginLeft: spacing.sm, // 8px
    padding: spacing.xs, // 4px - increase touch area
  },

  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Search Icon Styles
  searchIconCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: lightColors.text.tertiary,
    position: 'absolute',
    top: 1,
    left: 1,
  },

  searchIconHandle: {
    width: 4,
    height: 1.5,
    backgroundColor: lightColors.text.tertiary,
    position: 'absolute',
    bottom: 1,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },

  // Clear Icon Styles
  clearIconLine1: {
    width: 10,
    height: 1.5,
    backgroundColor: lightColors.text.tertiary,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },

  clearIconLine2: {
    width: 10,
    height: 1.5,
    backgroundColor: lightColors.text.tertiary,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
});

export default SearchInput;