/**
 * ActionGrid Component
 * 
 * A grid of horizontal action cards with icons and text side-by-side.
 * Features hover effects, proper spacing using design system constants,
 * and ensures touch targets meet accessibility requirements.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const ActionCard = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  variant = 'default',
  accessibilityLabel,
  accessibilityHint 
}) => {
  const cardStyle = variant === 'highlighted' 
    ? [styles.actionCard, styles.highlightedCard]
    : styles.actionCard;

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || subtitle}
    >
      {/* Icon Container */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Content Container */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      {/* Chevron Indicator */}
      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const ActionGrid = ({ actions = [], style }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {actions.map((action, index) => (
        <ActionCard
          key={action.id || index}
          icon={action.icon}
          title={action.title}
          subtitle={action.subtitle}
          onPress={action.onPress}
          variant={action.variant}
          accessibilityLabel={action.accessibilityLabel}
          accessibilityHint={action.accessibilityHint}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 480,
    gap: spacing.md, // 16px between cards
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusXl, // 16px - more rounded
    paddingVertical: spacing.lg, // 24px
    paddingHorizontal: spacing.lg, // 24px
    minHeight: sizing.touchTarget + spacing.lg, // Ensure 44px+ touch target
    
    // Enhanced border
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    
    // Enhanced shadow
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    
    // Smooth transitions for hover effects
    // Note: React Native doesn't have CSS hover, but we can simulate with activeOpacity
  },

  highlightedCard: {
    borderColor: lightColors.accent.gold,
    borderWidth: sizing.borderMedium, // 2px
    backgroundColor: lightColors.accent.goldLight,
    
    // Enhanced shadow for highlighted cards
    shadowColor: lightColors.accent.gold,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },

  iconContainer: {
    width: spacing.xxxl + spacing.sm, // 56px - larger
    height: spacing.xxxl + spacing.sm, // 56px
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg, // 16px
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusLg, // 12px
  },

  icon: {
    fontSize: sizing.iconXl, // 48px - larger
    lineHeight: sizing.iconXl,
  },

  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },

  cardTitle: {
    ...typography.h3,
    fontSize: 19, // Slightly larger
    color: lightColors.text.primary,
    marginBottom: spacing.xs + 2, // 6px
    lineHeight: 26,
    fontWeight: '600',
  },

  cardSubtitle: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    lineHeight: 20,
  },

  chevronContainer: {
    width: spacing.lg, // 24px
    height: spacing.lg, // 24px
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm, // 8px
  },

  chevron: {
    fontSize: 24, // Larger
    color: lightColors.text.tertiary,
    fontWeight: '300',
  },
});

// Default action configurations for common use cases
export const createDefaultActions = (navigation) => [
  {
    id: 'begin-case',
    icon: '⚖️',
    title: 'Begin Your Case',
    subtitle: 'Create a powerful presentation',
    onPress: () => navigation?.push?.('/templates'),
    accessibilityLabel: 'Begin Your Case',
    accessibilityHint: 'Navigate to template selection to create a new presentation',
  },
  {
    id: 'ai-generator',
    icon: '✨',
    title: 'AI Slide Generator',
    subtitle: 'Generate slides from case description',
    variant: 'highlighted',
    accessibilityLabel: 'AI Slide Generator',
    accessibilityHint: 'Open AI-powered slide generation tool',
  },
  {
    id: 'legal-dictionary',
    icon: '📖',
    title: 'Legal Dictionary',
    subtitle: '88+ legal abbreviations',
    onPress: () => navigation?.push?.('/abbreviations'),
    accessibilityLabel: 'Legal Dictionary',
    accessibilityHint: 'Browse legal abbreviations and definitions',
  },
  {
    id: 'citation-tools',
    icon: '📝',
    title: 'Citation Tools',
    subtitle: 'AI search & format citations',
    onPress: () => navigation?.push?.('/citation-formatter'),
    accessibilityLabel: 'Citation Tools',
    accessibilityHint: 'Access AI-powered citation search and formatting tools',
  },
  {
    id: 'legal-images',
    icon: '🖼️',
    title: 'Legal Images',
    subtitle: 'Download & manage images',
    onPress: () => navigation?.push?.('/image-library'),
    accessibilityLabel: 'Legal Images',
    accessibilityHint: 'Browse and manage legal image library',
  },
];

export default ActionGrid;