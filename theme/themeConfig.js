/**
 * Theme Configuration System
 *
 * Provides configuration objects and utilities for theme management,
 * responsive design, and component styling based on the design system.
 */

import {
  darkTheme,
  lightTheme,
  sizing,
  spacing,
  typography,
} from "./designSystem";

// ============================================================================
// THEME CONFIGURATION TYPES
// ============================================================================

/**
 * Theme mode options
 */
export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

/**
 * Accessibility preference options
 */
export const ACCESSIBILITY_PREFERENCES = {
  FONT_SIZE: {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    EXTRA_LARGE: "extraLarge",
  },
  CONTRAST: {
    NORMAL: "normal",
    HIGH: "high",
  },
  MOTION: {
    NORMAL: "normal",
    REDUCED: "reduced",
  },
};

// ============================================================================
// DEFAULT THEME CONFIGURATION
// ============================================================================

/**
 * Default theme configuration object
 */
export const defaultThemeConfig = {
  mode: THEME_MODES.AUTO,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: ACCESSIBILITY_PREFERENCES.FONT_SIZE.MEDIUM,
  },
  preferences: {
    compactMode: false,
    showAnimations: true,
    autoSave: true,
  },
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Get responsive value based on screen width
 * @param {object} values - Object with breakpoint keys and values
 * @param {number} screenWidth - Current screen width
 * @returns {any} Value for current screen size
 */
export const getResponsiveValue = (values, screenWidth) => {
  const { mobile = null, tablet = null, desktop = null, wide = null } = values;

  if (screenWidth >= 1440 && wide !== null) return wide;
  if (screenWidth >= 1024 && desktop !== null) return desktop;
  if (screenWidth >= 768 && tablet !== null) return tablet;
  return mobile;
};

/**
 * Create responsive style object
 * @param {object} values - Responsive values
 * @returns {object} Style object with responsive values
 */
export const createResponsiveStyle = (values) => ({
  mobile: values.mobile || values,
  tablet: values.tablet || values.mobile || values,
  desktop: values.desktop || values.tablet || values.mobile || values,
  wide:
    values.wide || values.desktop || values.tablet || values.mobile || values,
});

// ============================================================================
// COMPONENT STYLE GENERATORS
// ============================================================================

/**
 * Generate button styles based on variant and theme
 * @param {string} variant - Button variant ('primary', 'secondary', 'ghost')
 * @param {object} theme - Current theme object
 * @param {object} options - Additional styling options
 * @returns {object} Button style object
 */
export const generateButtonStyles = (variant, theme, options = {}) => {
  const { colors } = theme;
  const { size = "medium", disabled = false } = options;

  const baseStyles = {
    borderRadius: sizing.radiusMd,
    minHeight: sizing.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + spacing.xs, // 12px
    alignItems: "center",
    justifyContent: "center",
    ...typography.button,
  };

  const sizeStyles = {
    small: {
      minHeight: 36,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 14,
    },
    medium: baseStyles,
    large: {
      minHeight: 52,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      fontSize: 18,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: disabled
        ? colors.interactive.disabled
        : colors.accent.gold,
      color: colors.background.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: "transparent",
      color: disabled ? colors.interactive.disabled : colors.accent.gold,
      borderWidth: sizing.borderThin,
      borderColor: disabled ? colors.interactive.disabled : colors.accent.gold,
      paddingHorizontal: spacing.lg - 1, // Adjust for border
    },
    ghost: {
      backgroundColor: "transparent",
      color: disabled ? colors.interactive.disabled : colors.text.secondary,
      borderWidth: 0,
      paddingHorizontal: spacing.md,
    },
  };

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

/**
 * Generate card styles based on variant and theme
 * @param {string} variant - Card variant ('base', 'interactive', 'template')
 * @param {object} theme - Current theme object
 * @param {object} options - Additional styling options
 * @returns {object} Card style object
 */
export const generateCardStyles = (variant, theme, options = {}) => {
  const { colors } = theme;
  const { elevated = false, selected = false } = options;

  const baseStyles = {
    backgroundColor: colors.background.secondary,
    borderRadius: sizing.radiusLg,
    padding: spacing.lg,
    borderWidth: sizing.borderThin,
    borderColor: selected ? colors.accent.gold : colors.background.tertiary,
  };

  const variantStyles = {
    base: baseStyles,
    interactive: {
      ...baseStyles,
      // Interactive cards will have hover/press states handled by component
    },
    template: {
      ...baseStyles,
      padding: 0, // Template cards have custom padding
      overflow: "hidden",
    },
  };

  const elevationStyles = elevated
    ? {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4, // Android shadow
      }
    : {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      };

  return {
    ...variantStyles[variant],
    ...elevationStyles,
  };
};

/**
 * Generate input styles based on state and theme
 * @param {string} state - Input state ('default', 'focus', 'error', 'disabled')
 * @param {object} theme - Current theme object
 * @param {object} options - Additional styling options
 * @returns {object} Input style object
 */
export const generateInputStyles = (state, theme, options = {}) => {
  const { colors } = theme;
  const { hasIcon = false, multiline = false } = options;

  const baseStyles = {
    backgroundColor: colors.background.primary,
    borderRadius: sizing.radiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs, // 12px
    minHeight: sizing.touchTarget,
    borderWidth: sizing.borderThin,
    ...typography.body,
    color: colors.text.primary,
  };

  const stateStyles = {
    default: {
      borderColor: colors.background.tertiary,
    },
    focus: {
      borderColor: colors.accent.gold,
      borderWidth: sizing.borderMedium,
      paddingHorizontal: spacing.md - 1, // Adjust for thicker border
      paddingVertical: spacing.sm + spacing.xs - 1,
    },
    error: {
      borderColor: colors.accent.error,
      borderWidth: sizing.borderMedium,
      paddingHorizontal: spacing.md - 1,
      paddingVertical: spacing.sm + spacing.xs - 1,
    },
    disabled: {
      backgroundColor: colors.background.tertiary,
      color: colors.text.tertiary,
      borderColor: colors.background.tertiary,
    },
  };

  const iconStyles = hasIcon
    ? {
        paddingLeft: sizing.touchTarget, // Space for icon
      }
    : {};

  const multilineStyles = multiline
    ? {
        minHeight: spacing.xxxxl + spacing.md, // 72px
        textAlignVertical: "top",
      }
    : {};

  return {
    ...baseStyles,
    ...stateStyles[state],
    ...iconStyles,
    ...multilineStyles,
  };
};

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

/**
 * Animation timing and easing configuration
 */
export const animationConfig = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },
};

