/**
 * TemplateEngine - Provides predefined structures for common legal scenarios
 * Helps users generate contextually appropriate slides based on case type
 */

/**
 * Template definitions for common legal scenarios
 */
const TEMPLATES = {
  constitutional_challenge: {
    type: "constitutional_challenge",
    name: "Constitutional Challenge",
    description:
      "For cases involving constitutional validity, fundamental rights, and judicial review",
    icon: "⚖️",
    mandatorySlides: [
      "Case Overview",
      "Constitutional Provisions",
      "Grounds of Challenge",
      "Judicial Precedents",
      "Prayer for Relief",
    ],
    slideStructure: {
      "Case Overview": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Introduce the case, parties, and constitutional question",
      },
      "Constitutional Provisions": {
        blocks: ["quote", "text"],
        requireCitation: true,
        purpose: "Quote relevant constitutional articles with explanation",
      },
      "Grounds of Challenge": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "List specific grounds on which the law/action is challenged",
      },
      "Judicial Precedents": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Cite landmark judgments supporting the challenge",
      },
      "Prayer for Relief": {
        blocks: ["callout"],
        purpose: "State the relief sought from the court",
      },
    },
    promptAdditions: `
This is a CONSTITUTIONAL CHALLENGE case. Follow this structure:

1. Case Overview: Introduce parties, constitutional question, and forum
2. Constitutional Provisions: Quote exact text of relevant Articles with citations
3. Grounds of Challenge: List specific grounds (violation of Article X, Y, Z)
4. Judicial Precedents: Cite landmark cases (Kesavananda Bharati, Maneka Gandhi, etc.)
5. Arguments: Use twoColumn block for petitioner vs respondent arguments
6. Court's Analysis: Explain constitutional tests applied (proportionality, basic structure, etc.)
7. Ruling/Expected Outcome: State the decision or expected relief

EMPHASIS:
- Use _blue_ formatting for all Article references (e.g., _Article 21_)
- Use *gold* formatting for constitutional doctrines (e.g., *Basic Structure Doctrine*)
- Use ~red~ formatting for constitutional violations (e.g., ~violation of Article 14~)
- Always cite constitutional provisions with full reference
- Focus on fundamental rights and constitutional principles
`,
    exampleKeywords: [
      "Article",
      "fundamental right",
      "unconstitutional",
      "judicial review",
      "writ petition",
    ],
    suggestedSlideCount: 6,
    useCases: [
      "Challenging validity of a law",
      "Fundamental rights violation",
      "Writ petitions (Article 32, 226)",
      "Constitutional amendments",
    ],
  },

  criminal_prosecution: {
    type: "criminal_prosecution",
    name: "Criminal Prosecution",
    description:
      "For criminal cases with IPC offences, evidence, and witness testimony",
    icon: "🔒",
    mandatorySlides: [
      "Case Overview",
      "Charges and Offences",
      "Material Facts",
      "Evidence Presented",
      "Court Ruling",
    ],
    slideStructure: {
      "Case Overview": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Introduce the criminal case, parties, and charges",
      },
      "Charges and Offences": {
        blocks: ["text"],
        maxPoints: 3,
        purpose: "List IPC sections and specific charges",
      },
      "Material Facts": {
        blocks: ["timeline", "text"],
        purpose: "Chronological sequence of events leading to the offence",
      },
      "Evidence Presented": {
        blocks: ["evidence"],
        maxPoints: 5,
        purpose: "List key evidence (forensic, eyewitness, documentary)",
      },
      "Court Ruling": {
        blocks: ["callout", "text"],
        purpose: "State the verdict and sentencing",
      },
    },
    promptAdditions: `
This is a CRIMINAL PROSECUTION case. Follow this structure:

1. Case Overview: Accused, victim, charges, and court
2. Charges and Offences: List IPC sections with brief description
3. Material Facts: Use timeline block if chronology is important
4. Evidence Presented: Use evidence block for forensic, eyewitness, documentary evidence
5. Arguments: Use twoColumn for prosecution vs defense arguments
6. Legal Analysis: Discuss burden of proof, mens rea, actus reus
7. Court Ruling: State verdict (guilty/not guilty) and sentencing

EMPHASIS:
- Use _blue_ formatting for IPC sections (e.g., _Section 302 IPC_)
- Use ~red~ formatting for offences (e.g., ~Murder under Section 302~)
- Use *gold* formatting for legal principles (e.g., *Mens Rea*, *Beyond Reasonable Doubt*)
- Include evidence types: forensic, eyewitness, circumstantial, documentary
- Focus on criminal procedure and evidentiary standards
`,
    exampleKeywords: [
      "IPC",
      "offence",
      "evidence",
      "prosecution",
      "accused",
      "witness",
    ],
    suggestedSlideCount: 6,
    useCases: [
      "Murder cases",
      "Theft and robbery",
      "Assault and battery",
      "White-collar crimes",
    ],
  },

  civil_dispute: {
    type: "civil_dispute",
    name: "Civil Dispute",
    description:
      "For civil cases involving contracts, torts, property, and damages",
    icon: "📜",
    mandatorySlides: [
      "Case Overview",
      "Facts in Dispute",
      "Legal Issues",
      "Arguments",
      "Relief Sought",
    ],
    slideStructure: {
      "Case Overview": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Introduce parties, nature of dispute, and forum",
      },
      "Facts in Dispute": {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "List admitted facts vs disputed facts",
      },
      "Legal Issues": {
        blocks: ["text"],
        maxPoints: 3,
        purpose: "Frame the legal questions to be decided",
      },
      Arguments: {
        blocks: ["twoColumn"],
        purpose: "Plaintiff vs defendant arguments",
      },
      "Relief Sought": {
        blocks: ["callout"],
        purpose: "State the damages or remedy requested",
      },
    },
    promptAdditions: `
This is a CIVIL DISPUTE case. Follow this structure:

1. Case Overview: Plaintiff, defendant, nature of dispute (contract/tort/property)
2. Facts in Dispute: Distinguish admitted facts from disputed facts
3. Legal Issues: Frame as clear legal questions
4. Applicable Law: Cite relevant sections (Contract Act, Tort Law, Property Law)
5. Arguments: Use twoColumn for plaintiff vs defendant arguments
6. Evidence and Analysis: Discuss documentary evidence, witness testimony
7. Relief Sought: State damages, specific performance, injunction, etc.

EMPHASIS:
- Use _blue_ formatting for statutory sections (e.g., _Section 73, Contract Act_)
- Use *gold* formatting for legal doctrines (e.g., *Doctrine of Frustration*)
- Use ~red~ formatting for breaches (e.g., ~Breach of Contract~)
- Focus on civil remedies: damages, specific performance, injunction
- Include timeline if contract performance or events are time-sensitive
`,
    exampleKeywords: [
      "contract",
      "breach",
      "damages",
      "tort",
      "property",
      "civil suit",
    ],
    suggestedSlideCount: 5,
    useCases: [
      "Breach of contract",
      "Property disputes",
      "Tort claims (negligence, defamation)",
      "Partnership disputes",
    ],
  },

  moot_court: {
    type: "moot_court",
    name: "Moot Court",
    description:
      "Structured format for moot court competitions with clear arguments",
    icon: "🎓",
    mandatorySlides: [
      "Case Overview",
      "Issues Raised",
      "Submissions",
      "Precedents",
      "Prayer",
    ],
    slideStructure: {
      "Case Overview": {
        blocks: ["text"],
        maxPoints: 3,
        purpose: "Brief case summary and parties",
      },
      "Issues Raised": {
        blocks: ["text"],
        maxPoints: 3,
        purpose: "List issues in formal legal language",
      },
      Submissions: {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Main legal submissions with sub-submissions",
      },
      Precedents: {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Cite landmark cases with ratio decidendi",
      },
      Prayer: {
        blocks: ["callout"],
        purpose: "Formal prayer for relief",
      },
    },
    promptAdditions: `
This is a MOOT COURT presentation. Follow competition format:

1. Case Overview: Brief introduction (parties, forum, nature of case)
2. Issues Raised: Frame 2-3 issues in formal legal language
3. Submissions: Main submissions with sub-submissions (hierarchical structure)
4. Precedents: Cite landmark cases with ratio decidendi and application
5. Statutory Provisions: Quote relevant provisions with analysis
6. Counter-Arguments: Address opposing counsel's likely arguments
7. Prayer: Formal prayer for relief

EMPHASIS:
- Use formal moot court language ("It is humbly submitted that...")
- Structure submissions hierarchically (Submission 1, Sub-submission 1.1, 1.2)
- Cite cases with full citations (Case Name v. Case Name, (Year) Volume Reporter Page)
- Use _blue_ for statutory provisions, *gold* for legal principles, ~red~ for violations
- Focus on legal reasoning and precedent application
- Keep slides concise for oral presentation
`,
    exampleKeywords: [
      "moot court",
      "submissions",
      "precedents",
      "prayer",
      "legal reasoning",
    ],
    suggestedSlideCount: 7,
    useCases: [
      "Moot court competitions",
      "Oral arguments preparation",
      "Legal advocacy training",
      "Mock trials",
    ],
  },

  case_brief: {
    type: "case_brief",
    name: "Case Brief",
    description: "Academic format with IRAC structure for case analysis",
    icon: "📚",
    mandatorySlides: [
      "Case Citation",
      "Facts",
      "Issue",
      "Rule",
      "Analysis",
      "Conclusion",
    ],
    slideStructure: {
      "Case Citation": {
        blocks: ["text"],
        maxPoints: 3,
        purpose: "Full case citation and court details",
      },
      Facts: {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Material facts relevant to legal issues",
      },
      Issue: {
        blocks: ["text"],
        maxPoints: 2,
        purpose: "Legal question(s) before the court",
      },
      Rule: {
        blocks: ["quote", "text"],
        requireCitation: true,
        purpose: "Applicable legal rule or principle",
      },
      Analysis: {
        blocks: ["text"],
        maxPoints: 4,
        purpose: "Court's reasoning and application of law to facts",
      },
      Conclusion: {
        blocks: ["callout"],
        purpose: "Court's decision and ratio decidendi",
      },
    },
    promptAdditions: `
This is a CASE BRIEF in IRAC format. Follow this structure:

1. Case Citation: Full citation with court, judges, and date
2. Facts: Material facts only (relevant to legal issues)
3. Issue: Frame as "Whether..." legal question
4. Rule: State the applicable legal rule/principle with citation
5. Analysis: Explain court's reasoning and application of rule to facts
6. Conclusion: State the decision and ratio decidendi (legal principle established)
7. Significance: Explain the case's importance and future application

EMPHASIS:
- Follow IRAC structure strictly (Issue, Rule, Analysis, Conclusion)
- Use _blue_ for statutory provisions, *gold* for legal principles
- Focus on ratio decidendi (binding legal principle)
- Distinguish obiter dicta from ratio decidendi
- Explain the case's significance for future cases
- Keep facts concise and relevant to legal issues
`,
    exampleKeywords: [
      "case brief",
      "IRAC",
      "ratio decidendi",
      "legal analysis",
      "judgment",
    ],
    suggestedSlideCount: 6,
    useCases: [
      "Case study presentations",
      "Legal research summaries",
      "Exam preparation",
      "Academic analysis",
    ],
  },
};

