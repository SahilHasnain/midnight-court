/**
 * TemplatePreview Component
 * 
 * Template preview functionality with better visual representation.
 * Features:
 * - Template preview thumbnails with consistent aspect ratios
 * - Template information cards with clear hierarchy
 * - Usage statistics and last modified dates
 * - Loading states and error handling
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors, sizing, spacing, typography } from '../../theme/designSystem';

const TemplatePreview = ({ 
  template, 
  onClose,
  style 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    generatePreview();
  }, [template]);

  const generatePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate preview generation delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!template || !template.slides) {
        throw new Error('Invalid template data');
      }

      // Generate preview data
      const preview = {
        slides: template.slides.map((slide, index) => ({
          id: index,
          title: slide.title || `Slide ${index + 1}`,
          subtitle: slide.subtitle || '',
          blockCount: slide.blocks ? slide.blocks.length : 0,
          preview: generateSlidePreview(slide)
        })),
        metadata: {
          totalSlides: template.slides.length,
          totalBlocks: template.slides.reduce((sum, slide) => 
            sum + (slide.blocks ? slide.blocks.length : 0), 0
          ),
          estimatedDuration: calculateEstimatedDuration(template.slides),
          lastModified: template.lastModified || template.createdAt,
          templateType: template.type || 'custom'
        }
      };

      setPreviewData(preview);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlidePreview = (slide) => {
    // Generate a simple text-based preview of the slide content
    const elements = [];
    
    if (slide.title) {
      elements.push({ type: 'title', content: slide.title });
    }
    
    if (slide.subtitle) {
      elements.push({ type: 'subtitle', content: slide.subtitle });
    }

    if (slide.blocks) {
      slide.blocks.forEach(block => {
        switch (block.type) {
          case 'text':
            if (block.data?.points) {
              elements.push({ 
                type: 'bullets', 
                content: block.data.points.slice(0, 3) // Show first 3 points
              });
            }
            break;
          case 'quote':
            if (block.data?.quote) {
              elements.push({ 
                type: 'quote', 
                content: block.data.quote.substring(0, 100) + '...'
              });
            }
            break;
          case 'callout':
            if (block.data?.title) {
              elements.push({ 
                type: 'callout', 
                content: block.data.title
              });
            }
            break;
          default:
            elements.push({ 
              type: 'block', 
              content: `${block.type} block`
            });
        }
      });
    }

    return elements.slice(0, 5); // Limit preview elements
  };

  const calculateEstimatedDuration = (slides) => {
    // Rough estimation: 1-2 minutes per slide
    const minutes = slides.length * 1.5;
    return `${Math.round(minutes)} min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <ErrorState error={error} onRetry={generatePreview} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.templateIcon}>{template.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </View>
        </View>
      </View>

      {/* Metadata Cards */}
      <View style={styles.metadataSection}>
        <Text style={styles.sectionTitle}>Template Information</Text>
        
        <View style={styles.metadataGrid}>
          <MetadataCard
            icon="📑"
            label="Slides"
            value={previewData.metadata.totalSlides}
          />
          <MetadataCard
            icon="🧩"
            label="Blocks"
            value={previewData.metadata.totalBlocks}
          />
          <MetadataCard
            icon="⏱️"
            label="Duration"
            value={previewData.metadata.estimatedDuration}
          />
          <MetadataCard
            icon="📅"
            label="Modified"
            value={formatDate(previewData.metadata.lastModified)}
            isDate
          />
        </View>
      </View>

      {/* Slide Previews */}
      <View style={styles.slidesSection}>
        <Text style={styles.sectionTitle}>Slide Preview</Text>
        
        {previewData.slides.map((slide, index) => (
          <SlidePreviewCard
            key={slide.id}
            slide={slide}
            slideNumber={index + 1}
          />
        ))}
      </View>
    </ScrollView>
  );
};

// Loading State Component
const LoadingState = () => (
  <View style={styles.loadingContent}>
    <ActivityIndicator size="large" color={lightColors.accent.gold} />
    <Text style={styles.loadingText}>Generating preview...</Text>
  </View>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <View style={styles.errorContent}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorTitle}>Preview Error</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// Metadata Card Component
const MetadataCard = ({ icon, label, value, isDate = false }) => (
  <View style={styles.metadataCard}>
    <Text style={styles.metadataCardIcon}>{icon}</Text>
    <Text style={styles.metadataCardLabel}>{label}</Text>
    <Text style={[
      styles.metadataCardValue,
      isDate && styles.metadataCardValueDate
    ]}>
      {value}
    </Text>
  </View>
);

// Slide Preview Card Component
const SlidePreviewCard = ({ slide, slideNumber }) => (
  <View style={styles.slideCard}>
    <View style={styles.slideHeader}>
      <Text style={styles.slideNumber}>Slide {slideNumber}</Text>
      <Text style={styles.slideBlockCount}>{slide.blockCount} blocks</Text>
    </View>
    
    <View style={styles.slideContent}>
      {slide.title && (
        <Text style={styles.slideTitle} numberOfLines={2}>
          {slide.title}
        </Text>
      )}
      
      {slide.subtitle && (
        <Text style={styles.slideSubtitle} numberOfLines={1}>
          {slide.subtitle}
        </Text>
      )}

      <View style={styles.slidePreview}>
        {slide.preview.map((element, index) => (
          <PreviewElement key={index} element={element} />
        ))}
      </View>
    </View>
  </View>
);

