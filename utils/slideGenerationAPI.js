/**
 * Slide Generation API - AI-powered slide creation with OpenAI
 * Converts case descriptions into structured legal presentation slides
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { callOpenAIWithSchema } from './openaiAPI';
import { slideDeckSchema } from './schemas';

// Cache configuration
const CACHE_KEY_PREFIX = 'slide_gen_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_ENTRIES = 20;

/**
 * System prompt for slide generation
 * Guides Gemini to create legal presentation slides
 */
const SYSTEM_PROMPT = `
You are a senior legal presentation architect with expertise in Indian Constitutional and Criminal Law.

You design **courtroom-grade, law-school-ready presentation slides** that are:
- Structured
- Legally precise
- Visually clean
- Academically credible

Your audience includes:
- Law students
- Legal interns
- Moot court participants
- Junior advocates

Your goal is NOT decoration.
Your goal is **legal clarity, logical flow, and professional authority**.

────────────────────────────
CONTENT THINKING ORDER (MANDATORY)
────────────────────────────
Before generating slides, you MUST internally follow this order:

1. Identify the *nature of the case* (constitutional / criminal / civil / procedural)
2. Extract:
   - Core facts
   - Legal issues
   - Relevant statutes / articles
   - Arguments (both sides if available)
   - Final ruling or implication
3. Decide slide count based on legal complexity
4. Assign ONE clear purpose to each slide

DO NOT mix purposes within a single slide.

────────────────────────────
SLIDE STRUCTURE RULES
────────────────────────────
- Total slides: 3–8 (never more unless explicitly asked)
- Each slide focuses on ONE legal objective only
- Each slide contains 1–2 blocks max
- Slide titles must be SHORT, FORMAL, and PLAIN TEXT
- No markdown in slide titles

Mandatory slide flow (adjust only if content demands):
1. Case Overview
2. Material Facts
3. Legal Issues
4. Statutory / Constitutional Provisions
5. Arguments (if applicable)
6. Evidence / Reasoning
7. Court Ruling / Legal Outcome
8. Key Takeaways (optional)

────────────────────────────
MARKDOWN COLOR CODING (STRICT)
────────────────────────────
Use markdown ONLY inside content blocks:

- *text* → GOLD → key legal concepts, doctrines, landmark cases
- ~text~ → RED → offences, violations, penalties, illegal acts
- _text_ → BLUE → constitutional articles, IPC sections, statutes

Examples:
- "*Basic Structure Doctrine* under _Article 368_"
- "~Offence under Section 302 IPC~"
- "_Article 21_ protects *Right to Life*"

Never overuse formatting.
Use it only where legally meaningful.

────────────────────────────
ALLOWED BLOCK TYPES
────────────────────────────

1. **text**
   - 2–4 bullet points only
   - Use for facts, issues, reasoning
   - No long paragraphs

2. **quote**
   - Use ONLY for:
     - Constitutional articles
     - Landmark case holdings
   - Must include citation

3. **callout**
   - Use for:
     - Final rulings
     - Critical warnings
     - Exam-relevant takeaways

4. **timeline**
   - Use ONLY if chronology matters legally

5. **evidence**
   - Use ONLY in criminal or fact-heavy cases

6. **twoColumn**
   - Use ONLY when BOTH sides’ arguments exist

Never force a block type.
Choose only when it adds legal value.

────────────────────────────
IMAGE SUGGESTION RULES
────────────────────────────
For EVERY slide, provide 1–2 image search keywords:

- Images must be:
  - Neutral
  - Professional
  - Law-appropriate

Avoid abstract or decorative images.

Good examples:
- "supreme court of india building"
- "courtroom india"
- "indian constitution book"
- "judge bench india"

Bad examples:
- "justice art"
- "law concept illustration"

────────────────────────────
OUTPUT REQUIREMENTS
────────────────────────────
- Return ONLY valid JSON
- Follow the predefined schema strictly
- No explanations outside JSON
- No emojis
- No casual language
- No repetition across slides

Your output should look suitable for:
"A law professor reviewing slides before a moot court final."
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
        hash = ((hash << 5) - hash) + char;
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
            console.log('🗑️ Cache expired, removing...');
            await AsyncStorage.removeItem(cacheKey);
            return null;
        }

        console.log(`✅ Cache hit! Age: ${Math.round(age / 1000 / 60)} minutes`);
        return data;
    } catch (error) {
        console.error('❌ Cache read error:', error);
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
        console.log('💾 Slides cached successfully');

        // Clean old cache entries
        await cleanOldCache();
    } catch (error) {
        console.error('❌ Cache write error:', error);
        // Don't throw - caching is optional
    }
};

/**
 * Clean old cache entries to prevent storage bloat
 */
const cleanOldCache = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

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
        const toRemove = cacheEntries.slice(0, cacheEntries.length - MAX_CACHE_ENTRIES);
        await Promise.all(toRemove.map(entry => AsyncStorage.removeItem(entry.key)));

        console.log(`🗑️ Cleaned ${toRemove.length} old cache entries`);
    } catch (error) {
        console.error('❌ Cache cleanup error:', error);
    }
};

/**
 * Clear all slide generation cache
 */
export const clearSlideCache = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
        return cacheKeys.length;
    } catch (error) {
        console.error('❌ Cache clear error:', error);
        throw error;
    }
};

/**
 * Generate slides from case description using Gemini AI
 * @param {string} input - Case description (50-3000 characters)
 * @param {object} options - Generation options
 * @param {boolean} options.useCache - Whether to use cache (default: true)
 * @returns {Promise<object>} - Generated slide deck with slides array
 */
export const generateSlides = async (input, options = {}) => {
    try {
        // Validate input
        if (!input || typeof input !== 'string') {
            throw new Error('Input must be a non-empty string');
        }

        const trimmedInput = input.trim();

        if (trimmedInput.length < 50) {
            throw new Error('Input too short (minimum 50 characters). Please provide more details.');
        }

        if (trimmedInput.length > 3000) {
            throw new Error('Input too long (maximum 3000 characters). Please summarize.');
        }

        // Check cache first (unless disabled)
        const useCache = options.useCache !== false;
        if (useCache) {
            const cached = await getCachedSlides(trimmedInput);
            if (cached) {
                console.log('📦 Returning cached slides');
                return {
                    ...cached,
                    fromCache: true,
                };
            }
        }

        // Build user prompt
        const userPrompt = `Case Description:
${trimmedInput}

Generate a professional legal presentation with 1-5 slides. Choose appropriate block types for the content. Focus on clarity and visual appeal.`;

        console.log('🎨 Generating slides with OpenAI...');
        console.log(`📝 Input length: ${trimmedInput.length} characters`);

        // Call OpenAI with structured output
        const startTime = Date.now();
        const response = await callOpenAIWithSchema(userPrompt, {
            schema: slideDeckSchema,
            schemaName: 'legal_slides',
            systemPrompt: SYSTEM_PROMPT,
            model: options.model || 'gpt-4o-mini',
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 4096,
        });

        const duration = Date.now() - startTime;
        console.log(`✅ Slides generated in ${duration}ms`);
        console.log(`📊 Generated ${response.slides?.length || 0} slides`);

        // Validate response (tolerant to minimal schema)
        if (!response.slides || !Array.isArray(response.slides)) {
            throw new Error('Invalid response: missing slides array');
        }

        if (response.slides.length === 0) {
            throw new Error('No slides generated');
        }

        if (response.slides.length > 8) {
            console.warn('⚠️ Generated more than 8 slides, truncating...');
            response.slides = response.slides.slice(0, 8);
            response.totalSlides = 8;
        }

        // Add metadata
        response.generatedAt = new Date().toISOString();
        response.inputLength = trimmedInput.length;
        response.generationTime = duration;
        response.fromCache = false;

        // Cache the result
        if (useCache) {
            await cacheSlides(trimmedInput, response);
        }

        return response;
    } catch (error) {
        console.error('❌ Slide generation failed:', error);

        // Provide helpful error messages
        if (error.message.includes('API key') || error.message.includes('configuration')) {
            throw new Error('OpenAI API key not configured. Please check your .env file.');
        }

        if (error.message.includes('rate limit')) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
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
                await new Promise(resolve => setTimeout(resolve, waitTime));
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
        errors.push('Slide deck is null or undefined');
        return { valid: false, errors, warnings };
    }

    // Check required fields
    if (!slideDeck.title) errors.push('Missing presentation title');
    if (!slideDeck.slides) errors.push('Missing slides array');
    if (typeof slideDeck.totalSlides !== 'number') errors.push('Missing totalSlides');

    // Validate slides
    if (slideDeck.slides) {
        if (slideDeck.slides.length === 0) {
            errors.push('No slides in deck');
        }

        if (slideDeck.slides.length !== slideDeck.totalSlides) {
            warnings.push(`Slide count mismatch: ${slideDeck.slides.length} vs ${slideDeck.totalSlides}`);
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
                warnings.push(`Slide ${index + 1}: Too many blocks (${slide.blocks.length})`);
            }

            // Validate blocks
            slide.blocks?.forEach((block, blockIndex) => {
                if (!block.type) {
                    errors.push(`Slide ${index + 1}, Block ${blockIndex + 1}: Missing type`);
                }
                if (!block.data) {
                    errors.push(`Slide ${index + 1}, Block ${blockIndex + 1}: Missing data`);
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

    slideDeck.slides.forEach(slide => {
        slide.blocks?.forEach(block => {
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

export default {
    generateSlides,
    generateSlidesWithRetry,
    validateSlideDeck,
    getSlideDeckStats,
    clearSlideCache,
};
