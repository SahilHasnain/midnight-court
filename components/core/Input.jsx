/**
 * Input Component System
 * 
 * Implements clean input styling with calm design principles:
 * - TextInput: Clean styling with focus states and validation
 * - SearchInput: Integrated search icon with proper spacing
 * - Form validation components with inline error display
 * 
 * Features:
 * - Proper labeling and accessibility support
 * - Smooth focus transitions with gold accent
 * - Inline validation with helpful error messages
 * - WCAG 2.1 AA compliance
 */

import { darkColors, lightColors, sizing, spacing, typography } from '@/theme/designSystem';
import { useTheme } from '@/theme/ThemeContext';
import { useRef, useState } from 'react';
import { Animated, TextInput as RNTextInput, StyleSheet, Text, View } from 'react-native';

const Input = ({
  variant = 'text',
  label,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  icon,
  iconPosition = 'left',
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const inputStyles = getInputStyles(variant, colors, isFocused, error, disabled);
  const labelStyles = getLabelStyles(colors, error, disabled, required);

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur && onBlur(e);
  };

  const animatedBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.accent.error : colors.background.tertiary,
      error ? colors.accent.error : colors.accent.gold
    ],
  });

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <View style={[
        styles.iconContainer,
        iconPosition === 'right' && styles.iconRight
      ]}>
        {icon}
      </View>
    );
  };

  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <Text style={[labelStyles, labelStyle]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.accent.error }, errorStyle]}>
          {error}
        </Text>
      </View>
    );
  };

  const renderHelper = () => {
    if (!helperText || error) return null;
    
    return (
      <Text style={[styles.helperText, { color: colors.text.tertiary }, helperStyle]}>
        {helperText}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderLabel()}
      
      <Animated.View style={[
        inputStyles,
        { borderColor: animatedBorderColor },
        multiline && styles.multilineContainer
      ]}>
        {iconPosition === 'left' && renderIcon()}
        
        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              paddingLeft: icon && iconPosition === 'left' ? spacing.xl + spacing.sm : 0,
              paddingRight: icon && iconPosition === 'right' ? spacing.xl + spacing.sm : 0,
            },
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled,
            invalid: !!error,
          }}
          testID={testID}
          {...props}
        />
        
        {iconPosition === 'right' && renderIcon()}
      </Animated.View>
      
      {renderError()}
      {renderHelper()}
    </View>
  );
};

// Input variant components for easier usage
export const TextInput = (props) => (
  <Input variant="text" {...props} />
);

export const SearchInput = ({ icon, ...props }) => {
  const { isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;
  
  // Default search icon if none provided
  const searchIcon = icon || (
    <View style={[styles.searchIcon, { backgroundColor: colors.text.tertiary }]} />
  );
  
  return (
    <Input
      variant="search"
      icon={searchIcon}
      iconPosition="left"
      placeholder="Search..."
      {...props}
    />
  );
};

// Style generation functions
const getInputStyles = (variant, colors, isFocused, error, disabled) => {
  const baseStyles = [styles.inputContainer];
  
  if (disabled) {
    baseStyles.push(styles.disabled);
  }

  const backgroundColor = colors.background.primary;
  const borderWidth = isFocused ? sizing.borderMedium : sizing.borderThin;
  
  return [
    ...baseStyles,
    {
      backgroundColor,
      borderWidth,
      paddingHorizontal: isFocused ? spacing.md - 1 : spacing.md, // Adjust for border width
      paddingVertical: isFocused ? spacing.sm + spacing.xs - 1 : spacing.sm + spacing.xs,
    }
  ];
};

const getLabelStyles = (colors, error, disabled, required) => {
  const baseStyles = [styles.label];
  
  let color = colors.text.primary;
  if (disabled) {
    color = colors.text.tertiary;
  } else if (error) {
    color = colors.accent.error;
  }
  
  return [
    ...baseStyles,
    { color }
  ];
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  
  required: {
    color: '#E53E3E', // Error color for required indicator
  },
  
  inputContainer: {
    borderRadius: sizing.radiusMd,
    minHeight: sizing.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  multilineContainer: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  
  input: {
    ...typography.body,
    flex: 1,
    textAlignVertical: 'top', // For multiline inputs
    paddingVertical: 0, // Remove default padding
  },
  
  iconContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    width: sizing.iconMd,
    height: sizing.iconMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconRight: {
    left: 'auto',
    right: spacing.md,
  },
  
  searchIcon: {
    width: sizing.iconSm,
    height: sizing.iconSm,
    borderRadius: sizing.iconSm / 2,
    // Placeholder for actual search icon
  },
  
  errorContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  errorText: {
    ...typography.caption,
    flex: 1,
  },
  
  helperText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  
  disabled: {
    opacity: 0.6,
  },
});

export default Input;