// Preview Element Component
const PreviewElement = ({ element }) => {
  switch (element.type) {
    case 'title':
      return <Text style={styles.previewTitle}>{element.content}</Text>;
    
    case 'subtitle':
      return <Text style={styles.previewSubtitle}>{element.content}</Text>;
    
    case 'bullets':
      return (
        <View style={styles.previewBullets}>
          {element.content.map((point, index) => (
            <Text key={index} style={styles.previewBullet}>
              • {point.substring(0, 50)}{point.length > 50 ? '...' : ''}
            </Text>
          ))}
        </View>
      );
    
    case 'quote':
      return (
        <View style={styles.previewQuote}>
          <Text style={styles.previewQuoteText}>"{element.content}"</Text>
        </View>
      );
    
    case 'callout':
      return (
        <View style={styles.previewCallout}>
          <Text style={styles.previewCalloutText}>{element.content}</Text>
        </View>
      );
    
    default:
      return (
        <View style={styles.previewBlock}>
          <Text style={styles.previewBlockText}>{element.content}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    alignItems: 'center',
    padding: spacing.xl, // 32px
  },

  loadingText: {
    ...typography.body,
    color: lightColors.text.secondary,
    marginTop: spacing.md, // 16px
  },

  errorContent: {
    alignItems: 'center',
    padding: spacing.xl, // 32px
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md, // 16px
  },

  errorTitle: {
    ...typography.h2,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
  },

  errorMessage: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg, // 24px
  },

  retryButton: {
    backgroundColor: lightColors.accent.gold,
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.sm, // 8px
    borderRadius: sizing.radiusMd, // 8px
  },

  retryButtonText: {
    ...typography.button,
    color: lightColors.background.primary,
  },

  header: {
    padding: spacing.lg, // 24px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  templateIcon: {
    fontSize: 48,
    marginRight: spacing.md, // 16px
  },

  headerText: {
    flex: 1,
  },

  templateName: {
    ...typography.h1,
    color: lightColors.text.primary,
    marginBottom: spacing.xs, // 4px
  },

  templateDescription: {
    ...typography.body,
    color: lightColors.text.secondary,
  },

  metadataSection: {
    padding: spacing.lg, // 24px
  },

  sectionTitle: {
    ...typography.h2,
    color: lightColors.text.primary,
    marginBottom: spacing.md, // 16px
  },

  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm, // 8px
  },

  metadataCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: lightColors.background.secondary,
    padding: spacing.md, // 16px
    borderRadius: sizing.radiusMd, // 8px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    alignItems: 'center',
  },

  metadataCardIcon: {
    fontSize: 24,
    marginBottom: spacing.xs, // 4px
  },

  metadataCardLabel: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    marginBottom: spacing.xs, // 4px
  },

  metadataCardValue: {
    ...typography.body,
    color: lightColors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },

  metadataCardValueDate: {
    fontSize: 12,
  },

  slidesSection: {
    padding: spacing.lg, // 24px
  },

  slideCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusMd, // 8px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    marginBottom: spacing.md, // 16px
    overflow: 'hidden',
  },

  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md, // 16px
    backgroundColor: lightColors.background.tertiary,
  },

  slideNumber: {
    ...typography.h3,
    color: lightColors.text.primary,
  },

  slideBlockCount: {
    ...typography.caption,
    color: lightColors.text.tertiary,
  },

  slideContent: {
    padding: spacing.md, // 16px
  },

  slideTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.xs, // 4px
  },

  slideSubtitle: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    marginBottom: spacing.sm, // 8px
    fontStyle: 'italic',
  },

  slidePreview: {
    gap: spacing.xs, // 4px
  },

  previewTitle: {
    ...typography.body,
    color: lightColors.text.primary,
    fontWeight: '600',
  },

  previewSubtitle: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    fontStyle: 'italic',
  },

  previewBullets: {
    gap: 2,
  },

  previewBullet: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    fontSize: 12,
  },

  previewQuote: {
    backgroundColor: lightColors.accent.goldLight,
    padding: spacing.sm, // 8px
    borderRadius: sizing.radiusSm, // 6px
    borderLeftWidth: 3,
    borderLeftColor: lightColors.accent.gold,
  },

  previewQuoteText: {
    ...typography.bodySmall,
    color: lightColors.text.primary,
    fontStyle: 'italic',
    fontSize: 12,
  },

  previewCallout: {
    backgroundColor: lightColors.background.tertiary,
    padding: spacing.sm, // 8px
    borderRadius: sizing.radiusSm, // 6px
  },

  previewCalloutText: {
    ...typography.bodySmall,
    color: lightColors.text.primary,
    fontWeight: '600',
    fontSize: 12,
  },

  previewBlock: {
    backgroundColor: lightColors.background.tertiary,
    padding: spacing.xs, // 4px
    borderRadius: sizing.radiusXs, // 4px
  },

  previewBlockText: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    fontSize: 10,
  },
});

export default TemplatePreview;