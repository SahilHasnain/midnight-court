import { colors } from "@/theme/colors";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function QuoteBlock({ block, onUpdate, onDelete }) {
    const { quote, citation } = block.data;

    const updateQuote = (newQuote) => {
        onUpdate({ ...block, data: { ...block.data, quote: newQuote } });
    };

    const updateCitation = (newCitation) => {
        onUpdate({ ...block, data: { ...block.data, citation: newCitation } });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>📜 Legal Quote</Text>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.deleteBlock}>
                        <Text style={styles.deleteBlockText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.quoteContainer}>
                <Text style={styles.quoteSymbol}>&ldquo;</Text>
                <TextInput
                    value={quote}
                    onChangeText={updateQuote}
                    placeholder="Enter quote text..."
                    placeholderTextColor={colors.textSecondary}
                    style={styles.quoteInput}
                    multiline
                />
                <Text style={styles.quoteSymbol}>&rdquo;</Text>
            </View>

            <TextInput
                value={citation}
                onChangeText={updateCitation}
                placeholder="Citation (e.g., Supreme Court of India, 2020)"
                placeholderTextColor={colors.textSecondary}
                style={styles.citationInput}
            />

            {/* Preview */}
            {quote && (
                <View style={styles.previewContainer}>
                    <View style={styles.previewQuote}>
                        <Text style={styles.previewQuoteSymbol}>&ldquo;</Text>
                        <Text style={styles.previewQuoteText}>{quote}</Text>
                        <Text style={styles.previewQuoteSymbol}>&rdquo;</Text>
                    </View>
                    {citation && (
                        <Text style={styles.previewCitation}>— {citation}</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 28,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
        opacity: 0.95,
        letterSpacing: 0.2,
    },
    deleteBlock: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    deleteBlockText: {
        color: "#ef4444",
        fontSize: 13,
        fontWeight: "600",
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    quoteSymbol: {
        color: colors.gold,
        fontSize: 42,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay_700Bold',
        lineHeight: 48,
        marginTop: -6,
        opacity: 0.8,
    },
    quoteInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 14,
        paddingHorizontal: 10,
        borderRadius: 0,
        borderWidth: 0,
        color: colors.textPrimary,
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: "PlayfairDisplay_400Regular_Italic",
        minHeight: 64,
    },
    citationInput: {
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: "Inter_400Regular",
        marginBottom: 12,
    },
    previewContainer: {
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    previewQuote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    previewQuoteSymbol: {
        color: colors.gold,
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay_700Bold',
        lineHeight: 34,
        opacity: 0.3,
    },
    previewQuoteText: {
        flex: 1,
        color: colors.ivory,
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: "PlayfairDisplay_400Regular_Italic",
        lineHeight: 25,
        paddingHorizontal: 10,
    },
    previewCitation: {
        color: colors.gold,
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        marginTop: 14,
        textAlign: 'right',
        opacity: 0.9,
    }
});
