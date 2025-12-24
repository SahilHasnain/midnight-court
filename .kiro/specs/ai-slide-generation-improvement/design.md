# Design Document: AI Slide Generation Improvement

## Overview

This design document outlines the architectural and implementation approach for improving the AI slide generation feature. The improvements focus on three core pillars:

1. **Enhanced AI Quality**: Improved prompts, validation, and legal accuracy
2. **Better User Experience**: Clearer feedback, templates, and refinement capabilities
3. **Robust Architecture**: Validation layers, retry logic, and quality metrics

The design maintains backward compatibility with existing slide structures while introducing new capabilities for professional legal presentation generation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Input Form   │  │ Template     │  │ Preview      │      │
│  │ with         │  │ Selector     │  │ Component    │      │
│  │ Validation   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generation Orchestration                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Input        │  │ Template     │  │ Refinement   │      │
│  │ Processor    │  │ Engine       │  │ Handler      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Generation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Enhanced     │  │ Retry Logic  │  │ Response     │      │
│  │ Prompt       │  │ with         │  │ Parser       │      │
│  │ Builder      │  │ Fallback     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Validation & Quality                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Structure    │  │ Legal        │  │ Quality      │      │
│  │ Validator    │  │ Accuracy     │  │ Metrics      │      │
│  │              │  │ Checker      │  │ Logger       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Cache & Storage                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Generation   │  │ Template     │  │ Metrics      │      │
│  │ Cache        │  │ Storage      │  │ Storage      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**User Interface Layer**

- Input validation and real-time feedback
- Template selection and preview
- Generated slide preview with formatting
- Refinement interface

**Generation Orchestration**

- Coordinates input processing, template application, and AI generation
- Manages generation workflow and state
- Handles refinement requests

**AI Generation Layer**

- Builds enhanced prompts with legal context
- Manages OpenAI API calls with retry logic
- Parses and validates responses

**Validation & Quality**

- Validates slide structure and content
- Checks legal accuracy and citation format
- Logs quality metrics for monitoring

**Cache & Storage**

- Caches successful generations
- Stores templates and user preferences
- Persists quality metrics

## Components and Interfaces

### 1. Enhanced Prompt Builder

**Purpose**: Constructs legally-informed, context-rich prompts for the AI

**Interface**:

```javascript
class EnhancedPromptBuilder {
  /**
   * Build a complete prompt with system instructions and user input
   * @param {Object} options
   * @param {string} options.input - User's case description
   * @param {string} options.template - Template type (optional)
   * @param {number} options.desiredSlideCount - User's preferred slide count (3-8)
   * @param {Object} options.refinementContext - Previous generation for refinement (optional)
   * @param {Object} options.preferences - User preferences (detail level)
   * @returns {Object} { systemPrompt, userPrompt, metadata }
   */
  buildPrompt(options)

  /**
   * Get template-specific system prompt additions
   * @param {string} templateType
   * @returns {string}
   */
  getTemplateInstructions(templateType)

  /**
   * Build refinement prompt that preserves context
   * @param {Object} previousGeneration
   * @param {string} refinementInstructions
   * @returns {Object}
   */
  buildRefinementPrompt(previousGeneration, refinementInstructions)
}
```

**Key Features**:

- Modular system prompt with legal context sections
- Template-specific instruction injection
- Refinement context preservation
- Dynamic example selection based on input analysis

### 2. Input Processor & Validator

**Purpose**: Analyzes and validates user input before generation

**Interface**:

```javascript
class InputProcessor {
  /**
   * Analyze input and extract key elements
   * @param {string} input
   * @returns {Object} { caseType, hasStatutes, hasFacts, hasArguments, completeness, suggestions }
   */
  analyzeInput(input)

  /**
   * Validate input meets minimum requirements
   * @param {string} input
   * @returns {Object} { valid, errors, warnings }
   */
  validateInput(input)

  /**
   * Suggest improvements to input
   * @param {string} input
   * @param {Object} analysis
   * @returns {Array<string>} suggestions
   */
  suggestImprovements(input, analysis)

  /**
   * Detect case type from input
   * @param {string} input
   * @returns {string} 'constitutional' | 'criminal' | 'civil' | 'procedural' | 'general'
   */
  detectCaseType(input)
}
```

**Key Features**:

- Pattern matching for legal elements (articles, sections, case names)
- Completeness scoring (0-100)
- Real-time feedback as user types
- Case type detection for template suggestions

### 3. Template Engine

**Purpose**: Provides predefined structures for common legal scenarios

