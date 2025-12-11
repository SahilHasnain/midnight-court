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
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        opacity: 0.95,
        letterSpacing: 0.2,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
    },
    titleContainer: {
        marginBottom: 16,
    },
    label: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
        opacity: 0.9,
    },
    titleInput: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        minHeight: 64,
        textAlignVertical: 'top',
    },
    preview: {
        backgroundColor: colors.background,
        padding: 24,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    previewTitle: {
        color: colors.gold,
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        lineHeight: 30,
        letterSpacing: 0.3,
    },
});
