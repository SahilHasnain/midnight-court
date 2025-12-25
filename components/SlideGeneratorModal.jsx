/**
 * SlideGeneratorModal - AI-powered slide generation from case descriptions
 * Converts text descriptions into structured presentation slides
 */

import ImageSearchModal from "@/components/ImageSearchModal";
import { colors } from "@/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { inputProcessor } from "../utils/inputProcessor";
import { markdownFormatter } from "../utils/markdownFormatter";
import { pinAuth } from "../utils/pinAuth";
import { generateSlides } from "../utils/slideGenerationAPI";
import { templateEngine } from "../utils/templateEngine";
import PinModal from "./PinModal";

export default function SlideGeneratorModal({ visible, onClose, onUseSlides }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputAnalysis, setInputAnalysis] = useState(null);
  const [desiredSlideCount, setDesiredSlideCount] = useState(5);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [suggestedTemplate, setSuggestedTemplate] = useState(null);
  const [expandedSlides, setExpandedSlides] = useState({});

  // Image placement guidance state
  const [imageSearchModalVisible, setImageSearchModalVisible] = useState(false);
  const [prefilledImageKeyword, setPrefilledImageKeyword] = useState(null);
  const [targetSlideForImage, setTargetSlideForImage] = useState(null);

  // Refinement state
  const [refinementMode, setRefinementMode] = useState(false);
  const [refinementInput, setRefinementInput] = useState("");
  const [refinementLoading, setRefinementLoading] = useState(false);
  const [preservedSlides, setPreservedSlides] = useState([]);
  const [refinementChanges, setRefinementChanges] = useState([]);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      checkPinStatus();
      loadSavedSlideCountPreference();
      loadAvailableTemplates();
    }
  }, [visible]);

  const loadAvailableTemplates = () => {
    const templates = templateEngine.getTemplates();
    setAvailableTemplates(templates);
  };

  // Debounced input analysis
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for analysis (500ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      if (input.trim().length > 0) {
        const analysis = inputProcessor.analyzeInput(input);
        setInputAnalysis(analysis);

        // Suggest template based on analysis
        const suggested = templateEngine.suggestTemplate(analysis);
        setSuggestedTemplate(suggested);
      } else {
        setInputAnalysis(null);
        setSuggestedTemplate(null);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [input]);

  const checkPinStatus = async () => {
    const unlocked = await pinAuth.isUnlocked();
    if (!unlocked) {
      setShowPinModal(true);
    } else {
      setIsUnlocked(true);
    }
  };

  const loadSavedSlideCountPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("preferredSlideCount");
      if (saved) {
        const count = parseInt(saved, 10);
        if (count >= 3 && count <= 8) {
          setDesiredSlideCount(count);
        }
      }
    } catch (error) {
      console.error("Failed to load slide count preference:", error);
    }
  };

  const saveSlideCountPreference = async (count) => {
    try {
      await AsyncStorage.setItem("preferredSlideCount", count.toString());
    } catch (error) {
      console.error("Failed to save slide count preference:", error);
    }
  };

  const handleSlideCountChange = (count) => {
    setDesiredSlideCount(count);
    saveSlideCountPreference(count);
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      Alert.alert("Error", "Please enter a case description");
      return;
    }

    if (input.trim().length < 100) {
      Alert.alert(
        "Input Too Short",
        "Please provide at least 100 characters for quality results.\n\nMore details help the AI generate better, more accurate slides with proper legal structure."
      );
      return;
    }

    setLoading(true);
    try {
      console.log("🎨 Generating slides from modal...");
      console.log(`📊 Requested slide count: ${desiredSlideCount}`);
      if (selectedTemplate) {
        console.log(`📋 Selected template: ${selectedTemplate}`);
      }

      const result = await generateSlides(input.trim(), {
        desiredSlideCount: desiredSlideCount,
        template: selectedTemplate,
      });

      console.log("✅ Slides generated:", result);

      // Validate slide count matches request
      if (result.slides && result.slides.length !== desiredSlideCount) {
        console.warn(
          `⚠️ Slide count mismatch: requested ${desiredSlideCount}, got ${result.slides.length}`
        );
      }

      setGeneratedSlides(result);
      setFromCache(result.fromCache || false);

      // Show success message
      const cacheMsg = result.fromCache ? " (from cache)" : "";
      Alert.alert(
        "Success! 🎉",
        `Generated ${
          result.slides?.length || 0
        } slides${cacheMsg}\n\nReview and tap "Use These Slides" to replace your current presentation.`
      );
    } catch (error) {
      console.error("❌ Generation error:", error);
      Alert.alert(
        "Generation Failed",
        error.message || "Failed to generate slides. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseSlides = () => {
    if (!generatedSlides || !generatedSlides.slides) {
      Alert.alert("Error", "No slides to use");
      return;
    }

    Alert.alert(
      "Replace Slides?",
      `This will replace your current ${
        onUseSlides ? "presentation" : "slides"
      } with ${
        generatedSlides.slides.length
      } new slides. This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Replace",
          style: "destructive",
          onPress: () => {
            onUseSlides(generatedSlides.slides);
            handleClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setInput("");
    setGeneratedSlides(null);
    setFromCache(false);
    setSelectedTemplate(null);
    setSuggestedTemplate(null);
    setExpandedSlides({});
    setRefinementMode(false);
    setRefinementInput("");
    setPreservedSlides([]);
    setRefinementChanges([]);
    onClose();
  };

  const toggleSlideDetails = (slideIndex) => {
    setExpandedSlides((prev) => ({
      ...prev,
      [slideIndex]: !prev[slideIndex],
    }));
  };

  const handleImageSuggestionTap = (keyword, slideIndex) => {
    console.log(
      `🖼️ Image suggestion tapped: "${keyword}" for slide ${slideIndex}`
    );
    setPrefilledImageKeyword(keyword);
    setTargetSlideForImage(slideIndex);
    setImageSearchModalVisible(true);
  };

  const handleImageSelected = (image) => {
    console.log(`🖼️ Image selected for slide ${targetSlideForImage}:`, image);

    // Show placement options
    Alert.alert(
      "Where should this image be placed?",
      `Choose how to add this image to Slide ${targetSlideForImage + 1}`,
      [
        {
          text: "🖼️ Slide Background",
          onPress: () => addImageAsBackground(image, targetSlideForImage),
        },
        {
          text: "📝 Inline with Content",
          onPress: () => addImageInline(image, targetSlideForImage),
        },
        {
          text: "🎨 Separate Image Block",
          onPress: () => addImageBlock(image, targetSlideForImage),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setImageSearchModalVisible(false);
            setPrefilledImageKeyword(null);
            setTargetSlideForImage(null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const addImageAsBackground = (image, slideIndex) => {
    console.log(`🖼️ Adding image as background to slide ${slideIndex}`);

    if (!generatedSlides || !generatedSlides.slides[slideIndex]) {
      Alert.alert("Error", "Slide not found");
      return;
    }

    // Create updated slides with background image
    const updatedSlides = { ...generatedSlides };
    updatedSlides.slides[slideIndex] = {
      ...updatedSlides.slides[slideIndex],
      backgroundImage: {
        uri: image.uri,
        caption: image.caption,
        photographer: image.photographer,
        source: image.source,
      },
    };

    setGeneratedSlides(updatedSlides);
    setImageSearchModalVisible(false);
    setPrefilledImageKeyword(null);
    setTargetSlideForImage(null);

    Alert.alert(
      "Success! 🎉",
      `Image added as background to Slide ${
        slideIndex + 1
      }. You can see it when you use these slides.`
    );
  };

  const addImageInline = (image, slideIndex) => {
    console.log(`🖼️ Adding image inline to slide ${slideIndex}`);

    if (!generatedSlides || !generatedSlides.slides[slideIndex]) {
      Alert.alert("Error", "Slide not found");
      return;
    }

    // Create updated slides with inline image reference
    const updatedSlides = { ...generatedSlides };
    const slide = updatedSlides.slides[slideIndex];

    // Add inline image metadata to the slide
    if (!slide.inlineImages) {
      slide.inlineImages = [];
    }
    slide.inlineImages.push({
      uri: image.uri,
      caption: image.caption,
      photographer: image.photographer,
      source: image.source,
      position: "inline",
    });

    setGeneratedSlides(updatedSlides);
    setImageSearchModalVisible(false);
    setPrefilledImageKeyword(null);
    setTargetSlideForImage(null);

    Alert.alert(
      "Success! 🎉",
      `Image will appear inline with content in Slide ${
        slideIndex + 1
      }. You can see it when you use these slides.`
    );
  };

  const addImageBlock = (image, slideIndex) => {
    console.log(`🖼️ Adding image as separate block to slide ${slideIndex}`);

    if (!generatedSlides || !generatedSlides.slides[slideIndex]) {
      Alert.alert("Error", "Slide not found");
      return;
    }

    // Create updated slides with new image block
    const updatedSlides = { ...generatedSlides };
    const slide = updatedSlides.slides[slideIndex];

    // Add image block to the slide
    if (!slide.blocks) {
      slide.blocks = [];
    }

    slide.blocks.push({
      type: "image",
      data: {
        uri: image.uri,
        caption: image.caption,
        photographer: image.photographer,
        source: image.source,
      },
    });

    setGeneratedSlides(updatedSlides);
    setImageSearchModalVisible(false);
    setPrefilledImageKeyword(null);
    setTargetSlideForImage(null);

    Alert.alert(
      "Success! 🎉",
      `Image added as a separate block to Slide ${
        slideIndex + 1
      }. You can see it when you use these slides.`
    );
  };

  const handleRefineSlides = async () => {
    if (!refinementInput.trim()) {
      Alert.alert("Error", "Please enter refinement instructions");
      return;
    }

    if (!generatedSlides) {
      Alert.alert("Error", "No slides to refine");
      return;
    }

    setRefinementLoading(true);
    try {
      console.log("🔄 Refining slides...");
      console.log(`📝 Instructions: ${refinementInput}`);

      // Use refinement handler to refine slides
      const result = await refinementHandler.refineSlides(
        generatedSlides,
        refinementInput,
        {
          preserveSlides: preservedSlides,
          generateFunction: async (prompt, options) => {
            // Call generateSlides with refinement context
            return await generateSlides(prompt, {
              desiredSlideCount: generatedSlides.slides.length,
              template: selectedTemplate,
              isRefinement: true,
            });
          },
        }
      );

      console.log("✅ Refinement complete:", result);

      // Update slides with refined version
      setGeneratedSlides(result.slides);
      setRefinementChanges(result.changes);

      // Show success message with changes summary
      const changesCount = result.changes.length;
      const modifiedSlides = result.changes
        .filter((c) => c.slideIndex !== undefined)
        .map((c) => c.slideIndex + 1)
        .filter((v, i, a) => a.indexOf(v) === i); // unique

      Alert.alert(
        "Refinement Complete! 🎉",
        `${changesCount} changes made across ${
          modifiedSlides.length
        } slide(s).\n\nModified slides: ${modifiedSlides.join(", ")}`
      );

      // Clear refinement input and exit refinement mode
      setRefinementInput("");
      setRefinementMode(false);
    } catch (error) {
      console.error("❌ Refinement error:", error);
      Alert.alert(
        "Refinement Failed",
        error.message || "Failed to refine slides. Please try again."
      );
    } finally {
      setRefinementLoading(false);
    }
  };

  const toggleSlidePreservation = (slideIndex) => {
    setPreservedSlides((prev) => {
      if (prev.includes(slideIndex)) {
        return prev.filter((idx) => idx !== slideIndex);
      } else {
        return [...prev, slideIndex];
      }
    });
  };

  const handleCancelRefinement = () => {
    setRefinementMode(false);
    setRefinementInput("");
    setPreservedSlides([]);
  };

  const calculateSlideMetadata = (slide) => {
    const blockTypes = {};
    let totalPoints = 0;
    let citationCount = 0;
    let contentLength = 0;

    slide.blocks?.forEach((block) => {
      // Count block types
      blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;

      // Count points
      if (block.type === "text" && block.data?.points) {
        totalPoints += block.data.points.length;
        block.data.points.forEach((point) => {
          contentLength += point.length;
        });
      }

      // Count citations
      if (block.type === "quote" && block.data?.citation) {
        citationCount++;
        contentLength += block.data.quote?.length || 0;
      }

      // Count other content
      if (block.type === "callout" && block.data?.text) {
        contentLength += block.data.text.length;
      }

      if (block.type === "timeline" && block.data?.events) {
        totalPoints += block.data.events.length;
        block.data.events.forEach((event) => {
          contentLength += event.description?.length || 0;
        });
      }

      if (block.type === "evidence" && block.data?.items) {
        totalPoints += block.data.items.length;
        block.data.items.forEach((item) => {
          contentLength += item.description?.length || 0;
        });
      }

      if (block.type === "twoColumn") {
        if (block.data?.left?.points) {
          totalPoints += block.data.left.points.length;
          block.data.left.points.forEach((point) => {
            contentLength += point.length;
          });
        }
        if (block.data?.right?.points) {
          totalPoints += block.data.right.points.length;
          block.data.right.points.forEach((point) => {
            contentLength += point.length;
          });
        }
      }
    });

    return {
      blockTypes,
      totalPoints,
      citationCount,
      contentLength,
      avgContentPerBlock:
        slide.blocks?.length > 0
          ? Math.round(contentLength / slide.blocks.length)
          : 0,
    };
  };

  const renderBlockPreview = (block) => {
    const getBlockIcon = (type) => {
      const icons = {
        text: "📝",
        quote: "⚖️",
        callout: "⚠️",
        timeline: "📅",
        evidence: "📋",
        twoColumn: "⚖️",
      };
      return icons[type] || "📄";
    };

    return (
      <View key={Math.random()} style={styles.blockPreview}>
        <Text style={styles.blockType}>
          {getBlockIcon(block.type)} {block.type}
        </Text>
        {block.type === "text" && block.data?.points && (
          <View style={styles.blockContent}>
            {block.data.points.slice(0, 2).map((point, i) => (
              <View key={i} style={styles.blockTextContainer}>
                <Text style={styles.blockBullet}>• </Text>
                {markdownFormatter.renderMarkdownText(point, styles.blockText)}
              </View>
            ))}
            {block.data.points.length > 2 && (
              <Text style={styles.blockMore}>
                +{block.data.points.length - 2} more points
              </Text>
            )}
          </View>
        )}
        {block.type === "quote" && block.data?.quote && (
          <View style={styles.blockContent}>
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarks}>&ldquo;</Text>
              {markdownFormatter.renderMarkdownText(
                block.data.quote,
                styles.blockText
              )}
              <Text style={styles.quoteMarks}>&rdquo;</Text>
            </View>
            {block.data.citation && (
              <View style={styles.citationContainer}>
                <Text style={styles.citationDash}>— </Text>
                {markdownFormatter.renderMarkdownText(
                  block.data.citation,
                  styles.blockCitation
                )}
              </View>
            )}
          </View>
        )}
        {block.type === "callout" && block.data?.text && (
          <View style={styles.blockContent}>
            {markdownFormatter.renderMarkdownText(
              block.data.text,
              styles.blockText
            )}
          </View>
        )}
        {block.type === "timeline" && block.data?.events && (
          <View style={styles.blockContent}>
            {block.data.events.slice(0, 2).map((event, i) => (
              <View key={i} style={styles.timelineEvent}>
                <Text style={styles.timelineDate}>{event.date}</Text>
                {markdownFormatter.renderMarkdownText(
                  event.description,
                  styles.blockText
                )}
              </View>
            ))}
            {block.data.events.length > 2 && (
              <Text style={styles.blockMore}>
                +{block.data.events.length - 2} more events
              </Text>
            )}
          </View>
        )}
        {block.type === "evidence" && block.data?.items && (
          <View style={styles.blockContent}>
            {block.data.items.slice(0, 2).map((item, i) => (
              <View key={i} style={styles.evidenceItem}>
                <Text style={styles.evidenceLabel}>{item.label}:</Text>
                {markdownFormatter.renderMarkdownText(
                  item.description,
                  styles.blockText
                )}
              </View>
            ))}
            {block.data.items.length > 2 && (
              <Text style={styles.blockMore}>
                +{block.data.items.length - 2} more items
              </Text>
            )}
          </View>
        )}
        {block.type === "twoColumn" &&
          (block.data?.left || block.data?.right) && (
            <View style={styles.blockContent}>
              <View style={styles.twoColumnPreview}>
                {block.data.left && (
                  <View style={styles.columnPreview}>
                    <Text style={styles.columnTitle}>
                      {block.data.left.title}
                    </Text>
                    {block.data.left.points?.slice(0, 1).map((point, i) => (
                      <View key={i} style={styles.blockTextContainer}>
                        <Text style={styles.blockBullet}>• </Text>
                        {markdownFormatter.renderMarkdownText(
                          point,
                          styles.blockText
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {block.data.right && (
                  <View style={styles.columnPreview}>
                    <Text style={styles.columnTitle}>
                      {block.data.right.title}
                    </Text>
                    {block.data.right.points?.slice(0, 1).map((point, i) => (
                      <View key={i} style={styles.blockTextContainer}>
                        <Text style={styles.blockBullet}>• </Text>
                        {markdownFormatter.renderMarkdownText(
                          point,
                          styles.blockText
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible && isUnlocked}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🎨 Generate Slides</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            {!generatedSlides ? (
              <>
                {/* Input Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Case Description</Text>
                  <Text style={styles.sectionHint}>
                    Describe your case, arguments, or legal topic in 50-3000
                    characters. AI will generate a professional presentation.
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Enter case description, facts, arguments, timeline, evidence, etc..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  <View style={styles.charCountContainer}>
                    <Text
                      style={[
                        styles.charCount,
                        input.length < 100 &&
                          input.length > 0 &&
                          styles.charCountWarning,
                        input.length > 3000 && styles.charCountError,
                      ]}
                    >
                      {input.length} / 3000 characters
                      {input.length < 100 &&
                        input.length > 0 &&
                        " (minimum 100)"}
                      {input.length > 3000 && " (too long!)"}
                    </Text>
                  </View>

                  {/* Input Analysis Panel */}
                  {inputAnalysis && input.length >= 50 && (
                    <View style={styles.analysisPanel}>
                      <View style={styles.analysisHeader}>
                        <Text style={styles.analysisTitle}>
                          📊 Input Analysis
                        </Text>
                        <View
                          style={[
                            styles.completenessScore,
                            inputAnalysis.completeness >= 70 &&
                              styles.completenessGood,
                            inputAnalysis.completeness >= 40 &&
                              inputAnalysis.completeness < 70 &&
                              styles.completenessOkay,
                            inputAnalysis.completeness < 40 &&
                              styles.completenessLow,
                          ]}
                        >
                          <Text style={styles.completenessText}>
                            {inputAnalysis.completeness}% Complete
                          </Text>
                        </View>
                      </View>

                      {/* Case Type */}
                      <View style={styles.analysisRow}>
                        <Text style={styles.analysisLabel}>Case Type:</Text>
                        <Text style={styles.analysisValue}>
                          {inputAnalysis.caseType === "constitutional" &&
                            "⚖️ Constitutional"}
                          {inputAnalysis.caseType === "criminal" &&
                            "🔒 Criminal"}
                          {inputAnalysis.caseType === "civil" && "📜 Civil"}
                          {inputAnalysis.caseType === "procedural" &&
                            "⚙️ Procedural"}
                          {inputAnalysis.caseType === "general" && "📋 General"}
                        </Text>
                      </View>

                      {/* Elements Present */}
                      <View style={styles.elementsGrid}>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasFacts &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasFacts &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasFacts ? "✓" : "○"} Facts
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasLegalIssues &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasLegalIssues &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasLegalIssues ? "✓" : "○"}{" "}
                            Issues
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasStatutes &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasStatutes &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasStatutes ? "✓" : "○"}{" "}
                            Statutes
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasArguments &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasArguments &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasArguments ? "✓" : "○"}{" "}
                            Arguments
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasEvidence &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasEvidence &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasEvidence ? "✓" : "○"}{" "}
                            Evidence
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.elementChip,
                            inputAnalysis.elements.hasCitations &&
                              styles.elementPresent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.elementText,
                              inputAnalysis.elements.hasCitations &&
                                styles.elementTextPresent,
                            ]}
                          >
                            {inputAnalysis.elements.hasCitations ? "✓" : "○"}{" "}
                            Citations
                          </Text>
                        </View>
                      </View>

                      {/* Suggestions */}
                      {inputAnalysis.suggestions &&
                        inputAnalysis.suggestions.length > 0 && (
                          <View style={styles.suggestionsContainer}>
                            <Text style={styles.suggestionsTitle}>
                              💡 Suggestions:
                            </Text>
                            {inputAnalysis.suggestions.map(
                              (suggestion, idx) => (
                                <Text key={idx} style={styles.suggestionText}>
                                  • {suggestion}
                                </Text>
                              )
                            )}
                          </View>
                        )}
                    </View>
                  )}
                </View>

                {/* Slide Count Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 Slide Count</Text>
                  <Text style={styles.sectionHint}>
                    Choose how many slides to generate (3-8 slides)
                  </Text>

                  <View style={styles.slideCountContainer}>
                    {/* Slide count buttons */}
                    <View style={styles.slideCountButtons}>
                      {[3, 4, 5, 6, 7, 8].map((count) => (
                        <TouchableOpacity
                          key={count}
                          style={[
                            styles.slideCountButton,
                            desiredSlideCount === count &&
                              styles.slideCountButtonActive,
                            count === inputAnalysis?.estimatedSlideCount &&
                              styles.slideCountButtonSuggested,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            handleSlideCountChange(count);
                          }}
                          disabled={loading}
                        >
                          <Text
                            style={[
                              styles.slideCountButtonText,
                              desiredSlideCount === count &&
                                styles.slideCountButtonTextActive,
                            ]}
                          >
                            {count}
                          </Text>
                          {count === inputAnalysis?.estimatedSlideCount && (
                            <Text style={styles.suggestedBadge}>✨</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Info row */}
                    <View style={styles.slideCountInfo}>
                      <Text style={styles.slideCountInfoText}>
                        ⏱️ Estimated time: ~{desiredSlideCount * 2} minutes
                      </Text>
                      {inputAnalysis?.estimatedSlideCount && (
                        <Text style={styles.slideCountSuggestion}>
                          ✨ Suggested: {inputAnalysis.estimatedSlideCount}{" "}
                          slides
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Template Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    📋 Template (Optional)
                  </Text>
                  <Text style={styles.sectionHint}>
                    Choose a template for structured slide generation, or select
                    &quot;No Template&quot; for general format
                  </Text>

                  {/* No Template Option */}
                  <TouchableOpacity
                    style={[
                      styles.templateCard,
                      selectedTemplate === null && styles.templateCardSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTemplate(null);
                    }}
                    disabled={loading}
                  >
                    <View style={styles.templateHeader}>
                      <Text style={styles.templateIcon}>✨</Text>
                      <View style={styles.templateInfo}>
                        <Text
                          style={[
                            styles.templateName,
                            selectedTemplate === null &&
                              styles.templateNameSelected,
                          ]}
                        >
                          No Template
                        </Text>
                        <Text style={styles.templateDescription}>
                          General format - AI decides structure based on content
                        </Text>
                      </View>
                      {selectedTemplate === null && (
                        <Text style={styles.selectedBadge}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Template Cards */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.templatesScroll}
                    contentContainerStyle={styles.templatesScrollContent}
                  >
                    {availableTemplates.map((template) => (
                      <TouchableOpacity
                        key={template.type}
                        style={[
                          styles.templateCard,
                          styles.templateCardHorizontal,
                          selectedTemplate === template.type &&
                            styles.templateCardSelected,
                          suggestedTemplate === template.type &&
                            styles.templateCardSuggested,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          setSelectedTemplate(template.type);
                        }}
                        disabled={loading}
                      >
                        <View style={styles.templateHeader}>
                          <Text style={styles.templateIcon}>
                            {template.icon}
                          </Text>
                          <View style={styles.templateInfo}>
                            <View style={styles.templateTitleRow}>
                              <Text
                                style={[
                                  styles.templateName,
                                  selectedTemplate === template.type &&
                                    styles.templateNameSelected,
                                ]}
                              >
                                {template.name}
                              </Text>
                              {suggestedTemplate === template.type && (
                                <Text style={styles.recommendedBadge}>
                                  ✨ Recommended
                                </Text>
                              )}
                            </View>
                            <Text
                              style={styles.templateDescription}
                              numberOfLines={2}
                            >
                              {template.description}
                            </Text>
                          </View>
                          {selectedTemplate === template.type && (
                            <Text style={styles.selectedBadge}>✓</Text>
                          )}
                        </View>

                        {/* Use Cases */}
                        <View style={styles.templateUseCases}>
                          <Text style={styles.useCasesTitle}>Use for:</Text>
                          {template.useCases.slice(0, 2).map((useCase, idx) => (
                            <Text
                              key={idx}
                              style={styles.useCaseText}
                              numberOfLines={1}
                            >
                              • {useCase}
                            </Text>
                          ))}
                          {template.useCases.length > 2 && (
                            <Text style={styles.useCaseMore}>
                              +{template.useCases.length - 2} more
                            </Text>
                          )}
                        </View>

                        {/* Suggested Slide Count */}
                        <View style={styles.templateFooter}>
                          <Text style={styles.templateSlideCount}>
                            📊 Suggested: {template.suggestedSlideCount} slides
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Selected Template Characteristics */}
                  {selectedTemplate && (
                    <View style={styles.selectedTemplateInfo}>
                      <Text style={styles.selectedTemplateTitle}>
                        📌 Selected Template Characteristics
                      </Text>
                      {(() => {
                        const template = availableTemplates.find(
                          (t) => t.type === selectedTemplate
                        );
                        if (!template) return null;

                        return (
                          <>
                            <View style={styles.characteristicsGrid}>
                              <View style={styles.characteristicChip}>
                                <Text style={styles.characteristicText}>
                                  📊 {template.suggestedSlideCount} slides
                                </Text>
                              </View>
                              <View style={styles.characteristicChip}>
                                <Text style={styles.characteristicText}>
                                  {template.icon} {template.name}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.characteristicDescription}>
                              {template.description}
                            </Text>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>

                {/* Quick Example Prompts */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ Quick Examples</Text>
                  <Text style={styles.sectionHint}>
                    Tap any example to try it instantly
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickPromptsScroll}
                  >
                    <TouchableOpacity
                      style={styles.quickPromptChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(
                          "Article 21 case about right to privacy. Supreme Court held that privacy is a fundamental right. Key judgment: K.S. Puttaswamy v. Union of India (2017). The nine-judge bench unanimously ruled that privacy is protected under Article 21."
                        );
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.quickPromptTitle}>
                        📜 Right to Privacy
                      </Text>
                      <Text style={styles.quickPromptSubtitle}>
                        Constitutional case
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPromptChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(
                          "Murder case under Section 302 IPC. Prosecution presented 15 witnesses including eyewitnesses, forensic evidence (blood samples, fingerprints), and CCTV footage. Defense argued alibi and questioned credibility of witnesses. Key evidence: 1) CCTV showed accused near crime scene at 11:45 PM, 2) Forensic report matched blood type with victim, 3) Two eyewitnesses identified accused. Court found accused guilty beyond reasonable doubt."
                        );
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.quickPromptTitle}>
                        ⚖️ Criminal Case
                      </Text>
                      <Text style={styles.quickPromptSubtitle}>
                        Murder with evidence
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPromptChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(
                          "Section 377 IPC challenged on grounds of violating Article 14, 15, and 21. Petitioners argued that criminalizing consensual homosexual acts between adults is discriminatory and violates the right to privacy and dignity. The Supreme Court in Navtej Singh Johar v. Union of India (2018) decriminalized homosexuality, holding that Section 377 is unconstitutional."
                        );
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.quickPromptTitle}>
                        🏳️‍🌈 Section 377
                      </Text>
                      <Text style={styles.quickPromptSubtitle}>
                        Landmark judgment
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPromptChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(
                          "Breach of contract case with timeline: Jan 2020 - Contract signed for delivery of goods worth ₹50 lakhs, March 2020 - First payment of ₹20 lakhs made, June 2020 - Delivery due but not received, July 2020 - Legal notice sent demanding performance, Sept 2020 - Suit filed for specific performance and damages, Dec 2020 - Interim order passed, March 2021 - Final judgment with damages of ₹15 lakhs awarded to plaintiff."
                        );
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.quickPromptTitle}>
                        📝 Contract Breach
                      </Text>
                      <Text style={styles.quickPromptSubtitle}>
                        With timeline
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPromptChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(
                          "Custody battle between divorced parents. Mother's argument: Child's primary caregiver since birth, stable home environment with grandparents nearby, better educational facilities in her city, child's medical needs met regularly. Father's argument: Higher income of ₹2.5 lakhs/month, extended family support, child expressed preference to live with father. Court's consideration: Best interest of child as paramount, child's age (12 years old), psychological report recommending joint custody with primary residence with mother."
                        );
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.quickPromptTitle}>
                        👨‍👩‍👧 Child Custody
                      </Text>
                      <Text style={styles.quickPromptSubtitle}>
                        Comparative arguments
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Generate Button */}
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.generateButton,
                      (loading || input.length < 100) &&
                        styles.generateButtonDisabled,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleGenerate();
                    }}
                    disabled={loading || input.length < 100}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator
                          color={colors.background}
                          size="small"
                        />
                        <Text style={styles.generateButtonText}>
                          {" "}
                          Generating...
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.generateButtonText}>
                        ✨ Generate Slides with AI
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                  <Text style={styles.infoTitle}>💡 How It Works</Text>
                  <LinearGradient
                    colors={[colors.card, colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCard}
                  >
                    <Text style={styles.infoText}>
                      • AI analyzes your case description{"\n"}• Structures
                      content into 1-5 professional slides{"\n"}• Uses
                      appropriate formats (bullet points, quotes, timeline)
                      {"\n"}• Takes 2-3 seconds to generate{"\n"}• Results are
                      cached for instant re-use
                    </Text>
                  </LinearGradient>

                  <Text style={styles.infoTitle}>📝 Tips for Best Results</Text>
                  <LinearGradient
                    colors={[colors.card, colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCard}
                  >
                    <Text style={styles.infoText}>
                      • Include key facts, dates, and parties{"\n"}• Mention
                      relevant laws, articles, or cases{"\n"}• Describe
                      arguments and counter-arguments{"\n"}• Add timeline of
                      events if applicable{"\n"}• Include evidence and witness
                      details
                    </Text>
                  </LinearGradient>
                </View>
              </>
            ) : (
              <>
                {/* Preview Section */}
                <View style={styles.section}>
                  <View style={styles.previewHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Generated Presentation
                      </Text>
                      <Text style={styles.previewSubtitle}>
                        {generatedSlides.title || "Untitled Presentation"}
                      </Text>
                    </View>
                    {fromCache && (
                      <View style={styles.cacheBadge}>
                        <Text style={styles.cacheBadgeText}>📦 Cached</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statValue}>
                        {generatedSlides.slides.length}
                      </Text>
                      <Text style={styles.statLabel}>Slides</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statValue}>
                        {generatedSlides.slides.reduce(
                          (sum, s) => sum + (s.blocks?.length || 0),
                          0
                        )}
                      </Text>
                      <Text style={styles.statLabel}>Blocks</Text>
                    </View>
                    {generatedSlides.template && (
                      <View style={styles.statBadge}>
                        <Text style={styles.statValue}>📋</Text>
                        <Text style={styles.statLabel}>
                          {generatedSlides.template.name}
                        </Text>
                      </View>
                    )}
                    {generatedSlides.validation && (
                      <View style={styles.statBadge}>
                        <Text
                          style={[
                            styles.statValue,
                            generatedSlides.validation.score >= 80 &&
                              styles.qualityExcellent,
                            generatedSlides.validation.score >= 60 &&
                              generatedSlides.validation.score < 80 &&
                              styles.qualityGood,
                            generatedSlides.validation.score < 60 &&
                              styles.qualityPoor,
                          ]}
                        >
                          {generatedSlides.validation.score}
                        </Text>
                        <Text style={styles.statLabel}>Quality</Text>
                      </View>
                    )}
                  </View>

                  {/* Quality Metrics Display */}
                  {generatedSlides.validation && (
                    <View style={styles.qualitySection}>
                      <Text style={styles.qualitySectionTitle}>
                        📊 Quality Assessment
                      </Text>

                      {/* Overall Score */}
                      <View
                        style={[
                          styles.qualityOverallCard,
                          generatedSlides.validation.score >= 80 &&
                            styles.qualityCardExcellent,
                          generatedSlides.validation.score >= 60 &&
                            generatedSlides.validation.score < 80 &&
                            styles.qualityCardGood,
                          generatedSlides.validation.score < 60 &&
                            styles.qualityCardPoor,
                        ]}
                      >
                        <View style={styles.qualityOverallHeader}>
                          <Text style={styles.qualityOverallScore}>
                            {generatedSlides.validation.score}/100
                          </Text>
                          <View style={styles.qualityBadgeContainer}>
                            <Text
                              style={[
                                styles.qualityBadge,
                                generatedSlides.validation.score >= 80 &&
                                  styles.qualityBadgeExcellent,
                                generatedSlides.validation.score >= 60 &&
                                  generatedSlides.validation.score < 80 &&
                                  styles.qualityBadgeGood,
                                generatedSlides.validation.score < 60 &&
                                  styles.qualityBadgePoor,
                              ]}
                            >
                              {generatedSlides.validation.score >= 80 &&
                                "🏆 Excellent"}
                              {generatedSlides.validation.score >= 60 &&
                                generatedSlides.validation.score < 80 &&
                                "✅ Good"}
                              {generatedSlides.validation.score < 60 &&
                                "⚠️ Needs Improvement"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.qualityOverallDescription}>
                          {generatedSlides.validation.score >= 80 &&
                            "Professional quality slides ready for presentation"}
                          {generatedSlides.validation.score >= 60 &&
                            generatedSlides.validation.score < 80 &&
                            "Good quality slides with minor improvements possible"}
                          {generatedSlides.validation.score < 60 &&
                            "Consider regenerating for better quality"}
                        </Text>
                      </View>

                      {/* Score Breakdown */}
                      <View style={styles.qualityBreakdown}>
                        <Text style={styles.qualityBreakdownTitle}>
                          Score Breakdown
                        </Text>
                        <View style={styles.qualityScores}>
                          <View style={styles.qualityScoreItem}>
                            <View style={styles.qualityScoreHeader}>
                              <Text style={styles.qualityScoreLabel}>
                                📐 Structure
                              </Text>
                              <Text style={styles.qualityScoreValue}>
                                {generatedSlides.validation.scores.structure}
                                /100
                              </Text>
                            </View>
                            <View style={styles.qualityScoreBar}>
                              <View
                                style={[
                                  styles.qualityScoreProgress,
                                  {
                                    width: `${generatedSlides.validation.scores.structure}%`,
                                  },
                                  generatedSlides.validation.scores.structure >=
                                    80 && styles.progressExcellent,
                                  generatedSlides.validation.scores.structure >=
                                    60 &&
                                    generatedSlides.validation.scores
                                      .structure < 80 &&
                                    styles.progressGood,
                                  generatedSlides.validation.scores.structure <
                                    60 && styles.progressPoor,
                                ]}
                              />
                            </View>
                          </View>

                          <View style={styles.qualityScoreItem}>
                            <View style={styles.qualityScoreHeader}>
                              <Text style={styles.qualityScoreLabel}>
                                ⚖️ Legal Accuracy
                              </Text>
                              <Text style={styles.qualityScoreValue}>
                                {
                                  generatedSlides.validation.scores
                                    .legalAccuracy
                                }
                                /100
                              </Text>
                            </View>
                            <View style={styles.qualityScoreBar}>
                              <View
                                style={[
                                  styles.qualityScoreProgress,
                                  {
                                    width: `${generatedSlides.validation.scores.legalAccuracy}%`,
                                  },
                                  generatedSlides.validation.scores
                                    .legalAccuracy >= 80 &&
                                    styles.progressExcellent,
                                  generatedSlides.validation.scores
                                    .legalAccuracy >= 60 &&
                                    generatedSlides.validation.scores
                                      .legalAccuracy < 80 &&
                                    styles.progressGood,
                                  generatedSlides.validation.scores
                                    .legalAccuracy < 60 && styles.progressPoor,
                                ]}
                              />
                            </View>
                          </View>

                          <View style={styles.qualityScoreItem}>
                            <View style={styles.qualityScoreHeader}>
                              <Text style={styles.qualityScoreLabel}>
                                🎨 Formatting
                              </Text>
                              <Text style={styles.qualityScoreValue}>
                                {generatedSlides.validation.scores.formatting}
                                /100
                              </Text>
                            </View>
                            <View style={styles.qualityScoreBar}>
                              <View
                                style={[
                                  styles.qualityScoreProgress,
                                  {
                                    width: `${generatedSlides.validation.scores.formatting}%`,
                                  },
                                  generatedSlides.validation.scores
                                    .formatting >= 80 &&
                                    styles.progressExcellent,
                                  generatedSlides.validation.scores
                                    .formatting >= 60 &&
                                    generatedSlides.validation.scores
                                      .formatting < 80 &&
                                    styles.progressGood,
                                  generatedSlides.validation.scores.formatting <
                                    60 && styles.progressPoor,
                                ]}
                              />
                            </View>
                          </View>

                          <View style={styles.qualityScoreItem}>
                            <View style={styles.qualityScoreHeader}>
                              <Text style={styles.qualityScoreLabel}>
                                🎯 Relevance
                              </Text>
                              <Text style={styles.qualityScoreValue}>
                                {generatedSlides.validation.scores.relevance}
                                /100
                              </Text>
                            </View>
                            <View style={styles.qualityScoreBar}>
                              <View
                                style={[
                                  styles.qualityScoreProgress,
                                  {
                                    width: `${generatedSlides.validation.scores.relevance}%`,
                                  },
                                  generatedSlides.validation.scores.relevance >=
                                    80 && styles.progressExcellent,
                                  generatedSlides.validation.scores.relevance >=
                                    60 &&
                                    generatedSlides.validation.scores
                                      .relevance < 80 &&
                                    styles.progressGood,
                                  generatedSlides.validation.scores.relevance <
                                    60 && styles.progressPoor,
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Validation Issues */}
                      {generatedSlides.validation.issues &&
                        generatedSlides.validation.issues.length > 0 && (
                          <View style={styles.qualityIssues}>
                            <Text style={styles.qualityIssuesTitle}>
                              🔍 Quality Issues (
                              {generatedSlides.validation.issues.length})
                            </Text>
                            {generatedSlides.validation.issues
                              .slice(0, 5)
                              .map((issue, idx) => (
                                <View
                                  key={idx}
                                  style={[
                                    styles.qualityIssueItem,
                                    issue.severity === "error" &&
                                      styles.issueError,
                                    issue.severity === "warning" &&
                                      styles.issueWarning,
                                    issue.severity === "info" &&
                                      styles.issueInfo,
                                  ]}
                                >
                                  <View style={styles.issueHeader}>
                                    <Text style={styles.issueSeverity}>
                                      {issue.severity === "error" && "🚨"}
                                      {issue.severity === "warning" && "⚠️"}
                                      {issue.severity === "info" && "ℹ️"}
                                    </Text>
                                    <Text
                                      style={styles.issueMessage}
                                      numberOfLines={2}
                                    >
                                      {issue.message}
                                    </Text>
                                  </View>
                                  {issue.suggestion && (
                                    <Text
                                      style={styles.issueSuggestion}
                                      numberOfLines={2}
                                    >
                                      💡 {issue.suggestion}
                                    </Text>
                                  )}
                                  {issue.slideIndex !== null && (
                                    <Text style={styles.issueLocation}>
                                      📍 Slide {issue.slideIndex + 1}
                                      {issue.blockIndex !== null &&
                                        `, Block ${issue.blockIndex + 1}`}
                                    </Text>
                                  )}
                                </View>
                              ))}
                            {generatedSlides.validation.issues.length > 5 && (
                              <Text style={styles.moreIssuesText}>
                                +{generatedSlides.validation.issues.length - 5}{" "}
                                more issues
                              </Text>
                            )}
                          </View>
                        )}

                      {/* Quality Metrics */}
                      {generatedSlides.validation.metrics && (
                        <View style={styles.qualityMetrics}>
                          <Text style={styles.qualityMetricsTitle}>
                            📈 Content Metrics
                          </Text>
                          <View style={styles.metricsGrid}>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {generatedSlides.validation.metrics.avgBlocksPerSlide.toFixed(
                                  1
                                )}
                              </Text>
                              <Text style={styles.metricLabel}>
                                Avg Blocks/Slide
                              </Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {
                                  generatedSlides.validation.metrics
                                    .citationCount
                                }
                              </Text>
                              <Text style={styles.metricLabel}>Citations</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {generatedSlides.validation.metrics.legalTermDensity.toFixed(
                                  1
                                )}
                              </Text>
                              <Text style={styles.metricLabel}>
                                Legal Terms/Slide
                              </Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {generatedSlides.validation.metrics.formattingCompliance.toFixed(
                                  0
                                )}
                                %
                              </Text>
                              <Text style={styles.metricLabel}>
                                Format Compliance
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Slides Preview */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Slide Preview</Text>

                  {/* Color Legend */}
                  <View style={styles.colorLegend}>
                    <Text style={styles.colorLegendTitle}>
                      🎨 Color Coding Guide
                    </Text>
                    <View style={styles.legendItems}>
                      {markdownFormatter.getColorLegend().map((item, idx) => (
                        <View key={idx} style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendColorDot,
                              { backgroundColor: item.color },
                            ]}
                          />
                          <View style={styles.legendTextContainer}>
                            <Text style={styles.legendLabel}>{item.label}</Text>
                            <Text style={styles.legendExample}>
                              {item.example}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {generatedSlides.slides.map((slide, index) => {
                    const metadata = calculateSlideMetadata(slide);
                    const isExpanded = expandedSlides[index];

                    return (
                      <View key={index} style={styles.slideCard}>
                        <View style={styles.slideHeader}>
                          <Text style={styles.slideNumber}>
                            Slide {index + 1}
                          </Text>
                          <Text style={styles.slideBlockCount}>
                            {slide.blocks?.length || 0} blocks
                          </Text>
                        </View>
                        <Text style={styles.slideTitle}>{slide.title}</Text>
                        {slide.subtitle && (
                          <Text style={styles.slideSubtitle}>
                            {slide.subtitle}
                          </Text>
                        )}

                        {/* Slide Metadata Summary */}
                        <View style={styles.slideMetadataSummary}>
                          <View style={styles.metadataChip}>
                            <Text style={styles.metadataIcon}>📊</Text>
                            <Text style={styles.metadataText}>
                              {metadata.totalPoints} points
                            </Text>
                          </View>
                          {metadata.citationCount > 0 && (
                            <View style={styles.metadataChip}>
                              <Text style={styles.metadataIcon}>⚖️</Text>
                              <Text style={styles.metadataText}>
                                {metadata.citationCount} citations
                              </Text>
                            </View>
                          )}
                          <View style={styles.metadataChip}>
                            <Text style={styles.metadataIcon}>📝</Text>
                            <Text style={styles.metadataText}>
                              {metadata.contentLength} chars
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.detailsToggle}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                              );
                              toggleSlideDetails(index);
                            }}
                          >
                            <Text style={styles.detailsToggleText}>
                              {isExpanded ? "▼ Hide" : "▶ Details"}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Expandable Details Section */}
                        {isExpanded && (
                          <View style={styles.slideDetailsSection}>
                            <Text style={styles.detailsSectionTitle}>
                              📋 Slide Details
                            </Text>

                            {/* Block Type Breakdown */}
                            <View style={styles.detailsRow}>
                              <Text style={styles.detailsLabel}>
                                Block Types:
                              </Text>
                              <View style={styles.blockTypesContainer}>
                                {Object.entries(metadata.blockTypes).map(
                                  ([type, count]) => (
                                    <View
                                      key={type}
                                      style={styles.blockTypeChip}
                                    >
                                      <Text style={styles.blockTypeText}>
                                        {type}: {count}
                                      </Text>
                                    </View>
                                  )
                                )}
                              </View>
                            </View>

                            {/* Content Metrics */}
                            <View style={styles.detailsRow}>
                              <Text style={styles.detailsLabel}>
                                Content Metrics:
                              </Text>
                              <View style={styles.metricsContainer}>
                                <Text style={styles.metricDetail}>
                                  • Total Points: {metadata.totalPoints}
                                </Text>
                                <Text style={styles.metricDetail}>
                                  • Citations: {metadata.citationCount}
                                </Text>
                                <Text style={styles.metricDetail}>
                                  • Content Length: {metadata.contentLength}{" "}
                                  characters
                                </Text>
                                <Text style={styles.metricDetail}>
                                  • Avg per Block: {metadata.avgContentPerBlock}{" "}
                                  chars
                                </Text>
                              </View>
                            </View>

                            {/* Image Suggestions Count */}
                            {slide.suggestedImages &&
                              slide.suggestedImages.length > 0 && (
                                <View style={styles.detailsRow}>
                                  <Text style={styles.detailsLabel}>
                                    Image Suggestions:
                                  </Text>
                                  <Text style={styles.detailsValue}>
                                    {slide.suggestedImages.length} keywords
                                  </Text>
                                </View>
                              )}
                          </View>
                        )}

                        {/* Enhanced Image Suggestions */}
                        {slide.suggestedImages &&
                          slide.suggestedImages.length > 0 && (
                            <View style={styles.imageSuggestionsEnhanced}>
                              <View style={styles.imageSuggestionsHeader}>
                                <View style={styles.imageSuggestionsHeaderLeft}>
                                  <Text
                                    style={styles.imageSuggestionsTitleEnhanced}
                                  >
                                    🖼️ Suggested Images
                                  </Text>
                                  <Text style={styles.imageSuggestionsSubtitle}>
                                    Enhance this slide with relevant visuals
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.skipImagesButton}
                                  onPress={() => {
                                    console.log(
                                      `⏭️ Skipped images for slide ${index}`
                                    );
                                    Alert.alert(
                                      "Images Skipped",
                                      "You can always add images later from the image library."
                                    );
                                  }}
                                >
                                  <Text style={styles.skipImagesButtonText}>
                                    Skip
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <View style={styles.imageKeywordsEnhanced}>
                                {slide.suggestedImages.map((keyword, idx) => {
                                  // Determine relevance based on slide content
                                  const slideTitle =
                                    slide.title?.toLowerCase() || "";
                                  const isHighRelevance = slideTitle.includes(
                                    keyword.toLowerCase().split(" ")[0]
                                  );

                                  return (
                                    <View
                                      key={idx}
                                      style={styles.imageKeywordWrapper}
                                    >
                                      <TouchableOpacity
                                        style={[
                                          styles.imageKeywordButtonEnhanced,
                                          isHighRelevance &&
                                            styles.imageKeywordButtonHighRelevance,
                                        ]}
                                        onPress={() => {
                                          Haptics.impactAsync(
                                            Haptics.ImpactFeedbackStyle.Medium
                                          );
                                          handleImageSuggestionTap(
                                            keyword,
                                            index
                                          );
                                        }}
                                        activeOpacity={0.7}
                                      >
                                        <Text
                                          style={
                                            styles.imageKeywordIconEnhanced
                                          }
                                        >
                                          🔍
                                        </Text>
                                        <View
                                          style={styles.imageKeywordContent}
                                        >
                                          <Text
                                            style={
                                              styles.imageKeywordTextEnhanced
                                            }
                                          >
                                            {keyword}
                                          </Text>
                                          {isHighRelevance && (
                                            <View
                                              style={styles.relevanceIndicator}
                                            >
                                              <Text
                                                style={
                                                  styles.relevanceIndicatorText
                                                }
                                              >
                                                ⭐ Highly Relevant
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                      </TouchableOpacity>

                                      {/* Contextual help for each keyword */}
                                      <Text style={styles.imageKeywordPurpose}>
                                        {idx === 0 &&
                                          "Perfect for slide background or header"}
                                        {idx === 1 &&
                                          "Great for supporting visual context"}
                                        {idx > 1 && "Additional visual option"}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>

                              <View style={styles.imagePlacementHintEnhanced}>
                                <Text style={styles.imagePlacementIconEnhanced}>
                                  💡
                                </Text>
                                <View
                                  style={styles.imagePlacementTextContainer}
                                >
                                  <Text
                                    style={styles.imagePlacementTextEnhanced}
                                  >
                                    <Text style={styles.imagePlacementTextBold}>
                                      How it works:{" "}
                                    </Text>
                                    Tap any keyword to search professional stock
                                    photos. After selecting an image,
                                    you&apos;ll choose where to place it
                                    (background, inline, or separate block).
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}

                        {/* Image Placement Zones Indicator */}
                        {slide.suggestedImages &&
                          slide.suggestedImages.length > 0 && (
                            <View style={styles.placementZonesContainer}>
                              <Text style={styles.placementZonesTitle}>
                                📍 Image Placement Options
                              </Text>
                              <View style={styles.placementZones}>
                                <View style={styles.placementZone}>
                                  <View style={styles.placementZoneIcon}>
                                    <Text style={styles.placementZoneEmoji}>
                                      🖼️
                                    </Text>
                                  </View>
                                  <View style={styles.placementZoneInfo}>
                                    <Text style={styles.placementZoneLabel}>
                                      Slide Background
                                    </Text>
                                    <Text
                                      style={styles.placementZoneDescription}
                                    >
                                      Image fills entire slide behind content
                                    </Text>
                                  </View>
                                  <View
                                    style={[
                                      styles.recommendedBadgeSmall,
                                      slide.blocks?.length <= 2 &&
                                        styles.recommendedBadgeVisible,
                                    ]}
                                  >
                                    <Text style={styles.recommendedBadgeText}>
                                      ✨ Recommended
                                    </Text>
                                  </View>
                                </View>

                                <View style={styles.placementZone}>
                                  <View style={styles.placementZoneIcon}>
                                    <Text style={styles.placementZoneEmoji}>
                                      📝
                                    </Text>
                                  </View>
                                  <View style={styles.placementZoneInfo}>
                                    <Text style={styles.placementZoneLabel}>
                                      Inline with Content
                                    </Text>
                                    <Text
                                      style={styles.placementZoneDescription}
                                    >
                                      Image appears alongside text blocks
                                    </Text>
                                  </View>
                                </View>

                                <View style={styles.placementZone}>
                                  <View style={styles.placementZoneIcon}>
                                    <Text style={styles.placementZoneEmoji}>
                                      🎨
                                    </Text>
                                  </View>
                                  <View style={styles.placementZoneInfo}>
                                    <Text style={styles.placementZoneLabel}>
                                      Separate Image Block
                                    </Text>
                                    <Text
                                      style={styles.placementZoneDescription}
                                    >
                                      Creates dedicated image block
                                    </Text>
                                  </View>
                                  <View
                                    style={[
                                      styles.recommendedBadgeSmall,
                                      slide.blocks?.length >= 3 &&
                                        styles.recommendedBadgeVisible,
                                    ]}
                                  >
                                    <Text style={styles.recommendedBadgeText}>
                                      ✨ Best for content-heavy slides
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}

                        <View style={styles.blocksPreview}>
                          {slide.blocks?.map((block, blockIdx) => (
                            <View key={blockIdx}>
                              {renderBlockPreview(block)}
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Refinement Section */}
                {!refinementMode ? (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.refineButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRefinementMode(true);
                      }}
                    >
                      <Text style={styles.refineButtonText}>
                        ✨ Refine Slides
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.refineHint}>
                      Make targeted improvements to generated slides
                    </Text>
                  </View>
                ) : (
                  <View style={styles.section}>
                    <View style={styles.refinementHeader}>
                      <Text style={styles.sectionTitle}>
                        ✨ Refine Your Slides
                      </Text>
                      <TouchableOpacity
                        style={styles.cancelRefinementButton}
                        onPress={handleCancelRefinement}
                      >
                        <Text style={styles.cancelRefinementText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionHint}>
                      Describe what you'd like to change or improve
                    </Text>

                    <TextInput
                      style={styles.refinementInput}
                      value={refinementInput}
                      onChangeText={setRefinementInput}
                      placeholder="E.g., 'Add more detail to slide 3', 'Expand arguments section', 'Make slides more concise'..."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      editable={!refinementLoading}
                    />

                    {/* Refinement Suggestions */}
                    <View style={styles.refinementSuggestions}>
                      <Text style={styles.refinementSuggestionsTitle}>
                        💡 Quick Refinement Ideas:
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.suggestionChipsScroll}
                      >
                        <TouchableOpacity
                          style={styles.suggestionChip}
                          onPress={() =>
                            setRefinementInput("Add more legal citations")
                          }
                          disabled={refinementLoading}
                        >
                          <Text style={styles.suggestionChipText}>
                            📚 Add citations
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.suggestionChip}
                          onPress={() =>
                            setRefinementInput("Expand the arguments section")
                          }
                          disabled={refinementLoading}
                        >
                          <Text style={styles.suggestionChipText}>
                            📝 Expand arguments
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.suggestionChip}
                          onPress={() =>
                            setRefinementInput("Make content more concise")
                          }
                          disabled={refinementLoading}
                        >
                          <Text style={styles.suggestionChipText}>
                            ✂️ Make concise
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.suggestionChip}
                          onPress={() =>
                            setRefinementInput("Add more evidence details")
                          }
                          disabled={refinementLoading}
                        >
                          <Text style={styles.suggestionChipText}>
                            🔍 Add evidence
                          </Text>
                        </TouchableOpacity>
                      </ScrollView>
                    </View>

                    {/* Slide Preservation Options */}
                    <View style={styles.preservationSection}>
                      <Text style={styles.preservationTitle}>
                        🔒 Preserve Specific Slides (Optional)
                      </Text>
                      <Text style={styles.preservationHint}>
                        Tap slides you want to keep unchanged during refinement
                      </Text>
                      <View style={styles.preservationChips}>
                        {generatedSlides.slides.map((slide, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.preservationChip,
                              preservedSlides.includes(index) &&
                                styles.preservationChipActive,
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                              );
                              toggleSlidePreservation(index);
                            }}
                            disabled={refinementLoading}
                          >
                            <Text
                              style={[
                                styles.preservationChipText,
                                preservedSlides.includes(index) &&
                                  styles.preservationChipTextActive,
                              ]}
                            >
                              {preservedSlides.includes(index) ? "🔒" : "○"}{" "}
                              Slide {index + 1}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Refinement Changes Display */}
                    {refinementChanges.length > 0 && (
                      <View style={styles.changesSection}>
                        <Text style={styles.changesSectionTitle}>
                          📋 Recent Changes ({refinementChanges.length})
                        </Text>
                        <ScrollView
                          style={styles.changesScroll}
                          nestedScrollEnabled
                        >
                          {refinementChanges.slice(0, 5).map((change, idx) => (
                            <View key={idx} style={styles.changeItem}>
                              <View style={styles.changeHeader}>
                                <Text
                                  style={[
                                    styles.changeSeverity,
                                    change.severity === "major" &&
                                      styles.changeSeverityMajor,
                                    change.severity === "moderate" &&
                                      styles.changeSeverityModerate,
                                    change.severity === "minor" &&
                                      styles.changeSeverityMinor,
                                  ]}
                                >
                                  {change.severity === "major" && "🔴"}
                                  {change.severity === "moderate" && "🟡"}
                                  {change.severity === "minor" && "🟢"}
                                </Text>
                                <Text style={styles.changeDescription}>
                                  {change.description}
                                </Text>
                              </View>
                            </View>
                          ))}
                          {refinementChanges.length > 5 && (
                            <Text style={styles.moreChangesText}>
                              +{refinementChanges.length - 5} more changes
                            </Text>
                          )}
                        </ScrollView>
                      </View>
                    )}

                    {/* Refine Action Button */}
                    <TouchableOpacity
                      style={[
                        styles.refineActionButton,
                        (refinementLoading || !refinementInput.trim()) &&
                          styles.refineActionButtonDisabled,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleRefineSlides();
                      }}
                      disabled={refinementLoading || !refinementInput.trim()}
                    >
                      {refinementLoading ? (
                        <View style={styles.buttonContent}>
                          <ActivityIndicator
                            color={colors.background}
                            size="small"
                          />
                          <Text style={styles.refineActionButtonText}>
                            {" "}
                            Refining...
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.refineActionButtonText}>
                          ✨ Apply Refinement
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.useButton}
                    onPress={handleUseSlides}
                  >
                    <Text style={styles.useButtonText}>
                      ✅ Use These Slides
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={() => {
                      setGeneratedSlides(null);
                      setFromCache(false);
                    }}
                  >
                    <Text style={styles.regenerateButtonText}>
                      🔄 Generate Again
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <PinModal
        visible={showPinModal}
        onSuccess={() => {
          setShowPinModal(false);
          setIsUnlocked(true);
        }}
        onCancel={() => {
          setShowPinModal(false);
          onClose();
        }}
      />

      <ImageSearchModal
        visible={imageSearchModalVisible}
        onClose={() => {
          setImageSearchModalVisible(false);
          setPrefilledImageKeyword(null);
          setTargetSlideForImage(null);
        }}
        onSelectImage={handleImageSelected}
        prefilledKeyword={prefilledImageKeyword}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  closeText: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionHint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  charCountContainer: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  charCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  charCountWarning: {
    color: "#ffaa00",
    fontWeight: "600",
  },
  charCountError: {
    color: "#ff4444",
    fontWeight: "700",
  },
  analysisPanel: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  analysisTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  completenessScore: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  completenessGood: {
    backgroundColor: colors.gold + "20",
    borderColor: colors.gold,
  },
  completenessOkay: {
    backgroundColor: "#ffaa00" + "20",
    borderColor: "#ffaa00",
  },
  completenessLow: {
    backgroundColor: "#ff4444" + "20",
    borderColor: "#ff4444",
  },
  completenessText: {
    fontSize: 11,
    fontWeight: "700",
  },
  analysisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  analysisLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  analysisValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  elementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  elementChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary + "40",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  elementPresent: {
    backgroundColor: colors.gold + "20",
    borderColor: colors.gold,
  },
  elementText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  elementTextPresent: {
    color: colors.gold,
  },
  suggestionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  suggestionsTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 3,
  },
  slideCountContainer: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
  },
  slideCountButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  slideCountButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.textSecondary + "40",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  slideCountButtonActive: {
    backgroundColor: colors.gold + "20",
    borderColor: colors.gold,
    borderWidth: 2,
  },
  slideCountButtonSuggested: {
    borderColor: colors.gold + "60",
    borderStyle: "dashed",
  },
  slideCountButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
  slideCountButtonTextActive: {
    color: colors.gold,
    fontSize: 18,
  },
  suggestedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    fontSize: 12,
  },
  slideCountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderGold + "40",
  },
  slideCountInfoText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  slideCountSuggestion: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  generateButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  generateButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold + "60",
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  previewSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  cacheBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cacheBadgeText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  slideCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  slideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  slideNumber: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  slideBlockCount: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  slideTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  slideSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  blocksPreview: {
    marginTop: 8,
    gap: 8,
  },
  imageSuggestions: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gold + "40",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  imageSuggestionsTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  imageKeywords: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  imageKeywordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageKeywordIcon: {
    fontSize: 14,
    color: colors.gold,
  },
  imageKeywordText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  imagePlacementHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  imagePlacementIcon: {
    fontSize: 14,
  },
  imagePlacementText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  // Enhanced image suggestions styles
  imageSuggestionsEnhanced: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.gold + "50",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageSuggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  imageSuggestionsHeaderLeft: {
    flex: 1,
  },
  imageSuggestionsTitleEnhanced: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  imageSuggestionsSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  skipImagesButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary + "40",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipImagesButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  imageKeywordsEnhanced: {
    gap: 10,
    marginBottom: 12,
  },
  imageKeywordWrapper: {
    gap: 6,
  },
  imageKeywordButtonEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.gold + "60",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageKeywordButtonHighRelevance: {
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: colors.gold + "08",
  },
  imageKeywordIconEnhanced: {
    fontSize: 16,
    color: colors.gold,
  },
  imageKeywordContent: {
    flex: 1,
    gap: 4,
  },
  imageKeywordTextEnhanced: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  relevanceIndicator: {
    alignSelf: "flex-start",
  },
  relevanceIndicatorText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "700",
  },
  imageKeywordPurpose: {
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: "italic",
    marginLeft: 14,
    lineHeight: 14,
  },
  imagePlacementHintEnhanced: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderGold + "30",
  },
  imagePlacementIconEnhanced: {
    fontSize: 16,
  },
  imagePlacementTextContainer: {
    flex: 1,
  },
  imagePlacementTextEnhanced: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  imagePlacementTextBold: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  placementZonesContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gold + "30",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  placementZonesTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  placementZones: {
    gap: 10,
  },
  placementZone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  placementZoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  placementZoneEmoji: {
    fontSize: 18,
  },
  placementZoneInfo: {
    flex: 1,
  },
  placementZoneLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  placementZoneDescription: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  recommendedBadgeSmall: {
    backgroundColor: colors.gold + "20",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    opacity: 0,
  },
  recommendedBadgeVisible: {
    opacity: 1,
  },
  recommendedBadgeText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "600",
  },
  blockPreview: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 8,
    padding: 10,
  },
  blockType: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  blockContent: {
    gap: 4,
  },
  blockText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  blockMore: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },
  blockCitation: {
    color: colors.gold,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
  },
  useButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  useButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  regenerateButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  regenerateButtonText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  quickPromptsScroll: {
    marginTop: 4,
  },
  quickPromptChip: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold + "80",
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    minWidth: 160,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickPromptTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  quickPromptSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  templatesScroll: {
    marginTop: 8,
  },
  templatesScrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  templateCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold + "60",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  templateCardHorizontal: {
    width: 280,
    marginBottom: 0,
  },
  templateCardSelected: {
    backgroundColor: colors.gold + "15",
    borderColor: colors.gold,
    borderWidth: 2,
  },
  templateCardSuggested: {
    borderColor: colors.gold + "80",
    borderStyle: "dashed",
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  templateIcon: {
    fontSize: 28,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  templateName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  templateNameSelected: {
    color: colors.gold,
  },
  templateDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  recommendedBadge: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "600",
    backgroundColor: colors.gold + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedBadge: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "700",
  },
  templateUseCases: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGold + "40",
  },
  useCasesTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  useCaseText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  useCaseMore: {
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 2,
  },
  templateFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderGold + "40",
  },
  templateSlideCount: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  selectedTemplateInfo: {
    backgroundColor: colors.gold + "10",
    borderWidth: 1,
    borderColor: colors.gold + "40",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  selectedTemplateTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  characteristicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  characteristicChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  characteristicText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  characteristicDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  // Quality metrics styles
  qualityExcellent: {
    color: "#00C851",
  },
  qualityGood: {
    color: colors.gold,
  },
  qualityPoor: {
    color: "#ff4444",
  },
  qualitySection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  qualitySectionTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  qualityOverallCard: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  qualityCardExcellent: {
    borderColor: "#00C851",
    backgroundColor: "#00C851" + "10",
  },
  qualityCardGood: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + "10",
  },
  qualityCardPoor: {
    borderColor: "#ff4444",
    backgroundColor: "#ff4444" + "10",
  },
  qualityOverallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qualityOverallScore: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  qualityBadgeContainer: {
    alignItems: "flex-end",
  },
  qualityBadge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
  },
  qualityBadgeExcellent: {
    color: "#00C851",
    backgroundColor: "#00C851" + "20",
  },
  qualityBadgeGood: {
    color: colors.gold,
    backgroundColor: colors.gold + "20",
  },
  qualityBadgePoor: {
    color: "#ff4444",
    backgroundColor: "#ff4444" + "20",
  },
  qualityOverallDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  qualityBreakdown: {
    marginBottom: 16,
  },
  qualityBreakdownTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  qualityScores: {
    gap: 12,
  },
  qualityScoreItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  qualityScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qualityScoreLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  qualityScoreValue: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  qualityScoreBar: {
    height: 6,
    backgroundColor: colors.textSecondary + "20",
    borderRadius: 3,
    overflow: "hidden",
  },
  qualityScoreProgress: {
    height: "100%",
    borderRadius: 3,
  },
  progressExcellent: {
    backgroundColor: "#00C851",
  },
  progressGood: {
    backgroundColor: colors.gold,
  },
  progressPoor: {
    backgroundColor: "#ff4444",
  },
  qualityIssues: {
    marginBottom: 16,
  },
  qualityIssuesTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  qualityIssueItem: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  issueError: {
    borderColor: "#ff4444",
    backgroundColor: "#ff4444" + "10",
  },
  issueWarning: {
    borderColor: "#ffaa00",
    backgroundColor: "#ffaa00" + "10",
  },
  issueInfo: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + "10",
  },
  issueHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  issueSeverity: {
    fontSize: 16,
  },
  issueMessage: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  issueSuggestion: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
    marginLeft: 24,
  },
  issueLocation: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 24,
  },
  moreIssuesText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  qualityMetrics: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  qualityMetricsTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 8,
    padding: 12,
  },
  metricValue: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  // Color legend styles
  colorLegend: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  colorLegendTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  legendItems: {
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  legendExample: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: "italic",
  },
  // Enhanced block preview styles
  blockTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  blockBullet: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  quoteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  quoteMarks: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  citationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  citationDash: {
    color: colors.gold,
    fontSize: 11,
    fontStyle: "italic",
  },
  timelineEvent: {
    marginBottom: 6,
  },
  timelineDate: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  evidenceItem: {
    marginBottom: 6,
  },
  evidenceLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  twoColumnPreview: {
    flexDirection: "row",
    gap: 12,
  },
  columnPreview: {
    flex: 1,
  },
  columnTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  // Slide metadata styles
  slideMetadataSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  metadataChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  metadataIcon: {
    fontSize: 10,
  },
  metadataText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  detailsToggle: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.gold + "20",
    borderRadius: 12,
  },
  detailsToggleText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  slideDetailsSection: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  detailsSectionTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailsRow: {
    marginBottom: 10,
  },
  detailsLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  detailsValue: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  blockTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  blockTypeChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gold + "40",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  blockTypeText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "600",
  },
  metricsContainer: {
    gap: 4,
  },
  metricDetail: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  // Refinement UI styles
  refineButton: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  refineButtonText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: "700",
  },
  refineHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  refinementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cancelRefinementButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary + "40",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelRefinementText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  refinementInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    borderRadius: 12,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 20,
    marginBottom: 12,
  },
  refinementSuggestions: {
    marginBottom: 16,
  },
  refinementSuggestionsTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  suggestionChipsScroll: {
    marginTop: 4,
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gold + "60",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  suggestionChipText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  preservationSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  preservationTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  preservationHint: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 16,
  },
  preservationChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preservationChip: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.textSecondary + "40",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  preservationChipActive: {
    backgroundColor: colors.gold + "20",
    borderColor: colors.gold,
    borderWidth: 2,
  },
  preservationChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  preservationChipTextActive: {
    color: colors.gold,
  },
  changesSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGold + "40",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    maxHeight: 200,
  },
  changesSectionTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  changesScroll: {
    maxHeight: 140,
  },
  changeItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  changeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  changeSeverity: {
    fontSize: 14,
  },
  changeSeverityMajor: {
    color: "#ff4444",
  },
  changeSeverityModerate: {
    color: "#ffaa00",
  },
  changeSeverityMinor: {
    color: "#00C851",
  },
  changeDescription: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
  },
  moreChangesText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  refineActionButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refineActionButtonDisabled: {
    opacity: 0.5,
  },
  refineActionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
