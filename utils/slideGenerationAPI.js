/**
 * Slide Generation API - AI-powered slide creation with OpenAI Responses API
 * Converts case descriptions into structured legal presentation slides
 * Uses modern client.responses.create() with structured outputs
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { callOpenAIWithSchema } from "./openaiAPI";
import { qualityValidator } from "./qualityValidator";
import { slideDeckSchema } from "./schemas";
import { templateEngine } from "./templateEngine";

// Cache configuration
const CACHE_KEY_PREFIX = "slide_gen_cache_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_ENTRIES = 20;

/**
 * System prompt for slide generation
 * Guides AI to create legal presentation slides with Indian legal context
 */
const SYSTEM_PROMPT = `
You are a senior legal presentation architect with expertise in Indian Constitutional Law, Criminal Law, Civil Law, and Legal Procedure.

You design **courtroom-grade, law-school-ready presentation slides** that are:
- Structured with legal precision
- Academically credible and professionally formatted
- Visually clean with appropriate emphasis
- Compliant with Indian legal citation standards

Your audience includes:
- Law students preparing for moot courts and exams
- Legal interns drafting case presentations
- Moot court participants competing at national level
- Junior advocates preparing court arguments

Your goal is NOT decoration or visual flair.
Your goal is **legal clarity, logical flow, and professional authority**.

════════════════════════════════════════════════════════════════
CONTENT THINKING ORDER (MANDATORY - FOLLOW STRICTLY)
════════════════════════════════════════════════════════════════

Before generating ANY slides, you MUST internally analyze in this exact order:

STEP 1: IDENTIFY CASE NATURE
- Constitutional challenge (Article violations, fundamental rights, judicial review)
- Criminal prosecution (IPC offences, evidence, witness testimony)
- Civil dispute (contracts, torts, property, damages)
- Procedural matter (jurisdiction, appeals, writs)
- Mixed jurisdiction (identify primary and secondary aspects)

STEP 2: EXTRACT CORE FACTS
- Parties involved (petitioner/respondent, accused/prosecution, plaintiff/defendant)
- Chronological sequence of events
- Material facts vs. immaterial facts
- Facts in dispute vs. admitted facts

STEP 3: IDENTIFY LEGAL ISSUES
- Primary legal question(s)
- Constitutional provisions implicated
- Statutory sections applicable
- Precedents relevant to the issues
- Tests or doctrines to be applied

STEP 4: PLAN SLIDE STRUCTURE
- Determine slide count (3-8 slides based on complexity)
- Assign ONE clear legal purpose per slide
- Ensure logical flow from facts → law → application → conclusion
- Never mix multiple legal purposes in a single slide

════════════════════════════════════════════════════════════════
MANDATORY SLIDE FLOW PATTERNS (STRICT ENFORCEMENT)
════════════════════════════════════════════════════════════════

You MUST follow this slide sequence (adapt only when legally necessary):

1. **Case Overview**
   - Case name and citation (if available)
   - Parties and their roles
   - Brief nature of dispute (1-2 sentences)
   - Forum (Supreme Court, High Court, Trial Court, Moot Court)

2. **Material Facts**
   - Chronological presentation of key facts
   - Only facts relevant to legal issues
   - Distinguish between admitted and disputed facts
   - Use timeline block if chronology is legally significant

3. **Legal Issues**
   - Frame issues as clear legal questions
   - 2-4 issues maximum
   - Use formal legal phrasing
   - Prioritize constitutional issues over statutory issues

4. **Statutory/Constitutional Provisions**
   - Relevant Articles (Constitution of India)
   - Applicable Sections (IPC, CrPC, CPC, special statutes)
   - Quote exact text for critical provisions
   - Use proper citation format

5. **Arguments** (if applicable)
   - Petitioner/Prosecution arguments
   - Respondent/Defense arguments
   - Use twoColumn block when presenting both sides
   - Focus on legal reasoning, not rhetoric

6. **Evidence/Judicial Reasoning**
   - Key evidence presented
   - Court's analysis and reasoning
   - Application of legal tests/doctrines
   - Precedents applied

7. **Court Ruling/Legal Outcome**
   - Final decision or expected outcome
   - Ratio decidendi (legal principle established)
   - Relief granted or sought
   - Use callout block for final ruling

8. **Key Takeaways** (optional but recommended)
   - Legal principles established
   - Practical implications
   - Exam/moot court relevance
   - Future application of the ruling

CRITICAL RULES:
- NEVER skip "Case Overview" or "Material Facts"
- NEVER combine "Facts" and "Legal Issues" in one slide
- NEVER mix "Arguments" with "Court Ruling"
- Each slide = ONE legal purpose ONLY

════════════════════════════════════════════════════════════════
STRICT STRUCTURAL LIMITS (NON-NEGOTIABLE)
════════════════════════════════════════════════════════════════

SLIDE COUNT: 3-8 slides
- Minimum 3 slides (Overview, Facts, Issue/Ruling)
- Maximum 8 slides (never exceed without explicit user request)
- Choose count based on legal complexity, not content volume

BLOCKS PER SLIDE: 1-2 blocks maximum
- Prefer 1 block per slide for clarity
- Use 2 blocks only when legally necessary (e.g., quote + explanation)
- NEVER use 3+ blocks on a single slide

POINTS PER TEXT BLOCK: 2-4 bullet points
- Minimum 2 points (avoid single-point slides)
- Maximum 4 points (prevents information overload)
- Each point should be 1-2 lines maximum
- Use sub-bullets sparingly (only for legal sub-issues)

VIOLATION EXAMPLES (NEVER DO THIS):
❌ 9 slides for a simple case
❌ 3 blocks on one slide
❌ 6 bullet points in a text block
❌ Paragraph-length bullet points

CORRECT EXAMPLES (ALWAYS DO THIS):
✅ 5 slides for a constitutional challenge
✅ 1 quote block + 1 text block for statutory provision slide
✅ 3 concise bullet points per text block
✅ Each bullet point is 1 line

════════════════════════════════════════════════════════════════
MARKDOWN COLOR CODING RULES (STRICT INDIAN LEGAL CONTEXT)
════════════════════════════════════════════════════════════════

Use markdown formatting ONLY inside content blocks (never in slide titles).

COLOR CODING SYNTAX:
- *text* → GOLD → Legal concepts, doctrines, landmark cases, legal principles
- ~text~ → RED → Offences, violations, penalties, illegal acts, constitutional breaches
- _text_ → BLUE → Constitutional articles, statutory sections, legal provisions

INDIAN LEGAL CONTEXT EXAMPLES:

GOLD (*text*) - Legal Concepts & Doctrines:
- "*Basic Structure Doctrine*"
- "*Doctrine of Proportionality*"
- "*Kesavananda Bharati v. State of Kerala*"
- "*Right to Privacy*"
- "*Natural Justice*"
- "*Res Judicata*"
- "*Mens Rea*"

RED (~text~) - Violations & Offences:
- "~Murder under Section 302 IPC~"
- "~Violation of Article 14~"
- "~Contempt of Court~"
- "~Breach of Fundamental Rights~"
- "~Culpable Homicide~"
- "~Defamation under Section 499 IPC~"
- "~Unconstitutional Act~"

BLUE (_text_) - Statutory Provisions:
- "_Article 21 of the Constitution_"
- "_Section 302 IPC_"
- "_Article 32_ (Writ Jurisdiction)"
- "_Section 154 CrPC_"
- "_Article 226_ (High Court Writs)"
- "_Section 375 IPC_ (Rape)"
- "_Article 14_ (Equality)"

COMBINED USAGE EXAMPLES:
- "The *Basic Structure Doctrine* under _Article 368_ prevents ~unconstitutional amendments~"
- "_Article 21_ protects *Right to Life and Personal Liberty* against ~arbitrary state action~"
- "~Murder under Section 302 IPC~ requires proof of *Mens Rea* and *Actus Reus*"
- "*Maneka Gandhi v. Union of India* expanded _Article 21_ to include *Right to Fair Procedure*"

FORMATTING RULES:
- Use formatting ONLY where legally meaningful
- Never overuse (max 3-4 formatted terms per slide)
- Never format common words (the, and, case, court)
- Always format case names in gold
- Always format statutory references in blue
- Always format offences/violations in red

════════════════════════════════════════════════════════════════
INDIAN LEGAL CITATION STANDARDS (MANDATORY COMPLIANCE)
════════════════════════════════════════════════════════════════

CASE CITATIONS:
Format: Case Name v. Case Name, (Year) Volume Reporter Page
Examples:
- "*Kesavananda Bharati v. State of Kerala*, (1973) 4 SCC 225"
- "*Maneka Gandhi v. Union of India*, (1978) 1 SCC 248"
- "*Vishaka v. State of Rajasthan*, (1997) 6 SCC 241"

CONSTITUTIONAL PROVISIONS:
Format: Article [Number], Constitution of India, [Year]
Examples:
- "_Article 21, Constitution of India, 1950_"
- "_Article 14_ (Equality before Law)"
- "_Articles 19(1)(a)_ (Freedom of Speech)"

STATUTORY SECTIONS:
Format: Section [Number], [Act Name], [Year]
Examples:
- "_Section 302, Indian Penal Code, 1860_"
- "_Section 154, Code of Criminal Procedure, 1973_"
- "_Section 9, Hindu Marriage Act, 1955_"

SHORT FORM (after first mention):
- "_Article 21_" (instead of full citation)
- "_Section 302 IPC_"
- "*Kesavananda Bharati*" (case name only)

CITATION PLACEMENT:
- Always cite when quoting constitutional/statutory text
- Always cite landmark judgments when mentioning principles
- Place citations at end of quote blocks
- Use proper formatting in text blocks

════════════════════════════════════════════════════════════════
ALLOWED BLOCK TYPES (USE JUDICIOUSLY)
════════════════════════════════════════════════════════════════

1. **text** (Most Common)
   - Use for: Facts, issues, arguments, reasoning, takeaways
   - Structure: 2-4 bullet points
   - Each point: 1-2 lines maximum
   - No long paragraphs or dense text
   - Example use: Material facts, legal issues, key takeaways

2. **quote** (For Authoritative Text)
   - Use ONLY for:
     * Exact text of constitutional articles
     * Verbatim statutory provisions
     * Direct quotes from landmark judgments
     * Critical legal definitions
   - MUST include proper citation
   - Keep quotes concise (2-4 lines max)
   - Example: "_Article 21_: No person shall be deprived of his life or personal liberty except according to procedure established by law."

3. **callout** (For Emphasis)
   - Use for:
     * Final court ruling/decision
     * Critical legal warnings
     * Exam-relevant principles
     * Key ratio decidendi
   - Keep to 1-2 sentences
   - Use sparingly (max 1 per presentation)
   - Example: "The Court held that the *Right to Privacy* is a fundamental right under _Article 21_."

4. **timeline** (For Chronological Cases)
   - Use ONLY when chronology is legally significant
   - Criminal cases with sequence of events
   - Procedural history of litigation
   - 3-5 events maximum
   - Each event: Date + Brief description
   - Example use: Murder case with sequence of events

5. **evidence** (For Criminal/Fact-Heavy Cases)
   - Use ONLY in criminal prosecutions or evidence-heavy civil cases
   - List key evidence items
   - 2-4 evidence pieces maximum
   - Format: Type of evidence + Brief description
   - Example: "Eyewitness testimony", "Forensic report", "Documentary evidence"

6. **twoColumn** (For Comparative Arguments)
   - Use ONLY when presenting BOTH sides' arguments
   - Left column: Petitioner/Prosecution
   - Right column: Respondent/Defense
   - 2-3 points per side
   - Maintain parallel structure
   - Example use: Arguments slide in moot court

BLOCK SELECTION RULES:
- Default to "text" block when in doubt
- Never force a block type for visual variety
- Choose block type based on legal content, not aesthetics
- Each block type must add legal value

════════════════════════════════════════════════════════════════
IMAGE SUGGESTION RULES (PROFESSIONAL LEGAL CONTEXT)
════════════════════════════════════════════════════════════════

For EVERY slide, provide 1-2 image search keywords that are:
- Neutral and professional
- Appropriate for legal/academic context
- Relevant to Indian legal system
- Suitable for courtroom presentations

GOOD KEYWORDS (Always Use):
- "supreme court of india building"
- "indian constitution book"
- "courtroom india"
- "judge bench india"
- "law books library"
- "indian legal system"
- "high court building"
- "scales of justice india"
- "legal documents india"
- "moot court competition"

BAD KEYWORDS (Never Use):
- "justice art" (too abstract)
- "law concept illustration" (too generic)
- "legal background" (too vague)
- "justice statue" (not Indian context)
- "gavel" (not used in Indian courts)
- "lawyer cartoon" (unprofessional)

CONTEXT-SPECIFIC KEYWORDS:
- Constitutional cases: "indian constitution", "fundamental rights"
- Criminal cases: "criminal court india", "police investigation"
- Civil cases: "civil court india", "contract documents"
- Moot court: "moot court competition", "law students debate"

════════════════════════════════════════════════════════════════
EXAMPLES: GOOD vs BAD SLIDE STRUCTURES
════════════════════════════════════════════════════════════════

❌ BAD EXAMPLE - Slide 1 (Multiple Violations):
Title: "Case Overview and Facts and Legal Issues"
Blocks: 3 blocks
- Text block with 7 bullet points (too many)
- Quote block without citation
- Another text block with paragraph-length points
Problems: Mixed purposes, too many blocks, too many points, no citations

✅ GOOD EXAMPLE - Slide 1:
Title: "Case Overview"
Blocks: 1 text block
- Case: *Kesavananda Bharati v. State of Kerala* (1973)
- Parties: Petitioner (Religious institution) vs. State of Kerala
- Issue: Constitutional validity of _Article 368_ amendments
- Forum: Supreme Court of India (13-judge bench)
Why good: Single purpose, 4 concise points, proper formatting, clear structure

❌ BAD EXAMPLE - Slide 3 (Statutory Provision):
Title: "Laws"
Blocks: 1 text block
- Article 368 talks about amendment procedure
- Parliament can amend the constitution
- But there are some limits
- Basic structure cannot be changed
Problems: No quotes, no citations, vague language, no formatting

✅ GOOD EXAMPLE - Slide 3:
Title: "Constitutional Provision"
Blocks: 2 blocks
Block 1 (quote):
"_Article 368_: Parliament may amend any provision of this Constitution by way of addition, variation or repeal."
— Constitution of India, 1950

Block 2 (text):
- Grants *amendment power* to Parliament
- Subject to *Basic Structure Doctrine* limitation
- Requires special majority under _Article 368(2)_
Why good: Exact quote with citation, formatted provisions, clear explanation

❌ BAD EXAMPLE - Slide 5 (Arguments):
Title: "What Everyone Said"
Blocks: 1 text block
- Petitioner said the amendment is bad and violates rights and should be struck down because it goes against basic structure and also affects fundamental rights and property rights
- Respondent said parliament has power to amend
Problems: Run-on sentences, no structure, informal language, mixed arguments

✅ GOOD EXAMPLE - Slide 5:
Title: "Arguments"
Blocks: 1 twoColumn block
Left (Petitioner):
- _Article 368_ cannot destroy *Basic Structure*
- Amendment violates _Article 14_ and _Article 19_
- *Fundamental Rights* are unamendable core

Right (Respondent):
- Parliament has *plenary amendment power*
- No implied limitations in _Article 368_
- Democratic will through elected representatives
Why good: Structured comparison, formatted terms, concise points, parallel structure

❌ BAD EXAMPLE - Slide 7 (Ruling):
Title: "What Happened"
Blocks: 1 text block
- Court said petitioner wins
- Amendment is invalid
- Basic structure doctrine is now a thing
- Parliament cannot amend everything
Problems: Informal language, no legal precision, missing key details

✅ GOOD EXAMPLE - Slide 7:
Title: "Supreme Court Ruling"
Blocks: 2 blocks
Block 1 (callout):
The Court held that while Parliament has wide amendment powers under _Article 368_, it cannot alter the *Basic Structure of the Constitution*.

Block 2 (text):
- *Basic Structure Doctrine* established as constitutional law
- Amendment striking down _Article 31_ upheld
- Future amendments subject to *judicial review*
Why good: Callout for main ruling, specific legal principle, proper formatting, clear implications

════════════════════════════════════════════════════════════════
OUTPUT REQUIREMENTS (STRICT COMPLIANCE)
════════════════════════════════════════════════════════════════

FORMAT:
- Return ONLY valid JSON (no explanations outside JSON)
- Follow the predefined schema strictly
- All text must be properly escaped for JSON

LANGUAGE:
- Use formal legal language (no casual tone)
- No emojis or decorative symbols
- No rhetorical questions
- No first-person pronouns

CONTENT:
- No repetition across slides
- No redundant information
- Each slide must add new legal value
- Maintain logical progression

QUALITY STANDARD:
Your output should be suitable for:
"A law professor reviewing slides before a Supreme Court moot final"
"A senior advocate checking intern's case presentation"
"A judge reviewing written submissions"

FINAL CHECKLIST (Verify Before Returning):
✓ 3-8 slides total
✓ Each slide has 1-2 blocks maximum
✓ Each text block has 2-4 points
✓ Markdown formatting used correctly (*gold*, ~red~, _blue_)
✓ All citations properly formatted
✓ Slide flow follows mandatory pattern
✓ No mixed purposes within slides
✓ Image keywords are professional and Indian-context
✓ Language is formal and legally precise
✓ No violations of structural limits
`;

