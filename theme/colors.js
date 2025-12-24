/**
 * Legacy Colors (Backward Compatibility)
 *
 * This file maintains backward compatibility with existing components
 * by mapping legacy dark theme colors to the new light design system.
 *
 * All legacy color references now point to the modern light theme,
 * providing instant visual consistency across the entire app.
 */

import { darkColors, lightColors } from "./designSystem";

// Legacy color exports mapped to new light design system
// This automatically updates all screens using the old color system
export const colors = {
  // Background colors - mapped to light theme
  background: lightColors.background.primary, // "#FAFBFC" (was dark "#0B1120")
  card: lightColors.background.secondary, // "#F7F9FA" (was dark "#000")
  cardBackground: lightColors.background.secondary, // "#F7F9FA" (was dark "#1A1F2E")

  // Gold accent - using refined gold from design system
  gold: lightColors.accent.gold, // "#B8860B" (was bright "#CBA44A")
  borderGold: lightColors.accent.gold, // "#B8860B" (was "#E5C76B")

  // Text colors - mapped to light theme (inverted from dark)
  text: lightColors.text.primary, // "#1A1D21" (was white "#FFFFFF")
  textPrimary: lightColors.text.primary, // "#1A1D21" (was white "#FFFFFF")
  textSecondary: lightColors.text.secondary, // "#4A5568" (was gray "#9CA3AF")
  ivory: lightColors.background.primary, // "#FAFBFC" (was "#F5EEDF")

  // Border colors
  border: lightColors.background.tertiary, // "#F1F3F5" (was dark "#2D3748")

  // Toast/notification background
  toast: lightColors.background.secondary, // "#F7F9FA" (was dark "#1F2937")
};

// Export new design system colors for modern components
export { darkColors, lightColors };

// Helper function to get theme-aware colors
// Now defaults to light theme for consistency
export const getThemeColors = (isDark = false) => {
  return isDark ? darkColors : lightColors;
};
