/**
 * Card Component System
 * 
 * Implements card-based layouts with calm design principles:
 * - BaseCard: Subtle shadows and rounded corners for content containers
 * - InteractiveCard: Hover animations and active states for clickable items
 * - TemplateCard: Specialized card for template selection screens
 * 
 * Features:
 * - Proper focus indicators and accessibility attributes
 * - Smooth hover animations with elevation changes
 * - Consistent spacing using 8-point grid system
 * - WCAG 2.1 AA compliance
 */

import { darkColors, lightColors, sizing, spacing } from '@/theme/designSystem';
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

const Card = ({
  variant = 'base',
  children,
  onPress,
  disabled = false,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  const cardStyles = getCardStyles(variant, colors, disabled);
  const isInteractive = variant === 'interactive' || variant === 'template' || onPress;

  const handlePressIn = () => {
    if (isInteractive && !disabled) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (isInteractive && !disabled) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.04, 0.12],
    }),
  };

  if (isInteractive) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          style={[cardStyles, contentStyle]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessibilityRole={accessibilityRole || "button"}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          testID={testID}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={[cardStyles, style, contentStyle]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      {...props}
    >
      {children}
    </View>
  );
};

// Card variant components for easier usage
export const BaseCard = (props) => (
  <Card variant="base" {...props} />
);

export const InteractiveCard = (props) => (
  <Card variant="interactive" {...props} />
);

export const TemplateCard = (props) => (
  <Card variant="template" {...props} />
);

// Style generation function
const getCardStyles = (variant, colors, disabled) => {
  const baseStyles = [styles.card];
  
  if (disabled) {
    baseStyles.push(styles.disabled);
  }

  switch (variant) {
    case 'base':
      return [
        ...baseStyles,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.background.tertiary,
        }
      ];
    
    case 'interactive':
      return [
        ...baseStyles,
        styles.interactive,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.background.tertiary,
        }
      ];
    
    case 'template':
      return [
        ...baseStyles,
        styles.template,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.background.tertiary,
        }
      ];
    
    default:
      return baseStyles;
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: sizing.radiusLg,
    padding: spacing.lg,
    borderWidth: sizing.borderThin,
    shadowColor: '#1A1D21',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2, // Android shadow
  },
  
  interactive: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    elevation: 4,
  },
  
  template: {
    padding: 0, // Template cards handle their own padding
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    elevation: 4,
  },
  
  disabled: {
    opacity: 0.6,
  },
});

export default Card;