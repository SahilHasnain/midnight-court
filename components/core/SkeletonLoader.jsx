/**
 * SkeletonLoader Component
 * 
 * Smooth loading states and skeleton screens for template loading.
 * Features:
 * - Animated skeleton placeholders
 * - Multiple skeleton variants (card, list, grid)
 * - Consistent with design system
 * - Accessibility support
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { lightColors, sizing, spacing } from '../../theme/designSystem';

const SkeletonLoader = ({ 
  variant = 'card', // 'card', 'list', 'grid', 'text'
  count = 1,
  style,
  ...props 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard opacity={opacity} />;
      case 'list':
        return <SkeletonList opacity={opacity} />;
      case 'grid':
        return <SkeletonGrid opacity={opacity} />;
      case 'text':
        return <SkeletonText opacity={opacity} />;
      default:
        return <SkeletonCard opacity={opacity} />;
    }
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={index > 0 && styles.itemSpacing}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
};

// Skeleton Card (for template cards)
const SkeletonCard = ({ opacity }) => (
  <View style={styles.skeletonCard}>
    {/* Preview Area */}
    <Animated.View style={[styles.skeletonPreview, { opacity }]} />
    
    {/* Content Area */}
    <View style={styles.skeletonCardContent}>
      {/* Title */}
      <Animated.View style={[styles.skeletonTitle, { opacity }]} />
      
      {/* Description Lines */}
      <Animated.View style={[styles.skeletonDescription, { opacity }]} />
      <Animated.View style={[styles.skeletonDescriptionShort, { opacity }]} />
      
      {/* Metadata Row */}
      <View style={styles.skeletonMetadataRow}>
        <Animated.View style={[styles.skeletonMetadata, { opacity }]} />
        <Animated.View style={[styles.skeletonBadge, { opacity }]} />
      </View>
    </View>
  </View>
);

// Skeleton List (for search results)
const SkeletonList = ({ opacity }) => (
  <View style={styles.skeletonListItem}>
    <Animated.View style={[styles.skeletonListIcon, { opacity }]} />
    <View style={styles.skeletonListContent}>
      <Animated.View style={[styles.skeletonListTitle, { opacity }]} />
      <Animated.View style={[styles.skeletonListDescription, { opacity }]} />
    </View>
  </View>
);

// Skeleton Grid (for filter chips)
const SkeletonGrid = ({ opacity }) => (
  <View style={styles.skeletonGridContainer}>
    <Animated.View style={[styles.skeletonChip, { opacity }]} />
    <Animated.View style={[styles.skeletonChip, { opacity }]} />
    <Animated.View style={[styles.skeletonChipSmall, { opacity }]} />
  </View>
);

// Skeleton Text (for loading text content)
const SkeletonText = ({ opacity }) => (
  <View style={styles.skeletonTextContainer}>
    <Animated.View style={[styles.skeletonTextLine, { opacity }]} />
    <Animated.View style={[styles.skeletonTextLine, { opacity }]} />
    <Animated.View style={[styles.skeletonTextLineShort, { opacity }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    // Container styling handled by parent
  },

  itemSpacing: {
    marginTop: spacing.md, // 16px
  },

  // Skeleton Card Styles
  skeletonCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    overflow: 'hidden',
  },

  skeletonPreview: {
    height: 120, // 4:3 aspect ratio approximation
    backgroundColor: lightColors.background.tertiary,
  },

  skeletonCardContent: {
    padding: spacing.md, // 16px
  },

  skeletonTitle: {
    height: 20,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
    marginBottom: spacing.sm, // 8px
  },

  skeletonDescription: {
    height: 14,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
    marginBottom: spacing.xs, // 4px
  },

  skeletonDescriptionShort: {
    height: 14,
    width: '70%',
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
    marginBottom: spacing.sm, // 8px
  },

  skeletonMetadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  skeletonMetadata: {
    height: 12,
    width: 80,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
  },

  skeletonBadge: {
    height: 20,
    width: 60,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusSm, // 6px
  },

  // Skeleton List Styles
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md, // 16px
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusMd, // 8px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
  },

  skeletonListIcon: {
    width: 40,
    height: 40,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
    marginRight: spacing.md, // 16px
  },

  skeletonListContent: {
    flex: 1,
  },

  skeletonListTitle: {
    height: 18,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
    marginBottom: spacing.xs, // 4px
  },

  skeletonListDescription: {
    height: 14,
    width: '80%',
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
  },

  // Skeleton Grid Styles
  skeletonGridContainer: {
    flexDirection: 'row',
    gap: spacing.sm, // 8px
  },

  skeletonChip: {
    height: 32,
    width: 80,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
  },

  skeletonChipSmall: {
    height: 32,
    width: 60,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
  },

  // Skeleton Text Styles
  skeletonTextContainer: {
    gap: spacing.xs, // 4px
  },

  skeletonTextLine: {
    height: 16,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
  },

  skeletonTextLineShort: {
    height: 16,
    width: '60%',
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusXs, // 4px
  },
});

export default SkeletonLoader;