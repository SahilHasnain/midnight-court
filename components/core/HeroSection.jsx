/**
 * HeroSection Component
 * 
 * A calm, clean hero section with refined typography and proper spacing
 * using the 8-point grid system. Features subtle animations and accessibility compliance.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const HeroSection = ({ 
  title = "Midnight Court",
  tagline = "For your voice, for your case",
  subtitle = "Build clear, elegant decks for courtrooms and clients.",
  showAnimations = true,
  children 
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (showAnimations) {
      // Staggered entrance animations
      Animated.sequence([
        // Logo scale in
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Content fade and slide in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // No animations - set final values immediately
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      logoScaleAnim.setValue(1);
    }
  }, [showAnimations]);

  return (
    <View style={styles.container}>
      {/* Logo/Brand Mark - Animated */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScaleAnim }]
          }
        ]}
      >
        <View style={styles.logoMark} />
      </Animated.View>

      {/* Main Content - Animated */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Overline/Kicker */}
        <Text style={styles.kicker} accessibilityRole="text">
          LEGAL PRESENTATIONS
        </Text>

        {/* Main Title */}
        <Text 
          style={styles.title}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          {title}
        </Text>

        {/* Gold Accent Line */}
        <View style={styles.goldLine} />

        {/* Tagline */}
        <Text 
          style={styles.tagline}
          accessibilityRole="text"
        >
          {tagline}
        </Text>

        {/* Subtitle */}
        <Text 
          style={styles.subtitle}
          accessibilityRole="text"
        >
          {subtitle}
        </Text>

        {/* Children (e.g., continue button) */}
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.xxxl, // 48px
  },

  logoContainer: {
    marginBottom: spacing.lg, // 24px
    alignItems: 'center',
  },

  logoMark: {
    width: spacing.xxxxl, // 56px
    height: spacing.xxxxl, // 56px
    borderRadius: spacing.md, // 16px
    backgroundColor: lightColors.accent.gold,
    // Subtle shadow for depth
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  kicker: {
    ...typography.overline,
    color: lightColors.text.secondary,
    marginBottom: spacing.xs, // 4px
    textAlign: 'center',
  },

  title: {
    ...typography.display,
    color: lightColors.accent.gold,
    textAlign: 'center',
    marginBottom: spacing.sm, // 8px
    // Subtle text shadow for elegance
    textShadowColor: 'rgba(184, 134, 11, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  goldLine: {
    width: 80,
    height: 3,
    backgroundColor: lightColors.accent.gold,
    borderRadius: sizing.radiusXs, // 4px
    marginBottom: spacing.md, // 16px
    // Subtle glow effect
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  tagline: {
    ...typography.h2,
    color: lightColors.accent.gold,
    textAlign: 'center',
    marginBottom: spacing.md, // 16px
    lineHeight: 28,
    letterSpacing: 0.3,
  },

  subtitle: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl, // 32px
    paddingHorizontal: spacing.sm, // 8px
    lineHeight: 24,
  },

  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md, // 16px
  },
});

export default HeroSection;