/**
 * Design System Constants and Utilities
 *
 * This file contains the complete design system foundation including:
 * - Color palette with light/dark mode support
 * - Typography system with Inter and Playfair Display
 * - 8-point grid system and spacing utilities
 * - Responsive breakpoints
 * - Utility functions for color manipulation and contrast calculation
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

/**
 * Refined color palette with accessibility-compliant contrast ratios
 * Designed for calm, clean interface with reduced cognitive load
 */
export const lightColors = {
  // Background Colors (Calm & Professional)
  background: {
    primary: "#FAFBFC", // Soft white (reduces eye strain)
    secondary: "#F7F9FA", // Subtle gray (card backgrounds)
    tertiary: "#F1F3F5", // Light gray (dividers, borders)
  },

  // Content Colors (High Readability)
  text: {
    primary: "#1A1D21", // Near black (AAA contrast)
    secondary: "#4A5568", // Medium gray (AA contrast)
    tertiary: "#718096", // Light gray (metadata)
  },

  // Accent Colors (Purposeful & Calm)
  accent: {
    gold: "#B8860B", // Refined gold (less saturated)
    goldLight: "#F4E4BC", // Gold tint (backgrounds)
    success: "#38A169", // Calm green
    warning: "#D69E2E", // Warm amber
    error: "#E53E3E", // Clear red
    info: "#3182CE", // Trustworthy blue
  },

  // Interactive States
  interactive: {
    hover: "rgba(184, 134, 11, 0.08)", // Subtle gold tint
    active: "rgba(184, 134, 11, 0.12)", // Slightly stronger
    focus: "rgba(184, 134, 11, 0.24)", // Clear focus ring
    disabled: "rgba(74, 85, 104, 0.24)", // Muted gray
  },
};

export const darkColors = {
  // Background Colors (Dark mode adaptation)
  background: {
    primary: "#0B1120", // Deep blue-black
    secondary: "#1A1F2E", // Slightly lighter
    tertiary: "#2D3748", // Medium gray for borders
  },

  // Content Colors (Adjusted for dark backgrounds)
  text: {
    primary: "#FFFFFF", // Pure white
    secondary: "#E2E8F0", // Light gray
    tertiary: "#9CA3AF", // Medium gray
  },

  // Accent Colors (Maintained with adjustments)
  accent: {
    gold: "#CBA44A", // Brighter gold for dark backgrounds
    goldLight: "#2D2518", // Dark gold tint
    success: "#48BB78", // Brighter green
    warning: "#ED8936", // Brighter amber
    error: "#F56565", // Brighter red
    info: "#4299E1", // Brighter blue
  },

  // Interactive States (Adjusted opacity)
  interactive: {
    hover: "rgba(203, 164, 74, 0.12)",
    active: "rgba(203, 164, 74, 0.16)",
    focus: "rgba(203, 164, 74, 0.32)",
    disabled: "rgba(156, 163, 175, 0.24)",
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

/**
 * Typography hierarchy using Inter and Playfair Display
 * All sizes aligned to 8-point grid system
 */
export const typography = {
  // Display (Hero sections, major headings)
  display: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  // Headings (Section titles, card headers)
  h1: {
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Body text (Content, descriptions)
  body: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // UI elements (Buttons, labels, captions)
  button: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  overline: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
};

// ============================================================================
// 8-POINT GRID SYSTEM
// ============================================================================

/**
 * Spacing system based on 8-point grid
 * Provides consistent rhythm and alignment
 */
export const spacing = {
  xs: 4, // 0.5 units
  sm: 8, // 1 unit
  md: 16, // 2 units
  lg: 24, // 3 units
  xl: 32, // 4 units
  xxl: 40, // 5 units
  xxxl: 48, // 6 units
  xxxxl: 56, // 7 units
  xxxxxl: 64, // 8 units
};

/**
 * Component sizing based on 8-point grid
 */
export const sizing = {
  // Touch targets (minimum 44x44 points)
  touchTarget: 44,

  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,

  // Border radius
  radiusXs: 4,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,

  // Border widths
  borderThin: 1,
  borderMedium: 2,
  borderThick: 4,
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Responsive breakpoint system for different screen sizes
 */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

/**
 * Media query helpers
 */
export const mediaQueries = {
  mobile: `@media (min-width: ${breakpoints.mobile}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  wide: `@media (min-width: ${breakpoints.wide}px)`,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Color manipulation utilities
 */

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {object} RGB values {r, g, b}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate relative luminance of a color
 * @param {object} rgb - RGB color object {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
export const getLuminance = (rgb) => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG contrast requirements
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean} Whether combination meets requirements
 */
export const meetsContrastRequirement = (
  foreground,
  background,
  level = "AA",
  isLargeText = false
) => {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  // AA level (default)
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Darken a hex color by a percentage
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export const darken = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

/**
 * Lighten a hex color by a percentage
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lighten = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

/**
 * Add alpha transparency to a hex color
 * @param {string} hex - Hex color string
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export const addAlpha = (hex, alpha) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Complete theme configuration object
 * Combines colors, typography, spacing, and utilities
 */
export const createTheme = (mode = "light") => {
  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,
    colors,
    typography,
    spacing,
    sizing,
    breakpoints,
    mediaQueries,
    utils: {
      hexToRgb,
      getLuminance,
      getContrastRatio,
      meetsContrastRequirement,
      darken,
      lighten,
      addAlpha,
    },
  };
};

// Default themes
export const lightTheme = createTheme("light");
export const darkTheme = createTheme("dark");

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Validate color combinations for accessibility compliance
 */
export const validateColorCombinations = (theme) => {
  const { colors } = theme;
  const results = [];

  // Test primary text combinations
  const textCombinations = [
    {
      name: "Primary text on primary background",
      fg: colors.text.primary,
      bg: colors.background.primary,
    },
    {
      name: "Secondary text on primary background",
      fg: colors.text.secondary,
      bg: colors.background.primary,
    },
    {
      name: "Primary text on secondary background",
      fg: colors.text.primary,
      bg: colors.background.secondary,
    },
    {
      name: "Gold accent on primary background",
      fg: colors.accent.gold,
      bg: colors.background.primary,
    },
  ];

  textCombinations.forEach((combo) => {
    const ratio = getContrastRatio(combo.fg, combo.bg);
    const meetsAA = meetsContrastRequirement(combo.fg, combo.bg, "AA");
    const meetsAAA = meetsContrastRequirement(combo.fg, combo.bg, "AAA");

    results.push({
      name: combo.name,
      ratio: ratio.toFixed(2),
      meetsAA,
      meetsAAA,
    });
  });

  return results;
};

/**
 * Generate accessible color variations
 */
export const generateAccessibleVariations = (baseColor, backgroundColor) => {
  const variations = [];

  for (let i = 0; i <= 100; i += 5) {
    const lightened = lighten(baseColor, i);
    const darkened = darken(baseColor, i);

    const lightenedRatio = getContrastRatio(lightened, backgroundColor);
    const darkenedRatio = getContrastRatio(darkened, backgroundColor);

    if (lightenedRatio >= 4.5) {
      variations.push({
        color: lightened,
        ratio: lightenedRatio,
        type: "lightened",
        percent: i,
      });
    }

    if (darkenedRatio >= 4.5) {
      variations.push({
        color: darkened,
        ratio: darkenedRatio,
        type: "darkened",
        percent: i,
      });
    }
  }

  return variations.sort((a, b) => b.ratio - a.ratio);
};
