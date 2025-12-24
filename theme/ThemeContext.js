/**
 * Theme Context and Provider
 *
 * Provides React Context for theme management across the app with:
 * - Light/dark mode switching
 * - System preference detection
 * - AsyncStorage persistence
 * - Accessibility preferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Appearance } from "react-native";
import {
  darkTheme,
  defaultThemeConfig,
  lightTheme,
  THEME_MODES,
  validateThemeConfig,
} from "./themeConfig";

// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_STORAGE_KEY = "@midnight_court_theme_config";
const ACCESSIBILITY_STORAGE_KEY = "@midnight_court_accessibility_config";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

const ThemeContext = createContext(null);

// ============================================================================
// THEME REDUCER
// ============================================================================

const themeReducer = (state, action) => {
  switch (action.type) {
    case "SET_THEME_CONFIG":
      return {
        ...state,
        config: action.payload,
        isLoading: false,
      };

    case "SET_SYSTEM_THEME":
      return {
        ...state,
        systemTheme: action.payload,
      };

    case "SET_ACCESSIBILITY_PREFERENCES":
      return {
        ...state,
        config: {
          ...state.config,
          accessibility: {
            ...state.config.accessibility,
            ...action.payload,
          },
        },
      };

    case "SET_USER_PREFERENCES":
      return {
        ...state,
        config: {
          ...state.config,
          preferences: {
            ...state.config.preferences,
            ...action.payload,
          },
        },
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialState = () => ({
  config: defaultThemeConfig,
  systemTheme: Appearance.getColorScheme(),
  isLoading: true,
  error: null,
});

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, getInitialState());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get the effective theme mode (resolving 'auto' to actual mode)
   */
  const getEffectiveThemeMode = useCallback(() => {
    if (state.config.mode === THEME_MODES.AUTO) {
      return state.systemTheme === "dark"
        ? THEME_MODES.DARK
        : THEME_MODES.LIGHT;
    }
    return state.config.mode;
  }, [state.config.mode, state.systemTheme]);

  /**
   * Get the current theme object
   */
  const getCurrentTheme = useCallback(() => {
    const effectiveMode = getEffectiveThemeMode();
    const baseTheme =
      effectiveMode === THEME_MODES.DARK ? darkTheme : lightTheme;

    // Apply accessibility modifications if needed
    if (state.config.accessibility.highContrast) {
      return applyHighContrastMode(baseTheme);
    }

    return baseTheme;
  }, [getEffectiveThemeMode, state.config.accessibility.highContrast]);

  // ============================================================================
  // STORAGE UTILITIES
  // ============================================================================

  /**
   * Load theme configuration from AsyncStorage
   */
  const loadThemeConfig = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const [themeConfigJson, accessibilityConfigJson] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(ACCESSIBILITY_STORAGE_KEY),
      ]);

      let config = { ...defaultThemeConfig };

      // Load theme preferences
      if (themeConfigJson) {
        const savedThemeConfig = JSON.parse(themeConfigJson);
        config = { ...config, ...savedThemeConfig };
      }

      // Load accessibility preferences
      if (accessibilityConfigJson) {
        const savedAccessibilityConfig = JSON.parse(accessibilityConfigJson);
        config.accessibility = {
          ...config.accessibility,
          ...savedAccessibilityConfig,
        };
      }

      // Validate configuration
      const validation = validateThemeConfig(config);
      if (!validation.isValid) {
        console.warn(
          "Invalid theme configuration loaded, using defaults:",
          validation.errors
        );
        config = defaultThemeConfig;
      }

      dispatch({ type: "SET_THEME_CONFIG", payload: config });
    } catch (error) {
      console.error("Failed to load theme configuration:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      dispatch({ type: "SET_THEME_CONFIG", payload: defaultThemeConfig });
    }
  }, []);

  /**
   * Save theme configuration to AsyncStorage
   */
  const saveThemeConfig = useCallback(async (config) => {
    try {
      const { accessibility, ...themeConfig } = config;

      await Promise.all([
        AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeConfig)),
        AsyncStorage.setItem(
          ACCESSIBILITY_STORAGE_KEY,
          JSON.stringify(accessibility)
        ),
      ]);
    } catch (error) {
      console.error("Failed to save theme configuration:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  }, []);

  // ============================================================================
  // THEME ACTIONS
  // ============================================================================

  /**
   * Set theme mode (light, dark, or auto)
   */
  const setThemeMode = useCallback(
    async (mode) => {
      if (!Object.values(THEME_MODES).includes(mode)) {
        console.error("Invalid theme mode:", mode);
        return;
      }

      const newConfig = { ...state.config, mode };
      dispatch({ type: "SET_THEME_CONFIG", payload: newConfig });
      await saveThemeConfig(newConfig);
    },
    [state.config, saveThemeConfig]
  );

  /**
   * Toggle between light and dark modes
   */
  const toggleTheme = useCallback(async () => {
    const currentMode = getEffectiveThemeMode();
    const newMode =
      currentMode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    await setThemeMode(newMode);
  }, [getEffectiveThemeMode, setThemeMode]);

  /**
   * Set accessibility preferences
   */
  const setAccessibilityPreferences = useCallback(
    async (preferences) => {
      const newConfig = {
        ...state.config,
        accessibility: { ...state.config.accessibility, ...preferences },
      };

      dispatch({ type: "SET_ACCESSIBILITY_PREFERENCES", payload: preferences });
      await saveThemeConfig(newConfig);
    },
    [state.config, saveThemeConfig]
  );

  /**
   * Set user preferences
   */
  const setUserPreferences = useCallback(
    async (preferences) => {
      const newConfig = {
        ...state.config,
        preferences: { ...state.config.preferences, ...preferences },
      };

      dispatch({ type: "SET_USER_PREFERENCES", payload: preferences });
      await saveThemeConfig(newConfig);
    },
    [state.config, saveThemeConfig]
  );

  /**
   * Reset theme to defaults
   */
  const resetTheme = useCallback(async () => {
    dispatch({ type: "SET_THEME_CONFIG", payload: defaultThemeConfig });
    await saveThemeConfig(defaultThemeConfig);

    // Clear stored configurations
    try {
      await Promise.all([
        AsyncStorage.removeItem(THEME_STORAGE_KEY),
        AsyncStorage.removeItem(ACCESSIBILITY_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear theme storage:", error);
    }
  }, [saveThemeConfig]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load theme configuration on mount
   */
  useEffect(() => {
    loadThemeConfig();
  }, [loadThemeConfig]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: "SET_SYSTEM_THEME", payload: colorScheme });
    });

    return () => subscription?.remove();
  }, []);

  /**
   * Save configuration when it changes
   */
  useEffect(() => {
    if (!state.isLoading && state.config !== defaultThemeConfig) {
      saveThemeConfig(state.config);
    }
  }, [state.config, state.isLoading, saveThemeConfig]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = {
    // Current state
    theme: getCurrentTheme(),
    config: state.config,
    systemTheme: state.systemTheme,
    effectiveMode: getEffectiveThemeMode(),
    isLoading: state.isLoading,
    error: state.error,

    // Theme actions
    setThemeMode,
    toggleTheme,
    setAccessibilityPreferences,
    setUserPreferences,
    resetTheme,

    // Utility functions
    isDarkMode: getEffectiveThemeMode() === THEME_MODES.DARK,
    isLightMode: getEffectiveThemeMode() === THEME_MODES.LIGHT,
    isAutoMode: state.config.mode === THEME_MODES.AUTO,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to access theme context
 * @returns {object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Apply high contrast modifications to theme
 * @param {object} baseTheme - Base theme object
 * @returns {object} High contrast theme
 */
const applyHighContrastMode = (baseTheme) => {
  const { colors } = baseTheme;

  return {
    ...baseTheme,
    colors: {
      ...colors,
      // Increase contrast for text
      text: {
        ...colors.text,
        primary: baseTheme.mode === "dark" ? "#FFFFFF" : "#000000",
        secondary: baseTheme.mode === "dark" ? "#E2E8F0" : "#2D3748",
      },
      // Enhance accent colors
      accent: {
        ...colors.accent,
        gold: baseTheme.mode === "dark" ? "#FFD700" : "#B8860B",
      },
      // Increase border contrast
      background: {
        ...colors.background,
        tertiary: baseTheme.mode === "dark" ? "#4A5568" : "#CBD5E0",
      },
    },
  };
};

/**
 * HOC to provide theme to class components
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with theme prop
 */
export const withTheme = (Component) => {
  return React.forwardRef((props, ref) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} ref={ref} />;
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeContext;
