/**
 * Quality Validator - Comprehensive validation for AI-generated legal slides
 * Validates slide structure, legal accuracy, citation format, and content quality
 * Provides scoring and issue detection for professional legal presentations
 */

/**
 * Quality scoring weights (must sum to 100)
 */
const QUALITY_WEIGHTS = {
  structure: 25, // Slide/block organization and limits
  legalAccuracy: 30, // Correct legal references and terminology
  formatting: 20, // Markdown and citation format compliance
  relevance: 25, // Content alignment with input and legal purpose
};

/**
 * Indian legal citation patterns for validation
 */
const LEGAL_PATTERNS = {
  // Constitutional articles: Article 21, Article 14, etc.
  articles: /Article\s+\d+[A-Z]?(?:\(\d+\))?/gi,

  // Statutory sections: Section 302 IPC, Section 154 CrPC, etc.
  sections:
    /Section\s+\d+[A-Z]?(?:\(\d+\))?(?:\s+(?:IPC|CrPC|CPC|IT Act|Companies Act))?/gi,

  // Case citations: Name v. Name, (Year) Volume Reporter Page
  cases: /[A-Z][a-zA-Z\s&]+\s+v\.?\s+[A-Z][a-zA-Z\s&]+,?\s*\(?\d{4}\)?/gi,

  // Legal terms that should be formatted
  legalTerms:
    /(?:fundamental rights?|basic structure|natural justice|due process|judicial review|writ jurisdiction|habeas corpus|mandamus|certiorari|prohibition|quo warranto|mens rea|actus reus|res judicata|stare decisis|ultra vires|bona fide|prima facie|ratio decidendi|obiter dicta)/gi,

  // Offences and violations
  offences:
    /(?:murder|culpable homicide|rape|theft|robbery|dacoity|cheating|forgery|defamation|contempt|breach|violation|offence|crime)/gi,
};

/**
 * Markdown formatting patterns
 */
const FORMATTING_PATTERNS = {
  gold: /\*([^*]+)\*/g, // *text* for legal concepts
  red: /~([^~]+)~/g, // ~text~ for violations
  blue: /_([^_]+)_/g, // _text_ for statutes
};

/**
 * Quality Validator Class
 * Provides comprehensive validation of AI-generated slide decks
 */
export class QualityValidator {
  /**
   * Validate complete slide deck with comprehensive scoring
   * @param {Object} slideDeck - Generated slide deck
   * @param {Object} inputContext - Original input and metadata
   * @returns {Object} Validation result with score and issues
   */
  validateSlideDeck(slideDeck, inputContext = {}) {
    try {
      if (!slideDeck || !slideDeck.slides) {
        return {
          valid: false,
          overallScore: 0,
          scores: {
            structure: 0,
            legalAccuracy: 0,
            formatting: 0,
            relevance: 0,
          },
          issues: [
            {
              severity: "error",
              type: "structure",
              message: "Invalid slide deck: missing slides array",
              slideIndex: null,
              blockIndex: null,
              suggestion: "Regenerate the slide deck",
            },
          ],
          metrics: this._getEmptyMetrics(),
        };
      }

      // Perform individual validations
      const structureResult = this._validateStructure(slideDeck);
      const legalResult = this._checkLegalAccuracy(slideDeck);
      const formattingResult = this._validateFormatting(slideDeck);
      const relevanceResult = this._validateRelevance(slideDeck, inputContext);

      // Calculate weighted overall score
      const overallScore = Math.round(
        (structureResult.score * QUALITY_WEIGHTS.structure +
          legalResult.score * QUALITY_WEIGHTS.legalAccuracy +
          formattingResult.score * QUALITY_WEIGHTS.formatting +
          relevanceResult.score * QUALITY_WEIGHTS.relevance) /
          100
      );

      // Combine all issues
      const allIssues = [
        ...structureResult.issues,
        ...legalResult.issues,
        ...formattingResult.issues,
        ...relevanceResult.issues,
      ];

      // Calculate comprehensive metrics
      const metrics = this._calculateMetrics(slideDeck);

      return {
        valid:
          overallScore >= 60 &&
          allIssues.filter((i) => i.severity === "error").length === 0,
        overallScore,
        scores: {
          structure: structureResult.score,
          legalAccuracy: legalResult.score,
          formatting: formattingResult.score,
          relevance: relevanceResult.score,
        },
        issues: allIssues,
        metrics,
      };
    } catch (error) {
      console.error("Quality validation error:", error);
      return {
        valid: false,
        overallScore: 0,
        scores: { structure: 0, legalAccuracy: 0, formatting: 0, relevance: 0 },
        issues: [
          {
            severity: "error",
            type: "system",
            message: `Validation failed: ${error.message}`,
            slideIndex: null,
            blockIndex: null,
            suggestion: "Try regenerating the slides",
          },
        ],
        metrics: this._getEmptyMetrics(),
      };
    }
  }

