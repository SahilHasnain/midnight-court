# Implementation Plan

- [x] 1. Enhance system prompt with legal context and strict formatting rules

  - Update SYSTEM_PROMPT in `utils/slideGenerationAPI.js` with comprehensive legal instructions
  - Add content thinking order section (case nature → fact extraction → legal issues → slide planning)
  - Define mandatory slide flow patterns (Case Overview → Facts → Legal Issues → Provisions → Arguments → Evidence → Ruling → Takeaways)
  - Enforce strict limits: 3-8 slides, 1-2 blocks per slide, 2-4 points per text block
  - Add markdown color coding rules (_gold_ for legal concepts, ~red~ for violations, _blue_ for statutes)
  - Include Indian legal context and citation standards
  - Add examples of good vs bad slide structures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Implement input validation and analysis system

- [x] 2.1 Create InputProcessor class

  - Create new file `utils/inputProcessor.js`
  - Implement `analyzeInput()` method to extract case type, legal elements, and completeness score
  - Implement `validateInput()` method with minimum requirements checking
  - Implement `detectCaseType()` using pattern matching for articles, sections, case names
  - Implement `suggestImprovements()` to provide actionable feedback
  - Add pattern matching for Indian legal references (Article X, Section Y IPC, case citations)
  - Implement `suggestSlideCount()` based on input length and complexity
  - _Requirements: 4.1, 4.2, 4.3, 10.3_

- [x] 2.2 Integrate input analysis into SlideGeneratorModal

  - Add state for `inputAnalysis` in `components/SlideGeneratorModal.jsx`
  - Call `analyzeInput()` on input change with debouncing (500ms)
  - Display completeness score and missing elements in UI
  - Show real-time suggestions below input field
  - Update character minimum to 100 with justification message
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 2.3 Add slide count selector UI

  - Add state for `desiredSlideCount` (default: 5) in `components/SlideGeneratorModal.jsx`
  - Create SlideCountSelector component with slider/stepper (range: 3-8)
  - Display suggested slide count based on input analysis
  - Show estimated presentation time (2 minutes per slide)
  - Persist user preference to AsyncStorage
  - Load saved preference on modal open
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 2.4 Integrate slide count into generation flow

  - Pass `desiredSlideCount` to `generateSlides()` function
  - Update prompt builder to include "Generate EXACTLY X slides" instruction
  - Validate generated slide count matches requested count
  - Log warning if count mismatch occurs
  - Store `requestedSlideCount` in slide deck metadata
  - _Requirements: 10.2, 10.5_

- [x] 3. Create template system for common legal scenarios

- [x] 3.1 Implement TemplateEngine class

  - Create new file `utils/templateEngine.js`
  - Define 5 core templates: Constitutional Challenge, Criminal Prosecution, Civil Dispute, Moot Court, Case Brief
  - Implement `getTemplates()` to return all available templates with metadata
  - Implement `getTemplate(type)` to retrieve specific template configuration
  - Implement `applyTemplate()` to enhance generation config with template-specific instructions
  - Implement `suggestTemplate()` based on input analysis
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.2 Add template selection UI

  - Add template selector component to `components/SlideGeneratorModal.jsx`
  - Display template cards with descriptions and example use cases
  - Show recommended template based on input analysis
  - Allow manual template selection or "No Template" option
  - Display selected template characteristics
  - _Requirements: 7.1, 7.5_

- [x] 3.3 Integrate templates into generation flow

  - Modify `generateSlides()` in `utils/slideGenerationAPI.js` to accept template parameter
  - Apply template-specific prompt additions when template is selected
  - Pass template metadata to prompt builder
  - Store template type in generated slide deck metadata
  - _Requirements: 7.2, 7.4_

- [x] 4. Implement quality validation system

