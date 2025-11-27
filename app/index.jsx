import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import GoldButton from "../components/GoldButton"
import { colors } from "../theme/colors"

export default function Index() {
  const [hasSavedPresentation, setHasSavedPresentation] = useState(false);
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem('current_presentation');
        if (saved) {
          const data = JSON.parse(saved);
          setHasSavedPresentation(true);
          setSavedData(data);
        }
      } catch (error) {
        console.error('Failed to check saved presentation:', error);
      }
    };
    checkSaved();
  }, []);

  const continueSaved = () => {
    if (savedData && savedData.template) {
      router.push({
        pathname: "/editor",
        params: { template: savedData.template }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Midnight Court</Text>
        <View style={styles.goldLine} />
      </View>

      {/* Quote Section */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>
          &ldquo;Justice delayed is justice denied&rdquo;
        </Text>
        <Text style={styles.quoteAuthor}>— William E. Gladstone</Text>
      </View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        For every law student who dreams of making a difference.
      </Text>
      <Text style={styles.subtitle}>
        Craft powerful presentations that speak with authority.
      </Text>

      {/* CTA Buttons */}
      {hasSavedPresentation && (
        <TouchableOpacity onPress={continueSaved} style={styles.continueButton}>
          <Text style={styles.continueText}>⚡ Continue Last Presentation</Text>
          <Text style={styles.continueHint}>
            {savedData?.slides?.length || 0} slide{(savedData?.slides?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      <GoldButton
        title="Begin Your Case"
        onPress={() => router.push("/templates")}
        style={styles.ctaButton}
      />

      {/* Footer Helper */}
      <Text style={styles.helper}>
        Professional slides. Anywhere. Anytime.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: colors.gold,
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  goldLine: {
    width: 80,
    height: 3,
    backgroundColor: colors.gold,
    marginTop: 12,
    borderRadius: 2,
  },
  quoteContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  quote: {
    color: colors.ivory,
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 8,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  quoteAuthor: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  tagline: {
    color: colors.ivory,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 10,
    fontFamily: "Inter_400Regular",
  },
  ctaButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  continueButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: "100%",
    maxWidth: 320,
  },
  continueText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    fontFamily: "Inter_600SemiBold",
  },
  continueHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 20,
    opacity: 0.7,
    fontFamily: "Inter_400Regular",
  }
})
