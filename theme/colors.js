/**
 * Legacy Colors (Backward Compatibility)
 *
 * This file maintains backward compatibility with existing components
 * while providing access to the new design system colors.
 */

import { darkColors, lightColors } from "./designSystem";

// Legacy color exports for backward compatibility
export const colors = {
  background: "#0B1120",
  gold: "#CBA44A",
  ivory: "#F5EEDF",
  text: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  card: "#000",
  cardBackground: "#1A1F2E",
  border: "#2D3748",
  borderGold: "#E5C76B",
  toast: "#1F2937",
};

// Export new design system colors for modern components
export { darkColors, lightColors };

// Helper function to get theme-aware colors
export const getThemeColors = (isDark = true) => {
  return isDark ? darkColors : lightColors;
};
