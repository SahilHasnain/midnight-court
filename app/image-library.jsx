import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";

import Toast from "@/components/Toast";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  lightColors,
  spacing,
  sizing,
  typography,
} from "../theme/designSystem";
import { searchImages } from "../utils/imageSearchAPI";
import { StyleSheet } from "react-native";

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
      const updatedSavedImages = savedImages.filter(
        (img) => img.id !== imageId
      );
      setSavedImages(updatedSavedImages);
      await AsyncStorage.setItem(
        "saved_images",
        JSON.stringify(updatedSavedImages)
      );
      showToastMessage("✅ Image removed");
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
            <Ionicons
              name="camera"
              size={12}
              color={lightColors.background.primary}
            />
            <Text style={styles.photographerText} numberOfLines={1}>
              {item.photographer}
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
              accessibilityLabel="Save image"
            >
              <Ionicons
                name="bookmark"
                size={18}
                color={lightColors.background.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadBtnStyle]}
              onPress={() => downloadImage(item)}
              accessibilityLabel="Share image"
            >
              <Ionicons
                name="share-outline"
                size={18}
                color={lightColors.accent.gold}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadBtnStyle]}
              onPress={() => downloadImage(item)}
              accessibilityLabel="Share image"
            >
              <Ionicons
                name="share-outline"
                size={18}
                color={lightColors.accent.gold}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtnStyle]}
              onPress={() => deleteImage(item.id)}
              accessibilityLabel="Delete image"
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>LEGAL RESOURCES</Text>
          <Text style={styles.title}>Legal Images</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>
            Search and save professional legal images
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "search" && styles.activeTab]}
            onPress={() => setActiveTab("search")}
            accessibilityLabel="Search images tab"
            accessibilityState={{ selected: activeTab === "search" }}
          >
            <Ionicons
              name="search"
              size={18}
              color={
                activeTab === "search"
                  ? lightColors.accent.gold
                  : lightColors.text.tertiary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "search" && styles.activeTabText,
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "saved" && styles.activeTab]}
            onPress={() => setActiveTab("saved")}
            accessibilityLabel="Saved images tab"
            accessibilityState={{ selected: activeTab === "saved" }}
          >
            <Ionicons
              name="bookmark"
              size={18}
              color={
                activeTab === "saved"
                  ? lightColors.accent.gold
                  : lightColors.text.tertiary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "saved" && styles.activeTabText,
              ]}
            >
              Saved ({savedImages.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "search" ? (
          <View style={styles.content}>
            {/* Search Section */}
            <View style={styles.searchSection}>
              {/* Search Bar */}
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={lightColors.text.tertiary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search legal images..."
                  placeholderTextColor={lightColors.text.tertiary}
                  value={searchQuery}
                  onChangeText={(t) => {
                    setSearchQuery(t);
                    setIsTyping(true);
                  }}
                  onFocus={() => setIsTyping(true)}
                  onSubmitEditing={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={lightColors.text.tertiary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={handleSearch}
                  disabled={isLoading}
                  accessibilityLabel="Search"
                >
                  <Text style={styles.searchBtnText}>Search</Text>
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
                  accessibilityLabel="Unsplash source"
                  accessibilityState={{
                    selected: selectedSource === "unsplash",
                  }}
                >
                  <Text
                    style={[
                      styles.sourceBtnText,
                      selectedSource === "unsplash" &&
                        styles.sourceBtnTextActive,
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
                  accessibilityLabel="Pexels source"
                  accessibilityState={{ selected: selectedSource === "pexels" }}
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
                          const results = await searchImages(
                            item,
                            selectedSource
                          );
                          setSearchResults(results);
                        } catch (error) {
                          console.error("Search failed:", error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      accessibilityLabel={`Search for ${item}`}
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
                  color={lightColors.accent.gold}
                />
                <Text style={styles.loaderText}>Searching images...</Text>
              </View>
            ) : !isTyping && searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={(props) =>
                  renderImageCard({ ...props, isFromSearch: true })
                }
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridGap}
                contentContainerStyle={styles.gridContainer}
                keyboardShouldPersistTaps="handled"
                scrollEnabled
              />
            ) : !isTyping && searchQuery ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={lightColors.text.tertiary}
                  />
                </View>
                <Text style={styles.emptyStateText}>No Images Found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try different search terms or check your connection
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="images-outline"
                    size={48}
                    color={lightColors.text.tertiary}
                  />
                </View>
                <Text style={styles.emptyStateText}>Start Searching</Text>
                <Text style={styles.emptyStateSubtext}>
                  Search for professional legal images from Unsplash and Pexels
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {savedImages.length > 0 ? (
              <FlatList
                data={savedImages}
                renderItem={(props) =>
                  renderImageCard({ ...props, isFromSearch: false })
                }
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridGap}
                contentContainerStyle={styles.gridContainer}
                scrollEnabled
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="bookmark-outline"
                    size={48}
                    color={lightColors.text.tertiary}
                  />
                </View>
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

  kicker: {
    ...typography.overline,
    color: lightColors.text.secondary,
    marginBottom: spacing.sm, // 8px
    letterSpacing: 1.5,
  },

  title: {
    ...typography.display,
    fontSize: 32,
    color: lightColors.accent.gold,
    marginBottom: spacing.xs, // 4px
  },

  goldLine: {
    width: 80,
    height: 4,
    backgroundColor: lightColors.accent.gold,
    borderRadius: sizing.radiusSm, // 6px
    marginBottom: spacing.md, // 16px
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  subtitle: {
    ...typography.body,
    color: lightColors.text.secondary,
    lineHeight: 24,
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.secondary,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs, // 4px
    paddingVertical: spacing.md, // 16px
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: lightColors.accent.gold,
  },

  tabText: {
    ...typography.bodySmall,
    color: lightColors.text.tertiary,
    fontWeight: "600",
  },

  activeTabText: {
    color: lightColors.accent.gold,
  },

  content: {
    flex: 1,
  },

  // Search Section
  searchSection: {
    padding: spacing.lg, // 24px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.secondary,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightColors.background.primary,
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    paddingHorizontal: spacing.md, // 16px
    marginBottom: spacing.md, // 16px
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
    paddingVertical: spacing.sm, // 8px
  },

  clearSearchButton: {
    padding: spacing.xs, // 4px
    marginRight: spacing.xs,
  },

  searchBtn: {
    backgroundColor: lightColors.accent.gold,
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm, // 8px
    borderRadius: sizing.radiusMd, // 8px
  },

  searchBtnText: {
    ...typography.button,
    color: lightColors.background.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Source Toggle
  sourceToggle: {
    flexDirection: "row",
    gap: spacing.sm, // 8px
    marginBottom: spacing.md, // 16px
  },

  sourceBtn: {
    flex: 1,
    paddingVertical: spacing.sm, // 8px
    paddingHorizontal: spacing.md, // 16px
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.primary,
    alignItems: "center",
  },

  sourceBtnActive: {
    backgroundColor: lightColors.accent.goldLight,
    borderColor: lightColors.accent.gold,
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  sourceBtnText: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    fontWeight: "600",
  },

  sourceBtnTextActive: {
    color: lightColors.accent.gold,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: spacing.xs, // 4px
  },

  suggestionsLabel: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontWeight: "600",
    marginBottom: spacing.sm, // 8px
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  suggestionTag: {
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm, // 8px
    borderRadius: sizing.radiusLg, // 12px
    backgroundColor: lightColors.background.primary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    marginRight: spacing.sm, // 8px
  },

  suggestionTagText: {
    ...typography.caption,
    color: lightColors.accent.gold,
    fontSize: 12,
    fontWeight: "500",
  },

  // Grid Layout
  gridContainer: {
    paddingHorizontal: spacing.sm, // 8px
    paddingVertical: spacing.md, // 16px
  },

  gridGap: {
    gap: spacing.md, // 16px
    paddingHorizontal: spacing.sm, // 8px
  },

  // Image Card
  imageCardContainer: {
    flex: 1,
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    overflow: "hidden",
    marginBottom: spacing.xs, // 4px
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
  },

  imageCardThumbnail: {
    width: "100%",
    height: 180,
    backgroundColor: lightColors.background.tertiary,
  },

  imageInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(26, 29, 33, 0.85)",
    paddingVertical: spacing.xs, // 4px
    paddingHorizontal: spacing.sm, // 8px
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs, // 4px
  },

  photographerText: {
    ...typography.caption,
    color: lightColors.background.primary,
    fontSize: 11,
    flex: 1,
  },

  imageCardActions: {
    padding: spacing.sm, // 8px
    flexDirection: "row",
    gap: spacing.sm, // 8px
    borderTopWidth: sizing.borderThin,
    borderTopColor: lightColors.background.tertiary,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm, // 8px
    paddingHorizontal: spacing.sm, // 8px
    borderRadius: sizing.radiusMd, // 8px
    alignItems: "center",
    justifyContent: "center",
  },

  saveBtnStyle: {
    backgroundColor: lightColors.accent.gold,
  },

  downloadBtnStyle: {
    backgroundColor: lightColors.background.primary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
  },

  deleteBtnStyle: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: sizing.borderThin,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },

  // Loading State
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxxxl, // 64px
  },

  loaderText: {
    ...typography.body,
    color: lightColors.text.secondary,
    marginTop: spacing.md, // 16px
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl, // 32px
    paddingVertical: spacing.xxxxxl, // 64px
  },

  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: lightColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg, // 24px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
  },

  emptyStateText: {
    ...typography.h2,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
    textAlign: "center",
  },

  emptyStateSubtext: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
});
