/**
 * Responsive Design Utilities
 *
 * Provides utilities for responsive design, screen dimension handling,
 * and adaptive layouts based on device characteristics.
 */

import { Dimensions } from "react-native";
import { breakpoints } from "./designSystem";

// ============================================================================
// SCREEN DIMENSION UTILITIES
// ============================================================================

/**
 * Get current screen dimensions
 * @returns {object} Screen width and height
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return { width, height };
};

/**
 * Get current screen type based on width
 * @param {number} width - Screen width (optional, uses current if not provided)
 * @returns {string} Screen type ('mobile', 'tablet', 'desktop', 'wide')
 */
export const getScreenType = (width = null) => {
  const screenWidth = width || getScreenDimensions().width;

  if (screenWidth >= breakpoints.wide) return "wide";
  if (screenWidth >= breakpoints.desktop) return "desktop";
  if (screenWidth >= breakpoints.tablet) return "tablet";
  return "mobile";
};

/**
 * Check if current screen is mobile
 * @returns {boolean} True if mobile screen
 */
export const isMobile = () => getScreenType() === "mobile";

/**
 * Check if current screen is tablet or larger
 * @returns {boolean} True if tablet or larger
 */
export const isTabletOrLarger = () => {
  const type = getScreenType();
  return ["tablet", "desktop", "wide"].includes(type);
};

/**
 * Check if current screen is desktop or larger
 * @returns {boolean} True if desktop or larger
 */
export const isDesktopOrLarger = () => {
  const type = getScreenType();
  return ["desktop", "wide"].includes(type);
};

// ============================================================================
// RESPONSIVE VALUE UTILITIES
// ============================================================================

/**
 * Get responsive value based on current screen size
 * @param {object|any} values - Responsive values object or single value
 * @returns {any} Value for current screen size
 */
export const useResponsiveValue = (values) => {
  if (typeof values !== "object" || values === null) {
    return values;
  }

  const screenType = getScreenType();
  const { mobile, tablet, desktop, wide } = values;

  // Return the most specific value available for current screen type
  switch (screenType) {
    case "wide":
      return wide ?? desktop ?? tablet ?? mobile ?? values;
    case "desktop":
      return desktop ?? tablet ?? mobile ?? values;
    case "tablet":
      return tablet ?? mobile ?? values;
    case "mobile":
    default:
      return mobile ?? values;
  }
};

/**
 * Create responsive style object with current values
 * @param {object} responsiveStyles - Object with responsive style definitions
 * @returns {object} Flattened style object for current screen
 */
export const createResponsiveStyles = (responsiveStyles) => {
  const result = {};

  Object.keys(responsiveStyles).forEach((key) => {
    result[key] = useResponsiveValue(responsiveStyles[key]);
  });

  return result;
};

// ============================================================================
// GRID SYSTEM UTILITIES
// ============================================================================

/**
 * Calculate number of columns for responsive grid
 * @param {object} columnConfig - Column configuration for different screen sizes
 * @returns {number} Number of columns for current screen
 */
export const getResponsiveColumns = (columnConfig) => {
  const defaultConfig = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  };

  const config = { ...defaultConfig, ...columnConfig };
  return useResponsiveValue(config);
};

/**
 * Calculate item width for responsive grid
 * @param {number} columns - Number of columns
 * @param {number} gap - Gap between items
 * @param {number} containerWidth - Container width (optional)
 * @returns {number} Item width in pixels
 */
export const calculateGridItemWidth = (columns, gap, containerWidth = null) => {
  const screenWidth = containerWidth || getScreenDimensions().width;
  const totalGap = gap * (columns - 1);
  return (screenWidth - totalGap) / columns;
};

/**
 * Generate responsive grid layout
 * @param {object} config - Grid configuration
 * @returns {object} Grid layout styles and item dimensions
 */
