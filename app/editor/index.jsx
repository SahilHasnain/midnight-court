import { colors } from "@/theme/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import GoldButton from "@/components/GoldButton";



export default function EditorScreen() {
    const { template } = useLocalSearchParams();

    // Multi-slide state
    const [slides, setSlides] = useState([
        { title: "", subtitle: "", points: [""], image: null }
    ]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const currentSlide = slides[currentSlideIndex];

    useEffect(() => {
        if (template === "case") {
            updateSlide("title", "Case Summary");
            updateSlide("subtitle", "Facts & Issues");
        } else if (template === "judgement") {
            updateSlide("title", "Judgement");
            updateSlide("subtitle", "Holding & Reasoning");
        } else if (template === "arguments") {
            updateSlide("title", "Arguments vs Counter");
            updateSlide("subtitle", "Key Points");
        } else if (template === "precedent") {
            updateSlide("title", "Legal Precedents");
            updateSlide("subtitle", "Important Cases");
        } else if (template === "verdict") {
            updateSlide("title", "Verdict & Conclusion");
            updateSlide("subtitle", "Final Stand");
        } else {
            updateSlide("title", "Title Slide");
            updateSlide("subtitle", "Topic");
        }
    }, [template])

    // Auto-save slides to AsyncStorage
    useEffect(() => {
        const savePresentation = async () => {
            try {
                const presentationData = {
                    slides,
                    template,
                    lastModified: new Date().toISOString(),
                };
                await AsyncStorage.setItem('current_presentation', JSON.stringify(presentationData));
            } catch (error) {
                console.error('Failed to save presentation:', error);
            }
        };

        // Debounce save to avoid too many writes
        const timeoutId = setTimeout(savePresentation, 1000);
        return () => clearTimeout(timeoutId);
    }, [slides, template]);

    // Load saved presentation on mount
    useEffect(() => {
        const loadPresentation = async () => {
            try {
                const saved = await AsyncStorage.getItem('current_presentation');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.template === template && data.slides) {
                        setSlides(data.slides);
                    }
                }
            } catch (error) {
                console.error('Failed to load presentation:', error);
            }
        };

        loadPresentation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateSlide = (field, value) => {
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            [field]: value
        };
        setSlides(newSlides);
    }

    const updatePoint = (i, text) => {
        const newPoints = [...currentSlide.points];
        newPoints[i] = text;
        updateSlide("points", newPoints);
    }

    const addPoint = () => {
        updateSlide("points", [...currentSlide.points, ""]);
    }

    const deletePoint = (index) => {
        if (currentSlide.points.length > 1) {
            const newPoints = currentSlide.points.filter((_, i) => i !== index);
            updateSlide("points", newPoints);
        }
    }

    const addSlide = () => {
        setSlides([...slides, { title: "", subtitle: "", points: [""], image: null }]);
        setCurrentSlideIndex(slides.length);
    }

    const nextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    }

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    }

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Please allow access to your photos to add images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateSlide("image", result.assets[0].uri);
        }
    }

    const removeImage = () => {
        updateSlide("image", null);
    }

    const goToExport = () => {
        router.push({
            pathname: "/export",
            params: {
                slides: JSON.stringify(slides.map(s => ({
                    title: s.title,
                    subtitle: s.subtitle,
                    points: s.points.filter(p => p.trim().length > 0),
                    image: s.image
                })))
            }
        })
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.templateName}>{getTemplateName(template)}</Text>
                    <Text style={styles.slideCounter}>Slide {currentSlideIndex + 1} of {slides.length}</Text>
                </View>
            </View>

            {/* Slide Navigation */}
            <View style={styles.slideNav}>
                <TouchableOpacity
                    onPress={prevSlide}
                    style={[styles.navButton, currentSlideIndex === 0 && styles.navButtonDisabled]}
                    disabled={currentSlideIndex === 0}
                >
                    <Text style={[styles.navText, currentSlideIndex === 0 && styles.navTextDisabled]}>‹ Prev</Text>
                </TouchableOpacity>

                <View style={styles.slideIndicator}>
                    {slides.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => setCurrentSlideIndex(i)}>
                            <View style={[styles.dot, i === currentSlideIndex && styles.dotActive]} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={nextSlide}
                    style={[styles.navButton, currentSlideIndex === slides.length - 1 && styles.navButtonDisabled]}
                    disabled={currentSlideIndex === slides.length - 1}
                >
                    <Text style={[styles.navText, currentSlideIndex === slides.length - 1 && styles.navTextDisabled]}>Next ›</Text>
                </TouchableOpacity>
            </View>

            {/* Main Editor */}
            <View style={styles.editorContent}>
                <Text style={styles.label}>Heading</Text>
                <TextInput
                    value={currentSlide.title}
                    onChangeText={(text) => updateSlide("title", text)}
                    placeholder="Enter your heading"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                />

                <Text style={styles.label}>Subtitle</Text>
                <TextInput
                    value={currentSlide.subtitle}
                    onChangeText={(text) => updateSlide("subtitle", text)}
                    placeholder="Enter subtitle"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                />

                {/* Image Section */}
                <Text style={styles.label}>Image (Optional)</Text>
                {currentSlide.image ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: currentSlide.image }} style={styles.imagePreview} />
                        <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
                            <Text style={styles.removeImageText}>✕ Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderIcon}>📸</Text>
                        <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.label}>Key Points</Text>
                {currentSlide.points.map((p, i) => (
                    <View key={i} style={styles.pointRow}>
                        <TextInput
                            value={p}
                            onChangeText={(t) => updatePoint(i, t)}
                            placeholder={`Point ${i + 1}`}
                            placeholderTextColor={colors.textSecondary}
                            style={styles.pointInput}
                            multiline
                        />
                        {currentSlide.points.length > 1 && (
                            <TouchableOpacity
                                onPress={() => deletePoint(i)}
                                style={styles.deletePointButton}
                            >
                                <Text style={styles.deletePointText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <GoldButton
                    title="+ Add Point"
                    onPress={addPoint}
                    style={styles.addButton}
                />

                <GoldButton
                    title="+ Add New Slide"
                    onPress={addSlide}
                    style={styles.addButton}
                />

                <GoldButton
                    title="Continue to Export"
                    onPress={goToExport}
                />
            </View>
        </ScrollView>
    )
}

const getTemplateName = (template) => {
    const names = {
        title: "Title Slide",
        case: "Case Summary",
        judgement: "Judgement",
        arguments: "Arguments vs Counter",
        precedent: "Legal Precedent",
        verdict: "Verdict & Conclusion"
    };
    return names[template] || "Title Slide";
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
        marginLeft: -50, // Center compensation for back button
    },
    templateName: {
        color: colors.ivory,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "PlayfairDisplay_700Bold",
    },
    slideCounter: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
        fontFamily: "Inter_400Regular",
    },
    editorContent: {
        padding: 20,
    },
    label: {
        color: colors.gold,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
        fontFamily: "Inter_600SemiBold",
    },
    input: {
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        marginBottom: 12,
        fontSize: 15,
        fontFamily: "Inter_400Regular",
    },
    addButton: {
        marginBottom: 12,
        marginTop: 8,
    },
    slideNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGold,
    },
    navButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navText: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    navTextDisabled: {
        color: colors.textSecondary,
    },
    slideIndicator: {
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textSecondary,
        opacity: 0.3,
    },
    dotActive: {
        backgroundColor: colors.gold,
        opacity: 1,
        width: 24,
    },
    imageContainer: {
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        overflow: "hidden",
    },
    imagePreview: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    removeImageButton: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(11, 17, 32, 0.85)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    removeImageText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "600",
    },
    imagePlaceholder: {
        backgroundColor: colors.card,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: colors.borderGold,
        borderRadius: 12,
        padding: 40,
        alignItems: "center",
        marginBottom: 16,
    },
    imagePlaceholderIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    pointInput: {
        flex: 1,
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        color: colors.textPrimary,
        fontSize: 15,
        minHeight: 50,
        fontFamily: "Inter_400Regular",
    },
    deletePointButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: "#ef4444",
        borderRadius: 12,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    deletePointText: {
        color: "#ef4444",
        fontSize: 18,
        fontWeight: "600",
    }
})