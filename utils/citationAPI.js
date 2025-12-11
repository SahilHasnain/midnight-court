import { callGeminiWithSchema } from './geminiAPI';
import { citationDetailsSchema, citationSearchResultsSchema } from './schemas';

/**
 * Citation API - Find legal citations using Gemini AI with Structured Outputs
 * 
 * Pure AI approach with guaranteed JSON structure:
 * - Uses JSON Schema for reliable parsing (no more manual JSON regex!)
 * - NO local database (limited, outdated)
 * - NO caching (fresh results every time)
 * - ALWAYS call Gemini for accurate, comprehensive citations
 * 
 * Quality > Cost - Law students deserve the best!
 */

/**
 * Find legal citations using Gemini AI with Structured Outputs
 * Returns comprehensive, accurate citations with guaranteed JSON structure
 */
export const findCitations = async (query) => {
    if (!query || query.trim().length < 2) {
        return {
            query,
            citations: [],
            totalFound: 0,
            searchTime: "0ms"
        };
    }

    console.log('🤖 Gemini AI citation search (Structured Output):', query);

    const startTime = Date.now();

    const systemPrompt = `You are an expert legal researcher specializing in Indian law.
Return output that exactly matches this JSON shape and keys:
{
    "query": "original user query",
    "citations": [
        {
            "type": "article" | "case" | "act" | "section",
            "name": "short name (REQUIRED, e.g., Article 21)",
            "year": "year or empty string if not applicable",
            "fullTitle": "full name or title (REQUIRED)",
            "summary": "2-3 sentence summary (REQUIRED)",
            "relevance": 0-100 (REQUIRED number),
            "url": "optional URL or empty string"
        }
    ],
    "totalFound": number,
    "searchTime": "placeholder string"
}
CRITICAL RULES:
- EVERY citation object MUST have all fields: type, name, fullTitle, summary, relevance
- NEVER skip or omit name, fullTitle, summary, or relevance - they are MANDATORY
- If you don't know a value, provide a reasonable placeholder (e.g., "Unknown" for name)
- year and url can be empty strings if not applicable
- relevance MUST be a number between 0 and 100
- Use ONLY the exact keys above (lowercase, camelCase)
- totalFound must equal citations.length
- Ensure valid JSON, no trailing commas`;

    const userPrompt = `Find all relevant Indian legal citations for: "${query}"

Include:
- Constitutional articles (number + title)
- Supreme Court and High Court cases (with year)
- Acts and statutes (with relevant sections)
- Brief summaries explaining relevance

IMPORTANT: Every citation MUST have name, fullTitle, summary, and relevance. Do not skip any required fields.

Return EXACTLY in the JSON structure specified in the system prompt.`;

    try {
        const response = await callGeminiWithSchema(
            userPrompt,
            {
                model: "gemini-2.5-flash",
                schema: citationSearchResultsSchema,
                temperature: 0.3, // Lower for consistency
                maxOutputTokens: 4096,
                systemPrompt,
            }
        );

        const searchTime = `${Date.now() - startTime}ms`;

        // Post-processing: Filter out invalid citations
        const validCitations = response.citations.filter(citation => {
            const isValid = citation.name &&
                citation.fullTitle &&
                citation.summary &&
                typeof citation.relevance === 'number';

            if (!isValid) {
                console.warn('⚠️ Skipping invalid citation:', citation);
            }
            return isValid;
        });

        const result = {
            query: response.query || query,
            citations: validCitations,
            totalFound: validCitations.length,
            searchTime,
        };

        console.log(`✅ Found ${result.totalFound} valid citations in ${searchTime}`);
        return result;
    } catch (error) {
        console.error("❌ Citation search failed:", error);
        throw error;
    }
};

/**
 * Get detailed information about a specific citation
 * Uses Gemini to provide comprehensive legal analysis
 */
