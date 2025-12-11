import { colors } from "@/theme/colors";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SavedImagesModal from "../SavedImagesModal";

/**
 * ImageBlock - Image with caption and layout control
 * Allows flexible image placement anywhere in slide content
 */
export default function ImageBlock({ block, onUpdate, onDelete, onOpenImageSearch }) {
    const [showPreview, setShowPreview] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);

    const updateField = (field, value) => {
        onUpdate({
            ...block,
            data: { ...block.data, [field]: value }
        });
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            updateField('uri', result.assets[0].uri);
        }
    };

    const handleSelectFromLibrary = (image) => {
        updateField('uri', image.url);
        setShowLibraryModal(false);
    };

    // Parse markdown for caption preview
    const parseFormattedText = (text) => {
        if (!text) return [{ text: '', color: null }];

        const parts = [];
        let currentIndex = 0;
        const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > currentIndex) {
                parts.push({
                    text: text.substring(currentIndex, match.index),
                    color: null
                });
            }

            const matched = match[0];
            if (matched.startsWith('*') && matched.endsWith('*')) {
                parts.push({ text: matched.slice(1, -1), color: colors.gold });
            } else if (matched.startsWith('~') && matched.endsWith('~')) {
                parts.push({ text: matched.slice(1, -1), color: '#ef4444' });
            } else if (matched.startsWith('_') && matched.endsWith('_')) {
                parts.push({ text: matched.slice(1, -1), color: '#3b82f6' });
            }

            currentIndex = match.index + matched.length;
        }

        if (currentIndex < text.length) {
            parts.push({
                text: text.substring(currentIndex),
                color: null
            });
        }

        return parts.length > 0 ? parts : [{ text, color: null }];
    };

    const getSizeConfig = (size) => {
        switch (size) {
            case 'small':
                return { width: '50%', height: 400 };
            case 'medium':
                return { width: '60%', height: 500 };
            case 'large':
                return { width: '100%', height: 600 };
            default:
                return { width: '50%', height: 400 };
        }
    };

    const getAlignmentStyle = (layout) => {
        switch (layout) {
            case 'floatLeft':
            case 'floatRight':
                return 'flex-start'; // Float layouts align to start
            case 'center':
            default:
                return 'center';
        }
    };

    const sizeConfig = getSizeConfig(block.data.size);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>📷 Image</Text>
                <View style={styles.headerRight}>
                    {block.data.uri && (
                        <TouchableOpacity
                            onPress={() => setShowPreview(!showPreview)}
                            style={styles.previewToggle}
                        >
                            <Text style={styles.previewToggleText}>
                                {showPreview ? '✏️' : '👁️'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showPreview && block.data.uri ? (
                // Preview Mode
                <View style={[styles.previewContainer, { alignItems: getAlignmentStyle(block.data.layout) }]}>
                    <Image
                        source={{ uri: block.data.uri }}
                        style={[styles.previewImage, { width: sizeConfig.width, height: sizeConfig.height }]}
                        resizeMode="cover"
                    />
                    {block.data.caption && (
                        <Text style={styles.previewCaption}>
                            {parseFormattedText(block.data.caption).map((part, i) => (
                                <Text key={i} style={{ color: part.color || colors.textSecondary }}>
                                    {part.text}
                                </Text>
                            ))}
                        </Text>
                    )}
                </View>
            ) : (
                // Edit Mode
                <View style={styles.editContainer}>
                    {/* Image Picker */}
                    <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                        {block.data.uri ? (
                            <View style={styles.imageThumbnailContainer}>
                                <Image
                                    source={{ uri: block.data.uri }}
                                    style={styles.imageThumbnail}
                                    resizeMode="cover"
                                />
                                <Text style={styles.changeImageText}>Tap to change image</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyImageContainer}>
                                <Text style={styles.emptyImageIcon}>📷</Text>
                                <Text style={styles.emptyImageText}>Tap to upload image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Search & Upload Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.imagePickerButton, styles.searchButton]}
                            onPress={() => {
                                if (onOpenImageSearch) {
                                    onOpenImageSearch(block.id);
                                }
                            }}
                        >
                            <Text style={styles.searchButtonIcon}>🔍</Text>
                            <Text style={styles.searchButtonText}>Search Photos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.imagePickerButton, styles.libraryButton]}
                            onPress={() => setShowLibraryModal(true)}
                        >
                            <Text style={styles.searchButtonIcon}>📚</Text>
                            <Text style={styles.searchButtonText}>My Library</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Layout Selector */}
                    <View style={styles.controlGroup}>
                        <Text style={styles.label}>Layout</Text>
                        <View style={styles.layoutSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.layoutButton,
                                    block.data.layout === 'center' && styles.layoutButtonActive
                                ]}
                                onPress={() => updateField('layout', 'center')}
                            >
                                <Text style={styles.layoutButtonText}>⬛ Full</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.layoutButton,
                                    block.data.layout === 'floatLeft' && styles.layoutButtonActive
                                ]}
                                onPress={() => updateField('layout', 'floatLeft')}
                            >
                                <Text style={styles.layoutButtonText}>📐 Left</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.layoutButton,
                                    block.data.layout === 'floatRight' && styles.layoutButtonActive
                                ]}
                                onPress={() => updateField('layout', 'floatRight')}
                            >
                                <Text style={styles.layoutButtonText}>📐 Right</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>📐 = Content wraps beside image</Text>
                    </View>

                    {/* Size Selector */}
                    <View style={styles.controlGroup}>
                        <Text style={styles.label}>Size</Text>
                        <View style={styles.sizeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.sizeButton,
                                    block.data.size === 'small' && styles.sizeButtonActive
                                ]}
                                onPress={() => updateField('size', 'small')}
                            >
                                <Text style={styles.sizeButtonText}>Small</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sizeButton,
                                    block.data.size === 'medium' && styles.sizeButtonActive
                                ]}
                                onPress={() => updateField('size', 'medium')}
                            >
                                <Text style={styles.sizeButtonText}>Medium</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sizeButton,
                                    block.data.size === 'large' && styles.sizeButtonActive
                                ]}
                                onPress={() => updateField('size', 'large')}
                            >
                                <Text style={styles.sizeButtonText}>Large</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Caption Input */}
                    <View style={styles.controlGroup}>
                        <Text style={styles.label}>Caption (Optional)</Text>
                        <TextInput
                            value={block.data.caption}
                            onChangeText={(text) => updateField('caption', text)}
                            placeholder="e.g., Crime scene photo taken on 10 Jan 2024"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.captionInput}
                            multiline
                        />
                        <Text style={styles.hint}>*gold* ~red~ _blue_</Text>
                    </View>
                </View>
            )}

            {/* Saved Images Modal */}
            <SavedImagesModal
                visible={showLibraryModal}
                onClose={() => setShowLibraryModal(false)}
                onSelectImage={handleSelectFromLibrary}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    headerLabel: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    previewToggleText: {
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    editContainer: {
        gap: 16,
    },
    imagePickerButton: {
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imageThumbnailContainer: {
        position: 'relative',
    },
    imageThumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    changeImageText: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
        paddingVertical: 12,
    },
    emptyImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyImageIcon: {
        fontSize: 48,
        marginBottom: 12,
        opacity: 0.5,
    },
    emptyImageText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
    controlGroup: {
        gap: 8,
    },
    label: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        opacity: 0.95,
        letterSpacing: 0.2,
    },
    layoutSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    layoutButton: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        alignItems: 'center',
    },
    layoutButtonActive: {
        backgroundColor: colors.card,
        borderColor: colors.gold,
        borderWidth: 2,
    },
    layoutButtonText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    sizeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    sizeButton: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        alignItems: 'center',
    },
    sizeButtonActive: {
        backgroundColor: colors.card,
        borderColor: colors.gold,
        borderWidth: 2,
    },
    sizeButtonText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    captionInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    previewContainer: {
        gap: 12,
    },
    previewImage: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    previewCaption: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 12,
    },
    searchButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    libraryButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonIcon: {
        fontSize: 16,
    },
    searchButtonText: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
});
