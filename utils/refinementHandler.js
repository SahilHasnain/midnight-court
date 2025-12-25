/**
 * Refinement Handler - Manages iterative refinement of AI-generated slides
 * Allows users to modify generated slides with additional instructions
 * Preserves context and tracks changes between versions
 */

/**
 * Refinement action types
 */
const REFINEMENT_ACTIONS = {
  ADD_DETAIL: "add_detail",
  EXPAND: "expand",
  CONDENSE: "condense",
  CHANGE_FOCUS: "change_focus",
  ADD_MISSING: "add_missing",
  REORDER: "reorder",
  ADJUST_FORMAT: "adjust_format",
  GENERAL: "general",
};

/**
 * Refinement Handler Class
 * Manages the refinement workflow for generated slides
 */
export class RefinementHandler {
  /**
   * Refine existing slides with new instructions
   * @param {Object} existingSlides - Current slide deck
   * @param {string} refinementInstructions - User's refinement request
   * @param {Object} options - Refinement options
   * @param {Array<number>} options.preserveSlides - Slide indices to preserve (optional)
   * @param {Array<number>} options.targetSlides - Specific slides to modify (optional)
   * @param {Function} options.generateFunction - Function to call AI for refinement
   * @returns {Promise<Object>} Refined slides with change tracking
   */
  async refineSlides(existingSlides, refinementInstructions, options = {}) {
    try {
      if (!existingSlides || !existingSlides.slides) {
        throw new Error("Invalid existing slides");
      }

      if (
        !refinementInstructions ||
        refinementInstructions.trim().length === 0
      ) {
        throw new Error("Refinement instructions cannot be empty");
      }

      console.log("🔄 Starting slide refinement...");
      console.log(`📝 Instructions: ${refinementInstructions}`);

      // Parse refinement instructions to understand intent
      const parsedInstructions = this.parseRefinementInstructions(
        refinementInstructions
      );
      console.log(`🎯 Detected action: ${parsedInstructions.action}`);

      // Determine which slides to modify
      const targetSlides =
        options.targetSlides ||
        parsedInstructions.targetSlides ||
        this._getAllSlideIndices(existingSlides);

      // Filter out preserved slides
      const preserveSlides = options.preserveSlides || [];
      const slidesToModify = targetSlides.filter(
        (idx) => !preserveSlides.includes(idx)
      );

      console.log(`🎯 Target slides: ${slidesToModify.join(", ")}`);
      if (preserveSlides.length > 0) {
        console.log(`🔒 Preserved slides: ${preserveSlides.join(", ")}`);
      }

      // Build refinement prompt with context
      const refinementPrompt = this._buildRefinementPrompt(
        existingSlides,
        refinementInstructions,
        parsedInstructions,
        slidesToModify,
        preserveSlides
      );

      // Call AI generation function with refinement context
      if (!options.generateFunction) {
        throw new Error("Generate function is required for refinement");
      }

      const refinedResult = await options.generateFunction(refinementPrompt, {
        isRefinement: true,
        previousSlides: existingSlides,
        targetSlides: slidesToModify,
        preserveSlides: preserveSlides,
      });

      // Apply modifications while preserving user-approved slides
      const modifiedSlides = this.applyModifications(
        existingSlides,
        refinedResult,
        slidesToModify,
        preserveSlides
      );

      // Track changes between versions
      const changes = this.trackChanges(existingSlides, modifiedSlides);

      console.log(
        `✅ Refinement complete. ${changes.length} changes detected.`
      );

      // Add refinement metadata
      const refinementMetadata = {
        refinedAt: new Date().toISOString(),
        instructions: refinementInstructions,
        action: parsedInstructions.action,
        targetSlides: slidesToModify,
        preservedSlides: preserveSlides,
        changesCount: changes.length,
      };

      // Update refinement history
      if (!modifiedSlides.refinementHistory) {
        modifiedSlides.refinementHistory = [];
      }
      modifiedSlides.refinementHistory.push(refinementMetadata);

      return {
        slides: modifiedSlides,
        changes: changes,
        metadata: refinementMetadata,
      };
    } catch (error) {
      console.error("❌ Refinement failed:", error);
      throw new Error(`Refinement failed: ${error.message}`);
    }
  }

