/**
 * Example Usage of Design System
 * 
 * This file demonstrates how to use the new design system components
 * and utilities in React Native components.
 */

import { Text, TouchableOpacity, View } from 'react-native';
import {
    useButtonStyles,
    useColors,
    useSpacing,
    useTextStyles,
    useThemedStyles
} from './index';

// ============================================================================
// EXAMPLE COMPONENT USING DESIGN SYSTEM
// ============================================================================

const ExampleComponent = () => {
  const colors = useColors();
  const spacing = useSpacing();
  
  // Using themed styles hook
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg
    },
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.sizing.radiusLg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.background.tertiary
    }
  }));
  
  // Using component-specific style hooks
  const primaryButtonStyles = useButtonStyles('primary');
  const secondaryButtonStyles = useButtonStyles('secondary');
  const titleStyles = useTextStyles('h1');
  const bodyStyles = useTextStyles('body');
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={titleStyles}>Design System Example</Text>
        <Text style={bodyStyles}>
          This demonstrates the new calm UI design system with proper spacing,
          typography, and color usage.
        </Text>
        
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          <TouchableOpacity style={primaryButtonStyles}>
            <Text style={{ color: colors.background.primary, ...bodyStyles }}>
              Primary Action
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={secondaryButtonStyles}>
            <Text style={{ color: colors.accent.gold, ...bodyStyles }}>
              Secondary Action
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ExampleComponent;