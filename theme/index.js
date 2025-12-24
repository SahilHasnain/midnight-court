/**
 * Design System Index
 *
 * Central export point for all design system utilities, themes, and configurations.
 * This provides a clean API for consuming the design system throughout the app.
 */

// Core design system
export {
  addAlpha,
  breakpoints,
  createTheme,
  darkColors,
  darkTheme,
  darken,
  generateAccessibleVariations,
  getContrastRatio,
  getLuminance,
  hexToRgb,
  lightColors,
  lightTheme,
  lighten,
  mediaQueries,
  meetsContrastRequirement,
  sizing,
  spacing,
  typography,
  validateColorCombinations,
} from "./designSystem";

// Theme configuration
export {
  ACCESSIBILITY_PREFERENCES,
  THEME_MODES,
  animationConfig,
  animations,
  applyFontSizeScaling,
  createResponsiveStyle,
  defaultThemeConfig,
  generateButtonStyles,
  generateCardStyles,
  generateGridStyles,
  generateInputStyles,
  generateLayoutStyles,
  getResponsiveValue,
  getTextStyle,
  validateThemeConfig,
} from "./themeConfig";

// Responsive utilities
export {
  calculateGridItemWidth,
  createResponsiveStyles,
  debounce,
  generateResponsiveGrid,
  getDeviceInfo,
  getOrientationDimensions,
  getResponsiveColumns,
  getResponsivePadding,
  getResponsiveSpacing,
  getSafeAreaPadding,
  getScreenDimensions,
  getScreenType,
  isDesktopOrLarger,
  isLandscape,
  isMobile,
  isPortrait,
  isTabletOrLarger,
  scaleTypography,
  throttle,
  useResponsiveValue,
} from "./responsive";

// Legacy colors (backward compatibility)
export { colors, getThemeColors } from "./colors";

// Theme context and hooks
export { ThemeProvider, useTheme, withTheme } from "./ThemeContext";
export {
  combineStyleFactories,
  createStyleFactory,
  useAccessibility,
  useAccessibleTextStyle,
  useAnimationConfig,
  useButtonStyles,
  useCardStyles,
  useColors,
  useConditionalStyles,
  useInputStyles,
  useLayoutStyles,
  useResponsivePadding,
  useResponsiveSpacing,
  useResponsiveStyles,
  useSemanticColors,
  useSizing,
  useSpacing,
  useTextStyles,
  useThemeMode,
  useThemedStyles,
  useTypography,
} from "./useThemedStyles";

// System preferences
export {
  addAccessibilityListener,
  addColorSchemeListener,
  addSystemPreferenceListeners,
  getCachedSystemPreferences,
  getRecommendedThemeConfig,
  getSystemAccessibilityPreferences,
  getSystemCapabilities,
  getSystemColorScheme,
  getSystemPreferences,
  isReduceMotionEnabled,
  isScreenReaderEnabled,
  isSystemDarkMode,
  supportsAccessibilityPreferences,
  supportsDarkMode,
} from "./systemPreferences";

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Quick access to commonly used design tokens
 */
export const tokens = {
  // Spacing shortcuts
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  // Size shortcuts
  size: {
    touchTarget: 44,
    icon: {
      sm: 16,
      md: 24,
      lg: 32,
    },
    radius: {
      sm: 6,
      md: 8,
      lg: 12,
    },
  },

  // Animation shortcuts
  animation: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
};

/**
 * Design system version for compatibility tracking
 */
export const DESIGN_SYSTEM_VERSION = "1.0.0";
