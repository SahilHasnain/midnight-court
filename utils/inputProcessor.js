/**
 * InputProcessor - Analyzes and validates user input for slide generation
 * Provides real-time feedback on input quality and completeness
 */

/**
 * Pattern matching for Indian legal references
 */
const LEGAL_PATTERNS = {
  // Constitutional articles: "Article 21", "Article 14", "Articles 19(1)(a)"
  article: /\b[Aa]rticles?\s+\d+(\([^\)]+\))?(\s+of\s+the\s+Constitution)?/g,

  // IPC sections: "Section 302 IPC", "Section 154", "Sections 375-376"
  ipcSection: /\b[Ss]ections?\s+\d+(-\d+)?(\s+IPC)?/g,

  // CrPC sections: "Section 154 CrPC", "Section 161 CrPC"
  crpcSection: /\b[Ss]ections?\s+\d+\s+CrPC/g,

  // CPC sections: "Section 9 CPC", "Order 7 Rule 11"
  cpcSection: /\b[Ss]ections?\s+\d+\s+CPC/g,

  // Case citations: "Name v. Name", "Name vs Name", "Name v Name"
  caseCitation:
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+v\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,

  // Years in parentheses: "(2017)", "(1973)"
  year: /\(\d{4}\)/g,

  // Legal terms
  legalTerms:
    /\b(petitioner|respondent|appellant|accused|prosecution|defense|plaintiff|defendant|court|judgment|ruling|verdict|evidence|witness|testimony|fundamental rights?|constitutional|unconstitutional|writ|habeas corpus|mandamus|certiorari|prohibition|quo warranto|suo motu|prima facie|mens rea|actus reus|ratio decidendi|obiter dicta|res judicata|stare decisis|natural justice|due process|judicial review|basic structure)\b/gi,
};

/**
 * Case type keywords for detection
 */
const CASE_TYPE_KEYWORDS = {
  constitutional: [
    "article",
    "constitution",
    "fundamental right",
    "constitutional validity",
    "judicial review",
    "writ",
    "habeas corpus",
    "mandamus",
    "certiorari",
    "basic structure",
    "unconstitutional",
    "constitutional challenge",
  ],
  criminal: [
    "ipc",
    "crpc",
    "murder",
    "section 302",
    "section 307",
    "section 375",
    "accused",
    "prosecution",
    "defense",
    "evidence",
    "witness",
    "testimony",
    "forensic",
    "conviction",
    "acquittal",
    "bail",
    "fir",
    "charge sheet",
  ],
  civil: [
    "cpc",
    "contract",
    "breach",
    "damages",
    "specific performance",
    "injunction",
    "plaintiff",
    "defendant",
    "tort",
    "negligence",
    "property",
    "suit",
    "decree",
    "civil dispute",
    "compensation",
    "liability",
  ],
  procedural: [
    "jurisdiction",
    "appeal",
    "revision",
    "review",
    "limitation",
    "procedure",
    "service",
    "pleading",
    "interim order",
    "stay",
  ],
};

/**
 * InputProcessor class for analyzing and validating case descriptions
 */
export class InputProcessor {
  /**
   * Analyze input and extract key elements
   * @param {string} input - User's case description
   * @returns {Object} Analysis result with case type, elements, completeness, and suggestions
   */
  analyzeInput(input) {
    if (!input || typeof input !== "string") {
      return this._getEmptyAnalysis();
    }

    const trimmedInput = input.trim();

    if (trimmedInput.length === 0) {
      return this._getEmptyAnalysis();
    }

    // Detect case type
    const caseType = this.detectCaseType(trimmedInput);

    // Extract legal entities
    const detectedEntities = this._extractLegalEntities(trimmedInput);

    // Analyze content elements
    const elements = this._analyzeElements(trimmedInput, detectedEntities);

    // Calculate completeness score
    const completeness = this._calculateCompleteness(
      elements,
      trimmedInput.length
    );

    // Suggest slide count based on input
    const estimatedSlideCount = this.suggestSlideCount(trimmedInput, elements);

    // Generate suggestions
    const suggestions = this.suggestImprovements(trimmedInput, {
      caseType,
      elements,
      completeness,
      detectedEntities,
    });

    return {
      caseType,
      completeness,
      elements,
      detectedEntities,
      suggestions,
      estimatedSlideCount,
      inputLength: trimmedInput.length,
    };
  }