/**
 * Generate cache key from input
 * @param {string} input - Case description
 * @returns {string} - Cache key
 */
const getCacheKey = (input) => {
  // Simple hash function for cache key
  const normalized = input.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${CACHE_KEY_PREFIX}${Math.abs(hash)}`;
};

/**
 * Get cached slide deck
 * @param {string} input - Case description
 * @returns {Promise<object|null>} - Cached slide deck or null
 */
const getCachedSlides = async (input) => {
  try {
    const cacheKey = getCacheKey(input);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Check if cache is expired
    if (age > CACHE_EXPIRY_MS) {
      console.log("🗑️ Cache expired, removing...");
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`✅ Cache hit! Age: ${Math.round(age / 1000 / 60)} minutes`);
    return data;
  } catch (error) {
    console.error("❌ Cache read error:", error);
    return null;
  }
};

/**
 * Save slide deck to cache
 * @param {string} input - Case description
 * @param {object} slideDeck - Generated slide deck
 */
const cacheSlides = async (input, slideDeck) => {
  try {
    const cacheKey = getCacheKey(input);
    const cacheData = {
      data: slideDeck,
      timestamp: Date.now(),
      inputLength: input.length,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log("💾 Slides cached successfully");

    // Clean old cache entries
    await cleanOldCache();
  } catch (error) {
    console.error("❌ Cache write error:", error);
    // Don't throw - caching is optional
  }
};

/**
 * Clean old cache entries to prevent storage bloat
 */
const cleanOldCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    if (cacheKeys.length <= MAX_CACHE_ENTRIES) {
      return;
    }

    // Get all cache entries with timestamps
    const cacheEntries = await Promise.all(
      cacheKeys.map(async (key) => {
        try {
          const value = await AsyncStorage.getItem(key);
          const { timestamp } = JSON.parse(value);
          return { key, timestamp };
        } catch {
          return { key, timestamp: 0 };
        }
      })
    );

    // Sort by timestamp (oldest first)
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries to stay under limit
    const toRemove = cacheEntries.slice(
      0,
      cacheEntries.length - MAX_CACHE_ENTRIES
    );
    await Promise.all(
      toRemove.map((entry) => AsyncStorage.removeItem(entry.key))
    );

    console.log(`🗑️ Cleaned ${toRemove.length} old cache entries`);
  } catch (error) {
    console.error("❌ Cache cleanup error:", error);
  }
};

/**
 * Clear all slide generation cache
 */
export const clearSlideCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
    return cacheKeys.length;
  } catch (error) {
    console.error("❌ Cache clear error:", error);
    throw error;
  }
};

/**
 * Generate slides from case description using OpenAI
 * @param {string} input - Case description (50-3000 characters)
 * @param {object} options - Generation options
 * @param {boolean} options.useCache - Whether to use cache (default: true)
 * @param {number} options.desiredSlideCount - Desired number of slides (3-8, default: based on input)
 * @param {string} options.template - Template type to apply (optional)
 * @returns {Promise<object>} - Generated slide deck with slides array
 */
export const generateSlides = async (input, options = {}) => {
  try {
    // Validate input
    if (!input || typeof input !== "string") {
      throw new Error("Input must be a non-empty string");
    }

    const trimmedInput = input.trim();

    if (trimmedInput.length < 50) {
      throw new Error(
        "Input too short (minimum 50 characters). Please provide more details."
      );
    }

    if (trimmedInput.length > 3000) {
      throw new Error(
        "Input too long (maximum 3000 characters). Please summarize."
      );
    }

    // Get desired slide count (default to null to let AI decide based on content)
    const desiredSlideCount = options.desiredSlideCount || null;
    const templateType = options.template || null;

    // Validate slide count if provided
    if (
      desiredSlideCount !== null &&
      (desiredSlideCount < 3 || desiredSlideCount > 8)
    ) {
      throw new Error("Desired slide count must be between 3 and 8");
    }

    // Check cache first (unless disabled)
    const useCache = options.useCache !== false;
    if (useCache) {
      const cached = await getCachedSlides(trimmedInput);
      if (cached) {
        console.log("📦 Returning cached slides");
        return {
          ...cached,
          fromCache: true,
        };
      }
    }

    // Build user prompt with slide count instruction
    let userPrompt = `Case Description:
${trimmedInput}`;

    if (desiredSlideCount) {
      userPrompt += `\n\nIMPORTANT: Generate EXACTLY ${desiredSlideCount} slides. No more, no less.`;
    }

    // Apply template-specific instructions if template is selected
    let templateMetadata = null;
    let enhancedSystemPrompt = SYSTEM_PROMPT;

    if (templateType) {
      const template = templateEngine.getTemplate(templateType);
      if (template) {
        templateMetadata = {
          type: template.type,
          name: template.name,
          suggestedSlideCount: template.suggestedSlideCount,
        };

        // Append template-specific instructions to system prompt
        enhancedSystemPrompt = SYSTEM_PROMPT + template.promptAdditions;

        // Override slide count with template suggestion if not explicitly set
        if (!desiredSlideCount && template.suggestedSlideCount) {
          userPrompt += `\n\nSUGGESTED: Generate approximately ${template.suggestedSlideCount} slides based on the ${template.name} template structure.`;
        }

        console.log(`📋 Applying template: ${template.name}`);
      }
    }

    // Add system prompt addition for retries (quality improvement)
    if (options.systemPromptAddition) {
      enhancedSystemPrompt += options.systemPromptAddition;
    }

    userPrompt += `\n\nGenerate a professional legal presentation following the mandatory slide flow pattern. Apply strict structural limits and Indian legal citation standards.`;

    console.log("🎨 Generating slides with OpenAI...");
    console.log(`📝 Input length: ${trimmedInput.length} characters`);
    if (desiredSlideCount) {
      console.log(`📊 Requested slide count: ${desiredSlideCount}`);
    }
    if (templateType) {
      console.log(`📋 Template: ${templateType}`);
    }

    // Call OpenAI with structured output
    const startTime = Date.now();
    const response = await callOpenAIWithSchema(userPrompt, {
      schema: slideDeckSchema,
      schemaName: "legal_slides",
      systemPrompt: enhancedSystemPrompt,
      model: options.model || "gpt-4o-mini",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4096,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Slides generated in ${duration}ms`);
    console.log(`📊 Generated ${response.slides?.length || 0} slides`);

    // Validate response (tolerant to minimal schema)
    if (!response.slides || !Array.isArray(response.slides)) {
      throw new Error("Invalid response: missing slides array");
    }

    if (response.slides.length === 0) {
      throw new Error("No slides generated");
    }

    if (response.slides.length > 8) {
      console.warn("⚠️ Generated more than 8 slides, truncating...");
      response.slides = response.slides.slice(0, 8);
      response.totalSlides = 8;
    }

    // Log warning if slide count doesn't match request
    if (desiredSlideCount && response.slides.length !== desiredSlideCount) {
      console.warn(
        `⚠️ Slide count mismatch: requested ${desiredSlideCount}, got ${response.slides.length}`
      );
    }

    // Perform quality validation
    console.log("🔍 Validating slide quality...");
    const inputContext = {
      input: trimmedInput,
      desiredSlideCount,
      template: templateType,
    };

    const validationResult = qualityValidator.validateSlideDeck(
      response,
      inputContext
    );
    console.log(`📊 Quality score: ${validationResult.overallScore}/100`);

    // Log validation issues
    if (validationResult.issues.length > 0) {
      const errorCount = validationResult.issues.filter(
        (i) => i.severity === "error"
      ).length;
      const warningCount = validationResult.issues.filter(
        (i) => i.severity === "warning"
      ).length;
      console.log(
        `⚠️ Validation issues: ${errorCount} errors, ${warningCount} warnings`
      );
    }

    // Auto-regenerate if quality score is too low (< 60) and we haven't already retried
    if (validationResult.overallScore < 60 && !options._isRetry) {
      console.log("🔄 Quality score too low, attempting regeneration...");

      // Retry with stricter prompt
      const retryOptions = {
        ...options,
        _isRetry: true, // Prevent infinite retry loop
        temperature: Math.max(0.3, (options.temperature || 0.7) - 0.2), // Lower temperature for more focused output
        systemPromptAddition:
          "\n\nIMPORTANT: Focus on legal accuracy, proper formatting, and clear structure. Ensure all legal terms are properly formatted and citations are complete.",
      };

      try {
        console.log("🎯 Regenerating with improved parameters...");
        return await generateSlides(input, retryOptions);
      } catch (retryError) {
        console.warn(
          "⚠️ Regeneration failed, using original result:",
          retryError.message
        );
        // Continue with original result if retry fails
      }
    }

    // Add metadata
    response.generatedAt = new Date().toISOString();
    response.inputLength = trimmedInput.length;
    response.generationTime = duration;
    response.fromCache = false;
    response.requestedSlideCount = desiredSlideCount;
    response.template = templateMetadata; // Store template metadata

    // Store validation results in metadata
    response.validation = {
      score: validationResult.overallScore,
      scores: validationResult.scores,
      issues: validationResult.issues,
      metrics: validationResult.metrics,
      validatedAt: new Date().toISOString(),
    };

    // Log validation metrics for monitoring
    console.log("📈 Validation metrics:", {
      overallScore: validationResult.overallScore,
      structureScore: validationResult.scores.structure,
      legalAccuracyScore: validationResult.scores.legalAccuracy,
      formattingScore: validationResult.scores.formatting,
      relevanceScore: validationResult.scores.relevance,
      citationCount: validationResult.metrics.citationCount,
      legalTermDensity: validationResult.metrics.legalTermDensity,
      avgBlocksPerSlide: validationResult.metrics.avgBlocksPerSlide,
    });

    // Cache the result
    if (useCache) {
      await cacheSlides(trimmedInput, response);
    }

    return response;
  } catch (error) {
    console.error("❌ Slide generation failed:", error);

    // Provide helpful error messages
    if (
      error.message.includes("API key") ||
      error.message.includes("configuration")
    ) {
      throw new Error(
        "OpenAI API key not configured. Please check your .env file."
      );
    }

    if (error.message.includes("rate limit")) {
      throw new Error(
        "Rate limit exceeded. Please wait a moment and try again."
      );
    }

    throw new Error(`Slide generation failed: ${error.message}`);
  }
};

