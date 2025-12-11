import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Parse markdown-style text: *gold*, ~red~, _blue_
const parseFormattedText = (text) => {
    if (!text) return null;

    const parts = [];
    let currentIndex = 0;

    const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            parts.push({
                text: text.substring(currentIndex, match.index),
                color: colors.ivory
            });
        }

        const matched = match[0];
        if (matched.startsWith('*') && matched.endsWith('*')) {
            parts.push({ text: matched.slice(1, -1), color: colors.gold });
        } else if (matched.startsWith('~') && matched.endsWith('~')) {
            parts.push({ text: matched.slice(1, -1), color: '#ef4444' });
        } else if (matched.startsWith('_') && matched.endsWith('_')) {
            parts.push({ text: matched.slice(1, -1), color: '#3b82f6' });
        }

        currentIndex = match.index + matched.length;
    }

    if (currentIndex < text.length) {
        parts.push({
            text: text.substring(currentIndex),
            color: colors.ivory
        });
    }

    return parts.length > 0 ? parts : [{ text, color: colors.ivory }];
};

export default function ParagraphBlock({ block, onUpdate, onDelete }) {
    const { text } = block.data;
    const [showPreview, setShowPreview] = useState(false);

    const updateText = (newText) => {
        onUpdate({ ...block, data: { ...block.data, text: newText } });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>📄 Paragraph</Text>
                    <Text style={styles.hint}>*gold* ~red~ _blue_</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={() => setShowPreview(!showPreview)}
                        style={styles.previewToggle}
                    >
                        <Text style={styles.previewToggleSmallText}>
                            {showPreview ? '✏️' : '👁️'}
                        </Text>
                    </TouchableOpacity>
                    {onDelete && (
                        <TouchableOpacity onPress={onDelete} style={styles.deleteBlock}>
                            <Text style={styles.deleteBlockText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showPreview ? (
                <View style={styles.previewContainer}>
                    {text ? (
                        <Text style={styles.previewText}>
                            {parseFormattedText(text).map((part, idx) => (
                                <Text key={idx} style={{ color: part.color }}>
                                    {part.text}
                                </Text>
                            ))}
                        </Text>
                    ) : (
                        <Text style={styles.emptyPreview}>Preview: Your paragraph will appear here</Text>
                    )}
                </View>
            ) : (
                <TextInput
                    value={text}
                    onChangeText={updateText}
                    placeholder="Type paragraph text - Use *gold* ~red~ _blue_ for emphasis"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                />
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
        alignItems: 'flex-start',
        marginBottom: 14,
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
    hint: {
        color: colors.textSecondary,
        fontSize: 10,
        fontFamily: "Inter_400Regular",
        marginTop: 3,
        opacity: 0.75,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    previewToggleText: {
        color: colors.background,
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
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
    input: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 15,
        minHeight: 108,
        fontFamily: "Inter_400Regular",
        textAlignVertical: 'top',
    },
    previewContainer: {
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        minHeight: 108,
    },
    previewText: {
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        lineHeight: 23,
        color: colors.ivory,
    },
    emptyPreview: {
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: colors.textSecondary,
        fontStyle: 'italic',
        opacity: 0.7,
    }
});
