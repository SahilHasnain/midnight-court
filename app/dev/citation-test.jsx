import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { findCitations, getCacheStats, clearCitationCache } from "../../utils/citationAPI";

export default function CitationTestScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadCacheStats();
    }, [])
  );

  const loadCacheStats = async () => {
    const stats = await getCacheStats();
    setCacheStats(stats);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const citations = await findCitations(query);
      setResults(citations);
      await loadCacheStats();
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    await clearCitationCache();
    await loadCacheStats();
  };

  const testQueries = [
    "right to privacy",
    "article 21",
    "kesavananda bharati",
    "freedom of speech",
    "reservation",
    "sexual harassment",
  ];

  const runTestQuery = async (testQuery) => {
    setQuery(testQuery);
    setLoading(true);
    try {
      const citations = await findCitations(testQuery);
      setResults(citations);
      await loadCacheStats();
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
          <Text style={styles.title}>⚖️ Citation Finder Test</Text>
          <Text style={styles.subtitle}>Chunk 1.3 - Backend</Text>
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

      {/* Cache Stats */}
      {cacheStats && (
        <View style={styles.section}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>Cache Stats</Text>
            <TouchableOpacity onPress={handleClearCache} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statText}>Cached Queries: {cacheStats.entries}</Text>
            <Text style={styles.statText}>Cache Size: {(cacheStats.size / 1024).toFixed(1)} KB</Text>
          </View>
        </View>
      )}

      {/* Results */}
      {results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results ({results.length})</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultType}>
                  {result.type === 'constitutional_article' && '📜'}
                  {result.type === 'case' && '⚖️'}
                  {result.type === 'act' && '📖'}
                  {' ' + result.type.replace('_', ' ').toUpperCase()}
                </Text>
                {result.relevance !== undefined && (
                  <Text style={styles.relevanceScore}>{result.relevance}%</Text>
                )}
              </View>
              
              <Text style={styles.resultCitation}>{result.citation}</Text>
              
              {result.name && (
                <Text style={styles.resultName}>{result.name}</Text>
              )}
              
              {result.title && (
                <Text style={styles.resultTitle}>{result.title}</Text>
              )}
              
              {(result.summary || result.description) && (
                <Text style={styles.resultSummary}>
                  {result.summary || result.description}
                </Text>
              )}
              
              {result.year && (
                <Text style={styles.resultYear}>Year: {result.year}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 How It Works</Text>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            1. <Text style={styles.bold}>Local Search:</Text> Checks 11 constitutional articles, 10 landmark cases, 8 important acts
          </Text>
          <Text style={styles.instructionText}>
            2. <Text style={styles.bold}>Fuzzy Matching:</Text> Keyword-based relevance scoring
          </Text>
          <Text style={styles.instructionText}>
            3. <Text style={styles.bold}>Gemini AI:</Text> Used for complex queries with no local matches
          </Text>
          <Text style={styles.instructionText}>
            4. <Text style={styles.bold}>Caching:</Text> Results cached for 7 days to reduce API calls
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
    color: colors.text,
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
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statsBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 10,
    padding: 12,
  },
  statText: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  clearButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "600",
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
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 13,
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
    color: colors.text,
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "600",
    color: colors.gold,
  },
});
