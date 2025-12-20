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
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>LEGAL PRESENTATIONS</Text>
          <Text style={styles.title}>Midnight Court</Text>
          <View style={styles.goldLine} />
          <Text style={styles.tagline}>For your voice, for your case</Text>
          <Text style={styles.subtitle}>Build clear, elegant decks for courtrooms and clients.</Text>

          {hasSavedPresentation && (
            <TouchableOpacity onPress={continueSaved} style={styles.continueButton} activeOpacity={0.85}>
              <Text style={styles.continueText}>⚡ Continue Last Presentation</Text>
              <Text style={styles.continueHint}>
                {savedData?.slides?.length || 0} slide{(savedData?.slides?.length || 0) !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/templates")}
            activeOpacity={0.82}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionTitle}>Begin Your Case</Text>
            <Text style={styles.actionSubtitle}>Create a powerful presentation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/abbreviations")}
            activeOpacity={0.82}
          >
            <Text style={styles.actionIcon}>📖</Text>
            <Text style={styles.actionTitle}>Legal Dictionary</Text>
            <Text style={styles.actionSubtitle}>88+ legal abbreviations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/citation-formatter")}
            activeOpacity={0.82}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Citation Formatter</Text>
            <Text style={styles.actionSubtitle}>Format citations instantly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/image-library")}
            activeOpacity={0.82}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={styles.actionTitle}>Legal Images</Text>
            <Text style={styles.actionSubtitle}>Download & manage images</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helper}>Professional slides. Anywhere. Anytime.</Text>

        {/* Dev Menu - Remove before production */}
        {/* <View style={styles.devMenu}>
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
        </View> */}
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
    paddingVertical: 36,
  },
  heroCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: 'rgba(0,0,0,0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  kicker: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
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
    marginTop: 10,
    marginBottom: 12,
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
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 30,
    letterSpacing: 0.5,
    fontFamily: "PlayfairDisplay_700Bold",
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
    fontFamily: "Inter_400Regular",
  },
  ctaButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 480,
    gap: 14,
    marginTop: 4,
    marginBottom: 22,
  },
  actionButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 44,
    marginBottom: 10,
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
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.75,
    fontFamily: "Inter_400Regular",
  },
  devMenu: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  devButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  devButtonText: {
    color: colors.gold,
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
})
