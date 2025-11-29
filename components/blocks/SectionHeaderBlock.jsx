import { colors } from "@/theme/colors";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * SectionHeaderBlock - Big title section break
 * Chunk 10: Section Header & Dividers
 */
export default function SectionHeaderBlock({ block, onUpdate, onDelete }) {
    const updateField = (field, value) => {
        onUpdate({
            ...block,
            data: { ...block.data, [field]: value }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header with Delete */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>🌟 Section Header</Text>
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Big Title Input */}
            <View style={styles.titleContainer}>
                <Text style={styles.label}>Section Title</Text>
                <TextInput
                    value={block.data.title}
                    onChangeText={(text) => updateField('title', text)}
                    placeholder="Enter section title..."
                    placeholderTextColor={colors.textSecondary}
                    style={styles.titleInput}
                    multiline
                />
            </View>

            {/* Preview */}
            <View style={styles.preview}>
                <Text style={styles.previewTitle}>
                    {block.data.title || 'Section Title'}
                </Text>
            </View>
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
    titleContainer: {
        marginBottom: 16,
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
    },
    titleInput: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    preview: {
        backgroundColor: colors.background,
        padding: 24,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    previewTitle: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        lineHeight: 32,
    },
});
