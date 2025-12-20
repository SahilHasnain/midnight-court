import { colors } from "@/theme/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import CitationSearchModal from "@/components/CitationSearchModal";
import GoldButton from "@/components/GoldButton";
import ImageSearchModal from "@/components/ImageSearchModal";
import SaveTemplateModal from "@/components/SaveTemplateModal";
import SlideGeneratorModal from "@/components/SlideGeneratorModal";
import Toast from "@/components/Toast";
import BlockPicker from "@/components/blocks/BlockPicker";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { BLOCK_TYPES, createDefaultBlock } from "@/components/blocks/blockTypes";
import { getDummySlides } from "@/utils/dummyData";
import { getCustomTemplateById, getTemplateById, saveCustomTemplate } from "@/utils/templateData";

// Parse markdown-style text: *gold*, ~red~, _blue_
const parseFormattedText = (text) => {
    if (!text) return [{ text: '', color: null }];

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
    const [imageSearchVisible, setImageSearchVisible] = useState(false);
    const [selectedImageBlockId, setSelectedImageBlockId] = useState(null);
    const [citationSearchVisible, setCitationSearchVisible] = useState(false);
    const [selectedQuoteBlockId, setSelectedQuoteBlockId] = useState(null);
    const [slideGeneratorVisible, setSlideGeneratorVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    // TEST MODE - Only in development, zero production impact
    const [testMode, setTestMode] = useState(false);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const currentSlide = slides[currentSlideIndex] || { title: "", subtitle: "", blocks: [] };

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
        const newBlocks = currentSlide.blocks.filter(block => block.id !== blockId);
        updateSlide("blocks", newBlocks);
    }

    const addSlide = () => {
        setSlides([...slides, { title: "", subtitle: "", blocks: [] }]);
        setCurrentSlideIndex(slides.length);
        showToastMessage("✨ Slide added");
    }

    const insertSlideBefore = () => {
        const newSlide = { title: "", subtitle: "", blocks: [] };
        const newSlides = [...slides];
        newSlides.splice(currentSlideIndex, 0, newSlide);
        setSlides(newSlides);
        showToastMessage("⬆️ Slide inserted before");
        // Keep current index (new slide inserted before, so we're now on the new one)
    }

    const insertSlideAfter = () => {
        const newSlide = { title: "", subtitle: "", blocks: [] };
        const newSlides = [...slides];
        newSlides.splice(currentSlideIndex + 1, 0, newSlide);
        setSlides(newSlides);
        setCurrentSlideIndex(currentSlideIndex + 1);
        showToastMessage("⬇️ Slide inserted after");
    }

    const deleteSlide = () => {
        if (slides.length > 1) {
            const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
            setSlides(newSlides);
            showToastMessage("🗑️ Slide deleted");
            // Adjust current index if needed
            if (currentSlideIndex >= newSlides.length) {
                setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
            }
        } else {
            // Last slide - reset to empty
            setSlides([{ title: "", subtitle: "", blocks: [] }]);
            setCurrentSlideIndex(0);
            showToastMessage("🗑️ Slide cleared");
        }
    }

    const duplicateSlide = () => {
        const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
        const newSlides = [...slides];
        newSlides.splice(currentSlideIndex + 1, 0, duplicatedSlide);
        setSlides(newSlides);
        setCurrentSlideIndex(currentSlideIndex + 1);
        showToastMessage("📋 Slide duplicated");
    }

    const moveSlideUp = () => {
        if (currentSlideIndex > 0) {
            const newSlides = [...slides];
            [newSlides[currentSlideIndex - 1], newSlides[currentSlideIndex]] =
                [newSlides[currentSlideIndex], newSlides[currentSlideIndex - 1]];
            setSlides(newSlides);
            setCurrentSlideIndex(currentSlideIndex - 1);
            showToastMessage("⬆️ Slide moved up");
        }
    }

    const moveSlideDown = () => {
        if (currentSlideIndex < slides.length - 1) {
            const newSlides = [...slides];
            [newSlides[currentSlideIndex], newSlides[currentSlideIndex + 1]] =
                [newSlides[currentSlideIndex + 1], newSlides[currentSlideIndex]];
            setSlides(newSlides);
            setCurrentSlideIndex(currentSlideIndex + 1);
            showToastMessage("⬇️ Slide moved down");
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
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>‹ Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.templateName}>{getTemplateName(template)}</Text>
                        <Text style={styles.slideCounter}>Slide {currentSlideIndex + 1} of {slides.length}</Text>
                    </View>

                    {/* Dev controls */}
                    <View style={styles.devButtonsContainer}>
                        <TouchableOpacity
                            style={styles.geminiTestButton}
                            onPress={() => router.push('/dev/gemini-test')}
                        >
                            <Text style={styles.geminiTestText}>🔧</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.geminiTestButton}
                            onPress={() => router.push('/dev/citation-test')}
                        >
                            <Text style={styles.geminiTestText}>⚖️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.geminiTestButton}
                            onPress={() => router.push('/dev/slide-gen-test')}
                        >
                            <Text style={styles.geminiTestText}>🎨</Text>
                        </TouchableOpacity>
                    </View>
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
                                    {currentSlide.title || ''}
                                </Text>
                                {!currentSlide.title && (
                                    <Text style={[styles.headingPreviewText, { opacity: 0.4 }]}>
                                        Preview: Your heading will appear here
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <TextInput
                                value={currentSlide.title || ""}
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
                                {currentSlide.subtitle ? (
                                    <Text style={styles.subtitlePreviewText}>
                                        {parseFormattedText(currentSlide.subtitle).map((part, idx) => (
                                            <Text key={idx} style={{ color: part.color || colors.textSecondary, fontWeight: '500' }}>
                                                {part.text}
                                            </Text>
                                        ))}
                                    </Text>
                                ) : (
                                    <Text style={[styles.subtitlePreviewText, { opacity: 0.4, color: colors.textSecondary }]}>
                                        Preview: Your subtitle will appear here
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <TextInput
                                value={currentSlide.subtitle || ""}
                                onChangeText={(text) => updateSlide("subtitle", text)}
                                placeholder="Enter subtitle"
                                placeholderTextColor={colors.textSecondary}
                                style={styles.input}
                            />
                        )}
                    </View>

                    {/* Content Blocks */}
                    <Text style={styles.label}>Content Blocks</Text>
                    {currentSlide.blocks && currentSlide.blocks.length > 0 ? (
                        currentSlide.blocks.map((block, index) => (
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
                                onDelete={() => deleteBlock(block.id)}
                                onOpenImageSearch={(blockId) => {
                                    setSelectedImageBlockId(blockId);
                                    setImageSearchVisible(true);
                                }}
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
                    )))
                     : (
                        <View style={styles.emptyBlocksContainer}>
                            <Text style={styles.emptyBlocksText}>No content blocks yet</Text>
                            <Text style={styles.emptyBlocksHint}>Add your first block below</Text>
                        </View>
                    )}

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

                    {/* Find Citation Button */}
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedQuoteBlockId(null);
                            setCitationSearchVisible(true);
                        }}
                        style={styles.findCitationButton}
                    >
                        <Text style={styles.findCitationIcon}>⚖️</Text>
                        <View style={styles.addBlockTextContainer}>
                            <Text style={styles.addBlockTitle}>Find Legal Citation</Text>
                            <Text style={styles.addBlockSubtitle}>Search cases, articles & laws with AI</Text>
                        </View>
                        <Text style={styles.addBlockArrow}>›</Text>
                    </TouchableOpacity>

                    {/* Generate Slides Button */}
                    <TouchableOpacity
                        onPress={() => setSlideGeneratorVisible(true)}
                        style={styles.generateSlidesButton}
                    >
                        <Text style={styles.generateSlidesIcon}>🤖</Text>
                        <View style={styles.addBlockTextContainer}>
                            <Text style={styles.addBlockTitle}>Generate Slides from Text</Text>
                            <Text style={styles.addBlockSubtitle}>AI creates slides from case description</Text>
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

                        {slides.length > 1 && (
                            <View style={styles.slideActionRow}>
                                <TouchableOpacity
                                    onPress={moveSlideUp}
                                    style={[styles.slideActionButton, currentSlideIndex === 0 && styles.slideActionButtonDisabled]}
                                    disabled={currentSlideIndex === 0}
                                >
                                    <Text style={styles.slideActionIcon}>⬆️</Text>
                                    <Text style={styles.slideActionText}>Move Up</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={moveSlideDown}
                                    style={[styles.slideActionButton, currentSlideIndex === slides.length - 1 && styles.slideActionButtonDisabled]}
                                    disabled={currentSlideIndex === slides.length - 1}
                                >
                                    <Text style={styles.slideActionIcon}>⬇️</Text>
                                    <Text style={styles.slideActionText}>Move Down</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.slideActionRow}>
                            <TouchableOpacity
                                onPress={duplicateSlide}
                                style={styles.slideActionButton}
                            >
                                <Text style={styles.slideActionIcon}>📋</Text>
                                <Text style={styles.slideActionText}>Duplicate</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={addSlide}
                                style={styles.slideActionButton}
                            >
                                <Text style={styles.slideActionIcon}>➕</Text>
                                <Text style={styles.slideActionText}>Add at End</Text>
                            </TouchableOpacity>
                        </View>

                        {slides.length > 1 && (
                            <View style={styles.slideActionRow}>
                                <TouchableOpacity
                                    onPress={deleteSlide}
                                    style={[styles.slideActionButton, styles.slideActionButtonFull, styles.slideActionButtonDanger]}
                                >
                                    <Text style={styles.slideActionIcon}>🗑️</Text>
                                    <Text style={styles.slideActionTextDanger}>Delete Slide</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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

                {/* Image Search Modal */}
                <ImageSearchModal
                    visible={imageSearchVisible}
                    onClose={() => setImageSearchVisible(false)}
                    onSelectImage={(image) => {
                        // Update the selected image block
                        if (selectedImageBlockId) {
                            const updatedBlock = currentSlide.blocks.find(
                                (b) => b.id === selectedImageBlockId
                            );
                            if (updatedBlock) {
                                updateBlock(selectedImageBlockId, {
                                    ...updatedBlock,
                                    data: {
                                        ...updatedBlock.data,
                                        uri: image.uri,
                                        caption: image.caption,
                                    },
                                });
                            }
                        }
                        setSelectedImageBlockId(null);
                    }}
                />

                {/* Citation Search Modal */}
                <CitationSearchModal
                    visible={citationSearchVisible}
                    onClose={() => setCitationSearchVisible(false)}
                    onSelectCitation={(citation) => {
                        // citation has: text (name), author (fullTitle), year, summary
                        const quoteText = citation.summary || citation.text || citation.author;
                        const citationText = citation.year
                            ? `${citation.author}, ${citation.year}`
                            : citation.author;

                        // Update the selected quote block or create a new one
                        if (selectedQuoteBlockId) {
                            const updatedBlock = currentSlide.blocks.find(
                                (b) => b.id === selectedQuoteBlockId
                            );
                            if (updatedBlock) {
                                updateBlock(selectedQuoteBlockId, {
                                    ...updatedBlock,
                                    data: {
                                        quote: quoteText,
                                        citation: citationText,
                                    },
                                });
                                showToastMessage('✅ Citation inserted!');
                            }
                        } else {
                            // Create new quote block with citation
                            const newBlock = createDefaultBlock(BLOCK_TYPES.QUOTE);
                            newBlock.data = {
                                quote: quoteText,
                                citation: citationText,
                            };
                            const updatedBlocks = [...currentSlide.blocks, newBlock];
                            updateSlide("blocks", updatedBlocks);
                            showToastMessage('✅ Citation added as new Quote block!');
                        }
                        setSelectedQuoteBlockId(null);
                    }}
                />

                {/* Slide Generator Modal */}
                <SlideGeneratorModal
                    visible={slideGeneratorVisible}
                    onClose={() => setSlideGeneratorVisible(false)}
                    onUseSlides={(generatedSlides) => {
                        // Process slides and add image placeholder blocks for suggested images
                        const processedSlides = generatedSlides.map((slide, slideIndex) => {
                            // If slide has suggestedImages, inject an image block at the top
                            if (slide.suggestedImages && slide.suggestedImages.length > 0) {
                                // Alternate layout: even slides (0, 2, 4...) = right, odd slides (1, 3, 5...) = left
                                const layout = slideIndex % 2 === 0 ? 'floatRight' : 'floatLeft';

                                const imageBlock = {
                                    id: Date.now() + Math.random(),
                                    type: 'image',
                                    data: {
                                        url: null,
                                        placeholder: true,
                                        suggestedKeywords: slide.suggestedImages,
                                        layout: layout,
                                        size: 'small'
                                    }
                                };

                                return {
                                    ...slide,
                                    blocks: [imageBlock, ...slide.blocks]
                                };
                            }
                            return slide;
                        });

                        // Replace current slides with processed ones
                        setSlides(processedSlides);
                        setCurrentSlideIndex(0);
                        showToastMessage(`✅ Loaded ${processedSlides.length} slides! Tap image placeholders to add images.`);
                    }}
                />
            </ScrollView>
            <Toast message={toastMessage} visible={showToast} duration={2500} />
        </SafeAreaView>
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
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
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
    devButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    geminiTestButton: {
        backgroundColor: colors.card,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    geminiTestText: {
        fontSize: 18,
    },
    editorContent: {
        padding: 24,
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
        marginBottom: 6,
        opacity: 0.9,
        letterSpacing: 0.3,
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: "Inter_400Regular",
        marginTop: 2,
        opacity: 0.7,
    },
    sectionContainer: {
        marginBottom: 28,
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
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "Inter_700Bold",
        minHeight: 64,
    },
    headingPreview: {
        backgroundColor: colors.card,
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        minHeight: 64,
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
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        minHeight: 54,
        justifyContent: 'center',
    },
    subtitlePreviewText: {
        fontSize: 15,
        fontFamily: "Inter_500Medium",
        lineHeight: 22,
    },
    input: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
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
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
        backgroundColor: colors.background,
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
        padding: 20,
        marginBottom: 16,
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
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
    findCitationButton: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    findCitationIcon: {
        fontSize: 28,
        marginRight: 14,
    },
    generateSlidesButton: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    generateSlidesIcon: {
        fontSize: 28,
        marginRight: 14,
    },
    insertButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderStyle: 'dashed',
        opacity: 0.6,
        marginVertical: 10,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
    },
    insertButtonText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        opacity: 0.8,
    },
    slideManagementSection: {
        marginTop: 32,
        marginBottom: 20,
        padding: 20,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    sectionLabel: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 14,
        letterSpacing: 0.3,
        opacity: 0.95,
    },
    slideActionRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    slideActionButton: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
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
    slideActionButtonDisabled: {
        opacity: 0.4,
        borderColor: 'rgba(212, 175, 55, 0.15)',
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
        paddingVertical: 18,
        paddingHorizontal: 22,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
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
    emptyBlocksContainer: {
        backgroundColor: colors.card,
        padding: 32,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyBlocksText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 4,
    },
    emptyBlocksHint: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        opacity: 0.7,
    },
})