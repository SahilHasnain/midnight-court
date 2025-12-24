/**
 * FilterBar Component
 * 
 * Search and filtering interface for template selection.
 * Features:
 * - SearchInput component for template search functionality
 * - Filter chips for template categories (quick, full, custom)
 * - Clear visual feedback for active filters
 * - Keyboard navigation and accessibility compliance
 */

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';
import SearchInput from './SearchInput';

const FilterBar = ({
  searchQuery = '',
  onSearchChange,
  activeFilters = [],
  onFilterChange,
  availableFilters = [
    { id: 'quick', label: 'Quick Start', count: 0 },
    { id: 'full', label: 'Full Presentation', count: 0 },
    { id: 'custom', label: 'Custom', count: 0 }
  ],
  style
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const handleFilterToggle = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId];
    
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange?.([]);
    onSearchChange?.('');
  };

  const hasActiveFilters = activeFilters.length > 0 || searchQuery.length > 0;

  return (
    <View style={[styles.container, style]}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search templates..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={[
            styles.searchInput,
            searchFocused && styles.searchInputFocused
          ]}
        />
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterChips}>
          {availableFilters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive
                ]}
                onPress={() => handleFilterToggle(filter.id)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter.label}`}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
                
                {filter.count > 0 && (
                  <View style={[
                    styles.filterChipBadge,
                    isActive && styles.filterChipBadgeActive
                  ]}>
                    <Text style={[
                      styles.filterChipBadgeText,
                      isActive && styles.filterChipBadgeTextActive
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>
            {activeFilters.length > 0 && (
              `${activeFilters.length} filter${activeFilters.length !== 1 ? 's' : ''} active`
            )}
            {activeFilters.length > 0 && searchQuery.length > 0 && ' • '}
            {searchQuery.length > 0 && (
              `Searching for "${searchQuery}"`
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.background.secondary,
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
  },

  searchSection: {
    paddingHorizontal: spacing.lg, // 24px
    paddingTop: spacing.md, // 16px
    paddingBottom: spacing.sm, // 8px
  },

  searchInput: {
    // Styling handled by SearchInput component
  },

  searchInputFocused: {
    // Additional focus styling if needed
  },

  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 24px
    paddingBottom: spacing.md, // 16px
  },

  filterChips: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm, // 8px
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm, // 8px
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusMd, // 8px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.primary,
    minHeight: sizing.touchTarget - 12, // 32px (smaller than full touch target)
  },

  filterChipActive: {
    backgroundColor: lightColors.accent.goldLight,
    borderColor: lightColors.accent.gold,
  },

  filterChipText: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    fontWeight: '500',
  },

  filterChipTextActive: {
    color: lightColors.accent.gold,
    fontWeight: '600',
  },

  filterChipBadge: {
    marginLeft: spacing.xs, // 4px
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: sizing.radiusSm, // 6px
    backgroundColor: lightColors.background.tertiary,
    minWidth: 18,
    alignItems: 'center',
  },

  filterChipBadgeActive: {
    backgroundColor: lightColors.accent.gold,
  },

  filterChipBadgeText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
  },

  filterChipBadgeTextActive: {
    color: lightColors.background.primary,
  },

  clearButton: {
    paddingHorizontal: spacing.sm, // 8px
    paddingVertical: spacing.xs, // 4px
    marginLeft: spacing.sm,
  },

  clearButtonText: {
    ...typography.bodySmall,
    color: lightColors.accent.gold,
    fontWeight: '600',
  },

  summarySection: {
    paddingHorizontal: spacing.lg, // 24px
    paddingBottom: spacing.sm, // 8px
  },

  summaryText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontStyle: 'italic',
  },
});

export default FilterBar;