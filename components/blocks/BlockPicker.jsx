import { colors } from "@/theme/colors";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BLOCK_METADATA, BLOCK_TYPES } from "./blockTypes";

export default function BlockPicker({ visible, onClose, onSelectBlock }) {
    // Group blocks by category
    const basicBlocks = Object.entries(BLOCK_METADATA).filter(([_, meta]) => meta.category === 'basic');
    const emphasisBlocks = Object.entries(BLOCK_METADATA).filter(([_, meta]) => meta.category === 'emphasis');
    const layoutBlocks = Object.entries(BLOCK_METADATA).filter(([_, meta]) => meta.category === 'layout');
    const advancedBlocks = Object.entries(BLOCK_METADATA).filter(([_, meta]) => meta.category === 'advanced');

    const handleSelectBlock = (blockType) => {
        onSelectBlock(blockType);
        onClose();
    };

    const renderBlockCard = ([blockType, metadata]) => {
        // Enable all blocks except IMAGE_GRID
        const isAvailable = blockType === BLOCK_TYPES.TEXT ||
            blockType === BLOCK_TYPES.PARAGRAPH ||
            blockType === BLOCK_TYPES.QUOTE ||
            blockType === BLOCK_TYPES.CALLOUT ||
            blockType === BLOCK_TYPES.TWO_COLUMN ||
            blockType === BLOCK_TYPES.TIMELINE ||
            blockType === BLOCK_TYPES.EVIDENCE ||
            blockType === BLOCK_TYPES.SECTION_HEADER ||
            blockType === BLOCK_TYPES.DIVIDER ||
            blockType === BLOCK_TYPES.IMAGE;

        return (
            <TouchableOpacity
                key={blockType}
                style={[styles.blockCard, !isAvailable && styles.blockCardDisabled]}
                activeOpacity={0.7}
                onPress={() => isAvailable && handleSelectBlock(blockType)}
                disabled={!isAvailable}
            >
                <Text style={styles.blockIcon}>{metadata.icon}</Text>
                <View style={styles.blockInfo}>
                    <Text style={[styles.blockName, !isAvailable && styles.textDisabled]}>
                        {metadata.name}
                    </Text>
                    <Text style={[styles.blockDescription, !isAvailable && styles.textDisabled]}>
                        {metadata.description}
                    </Text>
                </View>
                {!isAvailable && (
                    <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Add Content Block</Text>
                            <Text style={styles.subtitle}>Choose a block type for your slide</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Basic Section */}
                        {basicBlocks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📌 Basic</Text>
                                {basicBlocks.map(renderBlockCard)}
                            </View>
                        )}

                        {/* Emphasis Section */}
                        {emphasisBlocks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>✨ Emphasis</Text>
                                {emphasisBlocks.map(renderBlockCard)}
                            </View>
                        )}

                        {/* Layout Section */}
                        {layoutBlocks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📐 Layout</Text>
                                {layoutBlocks.map(renderBlockCard)}
                            </View>
                        )}

                        {/* Advanced Section */}
                        {advancedBlocks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>🚀 Advanced</Text>
                                {advancedBlocks.map(renderBlockCard)}
                            </View>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                More block types coming in next updates! 🎉
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        borderTopWidth: 2,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderGold,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
    },
    title: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay_700Bold',
        marginBottom: 4,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    closeButton: {
        padding: 8,
        marginTop: -4,
    },
    closeButtonText: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '600',
    },
    scrollView: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: colors.ivory,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 12,
    },
    blockCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    blockCardDisabled: {
        opacity: 0.5,
        borderColor: colors.textSecondary,
    },
    blockIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    blockInfo: {
        flex: 1,
    },
    blockName: {
        color: colors.ivory,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 4,
    },
    blockDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        lineHeight: 18,
    },
    textDisabled: {
        opacity: 0.6,
    },
    comingSoonBadge: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    comingSoonText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    }
});