/**
 * Common animation presets
 */
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: animationConfig.duration.normal,
  },
  slideUp: {
    from: { transform: [{ translateY: 20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
    duration: animationConfig.duration.normal,
  },
  scaleIn: {
    from: { transform: [{ scale: 0.95 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
    duration: animationConfig.duration.fast,
  },
  slideInFromRight: {
    from: { transform: [{ translateX: 300 }] },
    to: { transform: [{ translateX: 0 }] },
    duration: animationConfig.duration.normal,
  },
};

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Apply font size scaling based on accessibility preferences
 * @param {object} textStyle - Base text style
 * @param {string} fontSizePreference - Font size preference
 * @returns {object} Scaled text style
 */
export const applyFontSizeScaling = (textStyle, fontSizePreference) => {
  const scaleFactors = {
    [ACCESSIBILITY_PREFERENCES.FONT_SIZE.SMALL]: 0.875,
    [ACCESSIBILITY_PREFERENCES.FONT_SIZE.MEDIUM]: 1,
    [ACCESSIBILITY_PREFERENCES.FONT_SIZE.LARGE]: 1.125,
    [ACCESSIBILITY_PREFERENCES.FONT_SIZE.EXTRA_LARGE]: 1.25,
  };

  const scaleFactor = scaleFactors[fontSizePreference] || 1;

  return {
    ...textStyle,
    fontSize: Math.round(textStyle.fontSize * scaleFactor),
    lineHeight: Math.round(textStyle.lineHeight * scaleFactor),
  };
};

/**
 * Get text style with accessibility adjustments
 * @param {string} variant - Typography variant
 * @param {object} theme - Current theme
 * @param {object} accessibility - Accessibility preferences
 * @returns {object} Text style object
 */
export const getTextStyle = (variant, theme, accessibility = {}) => {
  const baseStyle = typography[variant] || typography.body;
  const { fontSize = ACCESSIBILITY_PREFERENCES.FONT_SIZE.MEDIUM } =
    accessibility;

  const scaledStyle = applyFontSizeScaling(baseStyle, fontSize);

  return {
    ...scaledStyle,
    color: theme.colors.text.primary,
  };
};

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

/**
 * Generate layout styles for different screen sizes
 * @param {object} config - Layout configuration
 * @returns {object} Responsive layout styles
 */
export const generateLayoutStyles = (config) => {
  const {
    padding = spacing.lg,
    margin = 0,
    maxWidth = null,
    alignment = "flex-start",
  } = config;

  return {
    paddingHorizontal:
      typeof padding === "object" ? padding.horizontal : padding,
    paddingVertical: typeof padding === "object" ? padding.vertical : padding,
    marginHorizontal: typeof margin === "object" ? margin.horizontal : margin,
    marginVertical: typeof margin === "object" ? margin.vertical : margin,
    maxWidth,
    alignItems: alignment,
    width: "100%",
  };
};

/**
 * Generate grid layout styles
 * @param {number} columns - Number of columns
 * @param {number} gap - Gap between items
 * @returns {object} Grid layout styles
 */
export const generateGridStyles = (columns, gap = spacing.md) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginHorizontal: -gap / 2,
  itemStyle: {
    width: `${100 / columns}%`,
    paddingHorizontal: gap / 2,
    marginBottom: gap,
  },
});

// ============================================================================
// THEME VALIDATION
// ============================================================================

/**
 * Validate theme configuration
 * @param {object} config - Theme configuration to validate
 * @returns {object} Validation result with errors if any
 */
export const validateThemeConfig = (config) => {
  const errors = [];

  // Validate mode
  if (!Object.values(THEME_MODES).includes(config.mode)) {
    errors.push(`Invalid theme mode: ${config.mode}`);
  }

  // Validate accessibility preferences
  if (config.accessibility) {
    const { fontSize, highContrast, reducedMotion } = config.accessibility;

    if (
      fontSize &&
      !Object.values(ACCESSIBILITY_PREFERENCES.FONT_SIZE).includes(fontSize)
    ) {
      errors.push(`Invalid font size preference: ${fontSize}`);
    }

    if (typeof highContrast !== "boolean") {
      errors.push("highContrast must be a boolean");
    }

    if (typeof reducedMotion !== "boolean") {
      errors.push("reducedMotion must be a boolean");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export { darkTheme, lightTheme, sizing, spacing, typography };
