import { colors } from "@/theme/colors";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TextBlock({ block, onUpdate, onDelete }) {
    const { points } = block.data;

    const updatePoint = (index, text) => {
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], text };
        onUpdate({ ...block, data: { ...block.data, points: newPoints } });
    };

    const toggleHighlight = (index) => {
        const newPoints = [...points];
        newPoints[index] = { 
            ...newPoints[index], 
            highlighted: !newPoints[index].highlighted 
        };
        onUpdate({ ...block, data: { ...block.data, points: newPoints } });
    };

    const toggleHighlightStyle = (index) => {
        const newPoints = [...points];
        const currentStyle = newPoints[index].highlightStyle || 'background';
        newPoints[index] = { 
            ...newPoints[index], 
            highlightStyle: currentStyle === 'background' ? 'underline' : 'background'
        };
        onUpdate({ ...block, data: { ...block.data, points: newPoints } });
    };

    const addPoint = () => {
        const newPoints = [...points, { text: '', highlighted: false, highlightStyle: 'background' }];
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
                <Text style={styles.label}>📝 Key Points</Text>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.deleteBlock}>
                        <Text style={styles.deleteBlockText}>✕ Remove Block</Text>
                    </TouchableOpacity>
                )}
            </View>

            {points.map((point, i) => {
                const pointData = typeof point === 'string' ? { text: point, highlighted: false, highlightStyle: 'background' } : point;
                const { text, highlighted, highlightStyle = 'background' } = pointData;

                return (
                    <View key={i} style={styles.pointContainer}>
                        <View style={styles.pointRow}>
                            <TextInput
                                value={text}
                                onChangeText={(newText) => updatePoint(i, newText)}
                                placeholder={`Point ${i + 1}`}
                                placeholderTextColor={colors.textSecondary}
                                style={styles.pointInput}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={() => toggleHighlight(i)}
                                style={[styles.highlightButton, highlighted && styles.highlightButtonActive]}
                            >
                                <Text style={styles.highlightButtonText}>✨</Text>
                            </TouchableOpacity>
                            {points.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => deletePoint(i)}
                                    style={styles.deletePointButton}
                                >
                                    <Text style={styles.deletePointText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {highlighted && (
                            <View style={styles.highlightControls}>
                                <TouchableOpacity 
                                    onPress={() => toggleHighlightStyle(i)}
                                    style={styles.styleToggle}
                                >
                                    <Text style={styles.styleToggleText}>
                                        {highlightStyle === 'background' ? '🎨 Background' : '📏 Underline'}
                                    </Text>
                                </TouchableOpacity>
                                {text && (
                                    <Text style={[
                                        styles.preview,
                                        highlightStyle === 'background' ? styles.goldBackground : styles.goldUnderline
                                    ]}>
                                        {text}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}

            <TouchableOpacity onPress={addPoint} style={styles.addPointButton}>
                <Text style={styles.addPointText}>+ Add Point</Text>
            </TouchableOpacity>
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
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    deleteBlockText: {
        color: "#ef4444",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    pointContainer: {
        marginBottom: 12,
    },
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
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
    highlightButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    highlightButtonActive: {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
    },
    highlightButtonText: {
        fontSize: 20,
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
    highlightControls: {
        marginTop: 8,
        marginLeft: 4,
        gap: 8,
    },
    styleToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    styleToggleText: {
        color: colors.background,
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    preview: {
        fontSize: 15,
        fontWeight: "700",
        fontFamily: "Inter_700Bold",
        color: colors.ivory,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    goldBackground: {
        backgroundColor: colors.gold,
        color: colors.background,
        borderRadius: 6,
    },
    goldUnderline: {
        textDecorationLine: 'underline',
        textDecorationColor: colors.gold,
        textDecorationStyle: 'solid',
    },
    addPointButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    addPointText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    }
});
