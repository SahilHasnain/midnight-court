import { BLOCK_TYPES } from "@/components/blocks/blockTypes";
import GoldButton from "@/components/GoldButton";
import Toast from "@/components/Toast";
import { colors } from "@/theme/colors";
import { renderBlockToHTML } from "@/utils/blockRenderer";
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useState } from "react";
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH * 0.9;
const SLIDE_HEIGHT = SCREEN_HEIGHT * 0.65;

// Markdown formatter
const formatText = (text) => {
    if (!text) return [];
    const parts = [];
    let currentIndex = 0;
    const regex = /([*~_])(.*?)\1/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            parts.push({ text: text.slice(currentIndex, match.index), style: 'normal' });
        }
        const style = match[1] === '*' ? 'gold' : match[1] === '~' ? 'red' : 'blue';
        parts.push({ text: match[2], style });
        currentIndex = match.index + match[0].length;
    }

    if (currentIndex < text.length) {
        parts.push({ text: text.slice(currentIndex), style: 'normal' });
    }

    return parts.length ? parts : [{ text, style: 'normal' }];
};

export default function ExportScreen() {
    const { slides: slidesParam } = useLocalSearchParams();
    const slides = slidesParam ? JSON.parse(slidesParam) : [];
    const [isGenerating, setIsGenerating] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    // Helper to group floatLeft/floatRight images with following content
    const renderBlocksWithGrouping = (blocks) => {
        let html = '';
        let i = 0;

        while (i < blocks.length) {
            const block = blocks[i];

            // Check if this is a side-by-side image block
            if (block.type === BLOCK_TYPES.IMAGE &&
                (block.data.layout === 'floatLeft' || block.data.layout === 'floatRight')) {

                // Get the image HTML
                const imageHTML = renderBlockToHTML(block);

                // Get next content block if available
                const nextBlock = blocks[i + 1];
                let contentHTML = '';

                if (nextBlock && nextBlock.type !== BLOCK_TYPES.IMAGE) {
                    contentHTML = renderBlockToHTML(nextBlock);
                    i++; // Skip next block as we've already rendered it
                }

                // Determine flex-direction based on layout
                const isLeftLayout = block.data.layout === 'floatLeft';
                const imageWidth = block.data.size === 'small' ? '45%' :
                    block.data.size === 'medium' ? '50%' : '55%';

                // Render side-by-side container
                html += `
                    <div style="display: flex; gap: 20px; margin: 20px 0; align-items: flex-start; ${isLeftLayout ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}">
                        <div style="flex: 0 0 ${imageWidth};">
                            ${imageHTML.replace('style="display: none;"', 'style=""')}
                        </div>
                        <div style="flex: 0 1 auto; min-width: 0; padding-left: 0; margin-left: 0;">
                            ${contentHTML || '<div style="color: #9CA3AF; font-style: italic; font-size: 14px;">Add content block after image for side-by-side layout</div>'}
                        </div>
                    </div>
                `;
            } else {
                // Regular block rendering
                html += renderBlockToHTML(block);
            }

            i++;
        }

        return html;
    };

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
        // Convert all images to base64 (including ImageBlocks inside blocks array)
        const slidesWithBase64 = await Promise.all(
            slides.map(async (slide) => {
                // Convert blocks array images to base64
                const blocksWithBase64 = await Promise.all(
                    (slide.blocks || []).map(async (block) => {
                        if (block.type === 'image' && block.data.uri) {
                            const base64Image = await convertImageToBase64(block.data.uri);
                            return {
                                ...block,
                                data: { ...block.data, uri: base64Image }
                            };
                        }
                        return block;
                    })
                );

                return { ...slide, blocks: blocksWithBase64 };
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
            padding-left: 28px;
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
    ${slidesWithBase64.map((slide, index) => {
        const parseMarkdownToHTML = (text) => {
            if (!text) return '';
            text = text.replace(/\*([^*]+)\*/g, '<span style="color:#CBA44A;font-weight:600;">$1</span>');
            text = text.replace(/~([^~]+)~/g, '<span style="color:#ef4444;font-weight:600;">$1</span>');
            text = text.replace(/_([^_]+)_/g, '<span style="color:#3b82f6;font-weight:600;">$1</span>');
            return text;
        };
        
        return `
        <div class="slide">
            <div class="watermark">⚖️</div>
            <div class="slide-number">Slide ${index + 1} of ${slidesWithBase64.length}</div>
            
            ${slide.image ? `<img src="${slide.image}" class="slide-image" alt="Slide image" />` : ''}
            
            <h1>${slide.title || 'Untitled Slide'}</h1>
            <div class="gold-line"></div>
            <h2>${parseMarkdownToHTML(slide.subtitle || '')}</h2>
            
            ${slide.blocks && slide.blocks.length > 0 ? renderBlocksWithGrouping(slide.blocks) : ''}
        </div>
    `}).join('')}
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

            showToastMessage("🎉 PDF generated successfully!");
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
        <>
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
                <ScrollView 
                    horizontal 
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.slideScroll}
                    contentContainerStyle={styles.slideScrollContent}
                >
                    {slides.map((slide, index) => (
                        <View key={index} style={styles.slideContainer}>
                            <ScrollView style={styles.pdfSlide} showsVerticalScrollIndicator={false}>
                                <Text style={styles.watermark}>⚖️</Text>
                                <Text style={styles.slideNumber}>Slide {index + 1} of {slides.length}</Text>
                                
                                {slide.image && (
                                    <Image source={{ uri: slide.image }} style={styles.slideImage} />
                                )}

                                <Text style={styles.slideTitle}>{slide.title || 'Untitled Slide'}</Text>
                                <View style={styles.goldLine} />
                                {slide.subtitle && (
                                    <Text style={styles.slideSubtitle}>
                                        {formatText(slide.subtitle).map((part, j) => (
                                            <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                {part.text}
                                            </Text>
                                        ))}
                                    </Text>
                                )}

                                {slide.blocks?.map((block) => {
                                    if (block.type === BLOCK_TYPES.TEXT && block.data.points) {
                                        return block.data.points.filter(p => p?.trim()).map((point, i) => (
                                            <View key={`${block.id}_${i}`} style={styles.pointRow}>
                                                <Text style={styles.bullet}>⚖</Text>
                                                <Text style={styles.slidePoint}>
                                                    {formatText(point).map((part, j) => (
                                                        <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                            {part.text}
                                                        </Text>
                                                    ))}
                                                </Text>
                                            </View>
                                        ));
                                    }
                                    if (block.type === BLOCK_TYPES.PARAGRAPH) {
                                        return (
                                            <Text key={block.id} style={styles.paragraph}>
                                                {formatText(block.data.text).map((part, j) => (
                                                    <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                        {part.text}
                                                    </Text>
                                                ))}
                                            </Text>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.QUOTE) {
                                        return (
                                            <View key={block.id} style={styles.quoteBox}>
                                                <Text style={styles.quoteText}>"{block.data.quote}"</Text>
                                                {block.data.citation && <Text style={styles.citation}>— {block.data.citation}</Text>}
                                            </View>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.CALLOUT) {
                                        const variant = block.data.variant || 'info';
                                        const config = variant === 'critical' ? { icon: '🚨', color: '#ef4444' } : variant === 'warning' ? { icon: '⚠️', color: colors.gold } : { icon: 'ℹ️', color: '#3b82f6' };
                                        return (
                                            <View key={block.id} style={[styles.calloutBox, { borderLeftColor: config.color }]}>
                                                <Text style={styles.calloutIcon}>{config.icon}</Text>
                                                <View style={styles.calloutContent}>
                                                    <Text style={styles.calloutTitle}>{block.data.title}</Text>
                                                    <Text style={styles.calloutDesc}>{block.data.description}</Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.TWO_COLUMN) {
                                        return (
                                            <View key={block.id} style={styles.twoColumnBox}>
                                                <View style={styles.columnLeft}>
                                                    <Text style={styles.columnTitle}>{block.data.leftTitle || 'Arguments'}</Text>
                                                    {block.data.leftPoints?.filter(p => p?.trim()).map((point, i) => (
                                                        <Text key={i} style={styles.columnPoint}>
                                                            • {formatText(point).map((part, j) => (
                                                                <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                                    {part.text}
                                                                </Text>
                                                            ))}
                                                        </Text>
                                                    ))}
                                                </View>
                                                <View style={styles.columnRight}>
                                                    <Text style={[styles.columnTitle, { color: '#ef4444' }]}>{block.data.rightTitle || 'Counter'}</Text>
                                                    {block.data.rightPoints?.filter(p => p?.trim()).map((point, i) => (
                                                        <Text key={i} style={styles.columnPoint}>
                                                            • {formatText(point).map((part, j) => (
                                                                <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                                    {part.text}
                                                                </Text>
                                                            ))}
                                                        </Text>
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.TIMELINE) {
                                        return (
                                            <View key={block.id} style={styles.timelineBox}>
                                                {block.data.events?.filter(e => e.date || e.event).map((event, i) => (
                                                    <View key={i} style={styles.timelineItem}>
                                                        <View style={styles.timelineDot} />
                                                        <View style={styles.timelineContent}>
                                                            <Text style={styles.timelineDate}>{event.date}</Text>
                                                            <Text style={styles.timelineEvent}>
                                                                {formatText(event.event).map((part, j) => (
                                                                    <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                                        {part.text}
                                                                    </Text>
                                                                ))}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.EVIDENCE) {
                                        return (
                                            <View key={block.id} style={styles.evidenceBox}>
                                                <Text style={styles.evidenceTitle}>{block.data.evidenceName || 'Evidence'}</Text>
                                                <Text style={styles.evidenceText}>
                                                    {formatText(block.data.summary || '').map((part, j) => (
                                                        <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                            {part.text}
                                                        </Text>
                                                    ))}
                                                </Text>
                                                {block.data.citation && <Text style={styles.evidenceCitation}>Source: {block.data.citation}</Text>}
                                            </View>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.SECTION_HEADER) {
                                        return (
                                            <Text key={block.id} style={styles.sectionHeader}>
                                                {formatText(block.data.title || '').map((part, j) => (
                                                    <Text key={j} style={part.style === 'gold' ? styles.goldText : part.style === 'red' ? styles.redText : part.style === 'blue' ? styles.blueText : {}}>
                                                        {part.text}
                                                    </Text>
                                                ))}
                                            </Text>
                                        );
                                    }
                                    if (block.type === BLOCK_TYPES.DIVIDER) {
                                        return <View key={block.id} style={styles.divider} />;
                                    }
                                    return null;
                                })}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>
                <Text style={styles.swipeHint}>← Swipe to view slides →</Text>
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
        <Toast message={toastMessage} visible={showToast} duration={2500} />
        </>
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
        paddingVertical: 20,
    },
    sectionTitle: {
        color: colors.gold,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 15,
        paddingHorizontal: 20,
        fontFamily: "PlayfairDisplay_700Bold",
    },
    slideScroll: {
        flexGrow: 0,
    },
    slideScrollContent: {
        paddingHorizontal: (SCREEN_WIDTH - SLIDE_WIDTH) / 2,
        gap: 20,
    },
    slideContainer: {
        width: SLIDE_WIDTH,
        marginRight: 20,
    },
    pdfSlide: {
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        backgroundColor: '#0B1120',
        borderRadius: 8,
        padding: 25,
        borderWidth: 2,
        borderColor: colors.gold,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    watermark: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        fontSize: 80,
        opacity: 0.05,
    },
    slideNumber: {
        position: 'absolute',
        top: 15,
        right: 20,
        color: colors.gold,
        fontSize: 10,
        opacity: 0.7,
        fontFamily: "Inter_600SemiBold",
    },
    slideImage: {
        width: '100%',
        height: SLIDE_HEIGHT * 0.3,
        borderRadius: 6,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: colors.gold,
    },
    slideTitle: {
        color: colors.gold,
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "PlayfairDisplay_700Bold",
        marginBottom: 6,
    },
    goldLine: {
        width: 50,
        height: 2.5,
        backgroundColor: colors.gold,
        marginBottom: 8,
    },
    slideSubtitle: {
        color: '#F5EEDF',
        fontSize: 13,
        fontFamily: "Inter_400Regular",
        marginBottom: 10,
        opacity: 0.9,
    },
    pointRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    bullet: {
        color: colors.gold,
        fontSize: 11,
        marginRight: 8,
        marginTop: 2,
    },
    slidePoint: {
        color: '#D1D5DB',
        fontSize: 11,
        lineHeight: 16,
        fontFamily: "Inter_400Regular",
        flex: 1,
    },
    goldText: {
        color: colors.gold,
        fontWeight: '600',
    },
    redText: {
        color: '#EF4444',
        fontWeight: '600',
    },
    blueText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    paragraph: {
        color: '#D1D5DB',
        fontSize: 11,
        lineHeight: 16,
        marginBottom: 10,
        fontFamily: "Inter_400Regular",
    },
    quoteBox: {
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        paddingLeft: 12,
        marginVertical: 10,
        backgroundColor: 'rgba(203, 164, 74, 0.05)',
        padding: 10,
        borderRadius: 4,
    },
    quoteText: {
        color: '#F5EEDF',
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: "Inter_400Regular",
        marginBottom: 4,
    },
    citation: {
        color: colors.gold,
        fontSize: 10,
        fontFamily: "Inter_600SemiBold",
    },
    sectionHeader: {
        color: colors.gold,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: "PlayfairDisplay_700Bold",
        marginVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gold,
        opacity: 0.3,
        marginVertical: 10,
    },
    calloutBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(203, 164, 74, 0.05)',
        borderLeftWidth: 3,
        borderRadius: 4,
        padding: 10,
        marginVertical: 8,
    },
    calloutIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    calloutContent: {
        flex: 1,
    },
    calloutTitle: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 3,
        fontFamily: "Inter_700Bold",
    },
    calloutDesc: {
        color: '#D1D5DB',
        fontSize: 10,
        lineHeight: 14,
        fontFamily: "Inter_400Regular",
    },
    twoColumnBox: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 8,
    },
    columnLeft: {
        flex: 1,
        borderLeftWidth: 2,
        borderLeftColor: colors.gold,
        paddingLeft: 8,
    },
    columnRight: {
        flex: 1,
        borderLeftWidth: 2,
        borderLeftColor: '#ef4444',
        paddingLeft: 8,
    },
    columnTitle: {
        color: colors.gold,
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 5,
        fontFamily: "Inter_700Bold",
    },
    columnPoint: {
        color: '#D1D5DB',
        fontSize: 9,
        lineHeight: 13,
        marginBottom: 3,
        fontFamily: "Inter_400Regular",
    },
    timelineBox: {
        marginVertical: 8,
        paddingLeft: 5,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gold,
        marginTop: 3,
        marginRight: 8,
    },
    timelineContent: {
        flex: 1,
    },
    timelineDate: {
        color: colors.gold,
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 2,
        fontFamily: "Inter_700Bold",
    },
    timelineEvent: {
        color: '#D1D5DB',
        fontSize: 10,
        lineHeight: 14,
        fontFamily: "Inter_400Regular",
    },
    evidenceBox: {
        backgroundColor: 'rgba(26, 26, 26, 0.5)',
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        borderRadius: 6,
        padding: 10,
        marginVertical: 8,
    },
    evidenceTitle: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
        fontFamily: "Inter_700Bold",
    },
    evidenceText: {
        color: '#D1D5DB',
        fontSize: 10,
        lineHeight: 14,
        marginBottom: 5,
        fontFamily: "Inter_400Regular",
    },
    evidenceCitation: {
        color: colors.gold,
        fontSize: 9,
        fontStyle: 'italic',
        fontFamily: "Inter_400Regular",
    },
    swipeHint: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15,
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
