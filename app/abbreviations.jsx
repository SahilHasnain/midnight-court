import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import abbreviationsData from '../data/legalAbbreviations.json';
import { getBookmarks, toggleBookmark } from '../utils/abbreviationsStorage';
import Toast from '../components/Toast';

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
                    <Text style={styles.abbr}>{item.abbr}</Text>
                    <View style={styles.cardActions}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleToggleBookmark(item.abbr)}>
                            <Ionicons 
                                name={isBookmarked ? "star" : "star-outline"} 
                                size={22} 
                                color={isBookmarked ? colors.gold : colors.textSecondary} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCopyToClipboard(item)}>
                            <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.full}>{item.full}</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
                <Text style={styles.example}>Example: {item.example}</Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
                {showBookmarksOnly ? 'No bookmarks yet' : 'No abbreviations found'}
            </Text>
            <Text style={styles.emptySubtext}>
                {showBookmarksOnly ? 'Tap the star icon to bookmark' : 'Try a different search term'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Legal Abbreviations</Text>
                        <Text style={styles.subtitle}>{filteredData.length} terms</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.bookmarkButton}
                        onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
                    >
                        <Ionicons 
                            name={showBookmarksOnly ? "star" : "star-outline"} 
                            size={24} 
                            color={showBookmarksOnly ? colors.gold : colors.textSecondary} 
                        />
                        {bookmarks.length > 0 && (
                            <View style={styles.bookmarkBadge}>
                                <Text style={styles.bookmarkBadgeText}>{bookmarks.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search abbreviations..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="characters"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

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
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookmarkButton: {
        padding: 8,
        position: 'relative',
    },
    bookmarkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.gold,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkBadgeText: {
        color: colors.background,
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    categoryContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
    },
    categoryChipText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: colors.background,
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    abbr: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gold,
    },
    categoryBadge: {
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    full: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    meaning: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    example: {
        fontSize: 13,
        color: colors.textSecondary,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
});
