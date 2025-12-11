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
    variantSelector: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    variantButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    variantButtonActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderColor: colors.gold,
    },
    variantIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    variantLabel: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    inputGroup: {
        marginBottom: 14,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        opacity: 0.9,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    previewToggleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    titleInput: {
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    descriptionInput: {
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 74,
        textAlignVertical: 'top',
    },
    previewContainer: {
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    previewIcon: {
        fontSize: 26,
        marginRight: 14,
    },
    previewContent: {
        flex: 1,
    },
    previewTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 6,
    },
    previewDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
        opacity: 0.9,
    },
});
