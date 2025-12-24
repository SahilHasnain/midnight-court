/**
 * HeroSection Component
 *
 * A calm, clean hero section with refined typography and proper spacing
 * using the 8-point grid system. Features subtle animations and accessibility compliance.
 */

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  lightColors,
  sizing,
  spacing,
  typography,
} from "../../theme/designSystem";

const HeroSection = ({
  title = "Midnight Court",
  tagline = "For your voice, for your case",
  subtitle = "Build clear, elegant decks for courtrooms and clients.",
  showAnimations = true,
  children,
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
  }, [fadeAnim, logoScaleAnim, showAnimations, slideAnim]);

  return (
    <View style={styles.container}>
      {/* Logo/Brand Mark - Animated */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScaleAnim }],
          },
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
            transform: [{ translateY: slideAnim }],
          },
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
        <Text style={styles.tagline} accessibilityRole="text">
          {tagline}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle} accessibilityRole="text">
          {subtitle}
        </Text>

        {/* Children (e.g., continue button) */}
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.xxxl, // 48px
  },

  logoContainer: {
    marginBottom: spacing.xl, // 24px - increased
    alignItems: "center",
  },

  logoMark: {
    width: spacing.xxxxxl, // 64px - larger
    height: spacing.xxxxxl, // 64px
    borderRadius: sizing.radiusLg, // 16px - more rounded
    backgroundColor: lightColors.accent.gold,
    // Enhanced shadow for depth
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  kicker: {
    ...typography.overline,
    color: lightColors.text.secondary,
    marginBottom: spacing.sm, // 8px - increased
    textAlign: "center",
    letterSpacing: 1.5,
  },

  title: {
    ...typography.display,
    fontSize: 36, // Larger
    lineHeight: 44,
    color: lightColors.accent.gold,
    textAlign: "center",
    marginBottom: spacing.md, // 16px - increased
    // Enhanced text shadow for elegance
    textShadowColor: "rgba(184, 134, 11, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  goldLine: {
    width: 100, // Wider
    height: 4, // Thicker
    backgroundColor: lightColors.accent.gold,
    borderRadius: sizing.radiusSm, // 6px
    marginBottom: spacing.lg, // 24px - increased
    // Enhanced glow effect
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },

  tagline: {
    ...typography.h2,
    fontSize: 22, // Slightly larger
    color: lightColors.accent.gold,
    textAlign: "center",
    marginBottom: spacing.lg, // 24px - increased
    lineHeight: 32,
    letterSpacing: 0.5,
  },

  subtitle: {
    ...typography.body,
    fontSize: 17, // Slightly larger
    color: lightColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl, // 32px
    paddingHorizontal: spacing.md, // 16px
    lineHeight: 26,
  },

  childrenContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: spacing.lg, // 24px - increased
  },
});

export default HeroSection;
