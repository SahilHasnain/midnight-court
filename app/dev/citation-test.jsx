import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../theme/colors";
import { findCitations } from "../../utils/citationAPI";

export default function CitationTestScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const citations = await findCitations(query);
            setResults(citations);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const testQueries = [
        "right to privacy",
        "article 21",
        "kesavananda bharati",
        "freedom of speech",
        "reservation obc",
        "sexual harassment workplace",
        "environmental protection",
        "section 377",
    ];

    const runTestQuery = async (testQuery) => {
        setQuery(testQuery);
        setLoading(true);
        try {
            const citations = await findCitations(testQuery);
            setResults(citations);
        } catch (error) {
            console.error("Test error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>⚖️ Citation Finder (Pure AI)</Text>
                    <Text style={styles.subtitle}>Chunk 1.3 - Gemini Only</Text>
                </View>
            </View>

            {/* Search Input */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Citations</Text>
                <View style={styles.searchBox}>
                    <TextInput
                        style={styles.searchInput}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Enter legal query..."
                        placeholderTextColor={colors.textSecondary}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} size="small" />
                        ) : (
                            <Text style={styles.searchButtonText}>Search</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Test Queries */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Tests</Text>
                <View style={styles.testGrid}>
                    {testQueries.map((testQuery) => (
                        <TouchableOpacity
                            key={testQuery}
                            style={styles.testChip}
                            onPress={() => runTestQuery(testQuery)}
                            disabled={loading}
                        >
                            <Text style={styles.testChipText}>{testQuery}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Results */}
            {results.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Results ({results.length})</Text>
                    {results.map((result, index) => (
                        <View key={index} style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultType}>
                                    {result.type === 'constitutional_article' && '📜'}
                                    {result.type === 'supreme_court_case' && '⚖️'}
                                    {result.type === 'high_court_case' && '🏛️'}
                                    {result.type === 'act' && '📖'}
                                    {' ' + (result.type || 'citation').replace(/_/g, ' ').toUpperCase()}
                                </Text>
                                {result.relevance !== undefined && (
                                    <Text style={styles.relevanceScore}>{result.relevance}%</Text>
                                )}
                            </View>

                            <Text style={styles.resultCitation}>{result.citation}</Text>

                            {result.name && (
                                <Text style={styles.resultName}>{result.name}</Text>
                            )}

                            {result.summary && (
                                <Text style={styles.resultSummary}>{result.summary}</Text>
                            )}

                            {result.year && (
                                <Text style={styles.resultYear}>Year: {result.year}</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* How it works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🤖 Pure AI Approach</Text>
                <View style={styles.instructionBox}>
                    <Text style={styles.instructionText}>
                        ✨ <Text style={styles.bold}>Always Fresh:</Text> Every search calls Gemini AI
                    </Text>
                    <Text style={styles.instructionText}>
                        🎯 <Text style={styles.bold}>Maximum Accuracy:</Text> Latest legal knowledge
                    </Text>
                    <Text style={styles.instructionText}>
                        📚 <Text style={styles.bold}>Comprehensive:</Text> Not limited to pre-stored data
                    </Text>
                    <Text style={styles.instructionText}>
                        ⚖️ <Text style={styles.bold}>Quality First:</Text> Best citations for law students
                    </Text>
                    <Text style={styles.instructionText}>
                        💰 <Text style={styles.bold}>Cost:</Text> ~₹10-20/month for quality results
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
        padding: 8,
    },
    backText: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: "row",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 10,
        padding: 12,
        color: colors.textPrimary,
        fontSize: 14,
    },
    searchButton: {
        backgroundColor: colors.gold,
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 80,
    },
    searchButtonText: {
        color: colors.background,
        fontSize: 14,
        fontWeight: "600",
    },
    testGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    testChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    testChipText: {
        color: colors.gold,
        fontSize: 12,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    resultHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    resultType: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    relevanceScore: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "600",
    },
    resultCitation: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultName: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultSummary: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 16,
        marginTop: 4,
    },
    resultYear: {
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 4,
    },
    instructionBox: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 10,
        padding: 12,
    },
    instructionText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 18,
    },
    bold: {
        fontWeight: "600",
        color: colors.gold,
    },
});
