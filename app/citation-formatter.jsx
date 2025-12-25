import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CitationSearchModal from "../components/CitationSearchModal";
import Toast from "../components/Toast";
import {
  lightColors,
  sizing,
  spacing,
  typography,
} from "../theme/designSystem";

export default function CitationFormatterScreen() {
  const [caseName, setCaseName] = useState(
    "Kesavananda Bharati v. State of Kerala"
  );
  const [year, setYear] = useState("1973");
  const [court, setCourt] = useState("SC");
  const [reporter, setReporter] = useState("AIR");
  const [volume, setVolume] = useState("4");
  const [page, setPage] = useState("1461");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [showCitationSearch, setShowCitationSearch] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      2000
    );
  };

  const formatBluebook = () => {
    if (!caseName || !year || !reporter || !page) return "";
    return `${caseName}, ${reporter} ${year} ${court || "SC"} ${page}`;
  };

  const formatOSCOLA = () => {
    if (!caseName || !year || !reporter || !page) return "";
    return `${caseName} [${year}] ${reporter} ${page} (${court || "SC"})`;
  };

  const formatIndian = () => {
    if (!caseName || !year || !volume || !reporter || !page) return "";
    return `${caseName}, (${year}) ${volume} ${reporter} ${page}`;
  };

  const copyToClipboard = async (format, text) => {
    await Clipboard.setStringAsync(text);
    showToast(`${format} format copied!`, "success");
  };

  const clearForm = () => {
    setCaseName("");
    setYear("");
    setCourt("");
    setReporter("");
    setVolume("");
    setPage("");
  };

  const handleSelectCitation = (citation) => {
    setCaseName(citation.author || citation.text || "");
    setYear(citation.year || "");
    showToast("Citation loaded! Edit and format as needed.", "success");
  };

  const hasInput = caseName || year || court || reporter || volume || page;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>LEGAL TOOLS</Text>
          <Text style={styles.title}>Citation Formatter</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>
            Format legal citations instantly in multiple styles
          </Text>

          {/* <TouchableOpacity
            style={styles.aiSearchButton}
            onPress={() => setShowCitationSearch(true)}
            accessibilityLabel="Open AI Citation Search"
            accessibilityHint="Search for citations using AI"
          >
            <View style={styles.aiSearchIcon}>
              <Ionicons
                name="search"
                size={18}
                color={lightColors.accent.gold}
              />
            </View>
            <Text style={styles.aiSearchText}>AI Citation Search</Text>
            <Text style={styles.aiSearchEmoji}>✨</Text>
          </TouchableOpacity> */}
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Case Details</Text>
            {hasInput && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearForm}
                accessibilityLabel="Clear all fields"
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={lightColors.text.tertiary}
                />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Case Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kesavananda Bharati v. State of Kerala"
              placeholderTextColor={lightColors.text.tertiary}
              value={caseName}
              onChangeText={setCaseName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                Year <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="1973"
                placeholderTextColor={lightColors.text.tertiary}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Court</Text>
              <TextInput
                style={styles.input}
                placeholder="SC / HC"
                placeholderTextColor={lightColors.text.tertiary}
                value={court}
                onChangeText={setCourt}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                Reporter <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="AIR / SCC"
                placeholderTextColor={lightColors.text.tertiary}
                value={reporter}
                onChangeText={setReporter}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Volume</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                placeholderTextColor={lightColors.text.tertiary}
                value={volume}
                onChangeText={setVolume}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Page Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="1461"
              placeholderTextColor={lightColors.text.tertiary}
              value={page}
              onChangeText={setPage}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Output Formats */}
        {hasInput && (
          <View style={styles.outputSection}>
            <Text style={styles.sectionTitle}>Formatted Citations</Text>

            {/* Bluebook */}
            {formatBluebook() && (
              <View style={styles.outputCard}>
                <View style={styles.outputHeader}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatLabel}>Bluebook</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() =>
                      copyToClipboard("Bluebook", formatBluebook())
                    }
                    accessibilityLabel="Copy Bluebook citation"
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={lightColors.accent.gold}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.outputText}>{formatBluebook()}</Text>
              </View>
            )}

            {/* OSCOLA */}
            {formatOSCOLA() && (
              <View style={styles.outputCard}>
                <View style={styles.outputHeader}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatLabel}>OSCOLA</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard("OSCOLA", formatOSCOLA())}
                    accessibilityLabel="Copy OSCOLA citation"
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={lightColors.accent.gold}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.outputText}>{formatOSCOLA()}</Text>
              </View>
            )}

            {/* Indian Standard */}
            {formatIndian() && (
              <View style={styles.outputCard}>
                <View style={styles.outputHeader}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatLabel}>Indian Standard</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard("Indian", formatIndian())}
                    accessibilityLabel="Copy Indian Standard citation"
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={lightColors.accent.gold}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.outputText}>{formatIndian()}</Text>
              </View>
            )}
          </View>
        )}

        {/* Help Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Ionicons
              name="information-circle"
              size={20}
              color={lightColors.accent.info}
            />
            <Text style={styles.helpTitle}>Quick Guide</Text>
          </View>
          <View style={styles.helpContent}>
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={styles.helpText}>
                Fields marked with * are required
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={styles.helpText}>Reporter: AIR, SCC, etc.</Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={styles.helpText}>
                Court: SC (Supreme Court), HC (High Court)
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={styles.helpText}>
                Tap copy icon to copy formatted citation
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <CitationSearchModal
        visible={showCitationSearch}
        onClose={() => setShowCitationSearch(false)}
        onSelectCitation={handleSelectCitation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },

  scrollContent: {
    padding: spacing.lg, // 24px
  },

  // Header Styles
  header: {
    marginBottom: spacing.xl, // 32px
  },

  kicker: {
    ...typography.overline,
    color: lightColors.text.secondary,
    marginBottom: spacing.sm, // 8px
    letterSpacing: 1.5,
  },

  title: {
    ...typography.display,
    fontSize: 32,
    color: lightColors.accent.gold,
    marginBottom: spacing.xs, // 4px
  },

  goldLine: {
    width: 80,
    height: 4,
    backgroundColor: lightColors.accent.gold,
    borderRadius: sizing.radiusSm, // 6px
    marginBottom: spacing.md, // 16px
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  subtitle: {
    ...typography.body,
    color: lightColors.text.secondary,
    marginBottom: spacing.lg, // 24px
    lineHeight: 24,
  },

  aiSearchButton: {
    backgroundColor: lightColors.background.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm, // 8px
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: spacing.lg, // 24px
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderMedium, // 2px
    borderColor: lightColors.accent.gold,
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  aiSearchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightColors.accent.goldLight,
    justifyContent: "center",
    alignItems: "center",
  },

  aiSearchText: {
    ...typography.button,
    color: lightColors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  aiSearchEmoji: {
    fontSize: 18,
  },

  // Form Styles
  formCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginBottom: spacing.lg, // 24px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg, // 24px
  },

  sectionTitle: {
    ...typography.h2,
    color: lightColors.accent.gold,
    fontWeight: "600",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs, // 4px
    paddingHorizontal: spacing.sm, // 8px
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusSm, // 6px
    backgroundColor: lightColors.background.tertiary,
  },

  clearText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontSize: 12,
    fontWeight: "500",
  },

  inputGroup: {
    marginBottom: spacing.md, // 16px
  },

  label: {
    ...typography.bodySmall,
    color: lightColors.text.primary,
    fontWeight: "500",
    marginBottom: spacing.sm, // 8px
  },

  required: {
    color: lightColors.accent.error,
  },

  input: {
    backgroundColor: lightColors.background.primary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
    padding: spacing.md, // 16px
    ...typography.body,
    color: lightColors.text.primary,
  },

  row: {
    flexDirection: "row",
    gap: spacing.md, // 16px
  },

  halfWidth: {
    flex: 1,
  },

  // Output Styles
  outputSection: {
    marginBottom: spacing.lg, // 24px
  },

  outputCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginBottom: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  outputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md, // 16px
  },

  formatBadge: {
    backgroundColor: lightColors.accent.goldLight,
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusSm, // 6px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.accent.gold,
  },

  formatLabel: {
    ...typography.caption,
    color: lightColors.accent.gold,
    fontWeight: "600",
    fontSize: 12,
  },

  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
  },

  outputText: {
    ...typography.body,
    color: lightColors.text.primary,
    lineHeight: 24,
  },

  // Help Card Styles
  helpCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.accent.info,
    borderLeftWidth: 4,
  },

  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm, // 8px
    marginBottom: spacing.md, // 16px
  },

  helpTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    fontWeight: "600",
  },

  helpContent: {
    gap: spacing.sm, // 8px
  },

  helpItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm, // 8px
  },

  helpBullet: {
    ...typography.body,
    color: lightColors.accent.info,
    fontWeight: "700",
    width: 16,
  },

  helpText: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    lineHeight: 20,
    flex: 1,
  },
});
