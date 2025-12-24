import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import SlideGeneratorModal from "../components/SlideGeneratorModal"
import ActionGrid, { createDefaultActions } from "../components/core/ActionGrid"
import ContinuePresentationCard from "../components/core/ContinuePresentationCard"
import HeroSection from "../components/core/HeroSection"
import { lightColors, spacing } from "../theme/designSystem"

export default function Index() {
  const [hasSavedPresentation, setHasSavedPresentation] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [showSlideGenerator, setShowSlideGenerator] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem('current_presentation');
        if (saved) {
          const data = JSON.parse(saved);
          setHasSavedPresentation(true);
          setSavedData(data);
        }
      } catch (error) {
        console.error('Failed to check saved presentation:', error);
      }
    };
    checkSaved();
  }, []);

  const continueSaved = () => {
    if (savedData && savedData.template) {
      router.push({
        pathname: "/editor",
        params: { template: savedData.template }
      });
    }
  };

  const handleUseGeneratedSlides = async (slides) => {
    try {
      const presentationData = {
        slides,
        template: 'custom',
        lastModified: new Date().toISOString()
      };
      await AsyncStorage.setItem('current_presentation', JSON.stringify(presentationData));
      router.push({
        pathname: "/editor",
        params: { template: 'custom' }
      });
    } catch (error) {
      console.error('Failed to save generated slides:', error);
    }
  };

  // Create actions with proper navigation handlers
  const actions = createDefaultActions(router);
  
  // Update AI generator action to show modal
  const updatedActions = actions.map(action => {
    if (action.id === 'ai-generator') {
      return {
        ...action,
        onPress: () => setShowSlideGenerator(true)
      };
    }
    return action;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Continue Presentation */}
        <HeroSection showAnimations={true}>
          {hasSavedPresentation && (
            <ContinuePresentationCard
              presentationData={savedData}
              onPress={continueSaved}
              showAnimation={true}
            />
          )}
        </HeroSection>

        {/* Action Grid */}
        <ActionGrid 
          actions={updatedActions}
          style={styles.actionGrid}
        />
      </ScrollView>

      <SlideGeneratorModal
        visible={showSlideGenerator}
        onClose={() => setShowSlideGenerator(false)}
        onUseSlides={handleUseGeneratedSlides}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.xl, // 32px
    minHeight: '100%',
  },

  actionGrid: {
    marginTop: spacing.xl, // 32px - increased spacing
    marginBottom: spacing.xl, // 32px
  },
});