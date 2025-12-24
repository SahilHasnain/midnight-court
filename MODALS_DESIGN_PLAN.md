# AI Modals Design Enhancement Plan

## Overview

Both AI modals (Slide Generator and Citation Search) need to be enhanced with the modern design system to match the rest of the application.

## Current State

- **SlideGeneratorModal**: Complex modal with dark theme, emojis, and legacy styling
- **CitationSearchModal**: Dark theme with inconsistent styling

## Design System to Apply

### Colors

- Background Primary: `#FAFBFC`
- Background Secondary: `#F7F9FA`
- Background Tertiary: `#F1F3F5`
- Text Primary: `#1A1D21`
- Text Secondary: `#4A5568`
- Text Tertiary: `#718096`
- Accent Gold: `#B8860B`
- Accent Gold Light: `#F4E4BC`

### Typography

- Display: 32px (Modal titles)
- H2: 20px (Section titles)
- H3: 18px (Subheadings)
- Body: 16px (Content)
- Body Small: 14px (Labels)
- Caption: 12px (Metadata)

### Spacing (8-point grid)

- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

### Components

- Ionicons instead of emojis
- Consistent border radius (8px, 12px, 16px)
- Subtle shadows (opacity 0.04-0.06)
- Proper touch targets (44px minimum)

## Key Enhancements

### SlideGeneratorModal

1. **Header**: Clean header with close button and title
2. **Input Section**: Enhanced textarea with character count
3. **Analysis Panel**: Cleaner design with progress indicators
4. **Slide Count Selector**: Better button styling
5. **Template Selector**: Card-based design
6. **Generate Button**: Prominent gold button
7. **Preview Section**: Clean slide preview cards
8. **Quality Metrics**: Professional score display

### CitationSearchModal

1. **Header**: Consistent with other modals
2. **Search Bar**: Enhanced with icon and clear button
3. **Results**: Card-based layout with better spacing
4. **Loading State**: Gold activity indicator
5. **Empty State**: Icon container with helpful message

## Implementation Approach

Due to the complexity and size of these files, I'll:

1. Focus on the most critical styling updates
2. Update imports to use design system
3. Enhance key visual elements
4. Maintain all existing functionality
5. Replace emojis with Ionicons where appropriate