/**
 * Generate slides with retry logic
 * @param {string} input - Case description
 * @param {number} maxRetries - Maximum retry attempts (default: 2)
 * @returns {Promise<object>} - Generated slide deck
 */
export const generateSlidesWithRetry = async (input, maxRetries = 2) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      return await generateSlides(input);
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const waitTime = attempt * 1000; // Progressive backoff
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Quick validation of slide structure
 * @param {object} slideDeck - Generated slide deck
 * @returns {object} - Validation result
 */
export const validateSlideDeck = (slideDeck) => {
  const errors = [];
  const warnings = [];

  if (!slideDeck) {
    errors.push("Slide deck is null or undefined");
    return { valid: false, errors, warnings };
  }

  // Check required fields
  if (!slideDeck.title) errors.push("Missing presentation title");
  if (!slideDeck.slides) errors.push("Missing slides array");
  if (typeof slideDeck.totalSlides !== "number")
    errors.push("Missing totalSlides");

  // Validate slides
  if (slideDeck.slides) {
    if (slideDeck.slides.length === 0) {
      errors.push("No slides in deck");
    }

    if (slideDeck.slides.length !== slideDeck.totalSlides) {
      warnings.push(
        `Slide count mismatch: ${slideDeck.slides.length} vs ${slideDeck.totalSlides}`
      );
    }

    slideDeck.slides.forEach((slide, index) => {
      if (!slide.title) {
        errors.push(`Slide ${index + 1}: Missing title`);
      }

      if (!slide.blocks || !Array.isArray(slide.blocks)) {
        errors.push(`Slide ${index + 1}: Missing blocks array`);
      } else if (slide.blocks.length === 0) {
        warnings.push(`Slide ${index + 1}: No blocks`);
      } else if (slide.blocks.length > 4) {
        warnings.push(
          `Slide ${index + 1}: Too many blocks (${slide.blocks.length})`
        );
      }

      // Validate blocks
      slide.blocks?.forEach((block, blockIndex) => {
        if (!block.type) {
          errors.push(
            `Slide ${index + 1}, Block ${blockIndex + 1}: Missing type`
          );
        }
        if (!block.data) {
          errors.push(
            `Slide ${index + 1}, Block ${blockIndex + 1}: Missing data`
          );
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    slideCount: slideDeck.slides?.length || 0,
  };
};

/**
 * Get statistics about generated slides
 * @param {object} slideDeck - Generated slide deck
 * @returns {object} - Statistics
 */
export const getSlideDeckStats = (slideDeck) => {
  if (!slideDeck || !slideDeck.slides) {
    return null;
  }

  const blockTypes = {};
  let totalBlocks = 0;
  let totalTextLength = 0;

  slideDeck.slides.forEach((slide) => {
    slide.blocks?.forEach((block) => {
      totalBlocks++;
      blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;

      // Count text length
      const dataStr = JSON.stringify(block.data);
      totalTextLength += dataStr.length;
    });
  });

  return {
    totalSlides: slideDeck.slides.length,
    totalBlocks,
    averageBlocksPerSlide: (totalBlocks / slideDeck.slides.length).toFixed(1),
    blockTypes,
    totalTextLength,
    averageTextPerSlide: Math.round(totalTextLength / slideDeck.slides.length),
    generationTime: slideDeck.generationTime || 0,
    inputLength: slideDeck.inputLength || 0,
  };
};

/**
 * Refine existing slides with new instructions
 * @param {Object} existingSlides - Current slide deck
 * @param {string} refinementInstructions - User's refinement request
 * @param {Object} options - Refinement options
 * @param {Array<number>} options.preserveSlides - Slide indices to preserve (optional)
 * @param {Array<number>} options.targetSlides - Specific slides to modify (optional)
 * @returns {Promise<Object>} Refined slide deck with change tracking
 */
export const refineSlides = async (
  existingSlides,
  refinementInstructions,
  options = {}
) => {
  try {
    if (!existingSlides || !existingSlides.slides) {
      throw new Error("Invalid existing slides");
    }

    if (!refinementInstructions || refinementInstructions.trim().length === 0) {
      throw new Error("Refinement instructions cannot be empty");
    }

    console.log("🔄 Starting slide refinement via API...");
    console.log(`📝 Instructions: ${refinementInstructions}`);

    // Build refinement prompt with context
    const preserveSlides = options.preserveSlides || [];
    const targetSlides =
      options.targetSlides ||
      Array.from({ length: existingSlides.slides.length }, (_, i) => i);

    // Filter out preserved slides
    const slidesToModify = targetSlides.filter(
      (idx) => !preserveSlides.includes(idx)
    );

    console.log(`🎯 Target slides: ${slidesToModify.join(", ")}`);
    if (preserveSlides.length > 0) {
      console.log(`🔒 Preserved slides: ${preserveSlides.join(", ")}`);
    }

    // Build refinement prompt
    let refinementPrompt = `REFINEMENT REQUEST:\n\n`;
    refinementPrompt += `User Instructions: ${refinementInstructions}\n\n`;
    refinementPrompt += `CURRENT PRESENTATION:\n`;
    refinementPrompt += `Title: ${existingSlides.title || "Untitled"}\n`;
    refinementPrompt += `Total Slides: ${existingSlides.slides.length}\n\n`;

    // Add context about slides to modify
    if (slidesToModify.length < existingSlides.slides.length) {
      refinementPrompt += `TARGET SLIDES TO MODIFY: ${slidesToModify
        .map((i) => i + 1)
        .join(", ")}\n\n`;
    }

    if (preserveSlides.length > 0) {
      refinementPrompt += `PRESERVED SLIDES (DO NOT MODIFY): ${preserveSlides
        .map((i) => i + 1)
        .join(", ")}\n\n`;
    }

    // Add current slide content for context
    refinementPrompt += `CURRENT SLIDE CONTENT:\n\n`;
    existingSlides.slides.forEach((slide, index) => {
      const isTarget = slidesToModify.includes(index);
      const isPreserved = preserveSlides.includes(index);

      refinementPrompt += `Slide ${index + 1}: ${slide.title}`;
      if (isPreserved) {
        refinementPrompt += ` [PRESERVE - DO NOT MODIFY]`;
      } else if (isTarget) {
        refinementPrompt += ` [TARGET FOR MODIFICATION]`;
      }
      refinementPrompt += `\n`;

      // Add brief content summary
      const blockCount = slide.blocks?.length || 0;
      refinementPrompt += `  - ${blockCount} block(s)\n`;

      slide.blocks?.forEach((block, blockIndex) => {
        refinementPrompt += `  - Block ${blockIndex + 1}: ${block.type}\n`;
      });

      refinementPrompt += `\n`;
    });

    refinementPrompt += `\nIMPORTANT INSTRUCTIONS:\n`;
    refinementPrompt += `1. Maintain the overall structure and flow of the presentation\n`;
    refinementPrompt += `2. Apply the requested modifications ONLY to target slides\n`;
    refinementPrompt += `3. Keep preserved slides exactly as they are\n`;
    refinementPrompt += `4. Maintain legal accuracy and proper citation format\n`;
    refinementPrompt += `5. Follow all formatting rules (markdown colors, block limits, etc.)\n`;
    refinementPrompt += `6. Ensure modifications align with the user's specific request\n\n`;

    refinementPrompt += `Generate the complete refined presentation with all slides, applying modifications as requested.`;

    // Enhanced system prompt for refinement
    const refinementSystemPrompt =
      SYSTEM_PROMPT +
      `\n\nREFINEMENT MODE:\nYou are refining an existing presentation based on user feedback. Maintain consistency with the original structure while applying the requested changes. Preserve slides marked as "PRESERVE" exactly as they are.`;

    // Call OpenAI with refinement prompt
    const startTime = Date.now();
    const response = await callOpenAIWithSchema(refinementPrompt, {
      schema: slideDeckSchema,
      schemaName: "legal_slides_refinement",
      systemPrompt: refinementSystemPrompt,
      model: options.model || "gpt-4o-mini",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4096,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Refinement complete in ${duration}ms`);
    console.log(`📊 Refined ${response.slides?.length || 0} slides`);

    // Validate response
    if (!response.slides || !Array.isArray(response.slides)) {
      throw new Error("Invalid refinement response: missing slides array");
    }

    if (response.slides.length === 0) {
      throw new Error("No slides in refined result");
    }

    // Apply modifications while preserving user-approved slides
    const modifiedSlides = JSON.parse(JSON.stringify(existingSlides));

    slidesToModify.forEach((targetIndex) => {
      const refinedSlide = response.slides[targetIndex];
      if (refinedSlide) {
        modifiedSlides.slides[targetIndex] = {
          ...refinedSlide,
          _modified: true,
          _modifiedAt: new Date().toISOString(),
        };
      }
    });

    // Update metadata
    modifiedSlides.totalSlides = modifiedSlides.slides.length;
    modifiedSlides.lastModified = new Date().toISOString();
    modifiedSlides.refinedAt = new Date().toISOString();
    modifiedSlides.refinementTime = duration;

    // Add refinement history
    if (!modifiedSlides.refinementHistory) {
      modifiedSlides.refinementHistory = [];
    }
    modifiedSlides.refinementHistory.push({
      timestamp: new Date().toISOString(),
      instructions: refinementInstructions,
      targetSlides: slidesToModify,
      preservedSlides: preserveSlides,
      duration: duration,
    });

    // Perform quality validation on refined slides
    console.log("🔍 Validating refined slide quality...");
    const inputContext = {
      input: refinementInstructions,
      isRefinement: true,
    };

    const validationResult = qualityValidator.validateSlideDeck(
      modifiedSlides,
      inputContext
    );
    console.log(
      `📊 Refined quality score: ${validationResult.overallScore}/100`
    );

    // Store validation results
    modifiedSlides.validation = {
      score: validationResult.overallScore,
      scores: validationResult.scores,
      issues: validationResult.issues,
      metrics: validationResult.metrics,
      validatedAt: new Date().toISOString(),
    };

    return modifiedSlides;
  } catch (error) {
    console.error("❌ Slide refinement failed:", error);

    // Provide helpful error messages
    if (
      error.message.includes("API key") ||
      error.message.includes("configuration")
    ) {
      throw new Error(
        "OpenAI API key not configured. Please check your .env file."
      );
    }

    if (error.message.includes("rate limit")) {
      throw new Error(
        "Rate limit exceeded. Please wait a moment and try again."
      );
    }

    throw new Error(`Slide refinement failed: ${error.message}`);
  }
};

export default {
  generateSlides,
  generateSlidesWithRetry,
  refineSlides,
  validateSlideDeck,
  getSlideDeckStats,
  clearSlideCache,
};
