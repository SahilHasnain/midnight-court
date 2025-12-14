import { colors } from "@/theme/colors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { findCitations } from "../utils/citationAPI";

export default function CitationSearchModal({ visible, onClose, onSelectCitation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const results = await findCitations(searchQuery.trim());
            setSearchResults(results.citations || []);

            if (results.citations?.length === 0) {
                Alert.alert("No Results", `No citations found for "${searchQuery}"`);
            }
        } catch (error) {
            console.error("Citation search error:", error);
            Alert.alert("Search Failed", "Could not fetch citations. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    // Debounced search - triggers 800ms after user stops typing
    useEffect(() => {
        if (searchQuery.trim().length >= 3) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            debounceTimer.current = setTimeout(() => {
                handleSearch();
            }, 800);
        } else {
            setSearchResults([]);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery, handleSearch]);

    const handleSelectCitation = (citation) => {
        // Format citation for Quote block
        const formattedCitation = {
            text: citation.name || citation.citation,
            author: citation.fullTitle || citation.name,
            year: citation.year || "",
            summary: citation.summary || "",
        };

        onSelectCitation(formattedCitation);
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const getCitationIcon = (type) => {
        switch (type) {
            case 'constitutional_article':
            case 'article':
                return '📜';
            case 'supreme_court_case':
            case 'case':
                return '⚖️';
            case 'high_court_case':
                return '🏛️';
            case 'act':
            case 'section':
                return '📖';
            default:
                return '📄';
        }
    };

    const renderCitation = ({ item }) => (
        <TouchableOpacity
            style={styles.citationCard}
            onPress={() => handleSelectCitation(item)}
            activeOpacity={0.7}
        >
            <View style={styles.citationHeader}>
                <Text style={styles.citationIcon}>{getCitationIcon(item.type)}</Text>
                <View style={styles.citationHeaderText}>
                    <Text style={styles.citationType}>
                        {(item.type || 'citation').replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    {item.relevance !== undefined && (
                        <Text style={styles.relevanceScore}>{item.relevance}%</Text>
                    )}
                </View>
            </View>

            <Text style={styles.citationName}>{item.name || item.citation}</Text>

            {item.fullTitle && item.fullTitle !== item.name && (
                <Text style={styles.citationFullTitle}>{item.fullTitle}</Text>
            )}

            {item.summary && (
                <Text style={styles.citationSummary} numberOfLines={3}>
                    {item.summary}
                </Text>
            )}

            {item.year && (
                <Text style={styles.citationYear}>Year: {item.year}</Text>
            )}

            <View style={styles.insertHint}>
                <Text style={styles.insertHintText}>Tap to insert →</Text>
            </View>
        </TouchableOpacity>
    );

    const renderQuickSearches = () => {
        const quickSearches = [
            "right to privacy",
            "article 21",
            "kesavananda bharati",
            "freedom of speech",
            "article 14",
            "habeas corpus"
        ];

        return (
            <View style={styles.quickSearchContainer}>
                <Text style={styles.quickSearchTitle}>Quick Searches:</Text>
                <View style={styles.quickSearchGrid}>
                    {quickSearches.map((term) => (
                        <TouchableOpacity
                            key={term}
                            style={styles.quickSearchChip}
                            onPress={() => setSearchQuery(term)}
                        >
                            <Text style={styles.quickSearchText}>{term}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
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
                    <Text style={styles.headerTitle}>Find Legal Citation</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for case, article, or legal concept..."
                        placeholderTextColor={colors.textSecondary}
                        autoFocus={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {loading && (
                        <View style={styles.searchLoading}>
                            <ActivityIndicator color={colors.gold} size="small" />
                        </View>
                    )}
                </View>

                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                    <Text style={styles.minCharsText}>
                        Type at least 3 characters to search
                    </Text>
                )}

                {/* Results or Quick Searches */}
                {searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderCitation}
                        keyExtractor={(item, index) => `citation-${index}`}
                        contentContainerStyle={styles.resultsList}
                        keyboardShouldPersistTaps="handled"
                    />
                ) : searchQuery.trim().length === 0 ? (
                    renderQuickSearches()
                ) : !loading && searchQuery.trim().length >= 3 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🔍</Text>
                        <Text style={styles.emptyStateText}>
                            No citations found
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            Try a different search term
                        </Text>
                    </View>
                ) : null}

                {/* Footer Info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        🤖 Powered by Gemini AI • Always up-to-date
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        fontWeight: "600",
    },
    headerTitle: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    headerSpacer: {
        width: 40,
    },
    searchContainer: {
        padding: 16,
        position: "relative",
    },
    searchInput: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        color: colors.text,
        fontSize: 15,
    },
    searchLoading: {
        position: "absolute",
        right: 28,
        top: 28,
    },
    minCharsText: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: "center",
        marginTop: -8,
        marginBottom: 12,
    },
    resultsList: {
        padding: 16,
        paddingTop: 8,
    },
    citationCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    citationHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    citationIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    citationHeaderText: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    citationType: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    relevanceScore: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "700",
    },
    citationName: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4,
    },
    citationFullTitle: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },
    citationSummary: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 17,
        marginTop: 4,
    },
    citationYear: {
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 6,
        fontStyle: "italic",
    },
    insertHint: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold + "30",
    },
    insertHintText: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: "600",
        textAlign: "right",
    },
    quickSearchContainer: {
        padding: 16,
    },
    quickSearchTitle: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    quickSearchGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    quickSearchChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 18,
    },
    quickSearchText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
    },
    footer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderGold,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 11,
        textAlign: "center",
    },
});
