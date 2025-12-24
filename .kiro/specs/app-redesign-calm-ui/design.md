# Design Document

## Overview

This design document outlines a comprehensive redesign of the Midnight Court app to create a calm, clean, and beautiful user experience that significantly reduces cognitive load. The redesign focuses on visual harmony, intuitive interactions, and a cohesive design system that enhances productivity while maintaining the app's powerful functionality.

The design philosophy centers on "Calm Technology" principles: technology that works in the background, reduces anxiety, and amplifies human capabilities without demanding constant attention.

## Architecture

### Design System Foundation

**Visual Hierarchy Principles:**

- Primary: Core actions and content (high contrast, prominent placement)
- Secondary: Supporting actions and navigation (medium contrast, accessible)
- Tertiary: Metadata and decorative elements (low contrast, subtle)

**8-Point Grid System:**

- Base unit: 8px for all spacing, sizing, and positioning
- Rhythm: 8, 16, 24, 32, 40, 48, 56, 64px
- Typography: Line heights and margins aligned to 8px grid
- Components: All dimensions based on 8px increments

**Progressive Disclosure Strategy:**

- Level 1: Essential actions visible by default
- Level 2: Contextual actions appear on interaction
- Level 3: Advanced features accessible through dedicated flows

### Color Psychology & Accessibility

**Refined Color Palette:**

```javascript
// Primary Colors (Calm & Professional)
background: {
  primary: '#FAFBFC',      // Soft white (reduces eye strain)
  secondary: '#F7F9FA',    // Subtle gray (card backgrounds)
  tertiary: '#F1F3F5'      // Light gray (dividers, borders)
}

// Content Colors (High Readability)
text: {
  primary: '#1A1D21',      // Near black (AAA contrast)
  secondary: '#4A5568',    // Medium gray (AA contrast)
  tertiary: '#718096'      // Light gray (metadata)
}

// Accent Colors (Purposeful & Calm)
accent: {
  gold: '#B8860B',         // Refined gold (less saturated)
  goldLight: '#F4E4BC',    // Gold tint (backgrounds)
  success: '#38A169',      // Calm green
  warning: '#D69E2E',      // Warm amber
  error: '#E53E3E',        // Clear red
  info: '#3182CE'          // Trustworthy blue
}

// Interactive States
interactive: {
  hover: 'rgba(184, 134, 11, 0.08)',    // Subtle gold tint
  active: 'rgba(184, 134, 11, 0.12)',   // Slightly stronger
  focus: 'rgba(184, 134, 11, 0.24)',    // Clear focus ring
  disabled: 'rgba(74, 85, 104, 0.24)'   // Muted gray
}
```

**Dark Mode Adaptation:**

- Automatic system theme detection
- Smooth transitions between modes
- Preserved contrast ratios in both themes
- Reduced blue light in dark mode for evening use

### Typography System

**Font Hierarchy:**

```javascript
typography: {
  // Display (Hero sections, major headings)
  display: {
    family: 'Playfair Display',
    weight: 700,
    size: 32,
    lineHeight: 40,
    letterSpacing: -0.5
  },

  // Headings (Section titles, card headers)
  h1: { family: 'Inter', weight: 700, size: 24, lineHeight: 32 },
  h2: { family: 'Inter', weight: 600, size: 20, lineHeight: 28 },
  h3: { family: 'Inter', weight: 600, size: 18, lineHeight: 24 },

  // Body text (Content, descriptions)
  body: { family: 'Inter', weight: 400, size: 16, lineHeight: 24 },
  bodySmall: { family: 'Inter', weight: 400, size: 14, lineHeight: 20 },

  // UI elements (Buttons, labels, captions)
  button: { family: 'Inter', weight: 600, size: 16, lineHeight: 24 },
  caption: { family: 'Inter', weight: 500, size: 12, lineHeight: 16 },
  overline: { family: 'Inter', weight: 600, size: 11, lineHeight: 16, letterSpacing: 1.2 }
}
```

## Components and Interfaces

### Core Component Library

**1. Button System**

```javascript
// Primary Button (Main actions)
PrimaryButton: {
  background: accent.gold,
  color: background.primary,
  padding: '12px 24px',
  borderRadius: 8,
  minHeight: 44,
  typography: typography.button,
  states: {
    hover: { background: darken(accent.gold, 8%) },
    active: { background: darken(accent.gold, 12%) },
    disabled: { background: interactive.disabled, color: text.tertiary }
  }
}

// Secondary Button (Supporting actions)
SecondaryButton: {
  background: 'transparent',
  color: accent.gold,
  border: `1px solid ${accent.gold}`,
  padding: '11px 23px', // Adjusted for border
  states: {
    hover: { background: interactive.hover },
    active: { background: interactive.active }
  }
}

// Ghost Button (Subtle actions)
GhostButton: {
  background: 'transparent',
  color: text.secondary,
  padding: '12px 16px',
  states: {
    hover: { background: background.tertiary, color: text.primary }
  }
}
```

