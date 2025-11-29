import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * CalloutBlock - Important point box with icon and variant types
 * Chunk 5: Callout Box (Important Point)
 */
export default function CalloutBlock({ block, onUpdate, onDelete }) {
    const [showPreview, setShowPreview] = useState(false);

    const updateField = (field, value) => {
        onUpdate({
            ...block,
            data: { ...block.data, [field]: value }
        });
    };

    const getVariantConfig = (variant) => {
        switch (variant) {
            case 'info':
                return {
                    icon: 'ℹ️',
                    label: 'Info',
                    borderColor: '#3b82f6',
                    bgColor: 'rgba(59, 130, 246, 0.08)'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    label: 'Warning',
                    borderColor: colors.gold,
                    bgColor: 'rgba(203, 164, 74, 0.08)'
                };
            case 'critical':
                return {
                    icon: '🚨',
                    label: 'Critical',
                    borderColor: '#ef4444',
                    bgColor: 'rgba(239, 68, 68, 0.08)'
                };
            default:
                return {
                    icon: 'ℹ️',
                    label: 'Info',
                    borderColor: '#3b82f6',
                    bgColor: 'rgba(59, 130, 246, 0.08)'
                };
        }
    };

    const variantConfig = getVariantConfig(block.data.variant);

    return (
        <View style={styles.container}>
            {/* Header with Delete */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>
                    ⚠️ Callout Box
                </Text>
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Variant Selector */}
            <View style={styles.variantSelector}>
                <TouchableOpacity
                    style={[
                        styles.variantButton,
                        block.data.variant === 'info' && styles.variantButtonActive
                    ]}
                    onPress={() => updateField('variant', 'info')}
                >
                    <Text style={styles.variantIcon}>ℹ️</Text>
                    <Text style={styles.variantLabel}>Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.variantButton,
                        block.data.variant === 'warning' && styles.variantButtonActive
                    ]}
                    onPress={() => updateField('variant', 'warning')}
                >
                    <Text style={styles.variantIcon}>⚠️</Text>
                    <Text style={styles.variantLabel}>Warning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.variantButton,
                        block.data.variant === 'critical' && styles.variantButtonActive
                    ]}
                    onPress={() => updateField('variant', 'critical')}
                >
                    <Text style={styles.variantIcon}>🚨</Text>
                    <Text style={styles.variantLabel}>Critical</Text>
                </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    value={block.data.title}
                    onChangeText={(text) => updateField('title', text)}
                    placeholder="e.g., Key Legal Precedent"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.titleInput}
                />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Description</Text>
                    <TouchableOpacity
                        onPress={() => setShowPreview(!showPreview)}
                        style={styles.previewToggle}
                    >
                        <Text style={styles.previewToggleText}>
                            {showPreview ? '✏️' : '👁️'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showPreview ? (
                    <View
                        style={[
                            styles.previewContainer,
                            {
                                borderLeftColor: variantConfig.borderColor,
                                backgroundColor: variantConfig.bgColor
                            }
                        ]}
                    >
                        <Text style={styles.previewIcon}>{variantConfig.icon}</Text>
                        <View style={styles.previewContent}>
                            <Text style={styles.previewTitle}>{block.data.title || 'Untitled'}</Text>
                            <Text style={styles.previewDescription}>
                                {block.data.description || 'No description'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <TextInput
                        value={block.data.description}
                        onChangeText={(text) => updateField('description', text)}
                        placeholder="Enter important point or explanation..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.descriptionInput}
                        multiline
                        numberOfLines={3}
                    />
                )}
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
    variantSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    variantButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    variantButtonActive: {
        backgroundColor: colors.card,
        borderColor: colors.gold,
        borderWidth: 2,
    },
    variantIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    variantLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '500',
        fontFamily: 'Inter_500Medium',
    },
    inputGroup: {
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    previewToggleText: {
        fontSize: 14,
    },
    titleInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    descriptionInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 70,
        textAlignVertical: 'top',
    },
    previewContainer: {
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
    },
    previewIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    previewContent: {
        flex: 1,
    },
    previewTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 6,
    },
    previewDescription: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
    },
});