/**
 * TemplateEngine class
 */
class TemplateEngine {
  /**
   * Get all available templates with metadata
   * @returns {Array<Object>} Array of template objects
   */
  getTemplates() {
    return Object.values(TEMPLATES).map((template) => ({
      type: template.type,
      name: template.name,
      description: template.description,
      icon: template.icon,
      suggestedSlideCount: template.suggestedSlideCount,
      useCases: template.useCases,
      exampleKeywords: template.exampleKeywords,
    }));
  }

  /**
   * Get specific template by type
   * @param {string} templateType - Template type identifier
   * @returns {Object|null} Template configuration or null if not found
   */
  getTemplate(templateType) {
    return TEMPLATES[templateType] || null;
  }

  /**
   * Apply template to generation request
   * Enhances generation config with template-specific instructions
   * @param {string} templateType - Template type identifier
   * @param {string} input - User's case description
   * @returns {Object} Enhanced generation config
   */
  applyTemplate(templateType, input) {
    const template = this.getTemplate(templateType);

    if (!template) {
      return {
        input,
        templateApplied: false,
        error: "Template not found",
      };
    }

    return {
      input,
      templateType: template.type,
      templateName: template.name,
      templateApplied: true,
      promptAdditions: template.promptAdditions,
      mandatorySlides: template.mandatorySlides,
      slideStructure: template.slideStructure,
      suggestedSlideCount: template.suggestedSlideCount,
      exampleKeywords: template.exampleKeywords,
    };
  }