**2. Card System**

```javascript
// Base Card (Content containers)
BaseCard: {
  background: background.secondary,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${background.tertiary}`,
  shadow: '0 2px 8px rgba(26, 29, 33, 0.04)',
  states: {
    hover: { shadow: '0 4px 16px rgba(26, 29, 33, 0.08)' },
    active: { border: `1px solid ${accent.gold}` }
  }
}

// Interactive Card (Clickable items)
InteractiveCard: {
  extends: BaseCard,
  cursor: 'pointer',
  transition: 'all 200ms ease',
  states: {
    hover: {
      transform: 'translateY(-2px)',
      shadow: '0 8px 24px rgba(26, 29, 33, 0.12)'
    }
  }
}
```

**3. Input System**

```javascript
// Text Input (Form fields)
TextInput: {
  background: background.primary,
  border: `1px solid ${background.tertiary}`,
  borderRadius: 8,
  padding: '12px 16px',
  minHeight: 44,
  typography: typography.body,
  states: {
    focus: {
      border: `2px solid ${accent.gold}`,
      padding: '11px 15px', // Adjusted for thicker border
      outline: 'none'
    },
    error: { border: `2px solid ${accent.error}` }
  }
}

// Search Input (With icon)
SearchInput: {
  extends: TextInput,
  paddingLeft: 44, // Space for search icon
  icon: {
    position: 'absolute',
    left: 16,
    color: text.tertiary
  }
}
```

### Screen-Specific Components

**1. Home Screen Redesign**

```javascript
HeroSection: {
  layout: 'centered',
  padding: '48px 24px',
  maxWidth: 480,
  components: {
    logo: { size: 'large', color: accent.gold },
    title: { typography: typography.display, color: text.primary },
    subtitle: { typography: typography.body, color: text.secondary },
    cta: { component: 'PrimaryButton', prominence: 'high' }
  }
}

ActionGrid: {
  layout: 'grid',
  columns: 1, // Mobile-first
  gap: 16,
  components: {
    actionCard: {
      component: 'InteractiveCard',
      layout: 'horizontal', // Icon + text side by side
      padding: 20,
      icon: { size: 32, marginRight: 16 },
      content: {
        title: { typography: typography.h3, color: text.primary },
        description: { typography: typography.bodySmall, color: text.secondary }
      }
    }
  }
}
```

**2. Template Selection Redesign**

```javascript
TemplateGrid: {
  layout: 'masonry', // Adaptive grid
  columns: { mobile: 1, tablet: 2, desktop: 3 },
  gap: 20,
  components: {
    templateCard: {
      component: 'InteractiveCard',
      aspectRatio: '4:3',
      preview: {
        background: background.tertiary,
        borderRadius: '8px 8px 0 0',
        height: '60%'
      },
      content: {
        padding: 16,
        title: { typography: typography.h3 },
        description: { typography: typography.bodySmall },
        metadata: { typography: typography.caption, color: text.tertiary }
      }
    }
  }
}

FilterBar: {
  layout: 'horizontal',
  padding: '16px 24px',
  background: background.secondary,
  components: {
    searchInput: { component: 'SearchInput', flex: 1 },
    filterChips: {
      layout: 'horizontal',
      gap: 8,
      marginLeft: 16
    }
  }
}
```

**3. Block Editor Redesign**

```javascript
EditorToolbar: {
  position: 'sticky',
  top: 0,
  background: background.primary,
  borderBottom: `1px solid ${background.tertiary}`,
  padding: '12px 24px',
  components: {
    backButton: { component: 'GhostButton' },
    title: { typography: typography.h2, flex: 1, textAlign: 'center' },
    actions: {
      layout: 'horizontal',
      gap: 8,
      components: ['saveButton', 'exportButton', 'moreButton']
    }
  }
}