  /**
   * Validate input meets minimum requirements
   * @param {string} input - User's case description
   * @returns {Object} Validation result with valid flag, errors, and warnings
   */
  validateInput(input) {
    const errors = [];
    const warnings = [];

    if (!input || typeof input !== "string") {
      errors.push("Input must be a non-empty string");
      return { valid: false, errors, warnings };
    }

    const trimmedInput = input.trim();

    // Check minimum length
    if (trimmedInput.length < 100) {
      errors.push(
        "Input too short (minimum 100 characters for quality results)"
      );
    }

    // Check maximum length
    if (trimmedInput.length > 3000) {
      errors.push("Input too long (maximum 3000 characters)");
    }

    // Analyze content
    const analysis = this.analyzeInput(trimmedInput);

    // Check for basic legal content
    if (analysis.completeness < 30) {
      warnings.push("Input lacks sufficient legal details for quality slides");
    }

    // Check for at least some legal references
    const hasLegalContent =
      analysis.detectedEntities.articles.length > 0 ||
      analysis.detectedEntities.sections.length > 0 ||
      analysis.detectedEntities.cases.length > 0 ||
      analysis.elements.hasLegalIssues;

    if (!hasLegalContent && trimmedInput.length >= 100) {
      warnings.push(
        "Consider adding legal references (articles, sections, or case names)"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      analysis,
    };
  }

  /**
   * Detect case type from input using pattern matching
   * @param {string} input - User's case description
   * @returns {string} Case type: 'constitutional' | 'criminal' | 'civil' | 'procedural' | 'general'
   */
  detectCaseType(input) {
    if (!input) return "general";

    const lowerInput = input.toLowerCase();
    const scores = {
      constitutional: 0,
      criminal: 0,
      civil: 0,
      procedural: 0,
    };

    // Score each case type based on keyword matches
    Object.entries(CASE_TYPE_KEYWORDS).forEach(([type, keywords]) => {
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = lowerInput.match(regex);
        if (matches) {
          scores[type] += matches.length;
        }
      });
    });

    // Find the highest scoring type
    const maxScore = Math.max(...Object.values(scores));

    if (maxScore === 0) {
      return "general";
    }

    // Return the type with highest score
    const detectedType = Object.entries(scores).find(
      ([_, score]) => score === maxScore
    )?.[0];

