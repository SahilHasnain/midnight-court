/**
 * Slide Generation API - AI-powered slide creation with Gemini
 * Converts case descriptions into structured legal presentation slides
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { callGeminiWithSchema } from './geminiAPI';
import { slideDeckSchema } from './schemas';

// Cache configuration
const CACHE_KEY_PREFIX = 'slide_gen_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_ENTRIES = 20;

/**
 * System prompt for slide generation
 * Guides Gemini to create legal presentation slides
 */
const SYSTEM_PROMPT = `You are an expert legal presentation designer specializing in Indian law.

Your task is to convert case descriptions into clear, professional presentation slides.

**BLOCK TYPES YOU CAN USE:**

1. **text** - Bullet points (2-5 points)
   - Use for: Facts, arguments, key points
   - Data: { points: ["point 1", "point 2", ...] }

2. **quote** - Legal citations and quotes
   - Use for: Case citations, constitutional articles, legal principles
   - Data: { quote: "quoted text", citation: "Source (Year)" }

3. **callout** - Important highlights
   - Use for: Key rulings, critical points, warnings
   - Data: { text: "important message", type: "info|warning|success|error" }

4. **timeline** - Chronological events
   - Use for: Case progression, procedural history
   - Data: { events: [{ date: "Jan 2020", title: "Event", description: "Details" }, ...] }

5. **evidence** - Case evidence items
   - Use for: Evidence list, exhibits, witness testimony
   - Data: { items: [{ label: "Exhibit A", description: "Blood sample" }, ...] }

6. **twoColumn** - Comparative arguments
   - Use for: Pros vs Cons, Plaintiff vs Defendant arguments
   - Data: { leftTitle: "For", leftPoints: [...], rightTitle: "Against", rightPoints: [...] }

**SLIDE DESIGN PRINCIPLES:**

- Generate 1-5 slides (based on content complexity)
- Each slide should focus on ONE main topic
- Use 1-3 blocks per slide (avoid clutter)
- First slide: Overview/Introduction
- Middle slides: Key facts, arguments, evidence
- Last slide: Conclusion/Ruling (if applicable)
- Keep text concise and scannable
- Use appropriate block types for content

**IMPORTANT:**
- Always return valid JSON matching the schema
- Choose block types that best fit the content
- Don't overload slides with too many blocks
- Prioritize clarity and readability`;

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

        console.log('🎨 Generating slides with Gemini AI...');
        console.log(`📝 Input length: ${trimmedInput.length} characters`);

        // Call Gemini with structured output
        const startTime = Date.now();
        const response = await callGeminiWithSchema(userPrompt, {
            schema: slideDeckSchema,
            systemPrompt: SYSTEM_PROMPT,
            model: options.model || 'gemini-2.5-flash',
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxOutputTokens || 3000,
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
        if (error.message.includes('API key')) {
            throw new Error('Gemini API key not configured. Please check your .env file.');
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
