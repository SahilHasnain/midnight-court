import { colors } from "@/theme/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import GoldButton from "@/components/GoldButton";
import SaveTemplateModal from "@/components/SaveTemplateModal";
import BlockPicker from "@/components/blocks/BlockPicker";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { BLOCK_TYPES, createDefaultBlock } from "@/components/blocks/blockTypes";
import { getDummySlides } from "@/utils/dummyData";
import { getCustomTemplateById, getTemplateById, saveCustomTemplate } from "@/utils/templateData";

// Parse markdown-style text: *gold*, ~red~, _blue_
const parseFormattedText = (text) => {
    if (!text) return null;

    const parts = [];
    let currentIndex = 0;

    const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            parts.push({
                text: text.substring(currentIndex, match.index),
                color: null // will use default color
            });
        }

        const matched = match[0];
        if (matched.startsWith('*') && matched.endsWith('*')) {
            parts.push({ text: matched.slice(1, -1), color: colors.gold });
        } else if (matched.startsWith('~') && matched.endsWith('~')) {
            parts.push({ text: matched.slice(1, -1), color: '#ef4444' });
        } else if (matched.startsWith('_') && matched.endsWith('_')) {
            parts.push({ text: matched.slice(1, -1), color: '#3b82f6' });
        }

        currentIndex = match.index + matched.length;
    }

    if (currentIndex < text.length) {
        parts.push({
            text: text.substring(currentIndex),
            color: null
        });
    }

    return parts.length > 0 ? parts : [{ text, color: null }];
};


