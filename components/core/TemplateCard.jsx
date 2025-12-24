/**
 * TemplateCard Component
 * 
 * Individual template card with preview thumbnails and metadata.
 * Features:
 * - Consistent aspect ratios for preview thumbnails
 * - Template information with clear hierarchy
 * - Usage statistics and metadata display
 * - Interactive states with proper accessibility
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const TemplateCard = ({ 
  template, 
  onPress, 
  onPreview, 
  onDelete, 
  style 
}) => {
  const {
    id,
    name,
    description,
    icon,
    type,
    slides = [],
    createdAt,
    lastModified
  } = template;

  const slideCount = slides.length;
  const isCustomTemplate = type === 'custom';

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const displayDate = formatDate(lastModified || createdAt);

  return (
    <View style={[styles.cardWrapper, style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select ${name} template`}
        accessibilityHint={`${description}. ${slideCount} slide${slideCount !== 1 ? 's' : ''}`}
      >
        {/* Preview Thumbnail */}
        <View style={styles.previewContainer}>
          <View style={styles.previewThumbnail}>
            <Text style={styles.previewIcon}>{icon}</Text>
            <View style={styles.previewOverlay}>
              <Text style={styles.previewText}>Preview</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Template Title */}
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>

          {/* Template Description */}
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>

          {/* Metadata Section */}
          <View style={styles.metadataContainer}>
            {/* Slide Count */}
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>📑</Text>
              <Text style={styles.metadataText}>
                {slideCount} slide{slideCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Template Type Badge */}
            <View style={[styles.typeBadge, styles[`typeBadge${type}`]]}>
              <Text style={[styles.typeBadgeText, styles[`typeBadgeText${type}`]]}>
                {type === 'quick' ? 'Quick' : type === 'full' ? 'Full' : 'Custom'}
              </Text>
            </View>
          </View>

          {/* Date Information (for custom templates) */}
          {isCustomTemplate && displayDate && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                Created {displayDate}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Preview Button */}
        {onPreview && slideCount > 0 && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPreview}
            accessibilityRole="button"
            accessibilityLabel={`Preview ${name} template`}
          >
            <Text style={styles.actionButtonIcon}>👁️</Text>
          </TouchableOpacity>
        )}

        {/* Delete Button (for custom templates) */}
        {onDelete && isCustomTemplate && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${name} template`}
          >
            <Text style={styles.deleteButtonIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
  },

  card: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    overflow: 'hidden',
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  previewContainer: {
    position: 'relative',
    aspectRatio: 4 / 3, // Consistent aspect ratio
    backgroundColor: lightColors.background.tertiary,
  },

  previewThumbnail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  previewIcon: {
    fontSize: 48,
    opacity: 0.6,
  },

  previewOverlay: {
    position: 'absolute',
    bottom: spacing.sm, // 8px
    right: spacing.sm,
    backgroundColor: lightColors.interactive.hover,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusSm, // 6px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.accent.gold,
  },

  previewText: {
    ...typography.caption,
    color: lightColors.accent.gold,
    fontSize: 10,
  },

  contentContainer: {
    padding: spacing.md, // 16px
  },

  title: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.xs, // 4px
  },

  description: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    marginBottom: spacing.sm, // 8px
    lineHeight: 18,
  },

  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs, // 4px
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metadataIcon: {
    fontSize: 12,
    marginRight: spacing.xs, // 4px
  },

  metadataText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
  },

  typeBadge: {
    paddingHorizontal: spacing.sm, // 8px
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusSm, // 6px
    borderWidth: sizing.borderThin,
  },

  typeBadgequick: {
    backgroundColor: lightColors.accent.goldLight,
    borderColor: lightColors.accent.gold,
  },

  typeBadgefull: {
    backgroundColor: 'rgba(56, 161, 105, 0.1)', // success light
    borderColor: lightColors.accent.success,
  },

  typeBadgecustom: {
    backgroundColor: 'rgba(49, 130, 206, 0.1)', // info light
    borderColor: lightColors.accent.info,
  },

  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },

  typeBadgeTextquick: {
    color: lightColors.accent.gold,
  },

  typeBadgeTextfull: {
    color: lightColors.accent.success,
  },

  typeBadgeTextcustom: {
    color: lightColors.accent.info,
  },

  dateContainer: {
    marginTop: spacing.xs, // 4px
  },

  dateText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontSize: 10,
  },

  actionButtons: {
    position: 'absolute',
    top: spacing.sm, // 8px
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs, // 4px
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightColors.interactive.hover,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonIcon: {
    fontSize: 14,
  },

  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },

  deleteButtonIcon: {
    fontSize: 13,
    color: '#ef4444',
  },
});

export default TemplateCard;