export const generateResponsiveGrid = (config) => {
  const {
    columns: columnConfig = { mobile: 1, tablet: 2, desktop: 3 },
    gap = 16,
    padding = 24,
  } = config;

  const columns = getResponsiveColumns(columnConfig);
  const screenWidth = getScreenDimensions().width;
  const availableWidth = screenWidth - padding * 2;
  const itemWidth = calculateGridItemWidth(columns, gap, availableWidth);

  return {
    container: {
      paddingHorizontal: padding,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    item: {
      width: itemWidth,
      marginBottom: gap,
    },
    columns,
    itemWidth,
  };
};

// ============================================================================
// TYPOGRAPHY SCALING
// ============================================================================

/**
 * Scale typography based on screen size
 * @param {object} baseTypography - Base typography styles
 * @param {object} scaleConfig - Scaling configuration for different screens
 * @returns {object} Scaled typography styles
 */
export const scaleTypography = (baseTypography, scaleConfig = {}) => {
  const defaultScales = {
    mobile: 1,
    tablet: 1.1,
    desktop: 1.2,
    wide: 1.3,
  };

  const scales = { ...defaultScales, ...scaleConfig };
  const scale = useResponsiveValue(scales);

  return {
    ...baseTypography,
    fontSize: Math.round(baseTypography.fontSize * scale),
    lineHeight: Math.round(baseTypography.lineHeight * scale),
  };
};

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Get responsive spacing value
 * @param {object|number} spacingConfig - Spacing configuration or single value
 * @returns {number} Spacing value for current screen
 */
export const getResponsiveSpacing = (spacingConfig) => {
  if (typeof spacingConfig === "number") {
    return spacingConfig;
  }

  const defaultSpacing = {
    mobile: 16,
    tablet: 20,
    desktop: 24,
    wide: 32,
  };

  const config = { ...defaultSpacing, ...spacingConfig };
  return useResponsiveValue(config);
};

/**
 * Generate responsive padding
 * @param {object} paddingConfig - Padding configuration
 * @returns {object} Padding styles for current screen
 */
export const getResponsivePadding = (paddingConfig) => {
  if (typeof paddingConfig === "number") {
    return {
      paddingHorizontal: paddingConfig,
      paddingVertical: paddingConfig,
    };
  }

  const {
    horizontal = { mobile: 16, tablet: 24, desktop: 32 },
    vertical = { mobile: 16, tablet: 20, desktop: 24 },
    top,
    bottom,
    left,
    right,
  } = paddingConfig;

  const result = {};

  if (top !== undefined) result.paddingTop = useResponsiveValue(top);
  if (bottom !== undefined) result.paddingBottom = useResponsiveValue(bottom);
  if (left !== undefined) result.paddingLeft = useResponsiveValue(left);
  if (right !== undefined) result.paddingRight = useResponsiveValue(right);

  if (!top && !bottom) {
    result.paddingVertical = useResponsiveValue(vertical);
  }

  if (!left && !right) {
    result.paddingHorizontal = useResponsiveValue(horizontal);
  }

  return result;
};

// ============================================================================
// ORIENTATION UTILITIES
// ============================================================================

/**
 * Check if device is in landscape orientation
 * @returns {boolean} True if landscape
 */
export const isLandscape = () => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

/**
 * Check if device is in portrait orientation
 * @returns {boolean} True if portrait
 */
export const isPortrait = () => !isLandscape();

/**
 * Get orientation-aware dimensions
 * @returns {object} Dimensions with orientation context
 */
export const getOrientationDimensions = () => {
  const { width, height } = getScreenDimensions();
  const orientation = isLandscape() ? "landscape" : "portrait";

  return {
    width,
    height,
    orientation,
    shortSide: Math.min(width, height),
    longSide: Math.max(width, height),
  };
};

// ============================================================================
// SAFE AREA UTILITIES
// ============================================================================

/**
 * Calculate safe area padding for different screen types
 * @param {object} safeAreaInsets - Safe area insets from react-native-safe-area-context
 * @returns {object} Safe area padding styles
 */
export const getSafeAreaPadding = (safeAreaInsets = {}) => {
  const { top = 0, bottom = 0, left = 0, right = 0 } = safeAreaInsets;
  const screenType = getScreenType();

  // Adjust safe area handling based on screen type
  const adjustments = {
    mobile: { top, bottom, left, right },
    tablet: {
      top: Math.max(top, 20),
      bottom: Math.max(bottom, 20),
      left: Math.max(left, 20),
      right: Math.max(right, 20),
    },
    desktop: {
      top: Math.max(top, 24),
      bottom: Math.max(bottom, 24),
      left: Math.max(left, 24),
      right: Math.max(right, 24),
    },
    wide: {
      top: Math.max(top, 32),
      bottom: Math.max(bottom, 32),
      left: Math.max(left, 32),
      right: Math.max(right, 32),
    },
  };

  const adjusted = adjustments[screenType];

  return {
    paddingTop: adjusted.top,
    paddingBottom: adjusted.bottom,
    paddingLeft: adjusted.left,
    paddingRight: adjusted.right,
  };
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for responsive calculations
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for responsive calculations
 * @param {function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detect device type based on screen characteristics
 * @returns {object} Device information
 */
export const getDeviceInfo = () => {
  const { width, height } = getScreenDimensions();
  const screenType = getScreenType(width);
  const orientation = isLandscape() ? "landscape" : "portrait";
  const aspectRatio = width / height;

  // Detect likely device categories
  const isPhone = width < 768 && (aspectRatio > 1.5 || aspectRatio < 0.67);
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    height,
    screenType,
    orientation,
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape: isLandscape(),
    isPortrait: isPortrait(),
  };
};
