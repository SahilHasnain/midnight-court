import {
  deleteCustomTemplate,
  getAllTemplates,
  getCustomTemplates,
} from "@/utils/templateData";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterBar from "../../components/core/FilterBar";
import SkeletonLoader from "../../components/core/SkeletonLoader";
import TemplateGrid from "../../components/core/TemplateGrid";
import TemplatePreview from "../../components/core/TemplatePreview";
import {
  lightColors,
  sizing,
  spacing,
  typography,
} from "../../theme/designSystem";

export default function TemplateScreen() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates = getAllTemplates();

  // Load custom templates and initialize
  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      await loadCustomTemplates();
      // Simulate loading time for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Failed to initialize template screen:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomTemplates = async () => {
    const customs = await getCustomTemplates();
    setCustomTemplates(Object.values(customs));
  };

  // Combine all templates with counts for filter bar
  const getAllTemplatesWithCounts = () => {
    const allTemplates = [
      ...templates.quick.map((t) => ({ ...t, type: "quick" })),
      ...templates.full.map((t) => ({ ...t, type: "full" })),
      ...customTemplates.map((t) => ({ ...t, type: "custom" })),
    ];

    const counts = {
      quick: templates.quick.length,
      full: templates.full.length,
      custom: customTemplates.length,
    };

    return { allTemplates, counts };
  };

  // Filter templates based on search and active filters
  const getFilteredTemplates = () => {
    const { allTemplates } = getAllTemplatesWithCounts();

    let filtered = allTemplates;

    // Apply type filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((template) =>
        activeFilters.includes(template.type)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Get filter options with counts
  const getFilterOptions = () => {
    const { counts } = getAllTemplatesWithCounts();

    return [
      { id: "quick", label: "Quick Start", count: counts.quick },
      { id: "full", label: "Full Presentation", count: counts.full },
      { id: "custom", label: "Custom", count: counts.custom },
    ];
  };

  const handleTemplateSelect = (template) => {
    router.push({
      pathname: "/editor",
      params: {
        template: template.id,
        templateType: template.type,
      },
    });
  };

  const handleTemplatePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleTemplateDelete = async (template) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomTemplate(template.id);
              await loadCustomTemplates();
              Alert.alert("Success", "Template deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete template");
            }
          },
        },
      ]
    );
  };

  const filteredTemplates = getFilteredTemplates();
  const filterOptions = getFilterOptions();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Choose Your Template</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subheading}>
            Every great argument begins with structure
          </Text>
        </View>

        <FilterBar
          searchQuery=""
          activeFilters={[]}
          availableFilters={filterOptions}
          style={styles.filterBar}
        />

        <View style={styles.content}>
          <SkeletonLoader variant="card" count={3} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Choose Your Template</Text>
        <View style={styles.goldLine} />
        <Text style={styles.subheading}>
          Every great argument begins with structure
        </Text>
      </View>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        availableFilters={filterOptions}
        style={styles.filterBar}
      />

      {/* Template Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {filteredTemplates.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            activeFilters={activeFilters}
            onClearFilters={() => {
              setSearchQuery("");
              setActiveFilters([]);
            }}
          />
        ) : (
          <TemplateGrid
            templates={filteredTemplates}
            onTemplateSelect={handleTemplateSelect}
            onTemplatePreview={handleTemplatePreview}
            onTemplateDelete={handleTemplateDelete}
          />
        )}
      </ScrollView>

      {/* Template Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Template Preview</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {previewTemplate && (
            <TemplatePreview
              template={previewTemplate}
              onClose={() => setShowPreview(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Empty State Component
const EmptyState = ({ searchQuery, activeFilters, onClearFilters }) => {
  const hasSearch = searchQuery.length > 0;
  const hasFilters = activeFilters.length > 0;

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {hasSearch || hasFilters ? "🔍" : "📝"}
      </Text>
      <Text style={styles.emptyTitle}>
        {hasSearch || hasFilters
          ? "No Templates Found"
          : "No Custom Templates Yet"}
      </Text>
      <Text style={styles.emptyText}>
        {hasSearch || hasFilters
          ? "Try adjusting your search or filters to find templates."
          : "Create a presentation in the editor and save it as a template to see it here."}
      </Text>

      {(hasSearch || hasFilters) && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={onClearFilters}
        >
          <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },

  header: {
    paddingHorizontal: spacing.lg, // 24px
    paddingTop: spacing.xl, // 32px
    paddingBottom: spacing.lg, // 24px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
  },

  heading: {
    ...typography.display,
    color: lightColors.accent.gold,
    marginBottom: spacing.xs, // 4px
  },

  goldLine: {
    width: 60,
    height: 3,
    backgroundColor: lightColors.accent.gold,
    marginTop: spacing.sm, // 8px
    marginBottom: spacing.sm, // 8px
    borderRadius: sizing.radiusXs, // 4px
  },

  subheading: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    fontStyle: "italic",
    opacity: 0.9,
  },

  filterBar: {
    // Styling handled by FilterBar component
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.md, // 16px
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl, // 32px
    paddingVertical: spacing.xxxl, // 48px
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg, // 24px
  },

  emptyTitle: {
    ...typography.h2,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
    textAlign: "center",
  },

  emptyText: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg, // 24px
  },

  clearFiltersButton: {
    backgroundColor: lightColors.accent.gold,
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.sm, // 8px
    borderRadius: sizing.radiusMd, // 8px
  },

  clearFiltersButtonText: {
    ...typography.button,
    color: lightColors.background.primary,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.md, // 16px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
  },

  modalTitle: {
    ...typography.h2,
    color: lightColors.text.primary,
  },

  closeButton: {
    width: sizing.touchTarget, // 44px
    height: sizing.touchTarget, // 44px
    borderRadius: sizing.touchTarget / 2,
    backgroundColor: lightColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    ...typography.h3,
    color: lightColors.text.secondary,
  },
});
