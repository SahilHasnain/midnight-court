import { colors } from "@/theme/colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * DividerBlock - Visual separator with multiple styles
 * Chunk 10: Section Header & Dividers
 */
export default function DividerBlock({ block, onUpdate, onDelete }) {
    const updateStyle = (style) => {
        onUpdate({
            ...block,
            data: { ...block.data, style }
        });
    };

    const getDividerPreview = () => {
        switch (block.data.style) {
            case 'solid':
                return (
                    <View style={styles.solidDivider}>
                        <View style={styles.solidLine} />
                        <Text style={styles.scaleIcon}>⚖️</Text>
                        <View style={styles.solidLine} />
                    </View>
                );
            case 'dotted':
                return (
                    <View style={styles.dottedContainer}>
                        {[...Array(15)].map((_, i) => (
                            <View key={i} style={styles.dot} />
                        ))}
                    </View>
                );
            case 'gradient':
                return (
                    <View style={styles.gradientContainer}>
                        <View style={[styles.gradientLine, { opacity: 0.1 }]} />
                        <View style={[styles.gradientLine, { opacity: 0.3 }]} />
                        <View style={[styles.gradientLine, { opacity: 0.6 }]} />
                        <View style={[styles.gradientLine, { opacity: 0.3 }]} />
                        <View style={[styles.gradientLine, { opacity: 0.1 }]} />
                    </View>
                );
            default:
                return <View style={styles.solidLine} />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header with Delete */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>✨ Divider</Text>
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Style Selector */}
            <View style={styles.styleSelector}>
                <Text style={styles.label}>Divider Style</Text>
                <View style={styles.styleButtons}>
                    <TouchableOpacity
                        style={[
                            styles.styleButton,
                            block.data.style === 'solid' && styles.styleButtonActive
                        ]}
                        onPress={() => updateStyle('solid')}
                    >
                        <Text style={styles.styleButtonText}>⚖️ Solid</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.styleButton,
                            block.data.style === 'dotted' && styles.styleButtonActive
                        ]}
                        onPress={() => updateStyle('dotted')}
                    >
                        <Text style={styles.styleButtonText}>••• Dotted</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.styleButton,
                            block.data.style === 'gradient' && styles.styleButtonActive
                        ]}
                        onPress={() => updateStyle('gradient')}
                    >
                        <Text style={styles.styleButtonText}>≡ Gradient</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Preview */}
            <View style={styles.preview}>
                {getDividerPreview()}
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
    styleSelector: {
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
    styleButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    styleButton: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        alignItems: 'center',
    },
    styleButtonActive: {
        backgroundColor: colors.card,
        borderColor: colors.gold,
        borderWidth: 2,
    },
    styleButtonText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    preview: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
    },
    solidDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    solidLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.gold,
    },
    scaleIcon: {
        fontSize: 20,
    },
    dottedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gold,
    },
    gradientContainer: {
        gap: 4,
    },
    gradientLine: {
        height: 2,
        backgroundColor: colors.gold,
    },
});
