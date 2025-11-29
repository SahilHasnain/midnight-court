import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * EvidenceBlock - Structured evidence presentation card
 * Chunk 8: Evidence/Case Box
 */
export default function EvidenceBlock({ block, onUpdate, onDelete }) {
    const [showPreview, setShowPreview] = useState(false);

    const updateField = (field, value) => {
        onUpdate({
            ...block,
            data: { ...block.data, [field]: value }
        });
    };

    // Parse markdown for preview
    const parseFormattedText = (text) => {
        if (!text) return [{ text: '', color: null }];

        const parts = [];
        let currentIndex = 0;
        const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > currentIndex) {
                parts.push({
                    text: text.substring(currentIndex, match.index),
                    color: null
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
                color: null
            });
        }

        return parts.length > 0 ? parts : [{ text, color: null }];
    };

    return (
        <View style={styles.container}>
            {/* Header with Delete */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>🗂️ Evidence Card</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => setShowPreview(!showPreview)}
                        style={styles.previewToggle}
                    >
                        <Text style={styles.previewToggleText}>
                            {showPreview ? '✏️' : '👁️'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showPreview ? (
                // Preview Mode - Evidence card
                <View style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewEvidenceNumber}>
                            {block.data.evidenceName || 'Evidence #'}
                        </Text>
                    </View>
                    <Text style={styles.previewSummary}>
                        {parseFormattedText(block.data.summary || 'No summary').map((part, i) => (
                            <Text key={i} style={{ color: part.color || colors.textSecondary }}>
                                {part.text}
                            </Text>
                        ))}
                    </Text>
                    {block.data.citation && (
                        <View style={styles.previewCitationContainer}>
                            <Text style={styles.previewCitationLabel}>Source:</Text>
                            <Text style={styles.previewCitation}>{block.data.citation}</Text>
                        </View>
                    )}
                </View>
            ) : (
                // Edit Mode
                <View style={styles.editContainer}>
                    {/* Evidence Name/Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Evidence Name/Number</Text>
                        <TextInput
                            value={block.data.evidenceName}
                            onChangeText={(text) => updateField('evidenceName', text)}
                            placeholder="e.g., Exhibit A, Document 1, Witness Statement"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.nameInput}
                        />
                    </View>

                    {/* Summary */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Summary</Text>
                        <TextInput
                            value={block.data.summary}
                            onChangeText={(text) => updateField('summary', text)}
                            placeholder="Brief description of the evidence..."
                            placeholderTextColor={colors.textSecondary}
                            style={styles.summaryInput}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Citation */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Citation/Source (Optional)</Text>
                        <TextInput
                            value={block.data.citation}
                            onChangeText={(text) => updateField('citation', text)}
                            placeholder="e.g., Page 45, Police Report dated 10/01/2024"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.citationInput}
                        />
                    </View>

                    <Text style={styles.hint}>*gold* ~red~ _blue_</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLabel: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    previewToggleText: {
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: colors.background,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    editContainer: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    nameInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gold,
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    summaryInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 90,
        textAlignVertical: 'top',
    },
    citationInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        fontStyle: 'italic',
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    previewCard: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.gold,
    },
    previewHeader: {
        marginBottom: 12,
    },
    previewEvidenceNumber: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
    },
    previewSummary: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        lineHeight: 22,
        marginBottom: 12,
    },
    previewCitationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold,
    },
    previewCitationLabel: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    previewCitation: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        fontStyle: 'italic',
    },
});
