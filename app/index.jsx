import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Midnight Court</Text>
          <View style={styles.goldLine} />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          For your voice, for your case
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

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/templates")}
            activeOpacity={0.75}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionTitle}>Begin Your Case</Text>
            <Text style={styles.actionSubtitle}>Create a powerful presentation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/image-library")}
            activeOpacity={0.75}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={styles.actionTitle}>Legal Images</Text>
            <Text style={styles.actionSubtitle}>Download & manage images</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Helper */}
        <Text style={styles.helper}>
          Professional slides. Anywhere. Anytime.
        </Text>

        {/* Dev Menu - Remove before production */}
        <View style={styles.devMenu}>
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => router.push("/dev/gemini-test")}
          >
            <Text style={styles.devButtonText}>🔧 Gemini Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => router.push("/dev/citation-test")}
          >
            <Text style={styles.devButtonText}>⚖️ Citation Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    color: colors.gold,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 32,
    letterSpacing: 0.5,
    fontFamily: "PlayfairDisplay_700Bold",
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.borderGold,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    activeOpacity: 0.75,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: "Inter_700Bold",
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
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
  },
  devMenu: {
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },
  devButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  devButtonText: {
    color: colors.gold,
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
})