    return detectedType || "general";
  }

  /**
   * Suggest improvements to input based on analysis
   * @param {string} input - User's case description
   * @param {Object} analysis - Analysis result from analyzeInput
   * @returns {Array<string>} Array of actionable suggestions
   */
  suggestImprovements(input, analysis) {
    const suggestions = [];

    if (!analysis) {
      return suggestions;
    }

    const { elements, detectedEntities, completeness, caseType } = analysis;

    // Suggestions based on missing elements
    if (!elements.hasFacts) {
      suggestions.push(
        "Add key facts: parties involved, what happened, when it happened"
      );
    }

    if (!elements.hasLegalIssues) {
      suggestions.push("Describe the legal issues or questions to be resolved");
    }

    if (!elements.hasStatutes && caseType !== "general") {
      if (caseType === "constitutional") {
        suggestions.push(
          "Include relevant constitutional articles (e.g., Article 14, Article 21)"
        );
      } else if (caseType === "criminal") {
        suggestions.push(
          "Mention applicable IPC sections (e.g., Section 302 IPC)"
        );
      } else if (caseType === "civil") {
        suggestions.push(
          "Reference relevant statutory provisions or contract clauses"
        );
      }
    }

    if (!elements.hasArguments && input.length > 200) {
      suggestions.push(
        "Include arguments from both sides (petitioner/respondent or prosecution/defense)"
      );
    }

    if (
      !elements.hasEvidence &&
      caseType === "criminal" &&
      input.length > 300
    ) {
      suggestions.push(
        "Describe key evidence presented (witnesses, forensic reports, documents)"
      );
    }

    if (
      !elements.hasCitations &&
      detectedEntities.cases.length === 0 &&
      input.length > 250
    ) {
      suggestions.push(
        "Mention relevant case law or landmark judgments if applicable"
      );
    }

    // Suggestions based on completeness
    if (completeness < 40 && input.length >= 100) {
      suggestions.push(
        "Provide more details about the case for better slide generation"
      );
    }

    // Case-type specific suggestions
    if (
      caseType === "constitutional" &&
      !input.toLowerCase().includes("fundamental right")
    ) {
      suggestions.push("Specify which fundamental rights are involved");
    }

    if (caseType === "criminal" && !elements.hasEvidence) {
      suggestions.push("Include details about evidence and witness testimony");
    }

    // Limit to top 3 most important suggestions
    return suggestions.slice(0, 3);
  }

  /**
   * Suggest optimal slide count based on input length and complexity
   * @param {string} input - User's case description
   * @param {Object} elements - Analyzed elements
   * @returns {number} Suggested slide count (3-8)
   */
  suggestSlideCount(input, elements) {
    if (!input) return 5;

    const length = input.trim().length;
    let suggestedCount = 5; // Default

    // Base count on length
    if (length < 200) {
      suggestedCount = 3;
    } else if (length < 500) {
      suggestedCount = 4;
    } else if (length < 1000) {
      suggestedCount = 5;
    } else if (length < 1500) {
      suggestedCount = 6;
    } else if (length < 2000) {
      suggestedCount = 7;
    } else {
      suggestedCount = 8;
    }

    // Adjust based on complexity
    if (elements) {
      let complexityBonus = 0;

      if (elements.hasArguments) complexityBonus++;
      if (elements.hasEvidence) complexityBonus++;
      if (elements.hasCitations) complexityBonus++;

      // Add 1 slide for high complexity
      if (complexityBonus >= 2 && suggestedCount < 8) {
        suggestedCount++;
      }
    }

    // Ensure within bounds
    return Math.max(3, Math.min(8, suggestedCount));
  }

  /**
   * Extract legal entities from input
   * @private
   */
  _extractLegalEntities(input) {
    const articles = [...new Set(input.match(LEGAL_PATTERNS.article) || [])];
    const ipcSections = [
      ...new Set(input.match(LEGAL_PATTERNS.ipcSection) || []),
    ];
    const crpcSections = [
      ...new Set(input.match(LEGAL_PATTERNS.crpcSection) || []),
    ];
    const cpcSections = [
      ...new Set(input.match(LEGAL_PATTERNS.cpcSection) || []),
    ];
    const cases = [...new Set(input.match(LEGAL_PATTERNS.caseCitation) || [])];
    const years = [...new Set(input.match(LEGAL_PATTERNS.year) || [])];

    // Combine all sections
    const sections = [...ipcSections, ...crpcSections, ...cpcSections];

    // Extract parties (basic detection)
    const parties = this._extractParties(input);

    return {
      articles,
      sections,
      cases,
      years,
      parties,
    };
  }

  /**
   * Extract party names from input
   * @private
   */
  _extractParties(input) {
    const parties = [];
    const lowerInput = input.toLowerCase();

    // Look for common party indicators
    const partyPatterns = [
      /petitioner[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /respondent[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /plaintiff[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /defendant[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /accused[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    ];

    partyPatterns.forEach((pattern) => {
      const matches = input.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          parties.push(match[1].trim());
        }
      }
    });

    return [...new Set(parties)];
  }

  /**
   * Analyze content elements
   * @private
   */
  _analyzeElements(input, detectedEntities) {
    const lowerInput = input.toLowerCase();

    // Check for facts
    const hasFacts =
      /\b(fact|event|happened|occurred|incident|timeline|date|when|where)\b/i.test(
        input
      ) ||
      detectedEntities.years.length > 0 ||
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(input); // Date patterns

    // Check for legal issues
    const hasLegalIssues =
      /\b(issue|question|whether|challenge|dispute|matter|contention|ground)\b/i.test(
        input
      ) || /\b(violat|breach|infringe|unconstitutional)\b/i.test(input);

    // Check for statutes
    const hasStatutes =
      detectedEntities.articles.length > 0 ||
      detectedEntities.sections.length > 0;

    // Check for arguments
    const hasArguments =
      /\b(argument|contention|submission|claim|assert|maintain|plead)\b/i.test(
        input
      ) ||
      /\b(petitioner.*argued|respondent.*argued|prosecution.*argued|defense.*argued)\b/i.test(
        input
      );

    // Check for evidence
    const hasEvidence =
      /\b(evidence|witness|testimony|forensic|document|exhibit|proof|cctv|fingerprint|dna)\b/i.test(
        input
      );

    // Check for citations
    const hasCitations =
      detectedEntities.cases.length > 0 ||
      /\b(judgment|precedent|landmark|held|ruled|decided)\b/i.test(input);

    return {
      hasFacts,
      hasLegalIssues,
      hasStatutes,
      hasArguments,
      hasEvidence,
      hasCitations,
    };
  }

  /**
   * Calculate completeness score (0-100)
   * @private
   */
  _calculateCompleteness(elements, inputLength) {
    let score = 0;

    // Base score from length (max 30 points)
    if (inputLength >= 100) score += 10;
    if (inputLength >= 300) score += 10;
    if (inputLength >= 600) score += 10;

    // Element presence (70 points total)
    if (elements.hasFacts) score += 15;
    if (elements.hasLegalIssues) score += 15;
    if (elements.hasStatutes) score += 15;
    if (elements.hasArguments) score += 10;
    if (elements.hasEvidence) score += 8;
    if (elements.hasCitations) score += 7;

    return Math.min(100, score);
  }

  /**
   * Get empty analysis object
   * @private
   */
  _getEmptyAnalysis() {
    return {
      caseType: "general",
      completeness: 0,
      elements: {
        hasFacts: false,
        hasLegalIssues: false,
        hasStatutes: false,
        hasArguments: false,
        hasEvidence: false,
        hasCitations: false,
      },
      detectedEntities: {
        articles: [],
        sections: [],
        cases: [],
        years: [],
        parties: [],
      },
      suggestions: ["Start by describing the case facts and legal issues"],
      estimatedSlideCount: 5,
      inputLength: 0,
    };
  }
}

// Export singleton instance
export const inputProcessor = new InputProcessor();

export default inputProcessor;
