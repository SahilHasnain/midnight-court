import GoldButton from "@/components/GoldButton";
import { colors } from "@/theme/colors";
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { renderBlockToHTML } from "@/utils/blockRenderer";

export default function ExportScreen() {
    const { slides: slidesParam } = useLocalSearchParams();
    const slides = slidesParam ? JSON.parse(slidesParam) : [];
    const [isGenerating, setIsGenerating] = useState(false);

    const convertImageToBase64 = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image:', error);
            return null;
        }
    };

    const generateHTML = async () => {
        // Convert all images to base64
        const slidesWithBase64 = await Promise.all(
            slides.map(async (slide) => {
                if (slide.image) {
                    const base64Image = await convertImageToBase64(slide.image);
                    return { ...slide, image: base64Image };
                }
                return slide;
            })
        );

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Georgia', serif;
        }
        
        .slide {
            width: 100%;
            height: 100vh;
            background: linear-gradient(135deg, #0B1120 0%, #1a2332 100%);
            padding: 60px 80px;
            box-sizing: border-box;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .slide:last-child {
            page-break-after: auto;
        }
        
        .slide-number {
            position: absolute;
            top: 30px;
            right: 60px;
            color: #CBA44A;
            font-size: 14px;
            opacity: 0.7;
        }
        
        .gold-line {
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #CBA44A 0%, #E5C76B 100%);
            margin: 20px 0 30px 0;
            border-radius: 2px;
        }
        
        .slide-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 2px solid #CBA44A;
        }
        
        h1 {
            color: #CBA44A;
            font-size: 48px;
            font-weight: 700;
            margin: 0 0 15px 0;
            letter-spacing: 0.5px;
            line-height: 1.2;
        }
        
        h2 {
            color: #F5EEDF;
            font-size: 28px;
            font-weight: 400;
            margin: 0 0 40px 0;
            opacity: 0.9;
        }
        
        .points {
            margin-top: 20px;
        }
        
        .point {
            color: #D1D5DB;
            font-size: 20px;
            line-height: 1.8;
            margin: 12px 0;
            padding-left: 30px;
            position: relative;
        }
        
        .point:before {
            content: "⚖";
            position: absolute;
            left: 0;
            color: #CBA44A;
            font-size: 18px;
        }
        
        .footer {
            position: absolute;
            bottom: 30px;
            left: 80px;
            right: 80px;
            border-top: 1px solid rgba(203, 164, 74, 0.3);
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-text {
            color: #CBA44A;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        
        .watermark {
            color: rgba(203, 164, 74, 0.15);
            font-size: 120px;
            position: absolute;
            bottom: -20px;
            right: -20px;
            transform: rotate(-15deg);
            z-index: 0;
            pointer-events: none;
        }
    </style>
</head>
<body>
    ${slidesWithBase64.map((slide, index) => `
        <div class="slide">
            <div class="watermark">⚖️</div>
            <div class="slide-number">Slide ${index + 1} of ${slidesWithBase64.length}</div>
            
            ${slide.image ? `<img src="${slide.image}" class="slide-image" alt="Slide image" />` : ''}
            
            <h1>${slide.title || 'Untitled Slide'}</h1>
            <div class="gold-line"></div>
            <h2>${slide.subtitle || ''}</h2>
            
            ${slide.blocks && slide.blocks.length > 0 ? slide.blocks.map(block => renderBlockToHTML(block)).join('') : ''}
            
            <div class="footer">
                <div class="footer-text">MIDNIGHT COURT</div>
                <div class="footer-text">${new Date().toLocaleDateString()}</div>
            </div>
        </div>
    `).join('')}
</body>
</html>
        `;
    };

    const handleExportPDF = async () => {
        try {
            setIsGenerating(true);

            const html = await generateHTML();

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Save or Share your Presentation',
                UTI: 'com.adobe.pdf'
            });

            Alert.alert(
                "Success! 🎉",
                "Your presentation has been generated successfully!",
                [
                    { text: "Create Another", onPress: () => router.push("/templates") },
                    { text: "Done", style: "cancel" }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to generate PDF. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (slides.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No slides found</Text>
                <GoldButton title="Go Back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Preview & Export</Text>
                    <Text style={styles.headerSubtitle}>{slides.length} Slide{slides.length > 1 ? 's' : ''}</Text>
                </View>
            </View>

            {/* Preview Section */}
            <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Presentation Preview</Text>

                {slides.map((slide, index) => (
                    <View key={index} style={styles.previewCard}>
                        <View style={styles.slideHeader}>
                            <Text style={styles.slideNumber}>Slide {index + 1}</Text>
                        </View>

                        {slide.image && (
                            <Image source={{ uri: slide.image }} style={styles.previewImage} />
                        )}

                        <Text style={styles.previewTitle}>{slide.title || 'Untitled Slide'}</Text>
                        {slide.subtitle && (
                            <Text style={styles.previewSubtitle}>{slide.subtitle}</Text>
                        )}

                        {slide.blocks && slide.blocks.length > 0 && (
                            <View style={styles.pointsContainer}>
                                {slide.blocks.map((block) => {
                                    // For now, only render text blocks in preview
                                    // Will add more block types in future chunks
                                    if (block.type === 'text' && block.data.points) {
                                        return block.data.points
                                            .filter(p => p && p.trim().length > 0)
                                            .map((point, i) => (
                                                <Text key={`${block.id}_${i}`} style={styles.previewPoint}>⚖ {point}</Text>
                                            ));
                                    }
                                    return null;
                                })}
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Export Button */}
            <View style={styles.exportSection}>
                <GoldButton
                    title={isGenerating ? "Generating PDF..." : "Export as PDF"}
                    onPress={handleExportPDF}
                    style={styles.exportButton}
                />
                <Text style={styles.exportHint}>
                    Your presentation will be saved as a professional PDF
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: colors.textSecondary,
        fontSize: 18,
        marginBottom: 20,
        fontFamily: "Inter_400Regular",
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
        marginLeft: -50,
    },
    headerTitle: {
        color: colors.ivory,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "PlayfairDisplay_700Bold",
    },
    headerSubtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
        fontFamily: "Inter_400Regular",
    },
    previewSection: {
        padding: 20,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        fontFamily: "PlayfairDisplay_700Bold",
    },
    previewCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderGold,
    },
    slideHeader: {
        marginBottom: 12,
    },
    slideNumber: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    previewImage: {
        width: "100%",
        height: 150,
        borderRadius: 12,
        marginBottom: 16,
        resizeMode: "cover",
    },
    previewTitle: {
        color: colors.ivory,
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 8,
        fontFamily: "PlayfairDisplay_700Bold",
    },
    previewSubtitle: {
        color: colors.textSecondary,
        fontSize: 16,
        marginBottom: 12,
        fontFamily: "Inter_400Regular",
    },
    pointsContainer: {
        marginTop: 8,
    },
    previewPoint: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 6,
        lineHeight: 22,
        fontFamily: "Inter_400Regular",
    },
    exportSection: {
        padding: 20,
        paddingBottom: 40,
    },
    exportButton: {
        paddingVertical: 16,
    },
    exportHint: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: "center",
        marginTop: 12,
        fontFamily: "Inter_400Regular",
    }
});
