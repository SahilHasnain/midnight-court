/**
 * Themed Styles Hook
 *
 * Provides utilities for creating theme-aware styles and accessing
 * design system tokens within React components.
 */

import { useMemo } from "react";
import { useTheme } from "./ThemeContext";
import {
  createResponsiveStyles,
  getResponsivePadding,
  getResponsiveSpacing,
} from "./responsive";
import {
  generateButtonStyles,
  generateCardStyles,
  generateInputStyles,
  generateLayoutStyles,
  getTextStyle,
} from "./themeConfig";

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for creating theme-aware styles
 * @param {function} styleFactory - Function that receives theme and returns styles
 * @param {array} dependencies - Additional dependencies for memoization
 * @returns {object} Computed styles
 */
export const useThemedStyles = (styleFactory, dependencies = []) => {
  const { theme, config } = useTheme();

  return useMemo(() => {
    if (typeof styleFactory !== "function") {
      console.error("useThemedStyles: styleFactory must be a function");
      return {};
    }

    return styleFactory(theme, config);
  }, [theme, config, ...dependencies]);
};

// ============================================================================
// COMPONENT-SPECIFIC HOOKS
// ============================================================================

/**
 * Hook for button styles
 * @param {string} variant - Button variant ('primary', 'secondary', 'ghost')
 * @param {object} options - Additional styling options
 * @returns {object} Button styles
 */
export const useButtonStyles = (variant = "primary", options = {}) => {
  const { theme } = useTheme();

  return useMemo(() => {
    return generateButtonStyles(variant, theme, options);
  }, [variant, theme, options]);
};

/**
 * Hook for card styles
 * @param {string} variant - Card variant ('base', 'interactive', 'template')
 * @param {object} options - Additional styling options
 * @returns {object} Card styles
 */
export const useCardStyles = (variant = "base", options = {}) => {
  const { theme } = useTheme();

  return useMemo(() => {
    return generateCardStyles(variant, theme, options);
  }, [variant, theme, options]);
};

/**
 * Hook for input styles
 * @param {string} state - Input state ('default', 'focus', 'error', 'disabled')
 * @param {object} options - Additional styling options
 * @returns {object} Input styles
 */
export const useInputStyles = (state = "default", options = {}) => {
  const { theme } = useTheme();

  return useMemo(() => {
    return generateInputStyles(state, theme, options);
  }, [state, theme, options]);
};

/**
 * Hook for typography styles
 * @param {string} variant - Typography variant
 * @param {object} customStyles - Additional custom styles
 * @returns {object} Typography styles
 */
export const useTextStyles = (variant = "body", customStyles = {}) => {
  const { theme, config } = useTheme();

  return useMemo(() => {
    const baseStyle = getTextStyle(variant, theme, config.accessibility);
    return { ...baseStyle, ...customStyles };
  }, [variant, theme, config.accessibility, customStyles]);
};

/**
 * Hook for layout styles
 * @param {object} layoutConfig - Layout configuration
 * @returns {object} Layout styles
 */
export const useLayoutStyles = (layoutConfig = {}) => {
  const { theme } = useTheme();

  return useMemo(() => {
    return generateLayoutStyles(layoutConfig);
  }, [layoutConfig, theme]);
};

// ============================================================================
// RESPONSIVE HOOKS
// ============================================================================

/**
 * Hook for responsive styles
 * @param {object} responsiveStyles - Responsive style definitions
 * @returns {object} Computed responsive styles
 */
export const useResponsiveStyles = (responsiveStyles) => {
  return useMemo(() => {
    return createResponsiveStyles(responsiveStyles);
  }, [responsiveStyles]);
};

/**
 * Hook for responsive padding
 * @param {object} paddingConfig - Padding configuration
 * @returns {object} Responsive padding styles
 */
export const useResponsivePadding = (paddingConfig) => {
  return useMemo(() => {
    return getResponsivePadding(paddingConfig);
  }, [paddingConfig]);
};

/**
 * Hook for responsive spacing
 * @param {object|number} spacingConfig - Spacing configuration
 * @returns {number} Responsive spacing value
 */
export const useResponsiveSpacing = (spacingConfig) => {
  return useMemo(() => {
    return getResponsiveSpacing(spacingConfig);
  }, [spacingConfig]);
};

// ============================================================================
// COLOR HOOKS
// ============================================================================

/**
 * Hook for accessing theme colors
 * @returns {object} Theme colors
 */
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook for getting semantic colors
 * @returns {object} Semantic color mappings
 */