  /**
   * Suggest template based on input analysis
   * @param {Object} inputAnalysis - Analysis from InputProcessor
   * @returns {string|null} Recommended template type or null
   */
  suggestTemplate(inputAnalysis) {
    if (!inputAnalysis || !inputAnalysis.caseType) {
      return null;
    }

    // Map case types to templates
    const caseTypeMapping = {
      constitutional: "constitutional_challenge",
      criminal: "criminal_prosecution",
      civil: "civil_dispute",
      procedural: "civil_dispute", // Default to civil for procedural
      general: null, // No specific template for general cases
    };

    const suggestedType = caseTypeMapping[inputAnalysis.caseType];

    // Additional heuristics based on detected entities
    if (suggestedType === null && inputAnalysis.detectedEntities) {
      // If we detect case citations, suggest case brief
      if (
        inputAnalysis.detectedEntities.cases &&
        inputAnalysis.detectedEntities.cases.length > 0
      ) {
        return "case_brief";
      }

      // If we detect moot court keywords, suggest moot court
      const inputLower = inputAnalysis.input?.toLowerCase() || "";
      if (
        inputLower.includes("moot") ||
        inputLower.includes("submission") ||
        inputLower.includes("prayer")
      ) {
        return "moot_court";
      }
    }

    return suggestedType;
  }