  /**
   * Check legal accuracy of slide content
   * @param {Object} slideDeck - Slide deck to validate
   * @returns {Object} Legal accuracy validation result
   */
  checkLegalAccuracy(slideDeck) {
    return this._checkLegalAccuracy(slideDeck);
  }

  /**
   * Validate citation formats throughout the slide deck
   * @param {Object} slideDeck - Slide deck to validate
   * @returns {Object} Citation validation result
   */
  validateCitations(slideDeck) {
    const issues = [];
    let validCitations = 0;
    let totalCitations = 0;

    slideDeck.slides.forEach((slide, slideIndex) => {
      slide.blocks?.forEach((block, blockIndex) => {
        const content = this._extractTextFromBlock(block);

        // Check for citations in content
        const articles = content.match(LEGAL_PATTERNS.articles) || [];
        const sections = content.match(LEGAL_PATTERNS.sections) || [];
        const cases = content.match(LEGAL_PATTERNS.cases) || [];

        totalCitations += articles.length + sections.length + cases.length;

        // Validate article citations
        articles.forEach((article) => {
          if (this._isValidArticleCitation(article)) {
            validCitations++;
          } else {
            issues.push({
              severity: "warning",
              type: "citation",
              message: `Invalid article citation format: "${article}"`,
              slideIndex,
              blockIndex,
              suggestion: 'Use format: "Article 21" or "Article 19(1)(a)"',
            });
          }
        });

        // Validate section citations
        sections.forEach((section) => {
          if (this._isValidSectionCitation(section)) {
            validCitations++;
          } else {
            issues.push({
              severity: "warning",
              type: "citation",
              message: `Invalid section citation format: "${section}"`,
              slideIndex,
              blockIndex,
              suggestion: 'Use format: "Section 302 IPC" or "Section 154 CrPC"',
            });
          }
        });

        // Validate case citations
        cases.forEach((caseRef) => {
          if (this._isValidCaseCitation(caseRef)) {
            validCitations++;
          } else {
            issues.push({
              severity: "info",
              type: "citation",
              message: `Case citation could be improved: "${caseRef}"`,
              slideIndex,
              blockIndex,
              suggestion:
                'Include year and reporter: "Case v. Case, (2023) 1 SCC 1"',
            });
          }
        });
      });
    });

    return {
      valid: totalCitations === 0 || validCitations / totalCitations >= 0.8,
      validCitations,
      totalCitations,
      accuracy:
        totalCitations > 0 ? (validCitations / totalCitations) * 100 : 100,
      issues,
    };
  }

  /**
   * Calculate overall quality score using weighted algorithm
   * @param {Object} slideDeck - Slide deck to score
   * @returns {Number} Quality score (0-100)
   */
  calculateQualityScore(slideDeck) {
    const validation = this.validateSlideDeck(slideDeck);
    return validation.overallScore;
  }

  /**
   * Detect common issues with severity levels
   * @param {Object} slideDeck - Slide deck to analyze
   * @returns {Array} Array of issues with severity levels
   */
  detectIssues(slideDeck) {
    const validation = this.validateSlideDeck(slideDeck);
    return validation.issues;
  }

  // Private helper methods

