import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Parse markdown-style text: *gold*, ~red~, _blue_
const parseFormattedText = (text) => {
    if (!text) return null;

    const parts = [];
    let currentIndex = 0;

    // Regex to match *gold*, ~red~, _blue_
    const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > currentIndex) {
            parts.push({
                text: text.substring(currentIndex, match.index),
                color: colors.ivory
            });
        }

        // Add the matched formatted text
        const matched = match[0];
        if (matched.startsWith('*') && matched.endsWith('*')) {
            parts.push({ text: matched.slice(1, -1), color: colors.gold });
        } else if (matched.startsWith('~') && matched.endsWith('~')) {
            parts.push({ text: matched.slice(1, -1), color: '#ef4444' }); // red
        } else if (matched.startsWith('_') && matched.endsWith('_')) {
            parts.push({ text: matched.slice(1, -1), color: '#3b82f6' }); // blue
        }

        currentIndex = match.index + matched.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
        parts.push({
            text: text.substring(currentIndex),
            color: colors.ivory
        });
    }

    return parts.length > 0 ? parts : [{ text, color: colors.ivory }];
};

export default function TextBlock({ block, onUpdate, onDelete }) {
    const { points } = block.data;
    const [showPreview, setShowPreview] = useState(false);

    const updatePoint = (index, text) => {
        const newPoints = [...points];
        newPoints[index] = text;
        onUpdate({ ...block, data: { ...block.data, points: newPoints } });
    };

    const addPoint = () => {
        const newPoints = [...points, ''];
        onUpdate({ ...block, data: { ...block.data, points: newPoints } });
    };

    const deletePoint = (index) => {
        if (points.length > 1) {
            const newPoints = points.filter((_, i) => i !== index);
            onUpdate({ ...block, data: { ...block.data, points: newPoints } });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>📝 Key Points</Text>
                    <Text style={styles.hint}>*gold* ~red~ _blue_</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={() => setShowPreview(!showPreview)}
                        style={styles.previewToggle}
                    >
                        <Text style={styles.previewToggleText}>
                            {showPreview ? '✏️ Edit' : '👁️ Preview'}
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
                    {points.map((point, i) => {
                        if (!point || !point.trim()) return null;
                        const parts = parseFormattedText(point);
                        return (
                            <View key={i} style={styles.previewPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.previewText}>
                                    {parts.map((part, idx) => (
                                        <Text key={idx} style={{ color: part.color, fontWeight: '500' }}>
                                            {part.text}
                                        </Text>
                                    ))}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <>
                    {points.map((point, i) => (
                        <View key={i} style={styles.pointRow}>
                            <TextInput
                                value={point}
                                onChangeText={(text) => updatePoint(i, text)}
                                placeholder={`Point ${i + 1} - Use *gold* ~red~ _blue_`}
                                placeholderTextColor={colors.textSecondary}
                                style={styles.pointInput}
                                multiline
                            />
                            {points.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => deletePoint(i)}
                                    style={styles.deletePointButton}
                                >
                                    <Text style={styles.deletePointText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </>
            )}

            {!showPreview && (
                <TouchableOpacity onPress={addPoint} style={styles.addPointButton}>
                    <Text style={styles.addPointText}>+ Add Point</Text>
                </TouchableOpacity>
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    label: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: "Inter_400Regular",
        marginTop: 2,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    previewToggleText: {
        color: colors.background,
        fontSize: 12,
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
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    pointInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 15,
        minHeight: 50,
        fontFamily: "Inter_400Regular",
    },
    deletePointButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: "#ef4444",
        borderRadius: 12,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    deletePointText: {
        color: "#ef4444",
        fontSize: 18,
        fontWeight: "600",
    },
    previewContainer: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    previewPoint: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 8,
    },
    bullet: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
    },
    previewText: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter_500Medium",
        lineHeight: 22,
    },
    addPointButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    addPointText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    }
});
