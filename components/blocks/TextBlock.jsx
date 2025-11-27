import { colors } from "@/theme/colors";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TextBlock({ block, onUpdate, onDelete }) {
    const { points } = block.data;

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
                <Text style={styles.label}>📝 Key Points</Text>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.deleteBlock}>
                        <Text style={styles.deleteBlockText}>✕ Remove Block</Text>
                    </TouchableOpacity>
                )}
            </View>

            {points.map((point, i) => (
                <View key={i} style={styles.pointRow}>
                    <TextInput
                        value={point}
                        onChangeText={(text) => updatePoint(i, text)}
                        placeholder={`Point ${i + 1}`}
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