  /**
   * Validate slide deck structure
   * @private
   */
  _validateStructure(slideDeck) {
    const issues = [];
    let score = 100;

    // Check slide count (3-8 slides)
    const slideCount = slideDeck.slides.length;
    if (slideCount < 3) {
      issues.push({
        severity: "error",
        type: "structure",
        message: `Too few slides: ${slideCount} (minimum 3)`,
        slideIndex: null,
        blockIndex: null,
        suggestion: "Add more slides to cover all legal aspects",
      });
      score -= 30;
    } else if (slideCount > 8) {
      issues.push({
        severity: "warning",
        type: "structure",
        message: `Too many slides: ${slideCount} (maximum 8)`,
        slideIndex: null,
        blockIndex: null,
        suggestion: "Consolidate content into fewer slides",
      });
      score -= 15;
    }

    // Check each slide structure
    slideDeck.slides.forEach((slide, index) => {
      // Check for title
      if (!slide.title || slide.title.trim().length === 0) {
        issues.push({
          severity: "error",
          type: "structure",
          message: `Slide ${index + 1}: Missing title`,
          slideIndex: index,
          blockIndex: null,
          suggestion: "Add a clear, descriptive title",
        });
        score -= 10;
      }

      // Check block count (1-2 blocks per slide)
      const blockCount = slide.blocks?.length || 0;
      if (blockCount === 0) {
        issues.push({
          severity: "error",
          type: "structure",
          message: `Slide ${index + 1}: No content blocks`,
          slideIndex: index,
          blockIndex: null,
          suggestion: "Add at least one content block",
        });
        score -= 15;
      } else if (blockCount > 2) {
        issues.push({
          severity: "warning",
          type: "structure",
          message: `Slide ${index + 1}: Too many blocks (${blockCount}, max 2)`,
          slideIndex: index,
          blockIndex: null,
          suggestion: "Consolidate content into 1-2 blocks for clarity",
        });
        score -= 10;
      }

      // Check text block point counts
      slide.blocks?.forEach((block, blockIndex) => {
        if (block.type === "text" && block.data?.points) {
          const pointCount = block.data.points.length;
          if (pointCount < 2) {
            issues.push({
              severity: "warning",
              type: "structure",
              message: `Slide ${index + 1}, Block ${
                blockIndex + 1
              }: Too few points (${pointCount}, min 2)`,
              slideIndex: index,
              blockIndex,
              suggestion: "Add more detail or combine with another block",
            });
            score -= 5;
          } else if (pointCount > 4) {
            issues.push({
              severity: "warning",
              type: "structure",
              message: `Slide ${index + 1}, Block ${
                blockIndex + 1
              }: Too many points (${pointCount}, max 4)`,
              slideIndex: index,
              blockIndex,
              suggestion: "Break into multiple slides or consolidate points",
            });
            score -= 5;
          }
        }
      });
    });

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check legal accuracy and terminology
   * @private
   */
  _checkLegalAccuracy(slideDeck) {
    const issues = [];
    let score = 100;
    let legalTermCount = 0;
    let properlyFormattedTerms = 0;

    slideDeck.slides.forEach((slide, slideIndex) => {
      slide.blocks?.forEach((block, blockIndex) => {
        const content = this._extractTextFromBlock(block);

        // Check for legal terms
        const legalTerms = content.match(LEGAL_PATTERNS.legalTerms) || [];
        legalTermCount += legalTerms.length;

        // Check if legal terms are properly formatted (should be in gold)
        legalTerms.forEach((term) => {
          const goldFormatted = content.match(
            new RegExp(
              `\\*${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*`,
              "i"
            )
          );
          if (goldFormatted) {
            properlyFormattedTerms++;
          } else {
            issues.push({
              severity: "info",
              type: "legal",
              message: `Legal term "${term}" should be formatted in gold`,
              slideIndex,
              blockIndex,
              suggestion: `Use *${term}* for legal concepts`,
            });
          }
        });

        // Check for common legal accuracy issues
        this._checkCommonLegalIssues(content, slideIndex, blockIndex, issues);
      });
    });

    // Calculate legal accuracy score
    if (legalTermCount > 0) {
      const formattingAccuracy =
        (properlyFormattedTerms / legalTermCount) * 100;
      score = Math.min(score, formattingAccuracy + 20); // Base score + formatting bonus
    }

    // Penalize for legal accuracy issues
    const errorCount = issues.filter((i) => i.severity === "error").length;
    score -= errorCount * 20;

    return {
      score: Math.max(0, score),
      issues,
      legalTermCount,
      properlyFormattedTerms,
    };
  }

  /**
   * Validate markdown formatting compliance
   * @private
   */
  _validateFormatting(slideDeck) {
    const issues = [];
    let score = 100;
    let totalFormatting = 0;
    let correctFormatting = 0;

    slideDeck.slides.forEach((slide, slideIndex) => {
      slide.blocks?.forEach((block, blockIndex) => {
        const content = this._extractTextFromBlock(block);

        // Check gold formatting (*text*)
        const goldMatches = content.match(FORMATTING_PATTERNS.gold) || [];
        totalFormatting += goldMatches.length;
        goldMatches.forEach((match) => {
          const term = match.slice(1, -1); // Remove * markers
          if (
            LEGAL_PATTERNS.legalTerms.test(term) ||
            LEGAL_PATTERNS.cases.test(term)
          ) {
            correctFormatting++;
          } else {
            issues.push({
              severity: "info",
              type: "formatting",
              message: `"${term}" may not need gold formatting`,
              slideIndex,
              blockIndex,
              suggestion:
                "Use gold (*text*) only for legal concepts and case names",
            });
          }
        });

        // Check red formatting (~text~)
        const redMatches = content.match(FORMATTING_PATTERNS.red) || [];
        totalFormatting += redMatches.length;
        redMatches.forEach((match) => {
          const term = match.slice(1, -1); // Remove ~ markers
          if (
            LEGAL_PATTERNS.offences.test(term) ||
            /violation|breach|illegal|unconstitutional/i.test(term)
          ) {
            correctFormatting++;
          } else {
            issues.push({
              severity: "info",
              type: "formatting",
              message: `"${term}" may not need red formatting`,
              slideIndex,
              blockIndex,
              suggestion: "Use red (~text~) only for violations and offences",
            });
          }
        });

        // Check blue formatting (_text_)
        const blueMatches = content.match(FORMATTING_PATTERNS.blue) || [];
        totalFormatting += blueMatches.length;
        blueMatches.forEach((match) => {
          const term = match.slice(1, -1); // Remove _ markers
          if (
            LEGAL_PATTERNS.articles.test(term) ||
            LEGAL_PATTERNS.sections.test(term)
          ) {
            correctFormatting++;
          } else {
            issues.push({
              severity: "info",
              type: "formatting",
              message: `"${term}" may not need blue formatting`,
              slideIndex,
              blockIndex,
              suggestion: "Use blue (_text_) only for statutory provisions",
            });
          }
        });

        // Check for unformatted legal references
        const articles = content.match(LEGAL_PATTERNS.articles) || [];
        const sections = content.match(LEGAL_PATTERNS.sections) || [];

        articles.forEach((article) => {
          if (!content.includes(`_${article}_`)) {
            issues.push({
              severity: "warning",
              type: "formatting",
              message: `Article reference "${article}" should be formatted in blue`,
              slideIndex,
              blockIndex,
              suggestion: `Use _${article}_ for constitutional provisions`,
            });
            score -= 5;
          }
        });

        sections.forEach((section) => {
          if (!content.includes(`_${section}_`)) {
            issues.push({
              severity: "warning",
              type: "formatting",
              message: `Section reference "${section}" should be formatted in blue`,
              slideIndex,
              blockIndex,
              suggestion: `Use _${section}_ for statutory provisions`,
            });
            score -= 5;
          }
        });
      });
    });

    // Calculate formatting accuracy
    if (totalFormatting > 0) {
      const accuracy = (correctFormatting / totalFormatting) * 100;
      score = Math.min(score, accuracy);
    }

    return {
      score: Math.max(0, score),
      issues,
      totalFormatting,
      correctFormatting,
    };
  }

  /**
   * Validate content relevance to input
   * @private
   */
  _validateRelevance(slideDeck, inputContext) {
    const issues = [];
    let score = 100;

    // Basic relevance checks
    if (!inputContext.input) {
      return { score: 80, issues }; // Default score if no input context
    }

    const inputText = inputContext.input.toLowerCase();
    const slideContent = this._extractAllText(slideDeck).toLowerCase();

    // Check for key terms from input appearing in slides
    const inputWords = inputText.split(/\s+/).filter((word) => word.length > 3);
    const relevantWords = inputWords.filter((word) =>
      slideContent.includes(word)
    );

    if (inputWords.length > 0) {
      const relevanceRatio = relevantWords.length / inputWords.length;
      if (relevanceRatio < 0.3) {
        issues.push({
          severity: "warning",
          type: "relevance",
          message: "Slides may not be closely related to input description",
          slideIndex: null,
          blockIndex: null,
          suggestion:
            "Ensure slides address the specific case details provided",
        });
        score -= 20;
      }
    }

    // Check for mandatory slide types based on input
    const hasOverview = slideDeck.slides.some((slide) =>
      /overview|introduction|case/i.test(slide.title)
    );
    const hasFacts = slideDeck.slides.some((slide) =>
      /facts?|background|events?/i.test(slide.title)
    );
    const hasLegalIssues = slideDeck.slides.some((slide) =>
      /issues?|questions?|legal|law/i.test(slide.title)
    );

    if (!hasOverview) {
      issues.push({
        severity: "warning",
        type: "relevance",
        message: "Missing case overview slide",
        slideIndex: null,
        blockIndex: null,
        suggestion: "Add a slide introducing the case and parties",
      });
      score -= 15;
    }

    if (!hasFacts) {
      issues.push({
        severity: "warning",
        type: "relevance",
        message: "Missing facts slide",
        slideIndex: null,
        blockIndex: null,
        suggestion: "Add a slide covering material facts",
      });
      score -= 15;
    }

    if (!hasLegalIssues) {
      issues.push({
        severity: "info",
        type: "relevance",
        message: "Consider adding legal issues slide",
        slideIndex: null,
        blockIndex: null,
        suggestion: "Add a slide framing the legal questions",
      });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Calculate comprehensive metrics
   * @private
   */
  _calculateMetrics(slideDeck) {
    let totalBlocks = 0;
    let totalPoints = 0;
    let citationCount = 0;
    let legalTermCount = 0;
    let formattingCount = 0;

    slideDeck.slides.forEach((slide) => {
      totalBlocks += slide.blocks?.length || 0;

      slide.blocks?.forEach((block) => {
        const content = this._extractTextFromBlock(block);

        // Count points in text blocks
        if (block.type === "text" && block.data?.points) {
          totalPoints += block.data.points.length;
        }

        // Count citations
        const articles = content.match(LEGAL_PATTERNS.articles) || [];
        const sections = content.match(LEGAL_PATTERNS.sections) || [];
        const cases = content.match(LEGAL_PATTERNS.cases) || [];
        citationCount += articles.length + sections.length + cases.length;

        // Count legal terms
        const legalTerms = content.match(LEGAL_PATTERNS.legalTerms) || [];
        legalTermCount += legalTerms.length;

        // Count formatting
        const goldMatches = content.match(FORMATTING_PATTERNS.gold) || [];
        const redMatches = content.match(FORMATTING_PATTERNS.red) || [];
        const blueMatches = content.match(FORMATTING_PATTERNS.blue) || [];
        formattingCount +=
          goldMatches.length + redMatches.length + blueMatches.length;
      });
    });

    return {
      avgBlocksPerSlide: totalBlocks / slideDeck.slides.length,
      avgPointsPerBlock: totalPoints > 0 ? totalPoints / totalBlocks : 0,
      citationCount,
      legalTermDensity: legalTermCount / slideDeck.slides.length,
      formattingCompliance:
        formattingCount > 0
          ? (formattingCount / (citationCount + legalTermCount)) * 100
          : 0,
    };
  }

  /**
   * Extract text content from a block
   * @private
   */
  _extractTextFromBlock(block) {
    if (!block.data) return "";

    switch (block.type) {
      case "text":
        return (block.data.points || []).join(" ");
      case "quote":
        return `${block.data.quote || ""} ${block.data.citation || ""}`;
      case "callout":
        return block.data.text || "";
      case "timeline":
        return (block.data.events || [])
          .map((e) => `${e.title} ${e.description}`)
          .join(" ");
      case "evidence":
        return (block.data.items || [])
          .map((i) => `${i.label} ${i.description}`)
          .join(" ");
      case "twoColumn":
        return `${block.data.leftTitle || ""} ${(
          block.data.leftPoints || []
        ).join(" ")} ${block.data.rightTitle || ""} ${(
          block.data.rightPoints || []
        ).join(" ")}`;
      default:
        return JSON.stringify(block.data);
    }
  }

  /**
   * Extract all text from slide deck
   * @private
   */
  _extractAllText(slideDeck) {
    return slideDeck.slides
      .map((slide) => {
        const titleText = slide.title || "";
        const blockText = (slide.blocks || [])
          .map((block) => this._extractTextFromBlock(block))
          .join(" ");
        return `${titleText} ${blockText}`;
      })
      .join(" ");
  }

  /**
   * Check for common legal accuracy issues
   * @private
   */
  _checkCommonLegalIssues(content, slideIndex, blockIndex, issues) {
    // Check for incorrect article numbers (common mistakes)
    if (/Article 0|Article [0-9]{3,}/i.test(content)) {
      issues.push({
        severity: "error",
        type: "legal",
        message: "Invalid article number detected",
        slideIndex,
        blockIndex,
        suggestion: "Verify article numbers (Constitution has Articles 1-395)",
      });
    }

    // Check for incorrect IPC sections
    if (/Section [0-9]{4,} IPC/i.test(content)) {
      issues.push({
        severity: "warning",
        type: "legal",
        message: "Unusual IPC section number",
        slideIndex,
        blockIndex,
        suggestion: "Verify IPC section numbers (typically 1-511)",
      });
    }

    // Check for missing case years
    const caseWithoutYear =
      /[A-Z][a-zA-Z\s&]+\s+v\.?\s+[A-Z][a-zA-Z\s&]+(?!\s*\(?\d{4})/g;
    if (caseWithoutYear.test(content)) {
      issues.push({
        severity: "info",
        type: "legal",
        message: "Case citation missing year",
        slideIndex,
        blockIndex,
        suggestion: "Include year in case citations for completeness",
      });
    }
  }

  /**
   * Validate article citation format
   * @private
   */
  _isValidArticleCitation(article) {
    // Valid formats: Article 21, Article 19(1)(a), Article 32A
    return /^Article\s+\d{1,3}[A-Z]?(?:\(\d+\))?(?:\([a-z]\))?$/i.test(
      article.trim()
    );
  }

  /**
   * Validate section citation format
   * @private
   */
  _isValidSectionCitation(section) {
    // Valid formats: Section 302, Section 154 CrPC, Section 9 Hindu Marriage Act
    return /^Section\s+\d{1,3}[A-Z]?(?:\(\d+\))?(?:\s+[A-Z][A-Za-z\s]+)?$/i.test(
      section.trim()
    );
  }

  /**
   * Validate case citation format
   * @private
   */
  _isValidCaseCitation(caseRef) {
    // Basic validation for case format
    return /[A-Z][a-zA-Z\s&]+\s+v\.?\s+[A-Z][a-zA-Z\s&]+.*\d{4}/i.test(
      caseRef.trim()
    );
  }

  /**
   * Get empty metrics object
   * @private
   */
  _getEmptyMetrics() {
    return {
      avgBlocksPerSlide: 0,
      avgPointsPerBlock: 0,
      citationCount: 0,
      legalTermDensity: 0,
      formattingCompliance: 0,
    };
  }
}

// Export singleton instance
export const qualityValidator = new QualityValidator();

export default qualityValidator;