- [x] 4.1 Create QualityValidator class

  - Create new file `utils/qualityValidator.js`
  - Implement `validateSlideDeck()` for comprehensive validation
  - Implement `checkLegalAccuracy()` to verify legal references and citations
  - Implement `validateCitations()` to check citation format compliance
  - Implement `calculateQualityScore()` with scoring algorithm (structure 25%, legal accuracy 30%, formatting 20%, relevance 25%)
  - Implement `detectIssues()` to identify common problems with severity levels
  - _Requirements: 5.1, 5.2, 5.3, 9.1, 9.2, 9.3_

- [x] 4.2 Integrate validation into generation flow

  - Call `validateSlideDeck()` after AI generation in `utils/slideGenerationAPI.js`
  - Store validation results in slide deck metadata
  - Implement auto-regeneration if quality score < 60
  - Log validation metrics for monitoring
  - _Requirements: 5.4, 5.5_

- [x] 4.3 Display quality metrics in UI

  - Add quality score display component to `components/SlideGeneratorModal.jsx`
  - Show overall score with breakdown (structure, legal accuracy, formatting, relevance)
  - Display validation issues with severity indicators
  - Show suggestions for improvement
  - Add visual indicators (color-coded badges) for quality levels
  - _Requirements: 3.3, 5.5_

- [x] 5. Enhance preview with formatted markdown rendering

- [x] 5.1 Create markdown formatter utility

  - Create new file `utils/markdownFormatter.js`
  - Implement functions to convert markdown to styled text components
  - Handle _text_ → gold color, ~text~ → red color, _text_ → blue color
  - Preserve other text formatting
  - _Requirements: 1.4, 3.2_

- [x] 5.2 Update slide preview rendering

  - Modify `renderBlockPreview()` in `components/SlideGeneratorModal.jsx`
  - Apply markdown formatting to all text content in preview
  - Show formatted text with proper colors matching final output
  - Add legend explaining color coding
  - _Requirements: 3.2_

- [x] 5.3 Add metadata display to preview

  - Show block type counts per slide
  - Display legal citation count
  - Show content length metrics
  - Add expandable details section for each slide
  - _Requirements: 3.3_

- [ ] 6. Implement refinement capability
- [ ] 6.1 Create RefinementHandler class

  - Create new file `utils/refinementHandler.js`
  - Implement `refineSlides()` to handle refinement requests
  - Implement `parseRefinementInstructions()` to extract user intent
  - Implement `applyModifications()` for targeted slide updates
  - Implement `trackChanges()` to highlight modified slides
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.2 Add refinement UI to SlideGeneratorModal

  - Add "Refine Slides" button after generation
  - Create refinement input field with suggestions
  - Show which slides will be affected by refinement
  - Display change tracking after refinement
  - Add option to preserve specific slides during refinement
  - _Requirements: 6.1, 6.5_

- [ ] 6.3 Integrate refinement into generation API

  - Add `refineSlides()` function to `utils/slideGenerationAPI.js`
  - Build refinement prompt with previous generation context
  - Preserve user-approved slides during refinement
  - Update refinement history in slide deck metadata
  - _Requirements: 6.2, 6.4_

- [ ] 7. Improve error handling and retry logic
- [ ] 7.1 Create ErrorHandler class

  - Create new file `utils/errorHandler.js`
  - Implement `handleGenerationError()` with error categorization
  - Implement retry logic with exponential backoff
  - Implement fallback strategies for different error types
  - Implement `getUserMessage()` for user-friendly error messages
  - _Requirements: 8.2, 3.5_

- [ ] 7.2 Integrate enhanced error handling

  - Update `generateSlides()` to use ErrorHandler
  - Add automatic retry for rate limits and timeouts
  - Implement fallback to cached results on API failure
  - Show specific error messages with actionable guidance
  - Display remaining quota and reset time on rate limit errors
  - _Requirements: 8.2, 8.4, 3.5_

- [ ] 8. Add performance monitoring and metrics
- [ ] 8.1 Implement metrics logging

  - Add metrics collection to `utils/slideGenerationAPI.js`
  - Log generation time, token usage, quality scores
  - Track success/failure rates
  - Store metrics in AsyncStorage for analytics
  - _Requirements: 5.5, 8.5_

