import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../theme/colors";
import { callGemini, getGeminiStatus, testGeminiAPI } from "../../utils/geminiAPI";

export default function GeminiTestScreen() {
    const [statusInfo, setStatusInfo] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const info = getGeminiStatus();
            setStatusInfo(info);
        }, [])
    );

    const runTest = async () => {
        setLoading(true);
        try {
            const result = await testGeminiAPI();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const testLegalPrompt = async () => {
        setLoading(true);
        try {
            const prompt = "Briefly explain 'Right to Privacy' in Indian law in 2-3 sentences.";
            const response = await callGemini(prompt);
            setTestResult({ success: true, message: response });
        } catch (error) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>🔧 Gemini API Test</Text>
                    <Text style={styles.subtitle}>Chunk 1.1 - Infrastructure</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>API Status</Text>
                {statusInfo ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>
                            API Key: {statusInfo.api_key_configured ? "✅" : "❌"}
                        </Text>
                        <Text style={styles.infoLabel}>Limit: {statusInfo.free_tier_limit}</Text>
                        <Text style={styles.infoLabel}>Min Interval: {statusInfo.min_interval_ms}ms</Text>
                    </View>
                ) : (
                    <ActivityIndicator color={colors.gold} />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Test Gemini API</Text>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={runTest}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.buttonText}>🧪 Connection Test</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={testLegalPrompt}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.gold} />
                    ) : (
                        <Text style={styles.buttonText}>⚖️ Legal Prompt Test</Text>
                    )}
                </TouchableOpacity>
            </View>

            {testResult && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Results</Text>
                    <View
                        style={[
                            styles.resultBox,
                            testResult.success ? styles.successBox : styles.errorBox,
                        ]}
                    >
                        <Text
                            style={[
                                styles.resultLabel,
                                testResult.success ? styles.successText : styles.errorText,
                            ]}
                        >
                            {testResult.success ? "✅ Success" : "❌ Error"}
                        </Text>
                        <Text style={styles.resultMessage}>{testResult.message}</Text>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Setup Instructions</Text>
                <View style={styles.instructionBox}>
                    <Text style={styles.instructionStep}>1. Get Gemini API Key</Text>
                    <Text style={styles.instructionText}>Visit: https://aistudio.google.com</Text>

                    <Text style={[styles.instructionStep, { marginTop: 12 }]}>2. Add to .env</Text>
                    <Text style={styles.instructionCode}>EXPO_PUBLIC_GEMINI_KEY=your_key</Text>

                    <Text style={[styles.instructionStep, { marginTop: 12 }]}>3. Test Connection</Text>
                    <Text style={styles.instructionText}>Click buttons above to verify API works</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
        padding: 8,
    },
    backText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    infoBox: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 10,
        padding: 12,
    },
    infoLabel: {
        color: colors.text,
        fontSize: 13,
        marginBottom: 8,
    },
    button: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: colors.gold,
    },
    secondaryButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.background,
    },
    resultBox: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
    },
    successBox: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.5)",
    },
    errorBox: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.5)",
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    successText: {
        color: "#22c55e",
    },
    errorText: {
        color: "#ef4444",
    },
    resultMessage: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 18,
    },
    instructionBox: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 10,
        padding: 12,
    },
    instructionStep: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: "600",
    },
    instructionText: {
        color: colors.text,
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
    },
    instructionCode: {
        color: colors.gold,
        fontSize: 11,
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: 6,
        marginTop: 4,
    },
});
