import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * TwoColumnBlock - Arguments vs Counter-Arguments side-by-side
 * Chunk 6: Two-Column Layout
 */
export default function TwoColumnBlock({ block, onUpdate, onDelete }) {
    const [showPreview, setShowPreview] = useState(false);

    const updateField = (field, value) => {
        onUpdate({
            ...block,
            data: { ...block.data, [field]: value }
        });
    };

    const updateLeftPoint = (index, value) => {
        const newLeftPoints = [...block.data.leftPoints];
        newLeftPoints[index] = value;
        updateField('leftPoints', newLeftPoints);
    };

    const updateRightPoint = (index, value) => {
        const newRightPoints = [...block.data.rightPoints];
        newRightPoints[index] = value;
        updateField('rightPoints', newRightPoints);
    };

    const addLeftPoint = () => {
        updateField('leftPoints', [...block.data.leftPoints, '']);
    };

    const addRightPoint = () => {
        updateField('rightPoints', [...block.data.rightPoints, '']);
    };

    const deleteLeftPoint = (index) => {
        if (block.data.leftPoints.length > 1) {
            const newLeftPoints = block.data.leftPoints.filter((_, i) => i !== index);
            updateField('leftPoints', newLeftPoints);
        }
    };

    const deleteRightPoint = (index) => {
        if (block.data.rightPoints.length > 1) {
            const newRightPoints = block.data.rightPoints.filter((_, i) => i !== index);
            updateField('rightPoints', newRightPoints);
        }
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
                <Text style={styles.headerLabel}>⚔️ Two-Column Layout</Text>
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
                // Preview Mode - Side by side on mobile (will stack if narrow)
                <View style={styles.previewContainer}>
                    <View style={styles.previewColumn}>
                        <Text style={styles.previewColumnTitle}>
                            {block.data.leftTitle || 'Arguments'}
                        </Text>
                        {block.data.leftPoints.filter(p => p.trim()).map((point, idx) => (
                            <View key={idx} style={styles.previewPoint}>
                                <Text style={styles.previewPointText}>
                                    {parseFormattedText(point).map((part, i) => (
                                        <Text key={i} style={{ color: part.color || colors.textSecondary }}>
                                            {part.text}
                                        </Text>
                                    ))}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.previewDivider} />

                    <View style={styles.previewColumn}>
                        <Text style={[styles.previewColumnTitle, { color: '#ef4444' }]}>
                            {block.data.rightTitle || 'Counter Arguments'}
                        </Text>
                        {block.data.rightPoints.filter(p => p.trim()).map((point, idx) => (
                            <View key={idx} style={styles.previewPoint}>
                                <Text style={styles.previewPointText}>
                                    {parseFormattedText(point).map((part, i) => (
                                        <Text key={i} style={{ color: part.color || colors.textSecondary }}>
                                            {part.text}
                                        </Text>
                                    ))}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                // Edit Mode - Stacked vertically for easy mobile editing
                <View style={styles.editContainer}>
                    {/* Left Column */}
                    <View style={styles.columnSection}>
                        <View style={styles.columnHeader}>
                            <Text style={styles.columnLabel}>Left Column</Text>
                        </View>
                        <TextInput
                            value={block.data.leftTitle}
                            onChangeText={(text) => updateField('leftTitle', text)}
                            placeholder="e.g., Arguments"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.titleInput}
                        />

                        {block.data.leftPoints.map((point, index) => (
                            <View key={index} style={styles.pointRow}>
                                <TextInput
                                    value={point}
                                    onChangeText={(text) => updateLeftPoint(index, text)}
                                    placeholder="Enter point..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.pointInput}
                                    multiline
                                />
                                {block.data.leftPoints.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => deleteLeftPoint(index)}
                                        style={styles.deletePointButton}
                                    >
                                        <Text style={styles.deletePointText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity onPress={addLeftPoint} style={styles.addPointButton}>
                            <Text style={styles.addPointText}>+ Add Point</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Right Column */}
                    <View style={styles.columnSection}>
                        <View style={styles.columnHeader}>
                            <Text style={styles.columnLabel}>Right Column</Text>
                        </View>
                        <TextInput
                            value={block.data.rightTitle}
                            onChangeText={(text) => updateField('rightTitle', text)}
                            placeholder="e.g., Counter Arguments"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.titleInput}
                        />

                        {block.data.rightPoints.map((point, index) => (
                            <View key={index} style={styles.pointRow}>
                                <TextInput
                                    value={point}
                                    onChangeText={(text) => updateRightPoint(index, text)}
                                    placeholder="Enter point..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.pointInput}
                                    multiline
                                />
                                {block.data.rightPoints.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => deleteRightPoint(index)}
                                        style={styles.deletePointButton}
                                    >
                                        <Text style={styles.deletePointText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity onPress={addRightPoint} style={styles.addPointButton}>
                            <Text style={styles.addPointText}>+ Add Point</Text>
                        </TouchableOpacity>
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
        borderRadius: 14,
        padding: 20,
        marginBottom: 28,
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
    headerLabel: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        maxWidth: '60%',
        flexWrap: 'wrap',
        textAlign: "center",
        marginLeft: -10
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
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
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    editContainer: {
        gap: 16,
    },
    columnSection: {
        gap: 8,
    },
    columnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    columnLabel: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.95,
        letterSpacing: 0.2,
        fontFamily: 'Inter_600SemiBold',
    },
    titleInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    pointRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    pointInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 44,
    },
    deletePointButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deletePointText: {
        color: '#ef4444',
        fontSize: 14,
    },
    addPointButton: {
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        alignItems: 'center',
    },
    addPointText: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    previewContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    previewColumn: {
        flex: 1,
    },
    previewColumnTitle: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 12,
    },
    previewPoint: {
        marginBottom: 8,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(212, 175, 55, 0.25)',
    },
    previewPointText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
    },
    previewDivider: {
        width: 2,
        backgroundColor: 'rgba(212, 175, 55, 0.25)',
    },
});
