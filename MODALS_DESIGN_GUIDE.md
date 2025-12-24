# AI Modals Design Enhancement Guide

## Overview

This guide provides the design system updates needed for the AI Slide Generator Modal and AI Citation Search Modal to match the modern design system used throughout the application.

## Design System Reference

### Import Statement

```javascript
import {
  lightColors,
  sizing,
  spacing,
  typography,
} from "../theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
```

### Color Replacements

Replace all `colors.` references with `lightColors.`:

| Old (Legacy)           | New (Design System)                |
| ---------------------- | ---------------------------------- |
| `colors.background`    | `lightColors.background.primary`   |
| `colors.card`          | `lightColors.background.secondary` |
| `colors.border`        | `lightColors.background.tertiary`  |
| `colors.text`          | `lightColors.text.primary`         |
| `colors.textPrimary`   | `lightColors.text.primary`         |
| `colors.textSecondary` | `lightColors.text.secondary`       |
| `colors.gold`          | `lightColors.accent.gold`          |
| `colors.ivory`         | `lightColors.background.primary`   |

## SlideGeneratorModal Enhancements

### 1. Header Section

```javascript
// Replace header styles
header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.md, // 16px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.secondary,
},

headerTitle: {
    ...typography.h2,
    color: lightColors.accent.gold,
    fontWeight: '600',
},

closeButton: {
    width: sizing.touchTarget, // 44px
    height: sizing.touchTarget,
    borderRadius: sizing.touchTarget / 2,
    backgroundColor: lightColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
},
```

### 2. Container & Background

```javascript
container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
},

scrollView: {
    flex: 1,
},
```

### 3. Section Styling

```javascript
section: {
    padding: spacing.lg, // 24px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
},

sectionTitle: {
    ...typography.h3,
    color: lightColors.accent.gold,
    marginBottom: spacing.sm, // 8px
    fontWeight: '600',
},

sectionHint: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    marginBottom: spacing.md, // 16px
    lineHeight: 20,
},
```

### 4. Text Input

```javascript
textInput: {
    backgroundColor: lightColors.background.secondary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.md, // 16px
    ...typography.body,
    color: lightColors.text.primary,
    minHeight: 200,
    textAlignVertical: 'top',
},

charCount: {
    ...typography.caption,
    color: lightColors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs, // 4px
},

charCountWarning: {
    color: lightColors.accent.warning,
},

charCountError: {
    color: lightColors.accent.error,
},
```

### 5. Analysis Panel

```javascript
analysisPanel: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginTop: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
},

analysisTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.md, // 16px,
    fontWeight: '600',
},

completenessScore: {
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.xs, // 4px
    borderRadius: sizing.radiusSm, // 6px
    backgroundColor: lightColors.background.tertiary,
},

completenessGood: {
    backgroundColor: lightColors.accent.success,
},

completenessOkay: {
    backgroundColor: lightColors.accent.warning,
},

completenessLow: {
    backgroundColor: lightColors.accent.error,
},
```

### 6. Slide Count Selector

```javascript
slideCountButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightColors.background.secondary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
},

slideCountButtonActive: {
    backgroundColor: lightColors.accent.gold,
    borderColor: lightColors.accent.gold,
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
},

slideCountButtonText: {
    ...typography.h3,
    color: lightColors.text.primary,
    fontWeight: '600',
},

slideCountButtonTextActive: {
    color: lightColors.background.primary,
},
```

### 7. Template Cards

```javascript
templateCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginBottom: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
},

templateCardSelected: {
    borderColor: lightColors.accent.gold,
    borderWidth: sizing.borderMedium, // 2px
    backgroundColor: lightColors.accent.goldLight,
    shadowColor: lightColors.accent.gold,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
},

templateName: {
    ...typography.h3,
    color: lightColors.text.primary,
    fontWeight: '600',
},

templateDescription: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    marginTop: spacing.xs, // 4px
    lineHeight: 20,
},
```

### 8. Generate Button

```javascript
generateButton: {
    backgroundColor: lightColors.accent.gold,
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: spacing.xl, // 32px
    borderRadius: sizing.radiusLg, // 12px
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg, // 24px
    marginVertical: spacing.lg,
    minHeight: sizing.touchTarget, // 44px
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
},

generateButtonDisabled: {
    backgroundColor: lightColors.background.tertiary,
    opacity: 0.6,
},

generateButtonText: {
    ...typography.button,
    color: lightColors.background.primary,
    fontSize: 16,
    fontWeight: '600',
},
```

### 9. Preview Cards

