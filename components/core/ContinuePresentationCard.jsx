/**
 * ContinuePresentationCard Component
 * 
 * A clean, prominent card for continuing saved presentations with
 * clear visual hierarchy, presentation metadata, and smooth state transitions.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const ContinuePresentationCard = ({ 
  presentationData,
  onPress,
  showAnimation = true,
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: 200, // Slight delay for staggered effect
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [showAnimation]);

  if (!presentationData) {
    return null;
  }

  const slideCount = presentationData.slides?.length || 0;
  const lastModified = presentationData.lastModified 
    ? new Date(presentationData.lastModified).toLocaleDateString()
    : 'Recently';

  const templateName = presentationData.template || 'Custom';

  return (
    <Animated.View 
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Continue last presentation"
        accessibilityHint={`Resume working on presentation with ${slideCount} slides, last modified ${lastModified}`}
      >
        {/* Header with Icon and Action */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚡</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Continue Presentation</Text>
            <Text style={styles.headerSubtitle}>Pick up where you left off</Text>
          </View>
        </View>

        {/* Presentation Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Slides</Text>
              <Text style={styles.metadataValue}>
                {slideCount} slide{slideCount !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Template</Text>
              <Text style={styles.metadataValue}>{templateName}</Text>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Last Modified</Text>
              <Text style={styles.metadataValue}>{lastModified}</Text>
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: slideCount > 0 ? '60%' : '20%' } // Simulate progress
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {slideCount > 0 ? 'In Progress' : 'Getting Started'}
          </Text>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>Tap to continue →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg, // 24px
  },

  card: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusXl, // 16px
    padding: spacing.lg, // 24px
    
    // Prominent border to draw attention
    borderWidth: sizing.borderMedium, // 2px
    borderColor: lightColors.accent.gold,
    
    // Enhanced shadow for prominence
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md, // 16px
  },

  iconContainer: {
    width: spacing.xl, // 32px
    height: spacing.xl, // 32px
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.accent.goldLight,
    borderRadius: sizing.radiusSm, // 6px
    marginRight: spacing.md, // 16px
  },

  icon: {
    fontSize: 18,
    lineHeight: 18,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.xs, // 4px
  },

  headerSubtitle: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
  },

  metadata: {
    marginBottom: spacing.md, // 16px
  },

  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm, // 8px
  },

  metadataItem: {
    flex: 1,
  },

  metadataLabel: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    marginBottom: spacing.xs, // 4px
    textTransform: 'uppercase',
  },

  metadataValue: {
    ...typography.bodySmall,
    color: lightColors.text.primary,
    fontWeight: '500',
  },

  progressContainer: {
    marginBottom: spacing.md, // 16px
  },

  progressBar: {
    height: 4,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: 2,
    marginBottom: spacing.xs, // 4px
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: lightColors.accent.gold,
    borderRadius: 2,
  },

  progressText: {
    ...typography.caption,
    color: lightColors.text.secondary,
  },

  ctaContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm, // 8px
    borderTopWidth: sizing.borderThin,
    borderTopColor: lightColors.background.tertiary,
  },

  ctaText: {
    ...typography.button,
    color: lightColors.accent.gold,
    fontSize: 14,
  },
});

export default ContinuePresentationCard;