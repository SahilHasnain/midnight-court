/**
 * Icon Component System
 * 
 * Implements consistent icon sizing and accessibility labels:
 * - Standardized sizing (xs, sm, md, lg, xl)
 * - Accessibility labels and semantic markup
 * - Theme-aware coloring
 * - Consistent spacing and alignment
 * 
 * Features:
 * - WCAG 2.1 AA compliance
 * - Screen reader support
 * - Consistent sizing based on design system
 * - Theme-aware color adaptation
 */

import { darkColors, lightColors, sizing } from '@/theme/designSystem';
import { useTheme } from '@/theme/ThemeContext';
import { StyleSheet, View } from 'react-native';

const Icon = ({
  name,
  size = 'md',
  color,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
  children,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;
  
  const iconSize = getIconSize(size);
  const iconColor = color || colors.text.secondary;
  
  const iconStyles = [
    styles.icon,
    {
      width: iconSize,
      height: iconSize,
    },
    style
  ];

  return (
    <View
      style={iconStyles}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `${name} icon`}
      accessibilityHint={accessibilityHint}
      testID={testID}
      {...props}
    >
      {children || (
        <View
          style={[
            styles.placeholder,
            {
              width: iconSize,
              height: iconSize,
              backgroundColor: iconColor,
              borderRadius: iconSize / 4,
            }
          ]}
        />
      )}
    </View>
  );
};

// Size mapping function
const getIconSize = (size) => {
  switch (size) {
    case 'xs':
      return sizing.iconXs; // 16
    case 'sm':
      return sizing.iconSm; // 20
    case 'md':
      return sizing.iconMd; // 24
    case 'lg':
      return sizing.iconLg; // 32
    case 'xl':
      return sizing.iconXl; // 48
    default:
      return typeof size === 'number' ? size : sizing.iconMd;
  }
};

// Predefined icon components for common use cases
export const SearchIcon = (props) => (
  <Icon name="search" accessibilityLabel="Search" {...props}>
    {/* Placeholder for actual search icon implementation */}
    <View style={[styles.searchIconShape, { 
      borderColor: props.color || (props.isDark ? darkColors.text.secondary : lightColors.text.secondary)
    }]} />
  </Icon>
);

export const ChevronIcon = ({ direction = 'right', ...props }) => (
  <Icon name={`chevron-${direction}`} accessibilityLabel={`Chevron ${direction}`} {...props}>
    {/* Placeholder for actual chevron icon implementation */}
    <View style={[styles.chevronShape, styles[`chevron${direction.charAt(0).toUpperCase() + direction.slice(1)}`]]} />
  </Icon>
);

export const PlusIcon = (props) => (
  <Icon name="plus" accessibilityLabel="Add" {...props}>
    {/* Placeholder for actual plus icon implementation */}
    <View style={styles.plusShape}>
      <View style={[styles.plusLine, styles.plusHorizontal, { backgroundColor: props.color }]} />
      <View style={[styles.plusLine, styles.plusVertical, { backgroundColor: props.color }]} />
    </View>
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon name="close" accessibilityLabel="Close" {...props}>
    {/* Placeholder for actual close icon implementation */}
    <View style={styles.closeShape}>
      <View style={[styles.closeLine, styles.closeDiagonal1, { backgroundColor: props.color }]} />
      <View style={[styles.closeLine, styles.closeDiagonal2, { backgroundColor: props.color }]} />
    </View>
  </Icon>
);

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  placeholder: {
    // Placeholder styling for when no icon is provided
  },
  
  // Search icon shape (circle with line)
  searchIconShape: {
    width: '70%',
    height: '70%',
    borderRadius: 100,
    borderWidth: 2,
  },
  
  // Chevron shapes
  chevronShape: {
    width: '50%',
    height: '50%',
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'currentColor',
  },
  
  chevronRight: {
    transform: [{ rotate: '45deg' }],
  },
  
  chevronLeft: {
    transform: [{ rotate: '-135deg' }],
  },
  
  chevronUp: {
    transform: [{ rotate: '-45deg' }],
  },
  
  chevronDown: {
    transform: [{ rotate: '135deg' }],
  },
  
  // Plus icon shapes
  plusShape: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  plusLine: {
    position: 'absolute',
  },
  
  plusHorizontal: {
    width: '70%',
    height: 2,
  },
  
  plusVertical: {
    width: 2,
    height: '70%',
  },
  
  // Close icon shapes
  closeShape: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  closeLine: {
    position: 'absolute',
    width: '70%',
    height: 2,
  },
  
  closeDiagonal1: {
    transform: [{ rotate: '45deg' }],
  },
  
  closeDiagonal2: {
    transform: [{ rotate: '-45deg' }],
  },
});

export default Icon;