export default function EditorScreen() {
    const { template, templateType } = useLocalSearchParams();

    // Multi-slide state (now using blocks instead of points)
    const [slides, setSlides] = useState([
        { title: "", subtitle: "", blocks: [createDefaultBlock(BLOCK_TYPES.TEXT)] }
    ]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [blockPickerVisible, setBlockPickerVisible] = useState(false);
    const [insertPosition, setInsertPosition] = useState(null);
    const [showHeadingPreview, setShowHeadingPreview] = useState(false);
    const [showSubtitlePreview, setShowSubtitlePreview] = useState(false);
    const [saveTemplateVisible, setSaveTemplateVisible] = useState(false);

    // TEST MODE - Only in development, zero production impact
    const [testMode, setTestMode] = useState(false);

    const currentSlide = slides[currentSlideIndex];

    // Load template or saved presentation on mount
    useEffect(() => {
        const initializePresentation = async () => {
            // Priority 1: Load template if provided
            if (template) {
                let templateData;

                // Check if it's a custom template
                if (templateType === 'custom') {
                    templateData = await getCustomTemplateById(template);
                } else {
                    templateData = getTemplateById(template, templateType || 'quick');
                }

                if (templateData && templateData.slides) {
                    // Use template's pre-configured slides
                    setSlides(templateData.slides);
                    setCurrentSlideIndex(0);
                    console.log('✅ Loaded template:', templateData.name, 'with', templateData.slides.length, 'slides');
                    return; // Exit early, don't load saved data
                }
            }

            // Priority 2: Load saved presentation if no template
            try {
                const saved = await AsyncStorage.getItem('current_presentation');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.slides) {
                        setSlides(data.slides);
                        console.log('✅ Loaded saved presentation with', data.slides.length, 'slides');
                    }
                }
            } catch (error) {
                console.error('Failed to load presentation:', error);
            }
        };

        initializePresentation();
    }, [template, templateType]);

    // Auto-save slides to AsyncStorage
    useEffect(() => {
        const savePresentation = async () => {
            try {
                const presentationData = {
                    slides,
                    template,
                    lastModified: new Date().toISOString(),
                };
                await AsyncStorage.setItem('current_presentation', JSON.stringify(presentationData));
            } catch (error) {
                console.error('Failed to save presentation:', error);
            }
        };

        // Debounce save to avoid too many writes
        const timeoutId = setTimeout(savePresentation, 1000);
        return () => clearTimeout(timeoutId);
    }, [slides, template]);

    const updateSlide = (field, value) => {
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            [field]: value
        };
        setSlides(newSlides);
    }

    // TEST MODE: Load dummy professional data
    const toggleTestMode = () => {
        if (__DEV__) {
            if (!testMode) {
                // Enable test mode - load dummy data
                const dummySlides = getDummySlides();
                setSlides(dummySlides);
                setCurrentSlideIndex(0);
                console.log('🧪 TEST MODE ENABLED: Loaded professional dummy data');
            } else {
                // Disable test mode - reset to empty
                setSlides([{ title: "", subtitle: "", blocks: [createDefaultBlock(BLOCK_TYPES.TEXT)] }]);
                setCurrentSlideIndex(0);
                console.log('🧹 TEST MODE DISABLED: Reset to empty slide');
            }
            setTestMode(!testMode);
        }
    }

    const updateBlock = (blockId, updatedBlock) => {
        const newBlocks = currentSlide.blocks.map(block =>
            block.id === blockId ? updatedBlock : block
        );
        updateSlide("blocks", newBlocks);
    }

    const addBlock = (blockType = BLOCK_TYPES.TEXT) => {
        const newBlock = createDefaultBlock(blockType);

        if (insertPosition !== null) {
            // Insert at specific position
            const newBlocks = [...currentSlide.blocks];
            newBlocks.splice(insertPosition, 0, newBlock);
            updateSlide("blocks", newBlocks);
            setInsertPosition(null);
        } else {
            // Append at end
            updateSlide("blocks", [...currentSlide.blocks, newBlock]);
        }
        setBlockPickerVisible(false);
    }

    const openInsertPicker = (position) => {
        setInsertPosition(position);
        setBlockPickerVisible(true);
    }

    const deleteBlock = (blockId) => {
        if (currentSlide.blocks.length > 1) {
            const newBlocks = currentSlide.blocks.filter(block => block.id !== blockId);
            updateSlide("blocks", newBlocks);
        }
    }

    const addSlide = () => {
        setSlides([...slides, { title: "", subtitle: "", blocks: [createDefaultBlock(BLOCK_TYPES.TEXT)] }]);
        setCurrentSlideIndex(slides.length);
    }

    const insertSlideBefore = () => {
        const newSlide = { title: "", subtitle: "", blocks: [createDefaultBlock(BLOCK_TYPES.TEXT)] };
        const newSlides = [...slides];
        newSlides.splice(currentSlideIndex, 0, newSlide);
        setSlides(newSlides);
        // Keep current index (new slide inserted before, so we're now on the new one)
    }

    const insertSlideAfter = () => {
        const newSlide = { title: "", subtitle: "", blocks: [createDefaultBlock(BLOCK_TYPES.TEXT)] };
        const newSlides = [...slides];
        newSlides.splice(currentSlideIndex + 1, 0, newSlide);
        setSlides(newSlides);
        setCurrentSlideIndex(currentSlideIndex + 1);
    }

    const deleteSlide = () => {
        if (slides.length > 1) {
            const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
            setSlides(newSlides);
            // Adjust current index if needed
            if (currentSlideIndex >= newSlides.length) {
                setCurrentSlideIndex(newSlides.length - 1);
            }
        }
    }

    const nextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    }

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    }

    const goToExport = () => {
        router.push({
            pathname: "/export",
            params: {
                slides: JSON.stringify(slides.map(s => ({
                    title: s.title,
                    subtitle: s.subtitle,
                    blocks: s.blocks
                })))
            }
        });
    }

    const handleSaveTemplate = async (name, description, icon) => {
        try {
            await saveCustomTemplate(name, description, slides, icon);
            Alert.alert('Success', `Template "${name}" saved successfully!`);
            setSaveTemplateVisible(false);
        } catch (_error) {
            Alert.alert('Error', 'Failed to save template. Please try again.');
        }
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.templateName}>{getTemplateName(template)}</Text>
                    <Text style={styles.slideCounter}>Slide {currentSlideIndex + 1} of {slides.length}</Text>
                </View>

                {/* TEST MODE TOGGLE - Only visible in development */}
                {__DEV__ && (
                    <TouchableOpacity onPress={toggleTestMode} style={styles.testModeButton}>
                        <Text style={styles.testModeText}>{testMode ? '🧪' : '📝'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Slide Navigation */}
            <View style={styles.slideNav}>
                <TouchableOpacity
                    onPress={prevSlide}
                    style={[styles.navButton, currentSlideIndex === 0 && styles.navButtonDisabled]}
                    disabled={currentSlideIndex === 0}
                >
                    <Text style={[styles.navText, currentSlideIndex === 0 && styles.navTextDisabled]}>‹ Prev</Text>
                </TouchableOpacity>

                <View style={styles.slideIndicator}>
                    {slides.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => setCurrentSlideIndex(i)}>
                            <View style={[styles.dot, i === currentSlideIndex && styles.dotActive]} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={nextSlide}
                    style={[styles.navButton, currentSlideIndex === slides.length - 1 && styles.navButtonDisabled]}
                    disabled={currentSlideIndex === slides.length - 1}
                >
                    <Text style={[styles.navText, currentSlideIndex === slides.length - 1 && styles.navTextDisabled]}>Next ›</Text>
                </TouchableOpacity>
            </View>

            {/* Main Editor */}
            <View style={styles.editorContent}>
                {/* Heading Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.label}>Heading</Text>
                            <Text style={styles.hint}>Always displays in gold</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowHeadingPreview(!showHeadingPreview)}
                            style={styles.previewToggleSmall}
                        >
                            <Text style={styles.previewToggleSmallText}>
                                {showHeadingPreview ? '✏️' : '👁️'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showHeadingPreview ? (
                        <View style={styles.headingPreview}>
                            <Text style={styles.headingPreviewText}>
                                {currentSlide.title || 'Preview: Your heading will appear here'}
                            </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={currentSlide.title}
                            onChangeText={(text) => updateSlide("title", text)}
                            placeholder="Enter heading"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.headingInput}
                        />
                    )}
                </View>

                {/* Subtitle Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.label}>Subtitle</Text>
                            <Text style={styles.hint}>Optional: Use *gold* ~red~ _blue_ for emphasis</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowSubtitlePreview(!showSubtitlePreview)}
                            style={styles.previewToggleSmall}
                        >
                            <Text style={styles.previewToggleSmallText}>
                                {showSubtitlePreview ? '✏️' : '👁️'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showSubtitlePreview ? (
                        <View style={styles.subtitlePreview}>
                            <Text style={styles.subtitlePreviewText}>
                                {parseFormattedText(currentSlide.subtitle).map((part, idx) => (
                                    <Text key={idx} style={{ color: part.color || colors.textSecondary, fontWeight: '500' }}>
                                        {part.text}
                                    </Text>
                                ))}
                            </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={currentSlide.subtitle}
                            onChangeText={(text) => updateSlide("subtitle", text)}
                            placeholder="Enter subtitle"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.input}
                        />
                    )}
                </View>

                {/* Content Blocks */}
                <Text style={styles.label}>Content Blocks</Text>
                {currentSlide.blocks.map((block, index) => (
                    <View key={block.id}>
                        {/* Insert button before first block and between blocks */}
                        {index === 0 && (
                            <TouchableOpacity
                                onPress={() => openInsertPicker(0)}
                                style={styles.insertButton}
                            >
                                <Text style={styles.insertButtonText}>+ Insert Block</Text>
                            </TouchableOpacity>
                        )}

                        <BlockRenderer
                            block={block}
                            onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock)}
                            onDelete={currentSlide.blocks.length > 1 ? () => deleteBlock(block.id) : null}
                        />

                        {/* Insert button between blocks (not after last) */}
                        {index < currentSlide.blocks.length - 1 && (
                            <TouchableOpacity
                                onPress={() => openInsertPicker(index + 1)}
                                style={styles.insertButton}
                            >
                                <Text style={styles.insertButtonText}>+ Insert Block</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <TouchableOpacity
                    onPress={() => setBlockPickerVisible(true)}
                    style={styles.addBlockButton}
                >
                    <Text style={styles.addBlockIcon}>✨</Text>
                    <View style={styles.addBlockTextContainer}>
                        <Text style={styles.addBlockTitle}>Add Content Block</Text>
                        <Text style={styles.addBlockSubtitle}>Choose from text, quotes, timelines & more</Text>
                    </View>
                    <Text style={styles.addBlockArrow}>›</Text>
                </TouchableOpacity>

                {/* Slide Management Section */}
                <View style={styles.slideManagementSection}>
                    <Text style={styles.sectionLabel}>Slide Management</Text>

                    <View style={styles.slideActionRow}>
                        <TouchableOpacity
                            onPress={insertSlideBefore}
                            style={styles.slideActionButton}
                        >
                            <Text style={styles.slideActionIcon}>⬆️</Text>
                            <Text style={styles.slideActionText}>Insert Before</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={insertSlideAfter}
                            style={styles.slideActionButton}
                        >
                            <Text style={styles.slideActionIcon}>⬇️</Text>
                            <Text style={styles.slideActionText}>Insert After</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.slideActionRow}>
                        <TouchableOpacity
                            onPress={addSlide}
                            style={[styles.slideActionButton, styles.slideActionButtonFull]}
                        >
                            <Text style={styles.slideActionIcon}>➕</Text>
                            <Text style={styles.slideActionText}>Add at End</Text>
                        </TouchableOpacity>

                        {slides.length > 1 && (
                            <TouchableOpacity
                                onPress={deleteSlide}
                                style={[styles.slideActionButton, styles.slideActionButtonDanger]}
                            >
                                <Text style={styles.slideActionIcon}>🗑️</Text>
                                <Text style={styles.slideActionTextDanger}>Delete Slide</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Save as Template Button */}
                <TouchableOpacity
                    onPress={() => setSaveTemplateVisible(true)}
                    style={styles.saveTemplateButton}
                >
                    <Text style={styles.saveTemplateIcon}>💾</Text>
                    <Text style={styles.saveTemplateText}>Save as Custom Template</Text>
                </TouchableOpacity>

                <GoldButton
                    title="Continue to Export"
                    onPress={goToExport}
                />
            </View>

            {/* Block Picker Modal */}
            <BlockPicker
                visible={blockPickerVisible}
                onClose={() => {
                    setBlockPickerVisible(false);
                    setInsertPosition(null);
                }}
                onSelectBlock={(blockType) => addBlock(blockType)}
            />

            {/* Save Template Modal */}
            <SaveTemplateModal
                visible={saveTemplateVisible}
                onClose={() => setSaveTemplateVisible(false)}
                onSave={handleSaveTemplate}
            />
        </ScrollView>
    )
}

const getTemplateName = (template) => {
    const names = {
        title: "Title Slide",
        case: "Case Summary",
        judgement: "Judgement",
        arguments: "Arguments vs Counter",
        precedent: "Legal Precedent",
        verdict: "Verdict & Conclusion"
    };
    return names[template] || "Title Slide";
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
        marginLeft: -50, // Center compensation for back button
    },
    templateName: {
        color: colors.ivory,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "PlayfairDisplay_700Bold",
    },
    slideCounter: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
        fontFamily: "Inter_400Regular",
    },
    testModeButton: {
        backgroundColor: colors.card,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    testModeText: {
        fontSize: 18,
    },
    editorContent: {
        padding: 20,
    },
    label: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
        marginBottom: 4,
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: "Inter_400Regular",
        marginTop: 2,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    previewToggleSmall: {
        backgroundColor: colors.gold,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    previewToggleSmallText: {
        fontSize: 14,
    },
    headingInput: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "Inter_700Bold",
        minHeight: 60,
    },
    headingPreview: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        minHeight: 60,
        justifyContent: 'center',
    },
    headingPreviewText: {
        fontSize: 20,
        fontFamily: "Inter_700Bold",
        lineHeight: 28,
        color: colors.gold,
    },
    subtitlePreview: {
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        minHeight: 50,
        justifyContent: 'center',
    },
    subtitlePreviewText: {
        fontSize: 15,
        fontFamily: "Inter_500Medium",
        lineHeight: 22,
    },
    input: {
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        marginBottom: 12,
        fontSize: 15,
        fontFamily: "Inter_400Regular",
    },
    addButton: {
        marginBottom: 12,
        marginTop: 8,
    },
    slideNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
    },
    navButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navText: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    navTextDisabled: {
        color: colors.textSecondary,
    },
    slideIndicator: {
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textSecondary,
        opacity: 0.3,
    },
    dotActive: {
        backgroundColor: colors.gold,
        opacity: 1,
        width: 24,
    },
    imageContainer: {
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        overflow: "hidden",
    },
    imagePreview: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    removeImageButton: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(11, 17, 32, 0.85)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    removeImageText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "600",
    },
    imagePlaceholder: {
        backgroundColor: colors.card,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 40,
        alignItems: "center",
        marginBottom: 16,
    },
    imagePlaceholderIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    pointInput: {
        flex: 1,
        backgroundColor: colors.card,
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
        backgroundColor: colors.card,
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
    addBlockButton: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        marginTop: 8,
        borderWidth: 2,
        borderColor: colors.gold,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    addBlockIcon: {
        fontSize: 28,
        marginRight: 14,
    },
    addBlockTextContainer: {
        flex: 1,
    },
    addBlockTitle: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 3,
    },
    addBlockSubtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        lineHeight: 16,
    },
    addBlockArrow: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '300',
    },
    insertButton: {
        alignSelf: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderStyle: 'dashed',
        opacity: 0.5,
        marginVertical: 8,
        backgroundColor: 'transparent',
    },
    insertButtonText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    slideManagementSection: {
        marginTop: 24,
        marginBottom: 16,
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    sectionLabel: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 12,
    },
    slideActionRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    slideActionButton: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.borderGold,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    slideActionButtonFull: {
        flex: 1,
    },
    slideActionButtonDanger: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    slideActionIcon: {
        fontSize: 16,
    },
    slideActionText: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    slideActionTextDanger: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    saveTemplateButton: {
        backgroundColor: colors.surface,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },
    saveTemplateIcon: {
        fontSize: 18,
    },
    saveTemplateText: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
})