**Interface**:

```javascript
class TemplateEngine {
  /**
   * Get available templates
   * @returns {Array<Object>} templates with metadata
   */
  getTemplates()

  /**
   * Get template by type
   * @param {string} templateType
   * @returns {Object} template configuration
   */
  getTemplate(templateType)

  /**
   * Apply template to generation request
   * @param {string} templateType
   * @param {string} input
   * @returns {Object} enhanced generation config
   */
  applyTemplate(templateType, input)

  /**
   * Suggest template based on input analysis
   * @param {Object} inputAnalysis
   * @returns {string} recommended template type
   */
  suggestTemplate(inputAnalysis)
}
```

**Template Types**:

1. **Constitutional Challenge**: Focus on articles, fundamental rights, judicial review
2. **Criminal Prosecution**: Emphasize IPC sections, evidence, witness testimony
3. **Civil Dispute**: Highlight contract law, damages, remedies
4. **Moot Court**: Structured for competition format with clear arguments
5. **Case Brief**: Academic format with IRAC structure

**Template Structure**:

```javascript
{
  type: 'constitutional_challenge',
  name: 'Constitutional Challenge',
  description: 'For cases involving constitutional validity',
  mandatorySlides: [
    'Case Overview',
    'Constitutional Provisions',
    'Grounds of Challenge',
    'Judicial Precedents',
    'Prayer for Relief'
  ],
  slideStructure: {
    'Case Overview': { blocks: ['text'], maxPoints: 3 },
    'Constitutional Provisions': { blocks: ['quote'], requireCitation: true },
    // ...
  },
  promptAdditions: '...',
  exampleKeywords: ['Article', 'fundamental right', 'unconstitutional']
}
```

### 4. Quality Validator

**Purpose**: Validates generated slides for quality and legal accuracy

**Interface**:

```javascript
class QualityValidator {
  /**
   * Validate complete slide deck
   * @param {Object} slideDeck
   * @param {Object} inputContext
   * @returns {Object} { valid, score, issues, suggestions }
   */
  validateSlideDeck(slideDeck, inputContext)

  /**
   * Check legal accuracy
   * @param {Object} slideDeck
   * @returns {Object} { accurate, issues }
   */
  checkLegalAccuracy(slideDeck)

  /**
   * Validate citation formats
   * @param {Object} slideDeck
   * @returns {Object} { valid, invalidCitations }
   */
  validateCitations(slideDeck)

  /**
   * Calculate quality score
   * @param {Object} slideDeck
   * @returns {number} score 0-100
   */
  calculateQualityScore(slideDeck)

  /**
   * Check for common issues
   * @param {Object} slideDeck
   * @returns {Array<Object>} issues with severity
   */
  detectIssues(slideDeck)
}
```

**Validation Checks**:

- Slide count within limits (3-8)
- Block count per slide (1-2)
- Bullet points per text block (2-4)
- Citation format compliance
- Legal term usage appropriateness
- Markdown formatting consistency
- Content relevance to input

**Quality Scoring**:

```javascript
{
  structure: 0-25,      // Slide/block organization
  legalAccuracy: 0-30,  // Correct legal references
  formatting: 0-20,     // Markdown and citation format
  relevance: 0-25       // Alignment with input
}
```

### 5. Refinement Handler

**Purpose**: Manages iterative refinement of generated slides

**Interface**:

```javascript
class RefinementHandler {
  /**
   * Refine existing slides with new instructions
   * @param {Object} existingSlides
   * @param {string} refinementInstructions
   * @param {Object} options
   * @returns {Promise<Object>} refined slides with change tracking
   */
  refineSlides(existingSlides, refinementInstructions, options)

  /**
   * Parse refinement instructions
   * @param {string} instructions
   * @returns {Object} { action, targetSlides, modifications }
   */
  parseRefinementInstructions(instructions)

  /**
   * Apply targeted modifications
   * @param {Object} slides
   * @param {Object} modifications
   * @returns {Object} modified slides
   */
  applyModifications(slides, modifications)

  /**
   * Track changes between versions
   * @param {Object} original
   * @param {Object} refined
   * @returns {Array<Object>} changes
   */
  trackChanges(original, refined)
}
```

**Refinement Actions**:

- Add more detail to specific slides
- Expand or condense content
- Change focus or emphasis
- Add missing elements
- Reorder slides
- Adjust formatting

### 6. Enhanced UI Components

**SlideGeneratorModal Enhancements**:

