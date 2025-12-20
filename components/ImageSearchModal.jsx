import { colors } from "@/theme/colors";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { searchImages } from "../utils/imageSearchAPI";

export default function ImageSearchModal({ visible, onClose, onSelectImage }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState("unsplash");
    const [isTyping, setIsTyping] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert("Error", "Please enter a search term");
            return;
        }

        // Ensure search triggers even when keyboard is open
        Keyboard.dismiss();
        setIsTyping(false);
        setLoading(true);
        try {
            const results = await searchImages(searchQuery.trim(), selectedSource);
            setSearchResults(results);

            if (results.length === 0) {
                Alert.alert("No Results", `No images found for "${searchQuery}"`);
            }
        } catch (error) {
            console.error("Search error:", error);
            Alert.alert("Search Failed", "Could not fetch images. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = (image) => {
        onSelectImage({
            uri: image.url,
            caption: `${image.attribution}`,
            photographer: image.photographer,
            source: selectedSource,
        });
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedSource("unsplash");
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const renderImage = ({ item }) => (
        <TouchableOpacity
            style={styles.imageCard}
            onPress={() => handleSelectImage(item)}
            activeOpacity={0.7}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                    <Text style={styles.overlayText}>Tap to use</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Search Photos</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="e.g., courtroom, legal scales"
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={(t) => {
                            setSearchQuery(t);
                            setIsTyping(true);
                        }}
                        onFocus={() => setIsTyping(true)}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
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

                {/* Source Selector */}
                <View style={styles.sourceSelector}>
                    <TouchableOpacity
                        style={[
                            styles.sourceButton,
                            selectedSource === "unsplash" && styles.sourceButtonActive,
                        ]}
                        onPress={() => setSelectedSource("unsplash")}
                    >
                        <Text
                            style={[
                                styles.sourceButtonText,
                                selectedSource === "unsplash" && styles.sourceButtonTextActive,
                            ]}
                        >
                            Unsplash
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.sourceButton,
                            selectedSource === "pexels" && styles.sourceButtonActive,
                        ]}
                        onPress={() => setSelectedSource("pexels")}
                    >
                        <Text
                            style={[
                                styles.sourceButtonText,
                                selectedSource === "pexels" && styles.sourceButtonTextActive,
                            ]}
                        >
                            Pexels
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results Grid */}
                {!isTyping && searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderImage}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.gridRow}
                        contentContainerStyle={styles.gridContent}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled
                    />
                ) : (!isTyping && searchQuery && !loading) ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🖼️</Text>
                        <Text style={styles.emptyTitle}>No Results</Text>
                        <Text style={styles.emptyText}>
                            Try searching for courtroom, scales, or justice
                        </Text>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>Search Photos</Text>
                        <Text style={styles.emptyText}>
                            Browse free stock photos from Unsplash or Pexels. Perfect for legal
                            presentations.
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    closeButton: {
        fontSize: 24,
        color: colors.textSecondary,
        fontWeight: "bold",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gold,
        fontFamily: "Inter_700Bold",
    },
    searchSection: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
        fontFamily: "Inter_400Regular",
    },
    searchButton: {
        backgroundColor: colors.gold,
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 80,
    },
    searchButtonText: {
        color: colors.background,
        fontWeight: "600",
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
    },
    sourceSelector: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    sourceButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        backgroundColor: colors.background,
        alignItems: "center",
    },
    sourceButtonActive: {
        borderColor: colors.gold,
        backgroundColor: "rgba(212, 175, 55, 0.10)",
    },
    sourceButtonText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontFamily: "Inter_600SemiBold",
        fontWeight: "600",
    },
    sourceButtonTextActive: {
        color: colors.gold,
    },
    gridContent: {
        paddingHorizontal: 10,
        paddingVertical: 16,
    },
    gridRow: {
        justifyContent: "space-between",
        marginBottom: 10,
    },
    imageCard: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: colors.card,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    imageWrapper: {
        position: "relative",
        width: "100%",
    },
    thumbnail: {
        width: "100%",
        height: 180,
        backgroundColor: colors.background,
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    overlayText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    attribution: {
        padding: 8,
        fontSize: 11,
        color: colors.textSecondary,
        fontFamily: "Inter_400Regular",
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.gold,
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        fontFamily: "Inter_400Regular",
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(212, 175, 55, 0.15)',
        backgroundColor: colors.card,
    },
    footerText: {
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: "center",
        fontFamily: "Inter_400Regular",
    },
});
