/**
 * SlideGeneratorModal - AI-powered slide generation from case descriptions
 * Converts text descriptions into structured presentation slides
 */

import { colors } from '@/theme/colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { generateSlides } from '../utils/slideGenerationAPI';
import { pinAuth } from '../utils/pinAuth';
import PinModal from './PinModal';

export default function SlideGeneratorModal({ visible, onClose, onUseSlides }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedSlides, setGeneratedSlides] = useState(null);
    const [fromCache, setFromCache] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (visible) {
            checkPinStatus();
        }
    }, [visible]);

    const checkPinStatus = async () => {
        const unlocked = await pinAuth.isUnlocked();
        if (!unlocked) {
            setShowPinModal(true);
        } else {
            setIsUnlocked(true);
        }
    };

    const handleGenerate = async () => {
        if (!input.trim()) {
            Alert.alert('Error', 'Please enter a case description');
            return;
        }

        if (input.trim().length < 50) {
            Alert.alert('Too Short', 'Please provide at least 50 characters for better slide generation.');
            return;
        }

        setLoading(true);
        try {
            console.log('🎨 Generating slides from modal...');
            const result = await generateSlides(input.trim());

            console.log('✅ Slides generated:', result);
            setGeneratedSlides(result);
            setFromCache(result.fromCache || false);

            // Show success message
            const cacheMsg = result.fromCache ? ' (from cache)' : '';
            Alert.alert(
                'Success! 🎉',
                `Generated ${result.slides?.length || 0} slides${cacheMsg}\n\nReview and tap "Use These Slides" to replace your current presentation.`
            );
        } catch (error) {
            console.error('❌ Generation error:', error);
            Alert.alert('Generation Failed', error.message || 'Failed to generate slides. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseSlides = () => {
        if (!generatedSlides || !generatedSlides.slides) {
            Alert.alert('Error', 'No slides to use');
            return;
        }

        Alert.alert(
            'Replace Slides?',
            `This will replace your current ${onUseSlides ? 'presentation' : 'slides'} with ${generatedSlides.slides.length} new slides. This cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Replace',
                    style: 'destructive',
                    onPress: () => {
                        onUseSlides(generatedSlides.slides);
                        handleClose();
                    },
                },
            ]
        );
    };

    const handleClose = () => {
        setInput('');
        setGeneratedSlides(null);
        setFromCache(false);
        onClose();
    };

    const renderBlockPreview = (block) => {
        const getBlockIcon = (type) => {
            const icons = {
                text: '📝',
                quote: '⚖️',
                callout: '⚠️',
                timeline: '📅',
                evidence: '📋',
                twoColumn: '⚖️',
            };
            return icons[type] || '📄';
        };

        return (
            <View key={Math.random()} style={styles.blockPreview}>
                <Text style={styles.blockType}>
                    {getBlockIcon(block.type)} {block.type}
                </Text>
                {block.type === 'text' && block.data?.points && (
                    <View style={styles.blockContent}>
                        {block.data.points.slice(0, 2).map((point, i) => (
                            <Text key={i} style={styles.blockText} numberOfLines={1}>
                                • {point}
                            </Text>
                        ))}
                        {block.data.points.length > 2 && (
                            <Text style={styles.blockMore}>
                                +{block.data.points.length - 2} more points
                            </Text>
                        )}
                    </View>
                )}
                {block.type === 'quote' && block.data?.quote && (
                    <View style={styles.blockContent}>
                        <Text style={styles.blockText} numberOfLines={2}>
                            &ldquo;{block.data.quote}&rdquo;
                        </Text>
                        {block.data.citation && (
                            <Text style={styles.blockCitation}>— {block.data.citation}</Text>
                        )}
                    </View>
                )}
                {block.type === 'callout' && block.data?.text && (
                    <Text style={styles.blockText} numberOfLines={2}>
                        {block.data.text}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <>
        <Modal
            visible={visible && isUnlocked}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>🎨 Generate Slides</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                    {!generatedSlides ? (
                        <>
                            {/* Input Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Case Description</Text>
                                <Text style={styles.sectionHint}>
                                    Describe your case, arguments, or legal topic in 50-3000 characters.
                                    AI will generate a professional presentation.
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Enter case description, facts, arguments, timeline, evidence, etc..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={10}
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                                <View style={styles.charCountContainer}>
                                    <Text style={[
                                        styles.charCount,
                                        input.length < 50 && input.length > 0 && styles.charCountWarning,
                                        input.length > 3000 && styles.charCountError,
                                    ]}>
                                        {input.length} / 3000 characters
                                        {input.length < 50 && input.length > 0 && ' (minimum 50)'}
                                        {input.length > 3000 && ' (too long!)'}
                                    </Text>
                                </View>
                            </View>

                            {/* Quick Example Prompts */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>⚡ Quick Examples</Text>
                                <Text style={styles.sectionHint}>
                                    Tap any example to try it instantly
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptsScroll}>
                                    <TouchableOpacity
                                        style={styles.quickPromptChip}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setInput('Article 21 case about right to privacy. Supreme Court held that privacy is a fundamental right. Key judgment: K.S. Puttaswamy v. Union of India (2017). The nine-judge bench unanimously ruled that privacy is protected under Article 21.');
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={styles.quickPromptTitle}>📜 Right to Privacy</Text>
                                        <Text style={styles.quickPromptSubtitle}>Constitutional case</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickPromptChip}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setInput('Murder case under Section 302 IPC. Prosecution presented 15 witnesses including eyewitnesses, forensic evidence (blood samples, fingerprints), and CCTV footage. Defense argued alibi and questioned credibility of witnesses. Key evidence: 1) CCTV showed accused near crime scene at 11:45 PM, 2) Forensic report matched blood type with victim, 3) Two eyewitnesses identified accused. Court found accused guilty beyond reasonable doubt.');
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={styles.quickPromptTitle}>⚖️ Criminal Case</Text>
                                        <Text style={styles.quickPromptSubtitle}>Murder with evidence</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickPromptChip}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setInput('Section 377 IPC challenged on grounds of violating Article 14, 15, and 21. Petitioners argued that criminalizing consensual homosexual acts between adults is discriminatory and violates the right to privacy and dignity. The Supreme Court in Navtej Singh Johar v. Union of India (2018) decriminalized homosexuality, holding that Section 377 is unconstitutional.');
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={styles.quickPromptTitle}>🏳️‍🌈 Section 377</Text>
                                        <Text style={styles.quickPromptSubtitle}>Landmark judgment</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickPromptChip}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setInput('Breach of contract case with timeline: Jan 2020 - Contract signed for delivery of goods worth ₹50 lakhs, March 2020 - First payment of ₹20 lakhs made, June 2020 - Delivery due but not received, July 2020 - Legal notice sent demanding performance, Sept 2020 - Suit filed for specific performance and damages, Dec 2020 - Interim order passed, March 2021 - Final judgment with damages of ₹15 lakhs awarded to plaintiff.');
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={styles.quickPromptTitle}>📝 Contract Breach</Text>
                                        <Text style={styles.quickPromptSubtitle}>With timeline</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickPromptChip}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setInput('Custody battle between divorced parents. Mother\'s argument: Child\'s primary caregiver since birth, stable home environment with grandparents nearby, better educational facilities in her city, child\'s medical needs met regularly. Father\'s argument: Higher income of ₹2.5 lakhs/month, extended family support, child expressed preference to live with father. Court\'s consideration: Best interest of child as paramount, child\'s age (12 years old), psychological report recommending joint custody with primary residence with mother.');
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={styles.quickPromptTitle}>👨‍👩‍👧 Child Custody</Text>
                                        <Text style={styles.quickPromptSubtitle}>Comparative arguments</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>

                            {/* Generate Button */}
                            <View style={styles.actionContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.generateButton,
                                        (loading || input.length < 50) && styles.generateButtonDisabled,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        handleGenerate();
                                    }}
                                    disabled={loading || input.length < 50}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <View style={styles.buttonContent}>
                                            <ActivityIndicator color={colors.background} size="small" />
                                            <Text style={styles.generateButtonText}>  Generating...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.generateButtonText}>✨ Generate Slides with AI</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Info Section */}
                            <View style={styles.section}>
                                <Text style={styles.infoTitle}>💡 How It Works</Text>
                                <LinearGradient
                                    colors={[colors.card, colors.background]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.infoCard}
                                >
                                    <Text style={styles.infoText}>
                                        • AI analyzes your case description{'\n'}
                                        • Structures content into 1-5 professional slides{'\n'}
                                        • Uses appropriate formats (bullet points, quotes, timeline){'\n'}
                                        • Takes 2-3 seconds to generate{'\n'}
                                        • Results are cached for instant re-use
                                    </Text>
                                </LinearGradient>

                                <Text style={styles.infoTitle}>📝 Tips for Best Results</Text>
                                <LinearGradient
                                    colors={[colors.card, colors.background]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.infoCard}
                                >
                                    <Text style={styles.infoText}>
                                        • Include key facts, dates, and parties{'\n'}
                                        • Mention relevant laws, articles, or cases{'\n'}
                                        • Describe arguments and counter-arguments{'\n'}
                                        • Add timeline of events if applicable{'\n'}
                                        • Include evidence and witness details
                                    </Text>
                                </LinearGradient>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Preview Section */}
                            <View style={styles.section}>
                                <View style={styles.previewHeader}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Generated Presentation</Text>
                                        <Text style={styles.previewSubtitle}>
                                            {generatedSlides.title || 'Untitled Presentation'}
                                        </Text>
                                    </View>
                                    {fromCache && (
                                        <View style={styles.cacheBadge}>
                                            <Text style={styles.cacheBadgeText}>📦 Cached</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.statsRow}>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.statValue}>{generatedSlides.slides.length}</Text>
                                        <Text style={styles.statLabel}>Slides</Text>
                                    </View>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.statValue}>
                                            {generatedSlides.slides.reduce((sum, s) => sum + (s.blocks?.length || 0), 0)}
                                        </Text>
                                        <Text style={styles.statLabel}>Blocks</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Slides Preview */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Slide Preview</Text>
                                {generatedSlides.slides.map((slide, index) => (
                                    <View key={index} style={styles.slideCard}>
                                        <View style={styles.slideHeader}>
                                            <Text style={styles.slideNumber}>Slide {index + 1}</Text>
                                            <Text style={styles.slideBlockCount}>
                                                {slide.blocks?.length || 0} blocks
                                            </Text>
                                        </View>
                                        <Text style={styles.slideTitle}>{slide.title}</Text>
                                        {slide.subtitle && (
                                            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                                        )}

                                        {/* Image Suggestions */}
                                        {slide.suggestedImages && slide.suggestedImages.length > 0 && (
                                            <View style={styles.imageSuggestions}>
                                                <Text style={styles.imageSuggestionsTitle}>
                                                    🖼️ Suggested Images:
                                                </Text>
                                                <View style={styles.imageKeywords}>
                                                    {slide.suggestedImages.map((keyword, idx) => (
                                                        <View key={idx} style={styles.imageKeywordChip}>
                                                            <Text style={styles.imageKeywordText}>{keyword}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                                <Text style={styles.imageInstructions}>
                                                    💡 Tap a keyword to search and add an image using the image library
                                                </Text>
                                            </View>
                                        )}

                                        <View style={styles.blocksPreview}>
                                            {slide.blocks?.map((block, blockIdx) => (
                                                <View key={blockIdx}>
                                                    {renderBlockPreview(block)}
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionContainer}>
                                <TouchableOpacity
                                    style={styles.useButton}
                                    onPress={handleUseSlides}
                                >
                                    <Text style={styles.useButtonText}>✅ Use These Slides</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.regenerateButton}
                                    onPress={() => {
                                        setGeneratedSlides(null);
                                        setFromCache(false);
                                    }}
                                >
                                    <Text style={styles.regenerateButtonText}>🔄 Generate Again</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>

        <PinModal
            visible={showPinModal}
            onSuccess={() => {
                setShowPinModal(false);
                setIsUnlocked(true);
            }}
            onCancel={() => {
                setShowPinModal(false);
                onClose();
            }}
        />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 48,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
    },
    closeButton: {
        padding: 8,
        width: 40,
    },
    closeText: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '600',
    },
    headerTitle: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 40,
    },
    section: {
        padding: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    sectionHint: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
    },
    textInput: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 16,
        color: colors.textPrimary,
        fontSize: 14,
        minHeight: 200,
        textAlignVertical: 'top',
        lineHeight: 20,
    },
    charCountContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    charCount: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    charCountWarning: {
        color: '#ffaa00',
        fontWeight: '600',
    },
    charCountError: {
        color: '#ff4444',
        fontWeight: '700',
    },
    actionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    generateButton: {
        backgroundColor: colors.gold,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    generateButtonDisabled: {
        opacity: 0.5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    generateButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
    infoTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    infoCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold + '60',
        borderRadius: 12,
        padding: 16,
        overflow: 'hidden',
    },
    infoText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    previewSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 4,
    },
    cacheBadge: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    cacheBadgeText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 2,
    },
    slideCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    slideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    slideNumber: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '700',
    },
    slideBlockCount: {
        color: colors.textSecondary,
        fontSize: 11,
    },
    slideTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    slideSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 8,
    },
    blocksPreview: {
        marginTop: 8,
        gap: 8,
    },
    imageSuggestions: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.gold + '40',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        marginBottom: 8,
    },
    imageSuggestionsTitle: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    imageKeywords: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    imageKeywordChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    imageKeywordText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '500',
    },
    imageInstructions: {
        color: colors.textSecondary,
        fontSize: 10,
        fontStyle: 'italic',
        marginTop: 4,
    },
    blockPreview: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderGold + '40',
        borderRadius: 8,
        padding: 10,
    },
    blockType: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    blockContent: {
        gap: 4,
    },
    blockText: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 16,
    },
    blockMore: {
        color: colors.textSecondary,
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 2,
    },
    blockCitation: {
        color: colors.gold,
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 4,
    },
    useButton: {
        backgroundColor: colors.gold,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    useButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
    regenerateButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    regenerateButtonText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: '600',
    },
    quickPromptsScroll: {
        marginTop: 4,
    },
    quickPromptChip: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.borderGold + '80',
        borderRadius: 12,
        padding: 14,
        marginRight: 12,
        minWidth: 160,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quickPromptTitle: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 4,
    },
    quickPromptSubtitle: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '500',
    },
});