```javascript
// New state management
const [inputAnalysis, setInputAnalysis] = useState(null);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [qualityScore, setQualityScore] = useState(null);
const [refinementMode, setRefinementMode] = useState(false);
const [generationMetrics, setGenerationMetrics] = useState(null);
const [desiredSlideCount, setDesiredSlideCount] = useState(5); // User preference

// New UI sections
<InputAnalysisPanel analysis={inputAnalysis} />
<TemplateSelector
  templates={templates}
  suggested={suggestedTemplate}
  onSelect={setSelectedTemplate}
/>
<SlideCountSelector
  value={desiredSlideCount}
  min={3}
  max={8}
  suggestedCount={suggestedSlideCount}
  onChange={setDesiredSlideCount}
/>
<QualityScoreDisplay score={qualityScore} issues={issues} />
<RefinementInterface
  visible={refinementMode}
  onRefine={handleRefine}
/>
<GenerationMetrics metrics={generationMetrics} />
```

**New Components**:

1. **InputAnalysisPanel**: Real-time feedback on input completeness
2. **TemplateSelector**: Visual template selection with previews
3. **SlideCountSelector**: Allows user to choose desired number of slides (3-8) with visual slider and estimated presentation time
4. **QualityScoreDisplay**: Shows validation results and quality metrics
5. **RefinementInterface**: Allows targeted slide modifications
6. **FormattingPreview**: Shows markdown rendering in preview
7. **GenerationMetrics**: Displays performance and usage stats

## Data Models

### Enhanced Slide Deck Model

```javascript
{
  // Existing fields
  title: string,
  totalSlides: number,
  slides: Array<Slide>,

  // New fields
  template: string | null,           // Template used
  qualityScore: number,              // 0-100
  validationIssues: Array<Issue>,    // Validation warnings/errors
  generationMetadata: {
    inputLength: number,
    caseType: string,
    templateUsed: boolean,
    generationTime: number,
    modelUsed: string,
    promptTokens: number,
    completionTokens: number
  },
  legalMetadata: {
    articlesReferenced: Array<string>,
    sectionsReferenced: Array<string>,
    casesReferenced: Array<string>,
    legalTermCount: number
  },
  refinementHistory: Array<{
    timestamp: string,
    instructions: string,
    changedSlides: Array<number>
  }>
}
```

### Input Analysis Model

```javascript
{
  caseType: 'constitutional' | 'criminal' | 'civil' | 'procedural' | 'general',
  completeness: number,  // 0-100
  elements: {
    hasFacts: boolean,
    hasLegalIssues: boolean,
    hasStatutes: boolean,
    hasArguments: boolean,
    hasEvidence: boolean,
    hasCitations: boolean
  },
  detectedEntities: {
    articles: Array<string>,
    sections: Array<string>,
    cases: Array<string>,
    parties: Array<string>
  },
  suggestions: Array<string>,
  recommendedTemplate: string | null,
  estimatedSlideCount: number
}
```

### Quality Validation Model

```javascript
{
  valid: boolean,
  overallScore: number,  // 0-100
  scores: {
    structure: number,
    legalAccuracy: number,
    formatting: number,
    relevance: number
  },
  issues: Array<{
    severity: 'error' | 'warning' | 'info',
    type: string,
    message: string,
    slideIndex: number | null,
    blockIndex: number | null,
    suggestion: string
  }>,
  metrics: {
    avgBlocksPerSlide: number,
    avgPointsPerBlock: number,
    citationCount: number,
    legalTermDensity: number,
    formattingCompliance: number
  }
}
```

## Error Handling

### Error Categories

1. **Input Validation Errors**

   - Too short/long
   - Missing critical elements
   - Invalid characters

2. **API Errors**

   - Rate limiting
   - Timeout
   - Invalid response
   - Quota exceeded

3. **Validation Errors**

   - Structure violations
   - Legal inaccuracies
   - Format issues

4. **System Errors**
   - Cache failures
   - Storage errors
   - Network issues

### Error Handling Strategy

```javascript
class ErrorHandler {
  /**
   * Handle generation errors with appropriate recovery
   * @param {Error} error
   * @param {Object} context
   * @returns {Object} { recovered, result, userMessage }
   */
  handleGenerationError(error, context) {
    if (error.type === "RATE_LIMIT") {
      return this.handleRateLimit(error, context);
    }
    if (error.type === "VALIDATION_FAILED") {
      return this.handleValidationFailure(error, context);
    }
    if (error.type === "API_ERROR") {
      return this.handleAPIError(error, context);
    }
    return this.handleUnknownError(error, context);
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    // Implementation
  }

  /**
   * Provide user-friendly error messages
   */
  getUserMessage(error) {
    // Implementation
  }
}
```

