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
            presentationStyle="overFullScreen"
            statusBarTranslucent={true}
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '85%',
        borderTopWidth: 1.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        paddingBottom: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    },
    title: {
        color: colors.gold,
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay_700Bold',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        opacity: 0.8,
    },
    closeButton: {
        padding: 8,
        marginTop: -4,
        marginRight: -4,
    },
    closeButtonText: {
        color: colors.gold,
        fontSize: 26,
        fontWeight: '400',
        opacity: 0.9,
    },
    scrollView: {
        padding: 24,
        paddingTop: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: colors.ivory,
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
        letterSpacing: 0.5,
        opacity: 0.95,
    },
    blockCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    blockCardDisabled: {
        opacity: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.15)',
    },
    blockIcon: {
        fontSize: 36,
        marginRight: 18,
        width: 44,
        textAlign: 'center',
    },
    blockInfo: {
        flex: 1,
    },
    blockName: {
        color: colors.ivory,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 5,
        letterSpacing: 0.2,
    },
    blockDescription: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        lineHeight: 17,
        opacity: 0.85,
    },
    textDisabled: {
        opacity: 0.5,
    },
    comingSoonBadge: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    comingSoonText: {
        color: colors.gold,
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.3,
        opacity: 0.9,
    },
    footer: {
        paddingVertical: 24,
        paddingBottom: 32,
        alignItems: 'center',
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontStyle: 'italic',
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        opacity: 0.6,
    }
});