  /**
   * Parse refinement instructions to extract user intent
   * @param {string} instructions - User's refinement request
   * @returns {Object} Parsed instructions with action and targets
   */
  parseRefinementInstructions(instructions) {
    const lowerInstructions = instructions.toLowerCase();
    let action = REFINEMENT_ACTIONS.GENERAL;
    let targetSlides = null;
    const modifications = [];

    // Detect action type
    if (/add more|more detail|elaborate|expand on/i.test(lowerInstructions)) {
      action = REFINEMENT_ACTIONS.ADD_DETAIL;
      modifications.push("Add more detailed information");
    } else if (/expand|make longer|more content/i.test(lowerInstructions)) {
      action = REFINEMENT_ACTIONS.EXPAND;
      modifications.push("Expand content with additional points");
    } else if (
      /condense|shorten|make shorter|reduce|simplify/i.test(lowerInstructions)
    ) {
      action = REFINEMENT_ACTIONS.CONDENSE;
      modifications.push("Condense content to essential points");
    } else if (
      /focus on|emphasize|highlight|prioritize/i.test(lowerInstructions)
    ) {
      action = REFINEMENT_ACTIONS.CHANGE_FOCUS;
      modifications.push("Change focus or emphasis");
    } else if (/add|include|missing/i.test(lowerInstructions)) {
      action = REFINEMENT_ACTIONS.ADD_MISSING;
      modifications.push("Add missing elements");
    } else if (/reorder|rearrange|move|swap/i.test(lowerInstructions)) {
      action = REFINEMENT_ACTIONS.REORDER;
      modifications.push("Reorder slides or content");
    } else if (/format|style|color|markdown/i.test(lowerInstructions)) {
      action = REFINEMENT_ACTIONS.ADJUST_FORMAT;
      modifications.push("Adjust formatting");
    }

    // Detect target slides
    const slideNumberMatch = lowerInstructions.match(
      /slide[s]?\s+(\d+)(?:\s*(?:and|,)\s*(\d+))*/gi
    );
    if (slideNumberMatch) {
      targetSlides = [];
      slideNumberMatch.forEach((match) => {
        const numbers = match.match(/\d+/g);
        numbers.forEach((num) => {
          const slideIndex = parseInt(num, 10) - 1; // Convert to 0-based index
          if (slideIndex >= 0) {
            targetSlides.push(slideIndex);
          }
        });
      });
    }

    // Detect specific content to focus on
    const focusKeywords = this._extractFocusKeywords(instructions);
    if (focusKeywords.length > 0) {
      modifications.push(`Focus on: ${focusKeywords.join(", ")}`);
    }

    return {
      action,
      targetSlides,
      modifications,
      focusKeywords,
      originalInstructions: instructions,
    };
  }

  /**
   * Apply targeted modifications to slides
   * @param {Object} originalSlides - Original slide deck
   * @param {Object} refinedSlides - Refined slide deck from AI
   * @param {Array<number>} targetSlides - Slides that were modified
   * @param {Array<number>} preserveSlides - Slides to preserve from original
   * @returns {Object} Modified slide deck
   */
  applyModifications(
    originalSlides,
    refinedSlides,
    targetSlides,
    preserveSlides
  ) {
    // Create a copy of the original slides
    const modifiedSlides = JSON.parse(JSON.stringify(originalSlides));

    // If no refined slides returned, return original
    if (!refinedSlides || !refinedSlides.slides) {
      console.warn("⚠️ No refined slides returned, keeping original");
      return modifiedSlides;
    }

    // Apply modifications to target slides
    targetSlides.forEach((targetIndex) => {
      // Skip if this slide should be preserved
      if (preserveSlides.includes(targetIndex)) {
        return;
      }

      // Find corresponding slide in refined result
      const refinedSlide = refinedSlides.slides[targetIndex];
      if (refinedSlide) {
        // Replace the slide with refined version
        modifiedSlides.slides[targetIndex] = {
          ...refinedSlide,
          _modified: true, // Mark as modified for tracking
          _modifiedAt: new Date().toISOString(),
        };
      }
    });

    // Update metadata
    modifiedSlides.totalSlides = modifiedSlides.slides.length;
    modifiedSlides.lastModified = new Date().toISOString();

    return modifiedSlides;
  }