### Retry Logic

```javascript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  retryableErrors: ["RATE_LIMIT", "TIMEOUT", "NETWORK_ERROR"],
  fallbackStrategies: {
    RATE_LIMIT: "use_cache_or_wait",
    VALIDATION_FAILED: "regenerate_with_stricter_prompt",
    API_ERROR: "try_alternative_model",
  },
};
```

## Testing Strategy

### Unit Tests

1. **Prompt Builder Tests**

   - Template instruction injection
   - Refinement context preservation
   - Dynamic example selection

2. **Input Processor Tests**

   - Case type detection accuracy
   - Completeness scoring
   - Entity extraction

3. **Validator Tests**

   - Structure validation
   - Citation format checking
   - Quality scoring algorithm

4. **Template Engine Tests**
   - Template application
   - Template suggestion logic

### Integration Tests

1. **End-to-End Generation**

   - Input → Generation → Validation → Display
   - Template-based generation
   - Refinement workflow

2. **Error Handling**

   - API failure recovery
   - Validation failure handling
   - Retry logic

3. **Cache Integration**
   - Cache hit/miss scenarios
   - Cache invalidation

### Quality Assurance Tests

1. **Legal Accuracy**

   - Test with known cases
   - Verify citation formats
   - Check legal term usage

2. **Output Quality**

   - Measure quality scores across diverse inputs
   - Compare template vs non-template outputs
   - Assess refinement effectiveness

3. **Performance**
   - Generation time under various loads
   - Cache performance
   - API quota management

### User Acceptance Testing

1. **Law Student Testing**

   - Usability of input interface
   - Quality of generated slides
   - Effectiveness of templates

2. **Professor Review**
   - Legal accuracy verification
   - Professional standard assessment
   - Citation format compliance

## Implementation Phases

### Phase 1: Enhanced Prompt & Validation (Week 1-2)

- Implement EnhancedPromptBuilder
- Create QualityValidator
- Update system prompt with legal context
- Add validation layer to generation flow

### Phase 2: Input Processing & Templates (Week 3-4)

- Implement InputProcessor
- Create TemplateEngine with 5 core templates
- Add real-time input analysis to UI
- Implement template selection interface

### Phase 3: Refinement & Quality (Week 5-6)

- Implement RefinementHandler
- Add quality score display
- Create refinement UI
- Implement change tracking

### Phase 4: Polish & Testing (Week 7-8)

- Comprehensive testing
- Performance optimization
- Error handling improvements
- Documentation and user guides

## Success Metrics

1. **Quality Metrics**

   - Average quality score > 80/100
   - Legal accuracy rate > 95%
   - Citation format compliance > 98%

2. **User Satisfaction**

   - User acceptance rate > 85%
   - Refinement usage < 20% (indicating good first-time quality)
   - Template usage > 60%

3. **Performance**

   - Generation time < 5 seconds (95th percentile)
   - Success rate > 95%
   - Cache hit rate > 40%

4. **Adoption**
   - Daily active users increase by 50%
   - Slides per user increase by 100%
   - Feature satisfaction rating > 4.5/5

## User Preferences and Controls

### Slide Count Control

Users can specify their desired number of slides (3-8) before generation. This preference is:

1. **Stored in state**: `desiredSlideCount` state variable in SlideGeneratorModal
2. **Passed to AI**: Included in the prompt as a strict requirement
3. **Validated**: AI must generate exactly the requested number of slides
4. **Suggested**: System suggests optimal count based on input analysis and template
5. **Persisted**: User's last preference is saved for future sessions

**Prompt Integration**:

```javascript
const userPrompt = `Case Description:
${trimmedInput}

IMPORTANT: Generate EXACTLY ${desiredSlideCount} slides. No more, no less.

Generate a professional legal presentation following the mandatory slide flow pattern.`;
```

**UI Component**:

```javascript
<SlideCountSelector
  value={desiredSlideCount}
  min={3}
  max={8}
  suggestedCount={suggestedSlideCount}
  estimatedTime={desiredSlideCount * 2} // 2 minutes per slide
  onChange={(count) => {
    setDesiredSlideCount(count);
    AsyncStorage.setItem("preferredSlideCount", count.toString());
  }}
/>
```

**Validation**:
After generation, validate that `slideDeck.slides.length === desiredSlideCount`. If not, log a warning and optionally regenerate.
