
/**
 * Call Appwrite function proxy
 */
const callAppwriteFunction = async (payload) => {
    const url = process.env.EXPO_PUBLIC_GEMINI_FUNCTION_URL; // Will be set from env

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Appwrite function call failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
};

/**
 * Main Gemini API call wrapper (via Appwrite)
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - The response text from Gemini
 */
export const callGemini = async (prompt, options = {}) => {
    try {
        const {
            model = "gemini-2.5-flash-lite",
            systemPrompt = "",
        } = options;

        let finalPrompt = prompt;
        if (systemPrompt) {
            finalPrompt = `${systemPrompt}\n\n${prompt}`;
        }

        const response = await callAppwriteFunction({
            prompt: finalPrompt,
            model,
        });

        if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid response from Gemini");
        }

        return response.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
};

/**
 * Call Gemini with structured JSON output (via Appwrite)
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Configuration options
 * @returns {Promise<object>} - Parsed JSON object matching schema
 */
export const callGeminiWithSchema = async (prompt, options = {}) => {
    try {
        const {
            model = "gemini-2.5-flash-lite",
            schema = null,
            systemPrompt = "",
        } = options;

        if (!schema) {
            throw new Error("Schema is required for structured output");
        }

        let finalPrompt = prompt;
        if (systemPrompt) {
            finalPrompt = `${systemPrompt}\n\n${prompt}`;
        }

        const response = await callAppwriteFunction({
            prompt: finalPrompt,
            model,
            schema,
        });

        if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid response from Gemini");
        }

        const jsonText = response.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("❌ Gemini structured output error:", error);
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
};



export default {
    callGemini,
    callGeminiWithSchema,
};
