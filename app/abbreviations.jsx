import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '../components/Toast';
import abbreviationsData from '../data/legalAbbreviations.json';
import { lightColors, sizing, spacing, typography } from '../theme/designSystem';
import { getBookmarks, toggleBookmark } from '../utils/abbreviationsStorage';

export default function AbbreviationsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        const saved = await getBookmarks();
        setBookmarks(saved);
    };

    const handleToggleBookmark = async (abbr) => {
        const isNowBookmarked = await toggleBookmark(abbr);
        await loadBookmarks();
        showToast(isNowBookmarked ? 'Bookmarked!' : 'Removed from bookmarks', 'success');
    };

    const handleCopyToClipboard = async (item) => {
        const text = `${item.abbr} - ${item.full}\n${item.meaning}`;
        await Clipboard.setStringAsync(text);
        showToast('Copied to clipboard!', 'success');
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
    };

    const abbreviations = useMemo(() => {
        return Object.entries(abbreviationsData).map(([abbr, data]) => ({
            abbr,
            ...data,
        }));
    }, []);

    const filteredData = useMemo(() => {
        let filtered = abbreviations;

        if (showBookmarksOnly) {
            filtered = filtered.filter(item => bookmarks.includes(item.abbr));
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.abbr.toLowerCase().includes(query) ||
                    item.full.toLowerCase().includes(query) ||
                    item.meaning.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [abbreviations, searchQuery, selectedCategory, showBookmarksOnly, bookmarks]);

    const categories = ['All', 'Constitutional', 'Criminal', 'Civil', 'Procedural', 'General'];

    const renderItem = ({ item }) => {
        const isBookmarked = bookmarks.includes(item.abbr);
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.abbrContainer}>
                        <Text style={styles.abbr}>{item.abbr}</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleToggleBookmark(item.abbr)}
                            accessibilityLabel={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        >
                            <Ionicons 
                                name={isBookmarked ? "star" : "star-outline"} 
                                size={20} 
                                color={isBookmarked ? lightColors.accent.gold : lightColors.text.tertiary} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleCopyToClipboard(item)}
                            accessibilityLabel="Copy to clipboard"
                        >
                            <Ionicons 
                                name="copy-outline" 
                                size={18} 
                                color={lightColors.text.tertiary} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.full}>{item.full}</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
                <View style={styles.exampleContainer}>
                    <Text style={styles.exampleLabel}>Example:</Text>
                    <Text style={styles.example}>{item.example}</Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons 
                    name={showBookmarksOnly ? "star-outline" : "search-outline"} 
                    size={56} 
                    color={lightColors.text.tertiary} 
                />
            </View>
            <Text style={styles.emptyText}>
                {showBookmarksOnly ? 'No Bookmarks Yet' : 'No Abbreviations Found'}
            </Text>
            <Text style={styles.emptySubtext}>
                {showBookmarksOnly 
                    ? 'Tap the star icon on any term to bookmark it for quick access' 
                    : 'Try adjusting your search or category filters'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerContent}>
                        <Text style={styles.kicker}>LEGAL REFERENCE</Text>
                        <Text style={styles.title}>Legal Dictionary</Text>
                        <View style={styles.goldLine} />
                        <Text style={styles.subtitle}>
                            {filteredData.length} legal abbreviation{filteredData.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={[
                            styles.bookmarkButton,
                            showBookmarksOnly && styles.bookmarkButtonActive
                        ]}
                        onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
                        accessibilityLabel={showBookmarksOnly ? "Show all terms" : "Show bookmarks only"}
                    >
                        <Ionicons 
                            name={showBookmarksOnly ? "star" : "star-outline"} 
                            size={22} 
                            color={showBookmarksOnly ? lightColors.background.primary : lightColors.accent.gold} 
                        />
                        {bookmarks.length > 0 && !showBookmarksOnly && (
                            <View style={styles.bookmarkBadge}>
                                <Text style={styles.bookmarkBadgeText}>{bookmarks.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Enhanced Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons 
                    name="search" 
                    size={20} 
                    color={lightColors.text.tertiary} 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search abbreviations, terms, or meanings..."
                    placeholderTextColor={lightColors.text.tertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="characters"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity 
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                        accessibilityLabel="Clear search"
                    >
                        <Ionicons 
                            name="close-circle" 
                            size={20} 
                            color={lightColors.text.tertiary} 
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Enhanced Category Chips */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={item => item}
                contentContainerStyle={styles.categoryContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === item && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(item)}
                        accessibilityLabel={`Filter by ${item}`}
                        accessibilityState={{ selected: selectedCategory === item }}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive,
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Results List */}
            <FlatList
                data={filteredData}
                keyExtractor={item => item.abbr}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightColors.background.primary,
    },

    // Header Styles
    header: {
        paddingHorizontal: spacing.lg, // 24px
        paddingTop: spacing.xl, // 32px
        paddingBottom: spacing.lg, // 24px
        borderBottomWidth: sizing.borderThin,
        borderBottomColor: lightColors.background.tertiary,
        backgroundColor: lightColors.background.secondary,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    headerContent: {
        flex: 1,
    },

    kicker: {
        ...typography.overline,
        color: lightColors.text.secondary,
        marginBottom: spacing.xs, // 4px
    },

    title: {
        ...typography.display,
        color: lightColors.accent.gold,
        marginBottom: spacing.xs, // 4px
    },

    goldLine: {
        width: 60,
        height: 3,
        backgroundColor: lightColors.accent.gold,
        borderRadius: sizing.radiusXs, // 4px
        marginBottom: spacing.sm, // 8px
        shadowColor: lightColors.accent.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    subtitle: {
        ...typography.bodySmall,
        color: lightColors.text.secondary,
    },

    bookmarkButton: {
        width: sizing.touchTarget, // 44px
        height: sizing.touchTarget,
        borderRadius: sizing.touchTarget / 2,
        backgroundColor: lightColors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
    },

    bookmarkButtonActive: {
        backgroundColor: lightColors.accent.gold,
        borderColor: lightColors.accent.gold,
    },

    bookmarkBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: lightColors.accent.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: lightColors.background.secondary,
    },

    bookmarkBadgeText: {
        ...typography.caption,
        color: lightColors.background.primary,
        fontSize: 10,
        fontWeight: '700',
    },

    // Search Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: lightColors.background.secondary,
        marginHorizontal: spacing.lg, // 24px
        marginTop: spacing.md, // 16px
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md, // 16px
        paddingVertical: spacing.sm, // 8px
        borderRadius: sizing.radiusLg, // 12px
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
        shadowColor: lightColors.text.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },

    searchIcon: {
        marginRight: spacing.sm, // 8px
    },

    searchInput: {
        flex: 1,
        ...typography.body,
        color: lightColors.text.primary,
        paddingVertical: spacing.xs, // 4px
    },

    clearButton: {
        padding: spacing.xs, // 4px
    },

    // Category Chips
    categoryContainer: {
        paddingHorizontal: spacing.lg, // 24px
        paddingBottom: spacing.md, // 16px
        gap: spacing.sm, // 8px
    },

    categoryChip: {
        paddingHorizontal: spacing.md, // 16px
        paddingVertical: spacing.sm, // 8px
        borderRadius: sizing.radiusLg, // 12px
        backgroundColor: lightColors.background.secondary,
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
        marginRight: spacing.sm, // 8px
    },

    categoryChipActive: {
        backgroundColor: lightColors.accent.gold,
        borderColor: lightColors.accent.gold,
        shadowColor: lightColors.accent.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },

    categoryChipText: {
        ...typography.bodySmall,
        color: lightColors.text.secondary,
        fontWeight: '500',
    },

    categoryChipTextActive: {
        color: lightColors.background.primary,
        fontWeight: '600',
    },

    // List Content
    listContent: {
        padding: spacing.lg, // 24px
        paddingTop: spacing.md, // 16px
    },

    // Card Styles
    card: {
        backgroundColor: lightColors.background.secondary,
        borderRadius: sizing.radiusLg, // 12px
        padding: spacing.lg, // 24px
        marginBottom: spacing.md, // 16px
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
        shadowColor: lightColors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md, // 16px
    },

    abbrContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm, // 8px
    },

    abbr: {
        ...typography.h2,
        color: lightColors.accent.gold,
        fontWeight: '700',
    },

    categoryBadge: {
        backgroundColor: lightColors.accent.goldLight,
        paddingHorizontal: spacing.sm, // 8px
        paddingVertical: spacing.xs, // 4px
        borderRadius: sizing.radiusSm, // 6px
        borderWidth: sizing.borderThin,
        borderColor: lightColors.accent.gold,
    },

    categoryText: {
        ...typography.caption,
        color: lightColors.accent.gold,
        fontWeight: '600',
        fontSize: 10,
    },

    cardActions: {
        flexDirection: 'row',
        gap: spacing.sm, // 8px
    },

    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: lightColors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
    },

    full: {
        ...typography.h3,
        color: lightColors.text.primary,
        marginBottom: spacing.sm, // 8px
        fontWeight: '600',
    },

    meaning: {
        ...typography.body,
        color: lightColors.text.secondary,
        lineHeight: 24,
        marginBottom: spacing.md, // 16px
    },

    exampleContainer: {
        backgroundColor: lightColors.background.tertiary,
        padding: spacing.md, // 16px
        borderRadius: sizing.radiusMd, // 8px
        borderLeftWidth: 3,
        borderLeftColor: lightColors.accent.gold,
    },

    exampleLabel: {
        ...typography.caption,
        color: lightColors.text.tertiary,
        fontWeight: '600',
        marginBottom: spacing.xs, // 4px
        textTransform: 'uppercase',
    },

    example: {
        ...typography.bodySmall,
        color: lightColors.text.secondary,
        fontStyle: 'italic',
        lineHeight: 20,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxxxxl, // 64px
        paddingHorizontal: spacing.xl, // 32px
    },

    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: lightColors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg, // 24px
        borderWidth: sizing.borderThin,
        borderColor: lightColors.background.tertiary,
    },

    emptyText: {
        ...typography.h2,
        color: lightColors.text.primary,
        marginBottom: spacing.sm, // 8px
        textAlign: 'center',
    },

    emptySubtext: {
        ...typography.body,
        color: lightColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
});