export const getCitationDetails = async (citationName) => {
    console.log('🤖 Fetching citation details:', citationName);

    const systemPrompt = `You are an expert legal analyst specializing in Indian law.
Provide comprehensive, accurate analysis of legal citations.`;

    const userPrompt = `Provide comprehensive details about this Indian legal citation: "${citationName}"

Include:
- Full case name or article title
- Complete citation with reporter (AIR/SCC)
- Year and court if applicable
- Brief summary (2-3 sentences)
- Legal significance
- Key principles established
- Related citations if applicable`;

    try {
        const response = await callGeminiWithSchema(
            userPrompt,
            {
                model: "gemini-2.5-flash",
                schema: citationDetailsSchema,
                temperature: 0.2,
                maxOutputTokens: 1500,
                systemPrompt,
            }
        );

        console.log('✅ Citation details retrieved');
        return response;
    } catch (error) {
        console.error('❌ Failed to get citation details:', error);
        throw error;
    }
};

/**
 * Verify if a citation is accurate and currently valid
 * Quality check using Gemini's legal knowledge
 */
export const verifyCitation = async (citation) => {
    console.log('🔍 Verifying citation:', citation);

    const systemPrompt = `You are an expert legal researcher.
Verify citations accurately, including their current legal status.`;

    const userPrompt = `Verify this Indian legal citation: "${citation}"

Check:
1. Is the citation format correct?
2. Does this case/article/act exist?
3. Is it still valid (not overruled)?
4. Any recent amendments or modifications?

Respond with validation details including current status (active/overruled/modified/unknown).`;

    try {
        const response = await callGeminiWithSchema(
            userPrompt,
            {
                model: "gemini-2.5-flash",
                schema: citationDetailsSchema,
                temperature: 0.1,
                maxOutputTokens: 800,
                systemPrompt,
            }
        );

        console.log('✅ Citation verified');
        return response;
    } catch (error) {
        console.error('❌ Citation verification failed:', error);
        throw error;
    }
};

/**
 * Get related citations for building stronger legal arguments
 */
export const getRelatedCitations = async (citation) => {
    console.log('🔗 Finding related citations for:', citation);

    const systemPrompt = `You are an expert legal researcher.
Find related citations that support or are connected to a given citation.`;

    const userPrompt = `Find citations related to: "${citation}"

Include:
- Cases that cited this case
- Earlier cases this case relied on
- Cases on similar legal principles
- Relevant constitutional articles
- Related statutes

Provide 5-8 most relevant related citations with full details.`;

    try {
        const response = await callGeminiWithSchema(
            userPrompt,
            {
                model: "gemini-2.5-flash",
                schema: citationSearchResultsSchema,
                temperature: 0.2,
                maxOutputTokens: 1500,
                systemPrompt,
            }
        );

        console.log(`✅ Found ${response.totalFound} related citations`);
        return response;
    } catch (error) {
        console.error('❌ Failed to get related citations:', error);
        throw error;
    }
};

/**
 * Search citations by legal topic or area
 */
export const searchByTopic = async (topic) => {
    console.log('📚 Searching citations by topic:', topic);

    const systemPrompt = `You are an expert legal researcher specializing in Indian law.
Provide comprehensive, authoritative citations for legal topics.`;

    const userPrompt = `Find important Indian legal citations related to the topic: "${topic}"

Include landmark cases, constitutional provisions, and key statutes.
Prioritize foundational cases and frequently cited authorities.
Provide 8-12 most important citations with full details.`;

    try {
        const response = await callGeminiWithSchema(
            userPrompt,
            {
                model: "gemini-2.5-flash",
                schema: citationSearchResultsSchema,
                temperature: 0.2,
                maxOutputTokens: 2500,
                systemPrompt,
            }
        );

        // Sort by relevance
        response.citations.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

        console.log(`✅ Found ${response.totalFound} citations for topic: ${topic}`);
        return response;
    } catch (error) {
        console.error('❌ Topic search failed:', error);
        throw error;
    }
};
