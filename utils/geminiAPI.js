import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

if (!GEMINI_API_KEY) {
    console.warn(
        "⚠️ Gemini API key not found. Set EXPO_PUBLIC_GEMINI_KEY in .env file"
    );
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    FREE_TIER_REQUESTS_PER_MINUTE: 60,
    REQUEST_QUEUE: [],
    LAST_REQUEST_TIME: 0,
    MIN_INTERVAL_MS: (1000 * 60) / 60, // 1 request per second for safety margin
};

/**
 * Rate limiter - ensures we don't exceed Gemini free tier limits
 * Free tier: 60 requests/minute
 */
const rateLimiter = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - RATE_LIMIT_CONFIG.LAST_REQUEST_TIME;

    if (timeSinceLastRequest < RATE_LIMIT_CONFIG.MIN_INTERVAL_MS) {
        const waitTime =
            RATE_LIMIT_CONFIG.MIN_INTERVAL_MS - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    RATE_LIMIT_CONFIG.LAST_REQUEST_TIME = Date.now();
};

/**
 * Main Gemini API call wrapper
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - The response text from Gemini
 */
export const callGemini = async (
    prompt,
    options = {}
) => {
    try {
        // Apply rate limiting
        await rateLimiter();

        const {
            model = "gemini-2.5-flash",
            temperature = 0.7,
            maxOutputTokens = 1024,
            systemPrompt = "",
        } = options;

        const model_instance = genAI.getGenerativeModel({ model });

        let fullPrompt = prompt;
        if (systemPrompt) {
            fullPrompt = `${systemPrompt}\n\n${prompt}`;
        }

        const response = await model_instance.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }],
                },
            ],
            generationConfig: {
                temperature,
                maxOutputTokens,
            },
        });

        if (!response.response) {
            throw new Error("No response from Gemini API");
        }

        const responseText = response.response.text();
        return responseText;
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
};

/**
 * Call Gemini with JSON response parsing
 * Ensures response is valid JSON
 */
export const callGeminiJSON = async (
    prompt,
    options = {}
) => {
    try {
        const response = await callGemini(prompt, options);

        // Try to parse JSON response
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.warn("⚠️ Could not parse JSON from response:", parseError);
            // Return as is if not valid JSON
            return { raw_response: response };
        }

        return { raw_response: response };
    } catch (error) {
        console.error("❌ Gemini JSON call failed:", error);
        throw error;
    }
};

/**
 * Get API status and limits info
 */
export const getGeminiStatus = () => {
    return {
        api_key_configured: !!GEMINI_API_KEY,
        free_tier_limit: "60 requests/minute",
        min_interval_ms: RATE_LIMIT_CONFIG.MIN_INTERVAL_MS,
        last_request_time: RATE_LIMIT_CONFIG.LAST_REQUEST_TIME,
    };
};

/**
 * Test Gemini API connection
 */
export const testGeminiAPI = async () => {
    try {
        const testPrompt = "Respond with only: OK";
        const response = await callGemini(testPrompt);

        if (response.includes("OK")) {
            console.log("✅ Gemini API connection successful!");
            return { success: true, message: "Gemini API is working" };
        } else {
            return { success: false, message: "Unexpected response from Gemini" };
        }
    } catch (error) {
        console.error("❌ Gemini API test failed:", error);
        return { success: false, message: error.message };
    }
};

export default {
    callGemini,
    callGeminiJSON,
    getGeminiStatus,
    testGeminiAPI,
};