  /**
   * Track changes between original and refined versions
   * @param {Object} original - Original slide deck
   * @param {Object} refined - Refined slide deck
   * @returns {Array<Object>} Array of changes with details
   */
  trackChanges(original, refined) {
    const changes = [];

    if (!original.slides || !refined.slides) {
      return changes;
    }

    // Compare slide count
    if (original.slides.length !== refined.slides.length) {
      changes.push({
        type: "slide_count",
        description: `Slide count changed from ${original.slides.length} to ${refined.slides.length}`,
        severity: "major",
      });
    }

    // Compare each slide
    const minLength = Math.min(original.slides.length, refined.slides.length);
    for (let i = 0; i < minLength; i++) {
      const origSlide = original.slides[i];
      const refSlide = refined.slides[i];

      // Check if slide was marked as modified
      if (refSlide._modified) {
        // Title change
        if (origSlide.title !== refSlide.title) {
          changes.push({
            type: "title",
            slideIndex: i,
            description: `Slide ${i + 1} title changed`,
            before: origSlide.title,
            after: refSlide.title,
            severity: "minor",
          });
        }

        // Block count change
        const origBlockCount = origSlide.blocks?.length || 0;
        const refBlockCount = refSlide.blocks?.length || 0;
        if (origBlockCount !== refBlockCount) {
          changes.push({
            type: "block_count",
            slideIndex: i,
            description: `Slide ${
              i + 1
            } block count changed from ${origBlockCount} to ${refBlockCount}`,
            before: origBlockCount,
            after: refBlockCount,
            severity: "moderate",
          });
        }

        // Content changes (simplified comparison)
        const origContent = this._extractSlideContent(origSlide);
        const refContent = this._extractSlideContent(refSlide);
        if (origContent !== refContent) {
          const contentDiff = this._calculateContentDifference(
            origContent,
            refContent
          );
          changes.push({
            type: "content",
            slideIndex: i,
            description: `Slide ${
              i + 1
            } content modified (${contentDiff}% changed)`,
            before: origContent.substring(0, 100) + "...",
            after: refContent.substring(0, 100) + "...",
            severity: contentDiff > 50 ? "major" : "moderate",
            changePercentage: contentDiff,
          });
        }

        // Image suggestions change
        const origImages = origSlide.suggestedImages?.length || 0;
        const refImages = refSlide.suggestedImages?.length || 0;
        if (origImages !== refImages) {
          changes.push({
            type: "images",
            slideIndex: i,
            description: `Slide ${i + 1} image suggestions changed`,
            before: origImages,
            after: refImages,
            severity: "minor",
          });
        }
      }
    }

    // Check for added slides
    if (refined.slides.length > original.slides.length) {
      for (let i = original.slides.length; i < refined.slides.length; i++) {
        changes.push({
          type: "slide_added",
          slideIndex: i,
          description: `New slide ${i + 1} added: "${refined.slides[i].title}"`,
          severity: "major",
        });
      }
    }

    // Check for removed slides
    if (original.slides.length > refined.slides.length) {
      for (let i = refined.slides.length; i < original.slides.length; i++) {
        changes.push({
          type: "slide_removed",
          slideIndex: i,
          description: `Slide ${i + 1} removed: "${original.slides[i].title}"`,
          severity: "major",
        });
      }
    }

    return changes;
  }

  // Private helper methods

  /**
   * Get all slide indices
   * @private
   */
  _getAllSlideIndices(slideDeck) {
    return Array.from({ length: slideDeck.slides.length }, (_, i) => i);
  }

