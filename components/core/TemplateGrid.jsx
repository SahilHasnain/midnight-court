/**
 * TemplateGrid Component
 * 
 * Responsive masonry layout for template selection with improved discoverability.
 * Features:
 * - Adaptive grid that responds to screen sizes
 * - TemplateCard components with preview thumbnails
 * - Proper spacing and visual hierarchy
 * - Template metadata display with clean typography
 */

import { Dimensions, StyleSheet, View } from 'react-native';
import { spacing } from '../../theme/designSystem';
import TemplateCard from './TemplateCard';

const { width: screenWidth } = Dimensions.get('window');

const TemplateGrid = ({ 
  templates = [], 
  onTemplateSelect, 
  onTemplatePreview,
  onTemplateDelete,
  style,
  numColumns = null // Auto-calculate if not provided
}) => {
  // Calculate responsive columns based on screen width
  const getColumnCount = () => {
    if (numColumns) return numColumns;
    
    if (screenWidth >= 1024) return 3; // Desktop: 3 columns
    if (screenWidth >= 768) return 2;  // Tablet: 2 columns
    return 1; // Mobile: 1 column
  };

  const columnCount = getColumnCount();
  const cardWidth = (screenWidth - (spacing.lg * 2) - (spacing.md * (columnCount - 1))) / columnCount;

  // Organize templates into columns for masonry layout
  const organizeIntoColumns = (items) => {
    const columns = Array.from({ length: columnCount }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(item);
    });
    
    return columns;
  };

  const columns = organizeIntoColumns(templates);

  const renderColumn = (columnItems, columnIndex) => (
    <View key={columnIndex} style={[styles.column, { width: cardWidth }]}>
      {columnItems.map((template, itemIndex) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPress={() => onTemplateSelect?.(template)}
          onPreview={() => onTemplatePreview?.(template)}
          onDelete={() => onTemplateDelete?.(template)}
          style={[
            styles.templateCard,
            itemIndex > 0 && { marginTop: spacing.md }
          ]}
        />
      ))}
    </View>
  );

  if (templates.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.emptyState}>
          {/* Empty state will be handled by parent component */}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {columns.map((columnItems, columnIndex) => 
          renderColumn(columnItems, columnIndex)
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, // 24px
  },

  column: {
    flex: 0,
  },

  templateCard: {
    // Individual card styling handled by TemplateCard component
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl, // 48px
  },

  emptyState: {
    // Empty state styling handled by parent component
  },
});

export default TemplateGrid;