  /**
   * Get template metadata for display
   * @param {string} templateType - Template type identifier
   * @returns {Object|null} Template metadata or null
   */
  getTemplateMetadata(templateType) {
    const template = this.getTemplate(templateType);

    if (!template) {
      return null;
    }

    return {
      type: template.type,
      name: template.name,
      description: template.description,
      icon: template.icon,
      mandatorySlides: template.mandatorySlides,
      suggestedSlideCount: template.suggestedSlideCount,
      useCases: template.useCases,
      exampleKeywords: template.exampleKeywords,
    };
  }

  /**
   * Validate if input is suitable for a specific template
   * @param {string} templateType - Template type identifier
   * @param {Object} inputAnalysis - Analysis from InputProcessor
   * @returns {Object} Validation result with suggestions
   */
  validateTemplateMatch(templateType, inputAnalysis) {
    const template = this.getTemplate(templateType);

    if (!template) {
      return {
        valid: false,
        error: "Template not found",
      };
    }

    const warnings = [];
    const suggestions = [];

    // Check if case type matches template
    const expectedCaseTypes = {
      constitutional_challenge: ["constitutional"],
      criminal_prosecution: ["criminal"],
      civil_dispute: ["civil", "procedural"],
      moot_court: ["constitutional", "criminal", "civil"],
      case_brief: ["constitutional", "criminal", "civil"],
    };

    const expected = expectedCaseTypes[templateType] || [];
    if (inputAnalysis.caseType && !expected.includes(inputAnalysis.caseType)) {
      warnings.push(
        `This template is designed for ${expected.join(
          "/"
        )} cases, but your input appears to be a ${
          inputAnalysis.caseType
        } case.`
      );
    }

    // Check for required elements based on template
    if (templateType === "constitutional_challenge") {
      if (!inputAnalysis.elements.hasStatutes) {
        suggestions.push(
          "Include constitutional articles (e.g., Article 14, Article 21)"
        );
      }
      if (!inputAnalysis.elements.hasArguments) {
        suggestions.push("Add grounds of challenge and legal arguments");
      }
    }

    if (templateType === "criminal_prosecution") {
      if (!inputAnalysis.elements.hasEvidence) {
        suggestions.push(
          "Include evidence details (forensic, eyewitness, documentary)"
        );
      }
      if (!inputAnalysis.elements.hasStatutes) {
        suggestions.push("Mention IPC sections and charges");
      }
    }

    if (templateType === "case_brief") {
      if (!inputAnalysis.elements.hasCitations) {
        suggestions.push("Include case citation and court details");
      }
      if (!inputAnalysis.elements.hasLegalIssues) {
        suggestions.push("Frame the legal issue(s) clearly");
      }
    }

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions,
      matchScore: this._calculateMatchScore(templateType, inputAnalysis),
    };
  }

  /**
   * Calculate how well input matches a template (0-100)
   * @private
   * @param {string} templateType - Template type identifier
   * @param {Object} inputAnalysis - Analysis from InputProcessor
   * @returns {number} Match score (0-100)
   */
  _calculateMatchScore(templateType, inputAnalysis) {
    let score = 50; // Base score

    // Case type match
    const expectedCaseTypes = {
      constitutional_challenge: ["constitutional"],
      criminal_prosecution: ["criminal"],
      civil_dispute: ["civil", "procedural"],
      moot_court: ["constitutional", "criminal", "civil"],
      case_brief: ["constitutional", "criminal", "civil"],
    };

    const expected = expectedCaseTypes[templateType] || [];
    if (inputAnalysis.caseType && expected.includes(inputAnalysis.caseType)) {
      score += 20;
    }

    // Element presence
    const elements = inputAnalysis.elements || {};
    const elementCount = Object.values(elements).filter(Boolean).length;
    score += Math.min(elementCount * 5, 30); // Up to 30 points for elements

    return Math.min(score, 100);
  }
}

// Export singleton instance
export const templateEngine = new TemplateEngine();

// Export class for testing
export default TemplateEngine;