  /**
   * Build refinement prompt with context
   * @private
   */
  _buildRefinementPrompt(
    existingSlides,
    instructions,
    parsedInstructions,
    targetSlides,
    preserveSlides
  ) {
    let prompt = `REFINEMENT REQUEST:\n\n`;
    prompt += `User Instructions: ${instructions}\n\n`;
    prompt += `Action Type: ${parsedInstructions.action}\n\n`;

    // Add context about existing slides
    prompt += `CURRENT PRESENTATION:\n`;
    prompt += `Title: ${existingSlides.title || "Untitled"}\n`;
    prompt += `Total Slides: ${existingSlides.slides.length}\n\n`;

    // Add details about slides to modify
    if (targetSlides.length < existingSlides.slides.length) {
      prompt += `TARGET SLIDES TO MODIFY: ${targetSlides
        .map((i) => i + 1)
        .join(", ")}\n\n`;
    }

    if (preserveSlides.length > 0) {
      prompt += `PRESERVED SLIDES (DO NOT MODIFY): ${preserveSlides
        .map((i) => i + 1)
        .join(", ")}\n\n`;
    }

    // Add current slide content for context
    prompt += `CURRENT SLIDE CONTENT:\n\n`;
    existingSlides.slides.forEach((slide, index) => {
      const isTarget = targetSlides.includes(index);
      const isPreserved = preserveSlides.includes(index);

      prompt += `Slide ${index + 1}: ${slide.title}`;
      if (isPreserved) {
        prompt += ` [PRESERVE - DO NOT MODIFY]`;
      } else if (isTarget) {
        prompt += ` [TARGET FOR MODIFICATION]`;
      }
      prompt += `\n`;

      // Add brief content summary
      const blockCount = slide.blocks?.length || 0;
      prompt += `  - ${blockCount} block(s)\n`;

      slide.blocks?.forEach((block, blockIndex) => {
        prompt += `  - Block ${blockIndex + 1}: ${block.type}\n`;
      });

      prompt += `\n`;
    });

    prompt += `\nIMPORTANT INSTRUCTIONS:\n`;
    prompt += `1. Maintain the overall structure and flow of the presentation\n`;
    prompt += `2. Apply the requested modifications ONLY to target slides\n`;
    prompt += `3. Keep preserved slides exactly as they are\n`;
    prompt += `4. Maintain legal accuracy and proper citation format\n`;
    prompt += `5. Follow all formatting rules (markdown colors, block limits, etc.)\n`;
    prompt += `6. Ensure modifications align with the user's specific request\n\n`;

    prompt += `Generate the complete refined presentation with all slides, applying modifications as requested.`;

    return prompt;
  }

  /**
   * Extract focus keywords from instructions
   * @private
   */
  _extractFocusKeywords(instructions) {
    const keywords = [];

    // Look for quoted terms
    const quotedTerms = instructions.match(/"([^"]+)"/g);
    if (quotedTerms) {
      quotedTerms.forEach((term) => {
        keywords.push(term.replace(/"/g, ""));
      });
    }

    // Look for legal terms
    const legalTerms = instructions.match(
      /Article \d+|Section \d+|[A-Z][a-z]+ v\. [A-Z][a-z]+/g
    );
    if (legalTerms) {
      keywords.push(...legalTerms);
    }

    return keywords;
  }

  /**
   * Extract all text content from a slide
   * @private
   */
  _extractSlideContent(slide) {
    let content = slide.title || "";

    slide.blocks?.forEach((block) => {
      switch (block.type) {
        case "text":
          content += " " + (block.data?.points || []).join(" ");
          break;
        case "quote":
          content += " " + (block.data?.quote || "");
          content += " " + (block.data?.citation || "");
          break;
        case "callout":
          content += " " + (block.data?.text || "");
          break;
        case "timeline":
          (block.data?.events || []).forEach((event) => {
            content += " " + (event.description || "");
          });
          break;
        case "evidence":
          (block.data?.items || []).forEach((item) => {
            content += " " + (item.description || "");
          });
          break;
        case "twoColumn":
          content += " " + (block.data?.left?.points || []).join(" ");
          content += " " + (block.data?.right?.points || []).join(" ");
          break;
      }
    });

    return content.trim();
  }

  /**
   * Calculate percentage difference between two text strings
   * @private
   */
  _calculateContentDifference(text1, text2) {
    // Simple character-based difference calculation
    const len1 = text1.length;
    const len2 = text2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 0;

    // Count matching characters (simplified)
    let matches = 0;
    const minLen = Math.min(len1, len2);
    for (let i = 0; i < minLen; i++) {
      if (text1[i] === text2[i]) {
        matches++;
      }
    }

    const similarity = (matches / maxLen) * 100;
    return Math.round(100 - similarity);
  }
}

// Export singleton instance
export const refinementHandler = new RefinementHandler();

export default refinementHandler;
