# Midnight Court - AI Coding Agent Instructions

## Project Overview

Midnight Court is an Expo Router-based React Native app for building legal presentations. It features a block-based editor with AI-powered features using Google Gemini, focused on Indian law citations and professional slide generation.

## Architecture

- **Framework**: Expo Router for file-based navigation
- **Storage**: AsyncStorage for local persistence (single-user, serverless)
- **AI**: Google Gemini API with structured outputs (Zod schemas)
- **Theme**: Dark UI with gold accents (#CBA44A), Inter/Playfair Display fonts

## Key Components

- **Editor** (`app/editor/index.jsx`): Main slide builder with block system
- **Blocks** (`components/blocks/`): Modular content types (text, quote, timeline, etc.)
- **Modals** (`components/`): CitationSearchModal, ImageSearchModal, SlideGeneratorModal
- **APIs** (`utils/`): geminiAPI.js, citationAPI.js, imageSearchAPI.js

## Block System

Use `BLOCK_TYPES` from `components/blocks/blockTypes.js`:

- TEXT, PARAGRAPH, QUOTE, CALLOUT, TWO_COLUMN, TIMELINE, EVIDENCE, DIVIDER, SECTION_HEADER, IMAGE, IMAGE_GRID
- Render with `BlockRenderer`, create with `createDefaultBlock()`

## AI Integration Patterns

- **Citations**: `findCitations(query)` returns structured Indian law results
- **Slide Generation**: Gemini with custom prompts for legal content
- **Structured Outputs**: Always use `callGeminiWithSchema()` with Zod validation
- **Rate Limiting**: Built-in for Gemini free tier (2000 req/min)

## Text Formatting

Parse markdown-style formatting in text blocks:

- `*text*` → gold color
- `~text~` → red color
- `_text_` → blue color

## Development Workflow

```bash
npm install
npx expo start  # Then select platform
npx expo lint
```

## Environment Setup

- Set `EXPO_PUBLIC_GEMINI_KEY` in `.env` file
- Test Gemini connection via `/dev/gemini-test`

## File Organization

- `app/` - Screens (file-based routing)
- `components/` - Reusable UI components
- `utils/` - API clients and helpers
- `theme/` - Colors and styling constants
- `assets/` - Static files

## Common Patterns

- Use `SafeAreaView` with `react-native-safe-area-context`
- Gold buttons via `GoldButton` component
- Toast notifications via `Toast` component
- AsyncStorage keys: `'current_presentation'`, `'saved_images'`

## AI Features Status

- ✅ Citation search (Indian law)
- ✅ Slide generation
- ✅ Image search and management
- ✅ Template system
- 🚧 Export functionality (PDF/print)</content>
  <parameter name="filePath">c:\Users\MD SAHIL HASNAIN\Desktop\Projects\midnight-court\.github\copilot-instructions.md
