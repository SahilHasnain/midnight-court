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
        marginBottom: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    deleteBlock: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: "#ef4444",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    deleteBlockText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600",
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quoteSymbol: {
        color: colors.gold,
        fontSize: 40,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay_700Bold',
        lineHeight: 50,
        marginTop: -5,
    },
    quoteInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 14,
        paddingHorizontal: 8,
        borderRadius: 0,
        borderWidth: 0,
        color: colors.textPrimary,
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: "PlayfairDisplay_400Regular_Italic",
        minHeight: 60,
    },
    citationInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: "Inter_400Regular",
        marginBottom: 12,
    },
    previewContainer: {
        backgroundColor: 'rgba(203, 164, 74, 0.05)',
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        padding: 16,
        borderRadius: 8,
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
        opacity: 0.4,
    },
    previewQuoteText: {
        flex: 1,
        color: colors.ivory,
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: "PlayfairDisplay_400Regular_Italic",
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    previewCitation: {
        color: colors.gold,
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        marginTop: 12,
        textAlign: 'right',
    }
});
