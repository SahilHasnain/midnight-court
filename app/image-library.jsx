import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import Toast from "@/components/Toast";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    const [selectedSource, setSelectedSource] = useState("unsplash");
    const [activeTab, setActiveTab] = useState("search"); // 'search' or 'saved'
    const [isTyping, setIsTyping] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

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
        Keyboard.dismiss();
        setIsTyping(false);
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
            showToastMessage("✅ Image saved to collection");
        } catch (error) {
            console.error("Failed to save image:", error);
            showToastMessage("❌ Failed to save image");
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

    const downloadImage = async (image) => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                showToastMessage("❌ Sharing not available");
                return;
            }
            const uri = image.url || image.thumbnail;
            const filename = `image_${Date.now()}.jpg`;
            const localUri = FileSystem.cacheDirectory + filename;
            await FileSystem.downloadAsync(uri, localUri);
            await Sharing.shareAsync(localUri);
            showToastMessage("✅ Shared successfully");
        } catch (error) {
            console.error("Share error:", error);
            showToastMessage("❌ Failed to share image");
        }
    };

    const renderImageCard = ({ item, isFromSearch = false }) => (
        <View style={styles.imageCardContainer}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.thumbnail || item.url }}
                    style={styles.imageCardThumbnail}
                    resizeMode="cover"
                />
                {item.photographer && (
                    <View style={styles.imageInfoOverlay}>
                        <Text style={styles.photographerText} numberOfLines={1}>
                            📷 {item.photographer}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.imageCardActions}>
                {isFromSearch ? (
                    <>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.saveBtnStyle]}
                            onPress={() => saveImage(item)}
                        >
                            <Text style={styles.actionBtnIcon}>💾</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.downloadBtnStyle]}
                            onPress={() => downloadImage(item)}
                        >
                            <Text style={styles.actionBtnIcon}>📤</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.downloadBtnStyle]}
                            onPress={() => downloadImage(item)}
                        >
                            <Text style={styles.actionBtnIcon}>📤</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.deleteBtnStyle]}
                            onPress={() => deleteImage(item.id)}
                        >
                            <Text style={styles.actionBtnIconDelete}>🗑️</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    return (
        <>
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
                                    onChangeText={(t) => {
                                        setSearchQuery(t);
                                        setIsTyping(true);
                                    }}
                                    onFocus={() => setIsTyping(true)}
                                    onSubmitEditing={handleSearch}
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
                                            onPress={async () => {
                                                setSearchQuery(item);
                                                setIsTyping(false);
                                                Keyboard.dismiss();
                                                setIsLoading(true);
                                                try {
                                                    const results = await searchImages(item, selectedSource);
                                                    setSearchResults(results);
                                                } catch (error) {
                                                    console.error("Search failed:", error);
                                                } finally {
                                                    setIsLoading(false);
                                                }
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
                        ) : (!isTyping && searchResults.length > 0) ? (
                            <FlatList
                                data={searchResults}
                                renderItem={(props) => renderImageCard({ ...props, isFromSearch: true })}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                columnWrapperStyle={styles.gridGap}
                                contentContainerStyle={styles.gridContainer}
                                keyboardShouldPersistTaps="handled"
                                scrollEnabled
                            />
                        ) : (!isTyping && searchQuery) ? (
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
            <Toast message={toastMessage} visible={showToast} duration={2500} />
        </>
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
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
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
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
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
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        color: colors.textPrimary,
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
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        backgroundColor: colors.background,
        alignItems: "center",
    },
    sourceBtnActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.10)',
        borderColor: colors.gold,
    },
    sourceBtnText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    sourceBtnTextActive: {
        color: colors.gold,
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
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
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
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        overflow: "hidden",
        marginBottom: 4,
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
    },
    imageCardThumbnail: {
        width: "100%",
        height: 200,
        backgroundColor: colors.background,
    },
    imageInfoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    photographerText: {
        color: colors.ivory,
        fontSize: 11,
        fontFamily: 'Inter_500Medium',
        opacity: 0.9,
    },
    imageCardActions: {
        padding: 10,
        flexDirection: "row",
        gap: 8,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(212, 175, 55, 0.15)',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    saveBtnStyle: {
        backgroundColor: colors.gold,
    },
    actionBtnIcon: {
        fontSize: 18,
    },
    actionBtnLabel: {
        color: colors.textPrimary,
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    downloadBtnStyle: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    deleteBtnStyle: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    actionBtnIconDelete: {
        fontSize: 18,
    },
    actionBtnLabelDelete: {
        color: '#ef4444',
        fontSize: 11,
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
