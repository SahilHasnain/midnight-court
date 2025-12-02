# Midnight Court - Legal Presentation Builder

## Project Overview

Midnight Court is a React Native mobile app designed specifically for legal professionals to create, edit, and export professional courtroom presentations. Built with Expo Router, it provides a rich block-based editor with PDF export capabilities.

## Tech Stack

- **Framework**: React Native (0.81.5) + Expo (~54.0.25)
- **Routing**: Expo Router (~6.0.15)
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: AsyncStorage for auto-save and template persistence
- **PDF Generation**: expo-print (~15.0.7)
- **Image Handling**: expo-image-picker (~17.0.8)
- **Fonts**: Playfair Display (headings), Inter (body)
- **Language**: JavaScript with JSX

## Project Structure

```
midnight-court/
├── app/                      # Expo Router screens
│   ├── index.jsx            # Home/landing screen
│   ├── _layout.jsx          # Root layout
│   ├── editor/
│   │   └── index.jsx        # Main presentation editor
│   ├── templates/
│   │   └── index.jsx        # Template selection screen
│   └── export/
│       └── index.jsx        # PDF preview & export
├── components/
│   ├── GoldButton.jsx       # Primary action button
│   ├── SaveTemplateModal.jsx  # Custom template save dialog
│   └── blocks/              # Block system
│       ├── BlockPicker.jsx  # Block type selector modal
│       ├── BlockRenderer.jsx # Render blocks in editor
│       └── blockTypes.js    # Block definitions & metadata
├── utils/
│   ├── blockRenderer.js     # Block to HTML converter for PDF
│   ├── templateData.js      # Template storage & management
│   └── dummyData.js         # Test mode sample data
├── theme/
│   └── colors.js            # Color constants
└── assets/
    └── images/              # App images
```

## Core Features

### 1. Block-Based Editor

**Block Types** (14 total):

- **Text**: Bullet points with markdown formatting (_gold_, ~red~, _blue_)
- **Paragraph**: Plain text block
- **Quote**: Legal citations with author/source
- **Callout**: Highlighted boxes with icons (⚠️ warning, ℹ️ info, ⚖️ law, 🎯 key)
- **Two Column**: Arguments vs Counter-arguments layout
- **Timeline**: Case progression with dates and events
- **Evidence**: Evidence cards with title, description, source
- **Section Header**: Large section dividers
- **Divider**: Visual separator line
- **Image**: Single image with caption and layout (center/left/right)
- **Image Grid**: 2x2 or 2x3 image gallery

**Block Features**:

- Insert blocks at any position (before first, between blocks)
- Delete blocks (minimum 1 per slide)
- Drag to reorder (planned)
- Rich markdown formatting in text fields

### 2. Slide Management

- **Multi-slide presentations** (unlimited slides)
- **Navigation**: Prev/Next buttons, dot indicators, direct jump
- **Slide operations**:
  - Insert Before: Add new slide before current
  - Insert After: Add new slide after current
  - Add at End: Append new slide
  - Delete: Remove current slide (minimum 1 slide required)
- **Slide structure**: Each slide has title, subtitle, and blocks array

### 3. Template System

**Quick Templates** (1-2 slides):

- Blank Slide: Empty slide with title/subtitle only
- Case Summary: Timeline + text overview
- Arguments: Two-column layout for arguments vs counter
- Legal Precedent: Quote + evidence blocks
- Verdict: Callout + conclusion structure

**Full Templates** (5-7 slides):

- Complete Case: 7-slide full presentation structure
- Habeas Corpus: 5-slide petition template

**Custom Templates**:

- Save any presentation as reusable template
- Choose name, description, and icon (8 emoji options)
- Stored in AsyncStorage
- Delete with confirmation dialog
- Loads all slides and blocks intact

### 4. Auto-Save System

- **Storage**: AsyncStorage with 1-second debounce
- **Data saved**: All slides, blocks, template reference, lastModified timestamp
- **Load priority**:
  1. Template if provided (via route params)
  2. Saved presentation if no template
- **Key**: `current_presentation`

### 5. PDF Export

**Process**:

1. Convert all blocks to HTML using `blockRenderer.js`
2. Parse markdown formatting (_gold_, ~red~, _blue_)
3. Handle images (convert to base64, group side-by-side layouts)
4. Apply styles (colors, fonts, spacing)
5. Generate PDF with expo-print
6. Share via native share sheet

**Image Layouts**:

- **Center**: Full width, centered
- **Left/Right**: Side-by-side with content (45%/50%/55% widths for small/medium/large)
- **Grid**: 2x2 or 2x3 responsive grid

**Side-by-Side Logic**:

