/**
 * SlideGeneratorModal - AI-powered slide generation from case descriptions
 * Converts text descriptions into structured presentation slides
 */

import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
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
import { inputProcessor } from '../utils/inputProcessor';
import { pinAuth } from '../utils/pinAuth';
import { generateSlides } from '../utils/slideGenerationAPI';
import { templateEngine } from '../utils/templateEngine';
import PinModal from './PinModal';

export default function SlideGeneratorModal({ visible, onClose, onUseSlides }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedSlides, setGeneratedSlides] = useState(null);
    const [fromCache, setFromCache] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [inputAnalysis, setInputAnalysis] = useState(null);
    const [desiredSlideCount, setDesiredSlideCount] = useState(5);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [suggestedTemplate, setSuggestedTemplate] = useState(null);
    
    // Debounce timer ref
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (visible) {
            checkPinStatus();
            loadSavedSlideCountPreference();
            loadAvailableTemplates();
        }
    }, [visible]);

    const loadAvailableTemplates = () => {
        const templates = templateEngine.getTemplates();
        setAvailableTemplates(templates);
    };

    // Debounced input analysis
    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for analysis (500ms debounce)
        debounceTimerRef.current = setTimeout(() => {
            if (input.trim().length > 0) {
                const analysis = inputProcessor.analyzeInput(input);
                setInputAnalysis(analysis);
                
                // Suggest template based on analysis
                const suggested = templateEngine.suggestTemplate(analysis);
                setSuggestedTemplate(suggested);
            } else {
                setInputAnalysis(null);
                setSuggestedTemplate(null);
            }
        }, 500);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [input]);

    const checkPinStatus = async () => {
        const unlocked = await pinAuth.isUnlocked();
        if (!unlocked) {
            setShowPinModal(true);
        } else {
            setIsUnlocked(true);
        }
    };

    const loadSavedSlideCountPreference = async () => {
        try {
            const saved = await AsyncStorage.getItem('preferredSlideCount');
            if (saved) {
                const count = parseInt(saved, 10);
                if (count >= 3 && count <= 8) {
                    setDesiredSlideCount(count);
                }
            }
        } catch (error) {
            console.error('Failed to load slide count preference:', error);
        }
    };

    const saveSlideCountPreference = async (count) => {
        try {
            await AsyncStorage.setItem('preferredSlideCount', count.toString());
        } catch (error) {
            console.error('Failed to save slide count preference:', error);
        }
    };

    const handleSlideCountChange = (count) => {
        setDesiredSlideCount(count);
        saveSlideCountPreference(count);
    };

    const handleGenerate = async () => {
        if (!input.trim()) {
            Alert.alert('Error', 'Please enter a case description');
            return;
        }

        if (input.trim().length < 100) {
            Alert.alert(
                'Input Too Short', 
                'Please provide at least 100 characters for quality results.\n\nMore details help the AI generate better, more accurate slides with proper legal structure.'
            );
            return;
        }

        setLoading(true);
        try {
            console.log('🎨 Generating slides from modal...');
            console.log(`📊 Requested slide count: ${desiredSlideCount}`);
            if (selectedTemplate) {
                console.log(`📋 Selected template: ${selectedTemplate}`);
            }
            
            const result = await generateSlides(input.trim(), {
                desiredSlideCount: desiredSlideCount,
                template: selectedTemplate
            });

            console.log('✅ Slides generated:', result);
            
            // Validate slide count matches request
            if (result.slides && result.slides.length !== desiredSlideCount) {
                console.warn(`⚠️ Slide count mismatch: requested ${desiredSlideCount}, got ${result.slides.length}`);
            }
            
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
        setSelectedTemplate(null);
        setSuggestedTemplate(null);
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
                                        input.length < 100 && input.length > 0 && styles.charCountWarning,
                                        input.length > 3000 && styles.charCountError,
                                    ]}>
                                        {input.length} / 3000 characters
                                        {input.length < 100 && input.length > 0 && ' (minimum 100)'}
                                        {input.length > 3000 && ' (too long!)'}
                                    </Text>
                                </View>

                                {/* Input Analysis Panel */}
                                {inputAnalysis && input.length >= 50 && (
                                    <View style={styles.analysisPanel}>
                                        <View style={styles.analysisHeader}>
                                            <Text style={styles.analysisTitle}>📊 Input Analysis</Text>
                                            <View style={[
                                                styles.completenessScore,
                                                inputAnalysis.completeness >= 70 && styles.completenessGood,
                                                inputAnalysis.completeness >= 40 && inputAnalysis.completeness < 70 && styles.completenessOkay,
                                                inputAnalysis.completeness < 40 && styles.completenessLow,
                                            ]}>
                                                <Text style={styles.completenessText}>
                                                    {inputAnalysis.completeness}% Complete
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Case Type */}
                                        <View style={styles.analysisRow}>
                                            <Text style={styles.analysisLabel}>Case Type:</Text>
                                            <Text style={styles.analysisValue}>
                                                {inputAnalysis.caseType === 'constitutional' && '⚖️ Constitutional'}
                                                {inputAnalysis.caseType === 'criminal' && '🔒 Criminal'}
                                                {inputAnalysis.caseType === 'civil' && '📜 Civil'}
                                                {inputAnalysis.caseType === 'procedural' && '⚙️ Procedural'}
                                                {inputAnalysis.caseType === 'general' && '📋 General'}
                                            </Text>
                                        </View>

                                        {/* Elements Present */}
                                        <View style={styles.elementsGrid}>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasFacts && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasFacts && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasFacts ? '✓' : '○'} Facts
                                                </Text>
                                            </View>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasLegalIssues && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasLegalIssues && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasLegalIssues ? '✓' : '○'} Issues
                                                </Text>
                                            </View>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasStatutes && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasStatutes && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasStatutes ? '✓' : '○'} Statutes
                                                </Text>
                                            </View>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasArguments && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasArguments && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasArguments ? '✓' : '○'} Arguments
                                                </Text>
                                            </View>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasEvidence && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasEvidence && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasEvidence ? '✓' : '○'} Evidence
                                                </Text>
                                            </View>
                                            <View style={[styles.elementChip, inputAnalysis.elements.hasCitations && styles.elementPresent]}>
                                                <Text style={[styles.elementText, inputAnalysis.elements.hasCitations && styles.elementTextPresent]}>
                                                    {inputAnalysis.elements.hasCitations ? '✓' : '○'} Citations
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Suggestions */}
                                        {inputAnalysis.suggestions && inputAnalysis.suggestions.length > 0 && (
                                            <View style={styles.suggestionsContainer}>
                                                <Text style={styles.suggestionsTitle}>💡 Suggestions:</Text>
                                                {inputAnalysis.suggestions.map((suggestion, idx) => (
                                                    <Text key={idx} style={styles.suggestionText}>
                                                        • {suggestion}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Slide Count Selector */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📊 Slide Count</Text>
                                <Text style={styles.sectionHint}>
                                    Choose how many slides to generate (3-8 slides)
                                </Text>
                                
                                <View style={styles.slideCountContainer}>
                                    {/* Slide count buttons */}
                                    <View style={styles.slideCountButtons}>
                                        {[3, 4, 5, 6, 7, 8].map((count) => (
                                            <TouchableOpacity
                                                key={count}
                                                style={[
                                                    styles.slideCountButton,
                                                    desiredSlideCount === count && styles.slideCountButtonActive,
                                                    count === (inputAnalysis?.estimatedSlideCount) && styles.slideCountButtonSuggested,
                                                ]}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    handleSlideCountChange(count);
                                                }}
                                                disabled={loading}
                                            >
                                                <Text style={[
                                                    styles.slideCountButtonText,
                                                    desiredSlideCount === count && styles.slideCountButtonTextActive,
                                                ]}>
                                                    {count}
                                                </Text>
                                                {count === (inputAnalysis?.estimatedSlideCount) && (
                                                    <Text style={styles.suggestedBadge}>✨</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Info row */}
                                    <View style={styles.slideCountInfo}>
                                        <Text style={styles.slideCountInfoText}>
                                            ⏱️ Estimated time: ~{desiredSlideCount * 2} minutes
                                        </Text>
                                        {inputAnalysis?.estimatedSlideCount && (
                                            <Text style={styles.slideCountSuggestion}>
                                                ✨ Suggested: {inputAnalysis.estimatedSlideCount} slides
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Template Selector */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📋 Template (Optional)</Text>
                                <Text style={styles.sectionHint}>
                                    Choose a template for structured slide generation, or select "No Template" for general format
                                </Text>

                                {/* No Template Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.templateCard,
                                        selectedTemplate === null && styles.templateCardSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedTemplate(null);
                                    }}
                                    disabled={loading}
                                >
                                    <View style={styles.templateHeader}>
                                        <Text style={styles.templateIcon}>✨</Text>
                                        <View style={styles.templateInfo}>
                                            <Text style={[
                                                styles.templateName,
                                                selectedTemplate === null && styles.templateNameSelected
                                            ]}>
                                                No Template
                                            </Text>
                                            <Text style={styles.templateDescription}>
                                                General format - AI decides structure based on content
                                            </Text>
                                        </View>
                                        {selectedTemplate === null && (
                                            <Text style={styles.selectedBadge}>✓</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {/* Template Cards */}
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false} 
                                    style={styles.templatesScroll}
                                    contentContainerStyle={styles.templatesScrollContent}
                                >
                                    {availableTemplates.map((template) => (
                                        <TouchableOpacity
                                            key={template.type}
                                            style={[
                                                styles.templateCard,
                                                styles.templateCardHorizontal,
                                                selectedTemplate === template.type && styles.templateCardSelected,
                                                suggestedTemplate === template.type && styles.templateCardSuggested,
                                            ]}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setSelectedTemplate(template.type);
                                            }}
                                            disabled={loading}
                                        >
                                            <View style={styles.templateHeader}>
                                                <Text style={styles.templateIcon}>{template.icon}</Text>
                                                <View style={styles.templateInfo}>
                                                    <View style={styles.templateTitleRow}>
                                                        <Text style={[
                                                            styles.templateName,
                                                            selectedTemplate === template.type && styles.templateNameSelected
                                                        ]}>
                                                            {template.name}
                                                        </Text>
                                                        {suggestedTemplate === template.type && (
                                                            <Text style={styles.recommendedBadge}>✨ Recommended</Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.templateDescription} numberOfLines={2}>
                                                        {template.description}
                                                    </Text>
                                                </View>
                                                {selectedTemplate === template.type && (
                                                    <Text style={styles.selectedBadge}>✓</Text>
                                                )}
                                            </View>

                                            {/* Use Cases */}
                                            <View style={styles.templateUseCases}>
                                                <Text style={styles.useCasesTitle}>Use for:</Text>
                                                {template.useCases.slice(0, 2).map((useCase, idx) => (
                                                    <Text key={idx} style={styles.useCaseText} numberOfLines={1}>
                                                        • {useCase}
                                                    </Text>
                                                ))}
                                                {template.useCases.length > 2 && (
                                                    <Text style={styles.useCaseMore}>
                                                        +{template.useCases.length - 2} more
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Suggested Slide Count */}
                                            <View style={styles.templateFooter}>
                                                <Text style={styles.templateSlideCount}>
                                                    📊 Suggested: {template.suggestedSlideCount} slides
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Selected Template Characteristics */}
                                {selectedTemplate && (
                                    <View style={styles.selectedTemplateInfo}>
                                        <Text style={styles.selectedTemplateTitle}>
                                            📌 Selected Template Characteristics
                                        </Text>
                                        {(() => {
                                            const template = availableTemplates.find(t => t.type === selectedTemplate);
                                            if (!template) return null;
                                            
                                            return (
                                                <>
                                                    <View style={styles.characteristicsGrid}>
                                                        <View style={styles.characteristicChip}>
                                                            <Text style={styles.characteristicText}>
                                                                📊 {template.suggestedSlideCount} slides
                                                            </Text>
                                                        </View>
                                                        <View style={styles.characteristicChip}>
                                                            <Text style={styles.characteristicText}>
                                                                {template.icon} {template.name}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.characteristicDescription}>
                                                        {template.description}
                                                    </Text>
                                                </>
                                            );
                                        })()}
                                    </View>
                                )}
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
                                        (loading || input.length < 100) && styles.generateButtonDisabled,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        handleGenerate();
                                    }}
                                    disabled={loading || input.length < 100}
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
                                    {generatedSlides.template && (
                                        <View style={styles.statBadge}>
                                            <Text style={styles.statValue}>📋</Text>
                                            <Text style={styles.statLabel}>{generatedSlides.template.name}</Text>
                                        </View>
                                    )}
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
    analysisPanel: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
    },
    analysisHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    analysisTitle: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '700',
    },
    completenessScore: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    completenessGood: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
    },
    completenessOkay: {
        backgroundColor: '#ffaa00' + '20',
        borderColor: '#ffaa00',
    },
    completenessLow: {
        backgroundColor: '#ff4444' + '20',
        borderColor: '#ff4444',
    },
    completenessText: {
        fontSize: 11,
        fontWeight: '700',
    },
    analysisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    analysisLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
    },
    analysisValue: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    elementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    elementChip: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.textSecondary + '40',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    elementPresent: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
    },
    elementText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    elementTextPresent: {
        color: colors.gold,
    },
    suggestionsContainer: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    suggestionsTitle: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
    },
    suggestionText: {
        color: colors.textSecondary,
        fontSize: 11,
        lineHeight: 16,
        marginBottom: 3,
    },
    slideCountContainer: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
    },
    slideCountButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 12,
    },
    slideCountButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.textSecondary + '40',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    slideCountButtonActive: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
        borderWidth: 2,
    },
    slideCountButtonSuggested: {
        borderColor: colors.gold + '60',
        borderStyle: 'dashed',
    },
    slideCountButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '700',
    },
    slideCountButtonTextActive: {
        color: colors.gold,
        fontSize: 18,
    },
    suggestedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        fontSize: 12,
    },
    slideCountInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold + '40',
    },
    slideCountInfoText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '500',
    },
    slideCountSuggestion: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
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
    templatesScroll: {
        marginTop: 8,
    },
    templatesScrollContent: {
        gap: 12,
        paddingRight: 16,
    },
    templateCard: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.borderGold + '60',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    templateCardHorizontal: {
        width: 280,
        marginBottom: 0,
    },
    templateCardSelected: {
        backgroundColor: colors.gold + '15',
        borderColor: colors.gold,
        borderWidth: 2,
    },
    templateCardSuggested: {
        borderColor: colors.gold + '80',
        borderStyle: 'dashed',
    },
    templateHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    templateIcon: {
        fontSize: 28,
    },
    templateInfo: {
        flex: 1,
    },
    templateTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    templateName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    templateNameSelected: {
        color: colors.gold,
    },
    templateDescription: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 16,
    },
    recommendedBadge: {
        color: colors.gold,
        fontSize: 10,
        fontWeight: '600',
        backgroundColor: colors.gold + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    selectedBadge: {
        color: colors.gold,
        fontSize: 20,
        fontWeight: '700',
    },
    templateUseCases: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold + '40',
    },
    useCasesTitle: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
    },
    useCaseText: {
        color: colors.textSecondary,
        fontSize: 11,
        lineHeight: 16,
        marginBottom: 2,
    },
    useCaseMore: {
        color: colors.textSecondary,
        fontSize: 10,
        fontStyle: 'italic',
        marginTop: 2,
    },
    templateFooter: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold + '40',
    },
    templateSlideCount: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
    },
    selectedTemplateInfo: {
        backgroundColor: colors.gold + '10',
        borderWidth: 1,
        borderColor: colors.gold + '40',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
    },
    selectedTemplateTitle: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
    },
    characteristicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    characteristicChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    characteristicText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '600',
    },
    characteristicDescription: {
        color: colors.textSecondary,
        fontSize: 11,
        lineHeight: 16,
    },
});
