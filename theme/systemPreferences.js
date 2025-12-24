/**
 * System Preferences Detection
 *
 * Utilities for detecting and responding to system-level preferences
 * including color scheme, reduced motion, and accessibility settings.
 */

import { AccessibilityInfo, Appearance } from "react-native";

// ============================================================================
// COLOR SCHEME DETECTION
// ============================================================================

/**
 * Get current system color scheme
 * @returns {string|null} 'light', 'dark', or null if unavailable
 */
export const getSystemColorScheme = () => {
  return Appearance.getColorScheme();
};

/**
 * Check if system is using dark mode
 * @returns {boolean} True if dark mode is active
 */
export const isSystemDarkMode = () => {
  return getSystemColorScheme() === "dark";
};

/**
 * Listen for system color scheme changes
 * @param {function} callback - Callback function to handle changes
 * @returns {object} Subscription object with remove method
 */
export const addColorSchemeListener = (callback) => {
  return Appearance.addChangeListener(({ colorScheme }) => {
    callback(colorScheme);
  });
};

// ============================================================================
// ACCESSIBILITY PREFERENCES
// ============================================================================

/**
 * Check if reduce motion is enabled
 * @returns {Promise<boolean>} Promise resolving to reduce motion preference
 */
export const isReduceMotionEnabled = async () => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.warn("Failed to check reduce motion preference:", error);
    return false;
  }
};

/**
 * Check if screen reader is enabled
 * @returns {Promise<boolean>} Promise resolving to screen reader status
 */
export const isScreenReaderEnabled = async () => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn("Failed to check screen reader status:", error);
    return false;
  }
};

/**
 * Listen for accessibility preference changes
 * @param {function} callback - Callback function to handle changes
 * @returns {object} Subscription object with remove method
 */
export const addAccessibilityListener = (callback) => {
  const reduceMotionListener = AccessibilityInfo.addEventListener(
    "reduceMotionChanged",
    (isReduceMotionEnabled) => {
      callback({ type: "reduceMotion", value: isReduceMotionEnabled });
    }
  );

  const screenReaderListener = AccessibilityInfo.addEventListener(
    "screenReaderChanged",
    (isScreenReaderEnabled) => {
      callback({ type: "screenReader", value: isScreenReaderEnabled });
    }
  );

  return {
    remove: () => {
      reduceMotionListener?.remove();
      screenReaderListener?.remove();
    },
  };
};

// ============================================================================
// PREFERENCE DETECTION UTILITIES
// ============================================================================

/**
 * Get all system accessibility preferences
 * @returns {Promise<object>} Object containing all accessibility preferences
 */
export const getSystemAccessibilityPreferences = async () => {
  try {
    const [reduceMotion, screenReader] = await Promise.all([
      isReduceMotionEnabled(),
      isScreenReaderEnabled(),
    ]);

    return {
      reduceMotion,
      screenReader,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn("Failed to get system accessibility preferences:", error);
    return {
      reduceMotion: false,
      screenReader: false,
      timestamp: Date.now(),
    };
  }
};

/**
 * Get comprehensive system preferences
 * @returns {Promise<object>} Object containing all system preferences
 */
export const getSystemPreferences = async () => {
  const colorScheme = getSystemColorScheme();
  const accessibility = await getSystemAccessibilityPreferences();

  return {
    colorScheme,
    accessibility,
    timestamp: Date.now(),
  };
};

// ============================================================================
// PREFERENCE CHANGE HANDLER
// ============================================================================

/**
 * Comprehensive system preference change handler
 * @param {function} onColorSchemeChange - Callback for color scheme changes
 * @param {function} onAccessibilityChange - Callback for accessibility changes
 * @returns {object} Combined subscription with remove method
 */
export const addSystemPreferenceListeners = (
  onColorSchemeChange,
  onAccessibilityChange
) => {
  const colorSchemeSubscription = addColorSchemeListener(onColorSchemeChange);
  const accessibilitySubscription = addAccessibilityListener(
    onAccessibilityChange
  );

  return {
    remove: () => {
      colorSchemeSubscription?.remove();
      accessibilitySubscription?.remove();
    },
  };
};

// ============================================================================
// PREFERENCE VALIDATION
// ============================================================================

/**
 * Validate system preferences object
 * @param {object} preferences - Preferences object to validate
 * @returns {boolean} True if preferences are valid
 */
export const validateSystemPreferences = (preferences) => {
  if (!preferences || typeof preferences !== "object") {
    return false;
  }

  const { colorScheme, accessibility } = preferences;

  // Validate color scheme
  if (colorScheme !== null && !["light", "dark"].includes(colorScheme)) {
    return false;
  }

  // Validate accessibility preferences
  if (accessibility && typeof accessibility === "object") {
    const { reduceMotion, screenReader } = accessibility;

    if (
      typeof reduceMotion !== "boolean" ||
      typeof screenReader !== "boolean"
    ) {
      return false;
    }
  }

  return true;
};

// ============================================================================
// PREFERENCE CACHING
// ============================================================================

let cachedPreferences = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Get cached system preferences or fetch new ones
 * @param {boolean} forceRefresh - Force refresh of cached preferences
 * @returns {Promise<object>} System preferences
 */
export const getCachedSystemPreferences = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedPreferences &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedPreferences;
  }

  cachedPreferences = await getSystemPreferences();
  cacheTimestamp = now;

  return cachedPreferences;
};

/**
 * Clear cached preferences
 */
export const clearPreferenceCache = () => {
  cachedPreferences = null;
  cacheTimestamp = 0;
};

// ============================================================================
// THEME RECOMMENDATION
// ============================================================================

/**
 * Get recommended theme configuration based on system preferences
 * @returns {Promise<object>} Recommended theme configuration
 */
export const getRecommendedThemeConfig = async () => {
  const systemPrefs = await getCachedSystemPreferences();

  return {
    mode: "auto", // Always recommend auto mode for system integration
    accessibility: {
      highContrast: false, // Let user explicitly enable this
      reducedMotion: systemPrefs.accessibility.reduceMotion,
      fontSize: "medium", // Default to medium, user can adjust
    },
    preferences: {
      compactMode: false,
      showAnimations: !systemPrefs.accessibility.reduceMotion,
      autoSave: true,
    },
  };
};

// ============================================================================
// SYSTEM INTEGRATION UTILITIES
// ============================================================================

/**
 * Check if system supports dark mode
 * @returns {boolean} True if dark mode is supported
 */
export const supportsDarkMode = () => {
  try {
    // Check if Appearance API is available and functional
    const scheme = Appearance.getColorScheme();
    return scheme !== undefined;
  } catch (error) {
    return false;
  }
};

/**
 * Check if system supports accessibility preferences
 * @returns {Promise<boolean>} True if accessibility APIs are available
 */
export const supportsAccessibilityPreferences = async () => {
  try {
    // Test if AccessibilityInfo methods are available
    await AccessibilityInfo.isReduceMotionEnabled();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get system capabilities
 * @returns {Promise<object>} Object describing system capabilities
 */
export const getSystemCapabilities = async () => {
  const darkModeSupport = supportsDarkMode();
  const accessibilitySupport = await supportsAccessibilityPreferences();

  return {
    darkMode: darkModeSupport,
    accessibility: accessibilitySupport,
    timestamp: Date.now(),
  };
};
