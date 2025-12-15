/**
 * Slide Generation Test Screen
 * Test Gemini AI slide generation with various case descriptions
 */

import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateSlides, getSlideDeckStats, validateSlideDeck } from '../../utils/slideGenerationAPI';
import { testCases } from '../../utils/testData';

export default function SlideGenerationTestScreen() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [validation, setValidation] = useState(null);

    const handleGenerate = async (testInput = null) => {
        const textToGenerate = testInput || input;

        if (!textToGenerate.trim()) {
            Alert.alert('Error', 'Please enter a case description');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setStats(null);
        setValidation(null);

        try {
            const startTime = Date.now();
            const generated = await generateSlides(textToGenerate);
            const duration = Date.now() - startTime;

            console.log('✅ Generated slides:', generated);

            // Validate structure
            const validationResult = validateSlideDeck(generated);
            setValidation(validationResult);

            // Get statistics
            const statistics = getSlideDeckStats(generated);
            setStats(statistics);

            setResult(generated);

            // Show success message
            Alert.alert(
                'Success! ✅',
                `Generated ${generated.slides.length} slides in ${duration}ms\n\n${validationResult.valid ? '✅ Valid structure' : '⚠️ Has issues'
                }`
            );
        } catch (err) {
            console.error('❌ Generation error:', err);
            setError(err.message);
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTestCase = (testCase) => {
        setInput(testCase.input);
        handleGenerate(testCase.input);
    };

    const clearResults = () => {
        setResult(null);
        setError(null);
        setStats(null);
        setValidation(null);
    };

    const renderBlockPreview = (block) => {
        const blockIcons = {
            text: '📝',
            quote: '⚖️',
            callout: '⚠️',
            timeline: '📅',
            evidence: '📋',
            twoColumn: '⚖️',
        };

        return (
            <View key={Math.random()} style={styles.blockPreview}>
                <Text style={styles.blockType}>
                    {blockIcons[block.type] || '📄'} {block.type}
                </Text>
                <Text style={styles.blockData} numberOfLines={2}>
                    {JSON.stringify(block.data).substring(0, 100)}...
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>🎨 Slide Generation Test</Text>
                </View>

                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Case Description</Text>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Enter case description (50-3000 characters)..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>
                        {input.length} / 3000 characters
                        {input.length < 50 && input.length > 0 && ' (minimum 50)'}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.generateButton, loading && styles.generateButtonDisabled]}
                        onPress={() => handleGenerate()}
                        disabled={loading || input.length < 50}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={styles.generateButtonText}>🎨 Generate Slides</Text>
                        )}
                    </TouchableOpacity>

                    {(result || error) && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
                            <Text style={styles.clearButtonText}>Clear Results</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Test Cases */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Test Cases</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {testCases.map((testCase) => (
                            <TouchableOpacity
                                key={testCase.id}
                                style={styles.testCaseChip}
                                onPress={() => handleTestCase(testCase)}
                                disabled={loading}
                            >
                                <Text style={styles.testCaseTitle}>{testCase.title}</Text>
                                <Text style={styles.testCaseComplexity}>
                                    {testCase.complexity} • ~{testCase.expectedSlides} slides
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Results Section */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Generating slides with Gemini AI...</Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>❌</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {result && (
                    <>
                        {/* Validation Status */}
                        {validation && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    {validation.valid ? '✅ Validation' : '⚠️ Validation Issues'}
                                </Text>
                                <View style={styles.validationCard}>
                                    <Text style={styles.validationStatus}>
                                        Status: {validation.valid ? 'VALID' : 'HAS ISSUES'}
                                    </Text>
                                    {validation.errors.length > 0 && (
                                        <>
                                            <Text style={styles.validationLabel}>Errors:</Text>
                                            {validation.errors.map((err, i) => (
                                                <Text key={i} style={styles.validationError}>
                                                    • {err}
                                                </Text>
                                            ))}
                                        </>
                                    )}
                                    {validation.warnings.length > 0 && (
                                        <>
                                            <Text style={styles.validationLabel}>Warnings:</Text>
                                            {validation.warnings.map((warn, i) => (
                                                <Text key={i} style={styles.validationWarning}>
                                                    • {warn}
                                                </Text>
                                            ))}
                                        </>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Statistics */}
                        {stats && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📊 Statistics</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{stats.totalSlides}</Text>
                                        <Text style={styles.statLabel}>Slides</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{stats.totalBlocks}</Text>
                                        <Text style={styles.statLabel}>Blocks</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{stats.averageBlocksPerSlide}</Text>
                                        <Text style={styles.statLabel}>Avg/Slide</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{stats.generationTime}ms</Text>
                                        <Text style={styles.statLabel}>Gen Time</Text>
                                    </View>
                                </View>

                                <Text style={styles.statsSubtitle}>Block Types Used:</Text>
                                <View style={styles.blockTypesContainer}>
                                    {Object.entries(stats.blockTypes).map(([type, count]) => (
                                        <View key={type} style={styles.blockTypeChip}>
                                            <Text style={styles.blockTypeText}>
                                                {type}: {count}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Generated Slides */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                📑 Generated Presentation: {result.title}
                            </Text>

                            {result.slides.map((slide, index) => (
                                <View key={index} style={styles.slideCard}>
                                    <View style={styles.slideHeader}>
                                        <Text style={styles.slideNumber}>Slide {index + 1}</Text>
                                        <Text style={styles.slideBlockCount}>
                                            {slide.blocks.length} blocks
                                        </Text>
                                    </View>
                                    <Text style={styles.slideTitle}>{slide.title}</Text>
                                    {slide.subtitle && (
                                        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                                    )}

                                    <View style={styles.blocksContainer}>
                                        {slide.blocks.map((block) => renderBlockPreview(block))}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Raw JSON */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔍 Raw JSON Output</Text>
                            <ScrollView style={styles.jsonContainer} horizontal>
                                <Text style={styles.jsonText}>
                                    {JSON.stringify(result, null, 2)}
                                </Text>
                            </ScrollView>
                        </View>
                    </>
                )}

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ How It Works</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            • Enter a case description (50-3000 chars){'\n'}
                            • AI analyzes and structures content{'\n'}
                            • Generates 1-5 professional slides{'\n'}
                            • Uses appropriate block types{'\n'}
                            • Structured output (JSON schema){'\n'}
                            • Validates generated structure{'\n'}
                            • Ready to use in presentations
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    backText: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: '600',
    },
    headerTitle: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: '700',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    textInput: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        color: colors.text,
        fontSize: 14,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 6,
        textAlign: 'right',
    },
    actionButtons: {
        paddingHorizontal: 16,
        gap: 12,
    },
    generateButton: {
        backgroundColor: colors.gold,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    generateButtonDisabled: {
        opacity: 0.5,
    },
    generateButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
    clearButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    clearButtonText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: '600',
    },
    testCaseChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        minWidth: 160,
    },
    testCaseTitle: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    testCaseComplexity: {
        color: colors.textSecondary,
        fontSize: 11,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 12,
    },
    errorContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: '#ff4444',
        borderRadius: 12,
        alignItems: 'center',
    },
    errorIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        textAlign: 'center',
    },
    validationCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
    },
    validationStatus: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    validationLabel: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    validationError: {
        color: '#ff4444',
        fontSize: 12,
        marginLeft: 8,
    },
    validationWarning: {
        color: '#ffaa00',
        fontSize: 12,
        marginLeft: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
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
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 4,
    },
    statsSubtitle: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    blockTypesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    blockTypeChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    blockTypeText: {
        color: colors.text,
        fontSize: 12,
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
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    slideSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 8,
    },
    blocksContainer: {
        marginTop: 8,
        gap: 8,
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
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    blockData: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'monospace',
    },
    jsonContainer: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 12,
        maxHeight: 300,
    },
    jsonText: {
        color: colors.text,
        fontSize: 11,
        fontFamily: 'monospace',
    },
    infoCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
    },
    infoText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
    },
});
