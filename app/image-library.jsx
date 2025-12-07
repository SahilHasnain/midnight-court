import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../theme/colors";
import { searchImages } from "../utils/imageSearchAPI";

const LEGAL_SEARCH_TERMS = [
    "courtroom",
    "legal scales",
    "law books",
    "lawyer",
    "judge",
    "legal documents",
    "justice",
    "courthouse",
];

export default function ImageLibrary() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [savedImages, setSavedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState("pexels");
    const [activeTab, setActiveTab] = useState("search"); // 'search' or 'saved'

    // Load saved images on mount
    useFocusEffect(
        useCallback(() => {
            loadSavedImages();
        }, [])
    );

    const loadSavedImages = async () => {
        try {
            const saved = await AsyncStorage.getItem("saved_images");
            if (saved) {
                setSavedImages(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load saved images:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const results = await searchImages(searchQuery, selectedSource);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveImage = async (image) => {
        try {
            const updatedSavedImages = [
                ...savedImages,
                {
                    ...image,
                    savedAt: new Date().toISOString(),
                    id: `${image.id}-${Date.now()}`,
                },
            ];
            setSavedImages(updatedSavedImages);
            await AsyncStorage.setItem(
                "saved_images",
                JSON.stringify(updatedSavedImages)
            );
        } catch (error) {
            console.error("Failed to save image:", error);
        }
    };

    const deleteImage = async (imageId) => {
        try {
            const updatedSavedImages = savedImages.filter((img) => img.id !== imageId);
            setSavedImages(updatedSavedImages);
            await AsyncStorage.setItem(
                "saved_images",
                JSON.stringify(updatedSavedImages)
            );
        } catch (error) {
            console.error("Failed to delete image:", error);
        }
    };

    const renderImageCard = ({ item, isFromSearch = false }) => (
        <View style={styles.imageCardContainer}>
            <Image
                source={{ uri: item.thumbnail || item.url }}
                style={styles.imageCardThumbnail}
                resizeMode="cover"
            />
            <View style={styles.imageCardActions}>
                {isFromSearch ? (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.saveBtnStyle]}
                        onPress={() => saveImage(item)}
                    >
                        <Text style={styles.saveBtnText}>💾 Save</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtnStyle]}
                        onPress={() => deleteImage(item.id)}
                    >
                        <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal Images</Text>
                <View style={{ width: 50 }} />
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "search" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("search")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "search" && styles.activeTabText,
                        ]}
                    >
                        🔍 Search Images
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "saved" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("saved")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "saved" && styles.activeTabText,
                        ]}
                    >
                        💾 Saved ({savedImages.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === "search" ? (
                <View style={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchInputContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search legal images..."
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity
                                style={styles.searchBtn}
                                onPress={handleSearch}
                                disabled={isLoading}
                            >
                                <Text style={styles.searchBtnText}>🔍</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Source Toggle */}
                        <View style={styles.sourceToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.sourceBtn,
                                    selectedSource === "unsplash" && styles.sourceBtnActive,
                                ]}
                                onPress={() => setSelectedSource("unsplash")}
                            >
                                <Text
                                    style={[
                                        styles.sourceBtnText,
                                        selectedSource === "unsplash" && styles.sourceBtnTextActive,
                                    ]}
                                >
                                    Unsplash
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sourceBtn,
                                    selectedSource === "pexels" && styles.sourceBtnActive,
                                ]}
                                onPress={() => setSelectedSource("pexels")}
                            >
                                <Text
                                    style={[
                                        styles.sourceBtnText,
                                        selectedSource === "pexels" && styles.sourceBtnTextActive,
                                    ]}
                                >
                                    Pexels
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Search Suggestions */}
                        <View style={styles.suggestionsContainer}>
                            <Text style={styles.suggestionsLabel}>Quick Search:</Text>
                            <FlatList
                                data={LEGAL_SEARCH_TERMS}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionTag}
                                        onPress={() => {
                                            setSearchQuery(item);
                                        }}
                                    >
                                        <Text style={styles.suggestionTagText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item}
                                horizontal
                                scrollEnabled
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    </View>

                    {/* Results */}
                    {isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator
                                size="large"
                                color={colors.gold}
                            />
                            <Text style={styles.loaderText}>Searching images...</Text>
                        </View>
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            renderItem={(props) => renderImageCard({ ...props, isFromSearch: true })}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.gridGap}
                            contentContainerStyle={styles.gridContainer}
                            scrollEnabled
                        />
                    ) : searchQuery ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>🔍</Text>
                            <Text style={styles.emptyStateText}>No images found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Try different search terms
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>📸</Text>
                            <Text style={styles.emptyStateText}>Start Searching</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Search for legal images and save them
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.content}>
                    {savedImages.length > 0 ? (
                        <FlatList
                            data={savedImages}
                            renderItem={(props) => renderImageCard({ ...props, isFromSearch: false })}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.gridGap}
                            contentContainerStyle={styles.gridContainer}
                            scrollEnabled
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>💾</Text>
                            <Text style={styles.emptyStateText}>No Saved Images</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Search and save images to view them here
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    backBtnText: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    headerTitle: {
        color: colors.gold,
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "Inter_700Bold",
    },
    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    activeTab: {
        borderBottomColor: colors.gold,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    activeTabText: {
        color: colors.gold,
    },
    content: {
        flex: 1,
    },
    searchSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 14,
        fontFamily: "Inter_400Regular",
    },
    searchBtn: {
        padding: 8,
    },
    searchBtnText: {
        fontSize: 18,
    },
    sourceToggle: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    sourceBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderGold,
        backgroundColor: colors.card,
        alignItems: "center",
    },
    sourceBtnActive: {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
    },
    sourceBtnText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    sourceBtnTextActive: {
        color: colors.background,
    },
    suggestionsContainer: {
        marginTop: 8,
    },
    suggestionsLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
    },
    suggestionTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderGold,
        marginRight: 8,
    },
    suggestionTagText: {
        color: colors.gold,
        fontSize: 12,
        fontFamily: "Inter_500Medium",
    },
    gridContainer: {
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    gridGap: {
        gap: 12,
        paddingHorizontal: 8,
    },
    imageCardContainer: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        overflow: "hidden",
    },
    imageCardThumbnail: {
        width: "100%",
        height: 200,
        backgroundColor: colors.border,
    },
    imageCardActions: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexDirection: "row",
        gap: 6,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    saveBtnStyle: {
        backgroundColor: colors.gold,
    },
    saveBtnText: {
        color: colors.background,
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    deleteBtnStyle: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: "rgba(255, 0, 0, 0.3)",
    },
    deleteBtnText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loaderText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 12,
        fontFamily: "Inter_400Regular",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateText: {
        color: colors.ivory,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
    },
    emptyStateSubtext: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: "center",
        fontFamily: "Inter_400Regular",
    },
});