```javascript
previewCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginBottom: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
},

slideTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
    fontWeight: '600',
},

blockPreview: {
    backgroundColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusMd, // 8px
    padding: spacing.md, // 16px
    marginBottom: spacing.sm, // 8px
},

blockType: {
    ...typography.caption,
    color: lightColors.accent.gold,
    fontWeight: '600',
    marginBottom: spacing.xs, // 4px
    textTransform: 'uppercase',
},

blockText: {
    ...typography.bodySmall,
    color: lightColors.text.secondary,
    lineHeight: 20,
},
```

### 10. Quality Metrics

```javascript
qualitySection: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginTop: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
},

qualityOverallScore: {
    ...typography.display,
    fontSize: 48,
    color: lightColors.accent.gold,
    fontWeight: '700',
},

qualityScoreBar: {
    height: 8,
    backgroundColor: lightColors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.xs, // 4px
},

qualityScoreProgress: {
    height: '100%',
    borderRadius: 4,
},

progressExcellent: {
    backgroundColor: lightColors.accent.success,
},

progressGood: {
    backgroundColor: lightColors.accent.warning,
},

progressPoor: {
    backgroundColor: lightColors.accent.error,
},
```

## CitationSearchModal Enhancements

### 1. Modal Container

```javascript
modalContainer: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
},

modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.md, // 16px
    borderBottomWidth: sizing.borderThin,
    borderBottomColor: lightColors.background.tertiary,
    backgroundColor: lightColors.background.secondary,
},

modalTitle: {
    ...typography.h2,
    color: lightColors.accent.gold,
    fontWeight: '600',
},
```

### 2. Search Bar

```javascript
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    paddingHorizontal: spacing.md, // 16px
    margin: spacing.lg, // 24px
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
},

searchInput: {
    flex: 1,
    ...typography.body,
    color: lightColors.text.primary,
    paddingVertical: spacing.sm, // 8px
},

searchButton: {
    backgroundColor: lightColors.accent.gold,
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm, // 8px
    borderRadius: sizing.radiusMd, // 8px
},
```

### 3. Result Cards

```javascript
resultCard: {
    backgroundColor: lightColors.background.secondary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    marginHorizontal: spacing.lg, // 24px
    marginBottom: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
},

resultTitle: {
    ...typography.h3,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
    fontWeight: '600',
},

resultText: {
    ...typography.body,
    color: lightColors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.sm, // 8px
},

resultMeta: {
    ...typography.caption,
    color: lightColors.text.tertiary,
},
```

### 4. Loading & Empty States

```javascript
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxxxl, // 64px
},

loadingText: {
    ...typography.body,
    color: lightColors.text.secondary,
    marginTop: spacing.md, // 16px
},

emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // 32px
    paddingVertical: spacing.xxxxxl, // 64px
},

emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: lightColors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg, // 24px
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
},

emptyText: {
    ...typography.h2,
    color: lightColors.text.primary,
    marginBottom: spacing.sm, // 8px
    textAlign: 'center',
},

emptySubtext: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
},
```

## Icon Replacements

Replace emoji icons with Ionicons:

| Emoji | Ionicon         |
| ----- | --------------- |
| ✕     | `close`         |
| 🎨    | `color-palette` |
| 📝    | `document-text` |
| 📊    | `bar-chart`     |
| 📋    | `clipboard`     |
| ⚖️    | `scale`         |
| 🔍    | `search`        |
| ✨    | `sparkles`      |
| ⚠️    | `warning`       |
| ✓     | `checkmark`     |
| 📅    | `calendar`      |
| 🏆    | `trophy`        |
| 📈    | `trending-up`   |

## Implementation Steps

1. **Update Imports**: Add design system and Ionicons imports
2. **Replace Colors**: Update all color references to use `lightColors`
3. **Update Typography**: Apply typography system to all text elements
4. **Update Spacing**: Use spacing constants from design system
5. **Replace Emojis**: Convert emoji icons to Ionicons
6. **Update Shadows**: Apply consistent shadow system
7. **Update Border Radius**: Use sizing constants for border radius
8. **Test Accessibility**: Ensure proper touch targets and contrast

## Benefits

✅ **Visual Consistency** - Matches all other screens
✅ **Professional Appearance** - Clean, modern aesthetic
✅ **Better Accessibility** - Proper touch targets and contrast
✅ **Icon Consistency** - Ionicons throughout
✅ **Maintainability** - Uses centralized design system
✅ **Scalability** - Easy to update globally

## Notes

- Both modals are complex with many features
- Focus on visual updates without changing logic
- Maintain all existing functionality
- Test thoroughly after updates
- Consider breaking down into smaller components for easier maintenance

This guide provides all the styling updates needed to bring both AI modals in line with the modern design system used throughout the application.