- Groups consecutive floatLeft/floatRight images
- Uses flexbox with gap: 20px
- Content container: flex: 0 1 auto (natural width)
- Single source of truth for widths in export/index.jsx

### 6. Markdown Formatting

Supported in: titles, subtitles, text blocks, quotes, callouts, two-column, timeline

**Syntax**:

- `*text*` → Gold color (#CBA44A, bold)
- `~text~` → Red color (#ef4444, bold)
- `_text_` → Blue color (#3b82f6, bold)

**Rendering**:

- Editor: React Native Text components with color/fontWeight
- PDF: HTML spans with inline styles

### 7. Test Mode (Dev Only)

- Toggle with 🧪 button in editor header
- Loads professional dummy data (5 slides with all block types)
- Reset to empty slide on toggle off
- Only visible when `__DEV__ === true`

## Key Files Deep Dive

### app/editor/index.jsx (911 lines)

**State Management**:

- `slides`: Array of slide objects `[{ title, subtitle, blocks }]`
- `currentSlideIndex`: Active slide (0-based)
- `blockPickerVisible`: Modal visibility
- `insertPosition`: Track where to insert new block
- `saveTemplateVisible`: Custom template save modal

**Key Functions**:

- `updateBlock(blockId, updatedBlock)`: Modify specific block
- `addBlock(blockType)`: Insert block at position or append
- `openInsertPicker(position)`: Show BlockPicker at position
- `deleteBlock(blockId)`: Remove block (min 1 check)
- `insertSlideBefore/After()`: Slide insertion with index adjustment
- `deleteSlide()`: Remove slide (min 1 check)
- `handleSaveTemplate()`: Save to custom templates
- `goToExport()`: Navigate with slides as JSON param

**Effects**:

- Template/AsyncStorage loading with priority logic
- Auto-save with 1s debounce

### utils/templateData.js (615+ lines)

**Exports**:

- `QUICK_TEMPLATES`: Object with 5 quick templates
- `FULL_TEMPLATES`: Object with 2 full templates
- `getTemplateById(id, type)`: Get quick/full template
- `getAllTemplates()`: Return all templates grouped by type
- `saveCustomTemplate(name, desc, slides, icon)`: Save to AsyncStorage
- `getCustomTemplates()`: Load all custom templates
- `deleteCustomTemplate(id)`: Remove custom template
- `getCustomTemplateById(id)`: Get specific custom template

**Storage Key**: `custom_templates`

**Template Structure**:

```javascript
{
    id: 'template_id',
    name: 'Template Name',
    description: 'Brief description',
    icon: '⚖️',
    type: 'quick' | 'full' | 'custom',
    slides: [
        {
            title: 'Slide Title',
            subtitle: 'Slide Subtitle',
            blocks: [
                {
                    id: 'unique_id',
                    type: BLOCK_TYPES.TEXT,
                    data: { points: ['Point 1', 'Point 2'] }
                }
            ]
        }
    ]
}
```

### utils/blockRenderer.js (343 lines)

**Purpose**: Convert blocks to HTML for PDF generation

**Main Function**: `renderBlockToHTML(block)`

- Switches on block.type
- Calls specific renderer for each block type
- Returns HTML string with inline styles

**Block Renderers**:

- `renderTextBlock()`: Bullet list with markdown parsing
- `renderParagraphBlock()`: Simple p tag
- `renderQuoteBlock()`: Blockquote with citation
- `renderCalloutBlock()`: Colored box with icon
- `renderTwoColumnBlock()`: Flex two-column layout
- `renderTimelineBlock()`: Vertical timeline with dots
- `renderEvidenceBlock()`: Evidence card layout
- `renderSectionHeaderBlock()`: Large centered heading
- `renderDividerBlock()`: HR with styling
- `renderImageBlock()`: img with caption
- `renderImageGridBlock()`: Grid with gap

**Markdown Parser**: `parseMarkdownToHTML(text)`

- Uses regex to replace _text_, ~text~, _text_
- Returns HTML with span tags and inline color/font styles

### app/export/index.jsx

**Purpose**: PDF preview and export

**Key Functions**:

- `renderBlocksWithGrouping()`: Group side-by-side images
- `convertImageToBase64()`: Convert local images for PDF
- `generatePDFHTML()`: Create full HTML document
- `handleExportPDF()`: Call expo-print and share

**Side-by-Side Grouping**:

- Detects consecutive floatLeft/floatRight images
- Creates flex container with gap: 20px
- Image column: 45%/50%/55% based on size
- Content column: flex: 0 1 auto
- Flex direction: row for floatLeft, row-reverse for floatRight

### components/blocks/blockTypes.js (215 lines)

**Exports**:

- `BLOCK_TYPES`: Object with all block type constants
- `BLOCK_METADATA`: UI display info (name, icon, description)
- `createDefaultBlock(type)`: Factory function for new blocks

**Default Data Structures**:

- TEXT: `{ points: [''], highlightFirst: false }`
- PARAGRAPH: `{ text: '' }`
- QUOTE: `{ text: '', author: '', citation: '' }`
- CALLOUT: `{ text: '', type: 'warning' }`
- TWO_COLUMN: `{ left: { title: '', points: [] }, right: { title: '', points: [] } }`
- TIMELINE: `{ events: [{ date: '', event: '' }] }`
- EVIDENCE: `{ title: '', description: '', source: '' }`
- SECTION_HEADER: `{ title: '' }`
- DIVIDER: `{}`
- IMAGE: `{ uri: '', caption: '', layout: 'center', size: 'medium' }`
- IMAGE_GRID: `{ images: [], layout: '2x2' }`

### components/blocks/BlockRenderer.jsx

**Purpose**: Render blocks in editor with edit controls

**Features**:

- Delete button (trash icon)
- Type-specific editing UI
- Real-time updates via onChange callback
- Image picker integration
- Markdown formatting preview

### components/SaveTemplateModal.jsx

**UI Elements**:

- Template name input (required, max 50 chars)
- Description textarea (optional, max 150 chars)
- Icon picker grid (8 emoji options)
- Cancel/Save buttons

**Validation**:

- Name required check
- Trim whitespace
- Reset form on save/cancel

## Color Theme (theme/colors.js)

```javascript
{
    background: '#0D0D0D',      // Deep black
    surface: '#1A1A1A',         // Card background
    card: '#1F1F1F',            // Slightly lighter
    text: '#F5F5F5',            // Main text
    textSecondary: '#A0A0A0',   // Muted text
    gold: '#CBA44A',            // Primary accent
    borderGold: '#3D3226',      // Subtle gold border
    border: '#2A2A2A'           // Standard border
}
```

## Navigation Flow

```
index.jsx (home)
    ↓ (Choose template button)
templates/index.jsx
    ↓ (Select template: quick/full/custom)
editor/index.jsx
    ↓ (Continue to Export)
export/index.jsx
    ↓ (Export PDF / Share)
```

## Data Flow

### Template Loading

1. User taps template in templates/index.jsx
2. Routes to editor with `{ template: 'id', templateType: 'quick'|'full'|'custom' }`
3. Editor useEffect checks templateType
4. Loads from QUICK_TEMPLATES, FULL_TEMPLATES, or AsyncStorage
5. Sets slides state with template data

### Auto-Save

1. Slides state changes
2. useEffect triggers with 1s debounce
3. Saves to AsyncStorage as `current_presentation`
4. Includes: slides, template, lastModified

### Block Insertion

1. User taps "+" between blocks or before first block
2. `openInsertPicker(position)` called
3. Sets `insertPosition` state
4. Opens BlockPicker modal
5. User selects block type
6. `addBlock(type)` inserts at position via splice
7. BlockPicker closes, insertPosition reset

### PDF Export

1. User taps "Continue to Export" in editor
2. Routes to export with slides as JSON param
3. Export screen parses JSON
4. Renders preview with same blocks
5. User taps "Export PDF"
6. Converts each block to HTML via blockRenderer.js
7. Groups side-by-side images
8. Converts images to base64
9. Generates full HTML document
10. expo-print creates PDF
11. Native share sheet opens

## Known Patterns

### Slide Structure

```javascript
{
    title: 'string',
    subtitle: 'string',
    blocks: [
        { id: 'unique', type: 'blockType', data: {...} }
    ]
}
```

### Block ID Generation

- `Date.now().toString() + index` for templates
- Ensures uniqueness across all blocks

### Conditional Rendering

- Delete buttons hidden when only 1 block/slide remains
- Test mode button only in `__DEV__`
- Insert button hidden after last block
- Custom template delete button only for type='custom'

### Error Handling

- Minimum 1 block/slide enforced
- Template loading fallback to AsyncStorage
- AsyncStorage errors caught and logged
- Alert dialogs for user feedback

## Performance Considerations

- Debounced auto-save (1s) prevents excessive writes
- Image base64 conversion only on export
- Block rendering optimized with map and keys
- AsyncStorage async operations with try-catch

## Future Enhancements (Not Implemented)

- Block drag-to-reorder
- Real-time collaboration
- Cloud sync
- Advanced PDF styling options
- Template marketplace
- Analytics/usage tracking