- [ ] 8.2 Create metrics display component

  - Add generation metrics panel to `components/SlideGeneratorModal.jsx`
  - Show generation time, token usage, cache status
  - Display daily usage quota and remaining requests
  - Add performance indicators (fast/slow generation)
  - _Requirements: 8.4_

- [ ] 9. Enhance UI with accessibility and usability improvements
- [ ] 9.1 Add contextual help and tooltips

  - Add help icons with tooltips for all input fields
  - Create "How to Write Better Descriptions" guide
  - Add inline examples for each template type
  - Implement first-time user tutorial overlay
  - _Requirements: 10.1, 10.2_

- [ ] 9.2 Improve error messaging

  - Replace technical error messages with plain language
  - Add suggested fixes for common errors
  - Show examples of valid input when validation fails
  - Implement progressive disclosure for error details
  - _Requirements: 10.3_

- [ ] 9.3 Add keyboard shortcuts and navigation

  - Implement Ctrl+Enter to generate slides
  - Add Ctrl+R for refinement
  - Implement Escape to close modal
  - Add Tab navigation through all interactive elements
  - _Requirements: 10.4_

- [ ] 9.4 Create "What's Next?" guide

  - Add post-generation guide showing next steps
  - Explain how to customize slides further
  - Show how to add images using suggested keywords
  - Provide tips for effective presentations
  - _Requirements: 10.5_

- [ ] 10. Update OpenAI proxy function for better reliability
- [ ] 10.1 Enhance error handling in proxy

  - Update `appwrite-functions/openai-proxy/src/main.js`
  - Add better error categorization and logging
  - Implement request validation before API call
  - Add response validation after API call
  - Improve error messages returned to client
  - _Requirements: 8.2_

- [ ] 10.2 Add request/response logging

  - Log all requests with timestamps and parameters
  - Log response times and token usage
  - Track error rates by error type
  - Store logs for debugging and monitoring
  - _Requirements: 8.5_

- [ ] 11. Optimize caching strategy
- [ ] 11.1 Enhance cache key generation

  - Update cache key generation in `utils/slideGenerationAPI.js`
  - Include template type in cache key
  - Add input analysis fingerprint to cache key
  - Implement cache versioning for prompt changes
  - _Requirements: 8.3_

- [ ] 11.2 Implement intelligent cache invalidation

  - Invalidate cache when system prompt is updated
  - Add cache version checking
  - Implement selective cache clearing by template type
  - Add cache statistics display
  - _Requirements: 8.3_

- [ ] 12. Create comprehensive documentation
- [ ] 12.1 Write user guide

  - Create documentation for using the slide generator
  - Document each template type with examples
  - Explain refinement capabilities
  - Provide tips for best results
  - _Requirements: 10.1, 10.2_

- [ ] 12.2 Write developer documentation

  - Document all new classes and their interfaces
  - Explain validation rules and quality scoring
  - Document template structure and creation
  - Provide troubleshooting guide
  - _Requirements: 5.5_

- [ ]\* 13. Testing and quality assurance
- [ ]\* 13.1 Create unit tests for core utilities

  - Test InputProcessor with various case types
  - Test QualityValidator scoring algorithm
  - Test TemplateEngine template application
  - Test RefinementHandler change tracking
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]\* 13.2 Create integration tests

  - Test end-to-end generation flow
  - Test template-based generation
  - Test refinement workflow
  - Test error handling and retry logic
  - _Requirements: 8.2_

- [ ]\* 13.3 Perform legal accuracy testing

  - Test with known landmark cases
  - Verify citation format compliance
  - Check legal term usage appropriateness
  - Validate against law professor review
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]\* 13.4 Conduct user acceptance testing
  - Test with law students for usability
  - Gather feedback on template effectiveness
  - Measure quality score distribution
  - Assess refinement feature usage
  - _Requirements: 1.1, 7.1, 10.1_
