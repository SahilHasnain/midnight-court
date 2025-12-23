/**
 * OpenAI API Integration using Responses API
 * Modern approach using client.responses.create()
 * Maintains backward compatibility with legacy code
 */
import { Alert } from 'react-native';

/**
 * Call Appwrite function proxy for OpenAI
 */
const callAppwriteFunction = async (payload) => {
    const url = process.env.EXPO_PUBLIC_OPENAI_FUNCTION_URL;

    if (!url) {
        throw new Error('EXPO_PUBLIC_OPENAI_FUNCTION_URL not configured in environment');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.error === 'AI_LIMIT_EXCEEDED') {
            Alert.alert(
                'Usage Limit Reached',
                errorData.message || 'You have reached your AI usage limit.'
            );
            throw new Error('AI_LIMIT_EXCEEDED');
        }

        const errorText = await response.text();
        throw new Error(`OpenAI function call failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
};

/**
 * Main OpenAI API call wrapper using Responses API
 * Uses modern client.responses.create() method
 * 
 * @param {string} prompt - The input/prompt to send to OpenAI
 * @param {object} options - Configuration options
 * @param {string} options.model - OpenAI model to use (default: "gpt-4o-mini")
 * @param {string} options.systemPrompt - Instructions for the AI (system-level context)
 * @param {number} options.temperature - Temperature for response randomness (0-2)
 * @param {number} options.maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - The response text from OpenAI
 */
export const callOpenAI = async (prompt, options = {}) => {
    try {
        const {
            model = "gpt-4o-mini",
            systemPrompt = "",
            temperature = 0.7,
            maxTokens = 4096,
        } = options;

        const response = await callAppwriteFunction({
            prompt,
            systemPrompt,
            model,
            temperature,
            maxTokens,
        });

        if (!response?.choices?.[0]?.message?.content) {
            throw new Error("Invalid response from OpenAI");
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        throw new Error(`OpenAI API call failed: ${error.message}`);
    }
};

/**
 * Call OpenAI Responses API with structured JSON output
 * Uses modern text.format with JSON schema for type-safe outputs
 * 
 * @param {string} prompt - The input/prompt to send to OpenAI
 * @param {object} options - Configuration options
 * @param {string} options.model - OpenAI model to use (default: "gpt-4o-mini")
 * @param {object} options.schema - JSON Schema for structured output (required)
 * @param {string} options.schemaName - Name for the response schema
 * @param {string} options.systemPrompt - Instructions for the AI
 * @param {number} options.temperature - Temperature for response randomness (0-2)
 * @param {number} options.maxTokens - Maximum tokens in response
 * @returns {Promise<object>} - Parsed JSON object matching schema
 */
export const callOpenAIWithSchema = async (prompt, options = {}) => {
    try {
        const {
            model = "gpt-4o-mini", // Must support structured outputs
            schema = null,
            schemaName = "response",
            systemPrompt = "",
            temperature = 0.7,
            maxTokens = 4096,
        } = options;

        if (!schema) {
            throw new Error("Schema is required for structured output");
        }

        const response = await callAppwriteFunction({
            prompt,
            systemPrompt,
            model,
            schema,
            schemaName,
            temperature,
            maxTokens,
            useStructuredOutput: true,
        });

        // OpenAI structured outputs return parsed JSON directly
        if (!response?.choices?.[0]?.message?.parsed) {
            // Fallback to content parsing if parsed field not available
            const content = response?.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error("Invalid response from OpenAI");
            }
            return JSON.parse(content);
        }

        return response.choices[0].message.parsed;
    } catch (error) {
        console.error("❌ OpenAI structured output error:", error);
        throw new Error(`OpenAI API call failed: ${error.message}`);
    }
};

/**
 * Legacy function names for backward compatibility
 * Gradually migrate to new names
 */
export const callGemini = callOpenAI;
export const callGeminiWithSchema = callOpenAIWithSchema;

export default {
    callOpenAI,
    callOpenAIWithSchema,
    // Legacy exports
    callGemini,
    callGeminiWithSchema,
};