export const useSemanticColors = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return useMemo(
    () => ({
      // Background colors
      surface: colors.background.primary,
      surfaceSecondary: colors.background.secondary,
      surfaceTertiary: colors.background.tertiary,

      // Text colors
      onSurface: colors.text.primary,
      onSurfaceSecondary: colors.text.secondary,
      onSurfaceTertiary: colors.text.tertiary,

      // Interactive colors
      primary: colors.accent.gold,
      onPrimary: colors.background.primary,

      // Status colors
      success: colors.accent.success,
      warning: colors.accent.warning,
      error: colors.accent.error,
      info: colors.accent.info,

      // Interactive states
      hover: colors.interactive.hover,
      active: colors.interactive.active,
      focus: colors.interactive.focus,
      disabled: colors.interactive.disabled,
    }),
    [colors]
  );
};

// ============================================================================
// SPACING HOOKS
// ============================================================================

/**
 * Hook for accessing spacing tokens
 * @returns {object} Spacing values
 */
export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

/**
 * Hook for accessing sizing tokens
 * @returns {object} Sizing values
 */
export const useSizing = () => {
  const { theme } = useTheme();
  return theme.sizing;
};

// ============================================================================
// TYPOGRAPHY HOOKS
// ============================================================================

/**
 * Hook for accessing typography tokens
 * @returns {object} Typography styles
 */
export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook for creating text style with accessibility adjustments
 * @param {string} variant - Typography variant
 * @returns {object} Accessible text style
 */
export const useAccessibleTextStyle = (variant) => {
  const { theme, config } = useTheme();

  return useMemo(() => {
    return getTextStyle(variant, theme, config.accessibility);
  }, [variant, theme, config.accessibility]);
};

// ============================================================================
// ANIMATION HOOKS
// ============================================================================

/**
 * Hook for accessing animation configuration
 * @returns {object} Animation config
 */
export const useAnimationConfig = () => {
  const { config } = useTheme();

  return useMemo(() => {
    // Return reduced motion config if preference is set
    if (config.accessibility.reducedMotion) {
      return {
        duration: { fast: 0, normal: 0, slow: 0 },
        easing: { easeOut: "linear", easeIn: "linear", easeInOut: "linear" },
      };
    }

    // Return normal animation config
    return {
      duration: { fast: 150, normal: 200, slow: 300 },
      easing: {
        easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
        easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
    };
  }, [config.accessibility.reducedMotion]);
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for checking theme mode
 * @returns {object} Theme mode utilities
 */
export const useThemeMode = () => {
  const { isDarkMode, isLightMode, isAutoMode, effectiveMode } = useTheme();

  return {
    isDark: isDarkMode,
    isLight: isLightMode,
    isAuto: isAutoMode,
    mode: effectiveMode,
  };
};

/**
 * Hook for accessibility preferences
 * @returns {object} Accessibility preferences and utilities
 */
export const useAccessibility = () => {
  const { config, setAccessibilityPreferences } = useTheme();

  return {
    preferences: config.accessibility,
    setPreferences: setAccessibilityPreferences,
    isHighContrast: config.accessibility.highContrast,
    isReducedMotion: config.accessibility.reducedMotion,
    fontSize: config.accessibility.fontSize,
  };
};

/**
 * Hook for creating conditional styles based on theme
 * @param {object} lightStyles - Styles for light theme
 * @param {object} darkStyles - Styles for dark theme
 * @returns {object} Conditional styles
 */
export const useConditionalStyles = (lightStyles, darkStyles) => {
  const { isDarkMode } = useTheme();

  return useMemo(() => {
    return isDarkMode ? darkStyles : lightStyles;
  }, [isDarkMode, lightStyles, darkStyles]);
};

// ============================================================================
// STYLE FACTORY HELPERS
// ============================================================================

/**
 * Create a style factory function for use with useThemedStyles
 * @param {function} factory - Style factory function
 * @returns {function} Memoized style factory
 */
export const createStyleFactory = (factory) => {
  return (theme, config) => factory(theme, config);
};

/**
 * Combine multiple style factories
 * @param {...function} factories - Style factory functions
 * @returns {function} Combined style factory
 */
export const combineStyleFactories = (...factories) => {
  return (theme, config) => {
    return factories.reduce((combined, factory) => {
      const styles = factory(theme, config);
      return { ...combined, ...styles };
    }, {});
  };
};
