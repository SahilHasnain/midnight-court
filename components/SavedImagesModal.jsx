import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function SavedImagesModal({ visible, onClose, onSelectImage }) {
    const [savedImages, setSavedImages] = useState([]);

    useEffect(() => {
        if (visible) {
            loadSavedImages();
        }
    }, [visible]);

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

    const handleSelectImage = (image) => {
        onSelectImage({
            url: image.url,
            source: image.source,
        });
        onClose();
    };

    const renderImageCard = ({ item }) => (
        <TouchableOpacity
            style={styles.imageCard}
            onPress={() => handleSelectImage(item)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.thumbnail || item.url }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Tap to use</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Select from Library</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {savedImages.length > 0 ? (
                    <FlatList
                        data={savedImages}
                        renderItem={renderImageCard}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.gridGap}
                        contentContainerStyle={styles.gridContainer}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📸</Text>
                        <Text style={styles.emptyStateText}>No Saved Images</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Save images from the Legal Images library first
                        </Text>
                    </View>
                )}
            </SafeAreaView>
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Inter_700Bold",
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: colors.gold,
        fontSize: 24,
        fontWeight: "600",
    },
    gridContainer: {
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    gridGap: {
        gap: 12,
        paddingHorizontal: 8,
        marginBottom: 12,
    },
    imageCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        overflow: "hidden",
        position: "relative",
    },
    thumbnail: {
        width: "100%",
        height: 180,
        backgroundColor: colors.border,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
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