BlockContainer: {
  padding: '8px 24px',
  components: {
    blockWrapper: {
      marginBottom: 16,
      borderRadius: 8,
      states: {
        selected: {
          background: accent.goldLight,
          border: `2px solid ${accent.gold}`
        },
        hover: {
          background: background.tertiary
        }
      }
    },
    insertButton: {
      component: 'GhostButton',
      width: '100%',
      height: 44,
      border: `2px dashed ${background.tertiary}`,
      states: {
        hover: { border: `2px dashed ${accent.gold}` }
      }
    }
  }
}
```

## Data Models

### Theme Configuration Model

```javascript
ThemeConfig: {
  mode: 'light' | 'dark' | 'auto',
  accessibility: {
    highContrast: boolean,
    reducedMotion: boolean,
    fontSize: 'small' | 'medium' | 'large' | 'extraLarge'
  },
  preferences: {
    compactMode: boolean,
    showAnimations: boolean,
    autoSave: boolean
  }
}
```

### Component State Model

```javascript
ComponentState: {
  id: string,
  type: 'button' | 'card' | 'input' | 'modal',
  state: 'default' | 'hover' | 'active' | 'focus' | 'disabled',
  variant: 'primary' | 'secondary' | 'ghost',
  size: 'small' | 'medium' | 'large',
  accessibility: {
    label: string,
    description?: string,
    role?: string
  }
}
```

### Animation Configuration Model

```javascript
AnimationConfig: {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300
  },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  transitions: {
    fadeIn: { opacity: [0, 1], duration: 'normal' },
    slideUp: { transform: ['translateY(20px)', 'translateY(0)'], duration: 'normal' },
    scaleIn: { transform: ['scale(0.95)', 'scale(1)'], duration: 'fast' }
  }
}
```

## Error Handling

### User-Friendly Error States

**1. Network Errors**

- Gentle messaging: "Having trouble connecting"
- Retry mechanisms with exponential backoff
- Offline mode indicators
- Cached content availability

**2. Validation Errors**

- Inline validation with helpful suggestions
- Progressive error disclosure
- Clear recovery paths
- Contextual help links

**3. System Errors**

- Graceful degradation of features
- Error boundaries with fallback UI
- Automatic error reporting (with user consent)
- Recovery suggestions and alternative workflows

### Error UI Components

```javascript
ErrorBoundary: {
  fallback: {
    component: 'BaseCard',
    padding: 32,
    textAlign: 'center',
    icon: { name: 'alert-circle', size: 48, color: accent.warning },
    title: { typography: typography.h2, marginTop: 16 },
    description: { typography: typography.body, color: text.secondary },
    actions: {
      layout: 'horizontal',
      gap: 16,
      marginTop: 24,
      components: ['retryButton', 'reportButton']
    }
  }
}

InlineError: {
  background: lighten(accent.error, 95%),
  border: `1px solid ${lighten(accent.error, 80%)}`,
  borderRadius: 6,
  padding: '8px 12px',
  marginTop: 4,
  icon: { name: 'alert-triangle', size: 16, color: accent.error },
  text: { typography: typography.bodySmall, color: accent.error, marginLeft: 8 }
}
```

## Testing Strategy

### Visual Regression Testing

- Automated screenshot comparison across devices
- Component library visual testing
- Theme switching validation
- Accessibility compliance verification

### Usability Testing Protocol

**1. Cognitive Load Assessment**

- Task completion time measurement
- Error rate tracking
- User satisfaction surveys (SUS scale)
- Eye-tracking studies for attention patterns

**2. Accessibility Testing**

- Screen reader navigation testing
- Keyboard-only interaction testing
- Color contrast validation
- Motor impairment simulation

**3. Performance Testing**

- Animation frame rate monitoring
- Touch response time measurement
- Memory usage optimization
- Battery impact assessment

### A/B Testing Framework

**Test Scenarios:**

- Button placement and sizing variations
- Color palette preferences
- Navigation pattern effectiveness
- Content density optimization

**Metrics:**

- Task completion rates
- User engagement duration
- Feature adoption rates
- Error recovery success rates

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

- Design system implementation
- Core component library
- Theme configuration system
- Basic accessibility features

### Phase 2: Core Screens (Weeks 3-4)

- Home screen redesign
- Template selection redesign
- Navigation improvements
- Search and filtering enhancements

### Phase 3: Editor Experience (Weeks 5-6)

- Block editor redesign
- Improved toolbar and controls
- Enhanced block insertion flow
- Drag and drop improvements

### Phase 4: Polish & Optimization (Weeks 7-8)

- Animation implementation
- Performance optimization
- Advanced accessibility features
- User testing and refinements

## Success Metrics

### Quantitative Metrics

- 30% reduction in task completion time
- 50% decrease in user errors
- 25% improvement in user satisfaction scores
- 40% increase in feature discoverability

### Qualitative Metrics

- Improved user feedback sentiment
- Reduced support ticket volume
- Increased user retention rates
- Enhanced professional perception of the app

## Accessibility Compliance

### WCAG 2.1 AA Standards

- Color contrast ratios ≥ 4.5:1 for normal text
- Color contrast ratios ≥ 3:1 for large text
- Minimum touch target size of 44x44 points
- Keyboard navigation support for all interactive elements

### Inclusive Design Features

- Dynamic font sizing support
- High contrast mode option
- Reduced motion preferences
- Screen reader optimization
- Voice control compatibility

This design document provides a comprehensive blueprint for transforming Midnight Court into a calm, clean, and beautiful application that significantly reduces cognitive load while maintaining its powerful functionality. The design system ensures consistency, accessibility, and scalability for future enhancements.
