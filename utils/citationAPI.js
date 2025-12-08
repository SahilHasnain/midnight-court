import { callGeminiJSON } from './geminiAPI';

/**
 * Citation API - Find legal citations using Gemini AI ONLY
 * 
 * Pure AI approach for maximum quality:
 * - NO local database (limited, outdated)
 * - NO caching (fresh results every time)
 * - ALWAYS call Gemini for accurate, comprehensive citations
 * 
 * Quality > Cost - Law students deserve the best!
 */

/**
 * Find legal citations using Gemini AI
 * Returns comprehensive, accurate citations from latest legal knowledge
 */
export const findCitations = async (query) => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    console.log('🤖 Gemini AI citation search:', query);

    const prompt = `You are an expert Indian legal researcher. Find the most relevant and accurate Indian legal citations for: "${query}"

Include:
1. Constitutional Articles - with article number, title, and brief description
2. Landmark Supreme Court Cases - with full case name, year, citation (AIR/SCC), and 1-line summary
3. Relevant Acts/Statutes - with full name, year, and brief description
4. High Court cases if highly relevant

IMPORTANT:
- Provide ONLY verified, accurate citations
- Include complete citation formats (AIR/SCC for cases)
- Prioritize landmark cases and fundamental rights
- Include relevance score (1-100) based on query match

Return as JSON array:
[
  {
    "type": "constitutional_article" | "supreme_court_case" | "high_court_case" | "act",
    "citation": "full citation with year and reporter",
    "name": "Article title or Case name",
    "year": "year",
    "summary": "brief 1-2 line description of relevance",
    "relevance": 85
  }
]

Return 5-10 most relevant results. ONLY return valid JSON, no additional text.`;

    try {
        const response = await callGeminiJSON(prompt, {
            temperature: 0.1, // Very low - maximum accuracy for legal citations
            maxOutputTokens: 2000,
        });

        if (Array.isArray(response)) {
            const sorted = response.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
            console.log(`✅ Gemini found ${sorted.length} citations for: ${query}`);
            return sorted.slice(0, 10);
        }

        // If not array, try to extract from response
        if (typeof response === 'object' && response.citations) {
            const sorted = response.citations.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
            return sorted.slice(0, 10);
        }

        console.warn('Gemini returned unexpected format:', response);
        return [];
    } catch (error) {
        console.error('❌ Gemini citation search failed:', error);
        throw error;
    }
};

/**
 * Get detailed information about a specific citation
 * Uses Gemini to provide comprehensive legal analysis
 */
export const getCitationDetails = async (citation) => {
    console.log('🤖 Fetching citation details:', citation);

    const prompt = `Provide comprehensive details about this Indian legal citation: "${citation}"

Include:
- Full case name or article title
- Complete citation with reporter (AIR/SCC)
- Year and court
- Brief summary (2-3 sentences)
- Legal significance
- Key principles established
- Related citations if applicable

Return as JSON:
{
  "type": "case" | "article" | "act",
  "name": "full name",
  "citation": "complete citation",
  "year": "year",
  "court": "court name",
  "summary": "detailed summary",
  "significance": "why this is important",
  "key_principles": ["principle 1", "principle 2"],
  "related_citations": ["citation 1", "citation 2"]
}

Return ONLY valid JSON.`;

    try {
        const response = await callGeminiJSON(prompt, {
            temperature: 0.1,
            maxOutputTokens: 1500,
        });

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

    const prompt = `Verify this Indian legal citation: "${citation}"

Check:
1. Is the citation format correct?
2. Does this case/article exist?
3. Is it still valid (not overruled)?
4. Any recent amendments or modifications?

Return as JSON:
{
  "is_valid": true/false,
  "exists": true/false,
  "status": "active" | "overruled" | "modified" | "unknown",
  "correct_citation": "corrected citation if wrong",
  "notes": "any important notes about validity",
  "last_verified": "current date"
}

Return ONLY valid JSON.`;

    try {
        const response = await callGeminiJSON(prompt, {
            temperature: 0.1,
            maxOutputTokens: 800,
        });

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

    const prompt = `Find citations related to: "${citation}"

Include:
- Cases that cited this case
- Earlier cases this case relied on
- Cases on similar legal principles
- Relevant constitutional articles
- Related statutes

Return 5-8 most relevant related citations as JSON array:
[
  {
    "citation": "full citation",
    "name": "name",
    "year": "year",
    "relationship": "cited in" | "relied on" | "similar principle" | "related statute",
    "relevance": 75
  }
]

Return ONLY valid JSON array.`;

    try {
        const response = await callGeminiJSON(prompt, {
            temperature: 0.2,
            maxOutputTokens: 1500,
        });

        if (Array.isArray(response)) {
            return response.slice(0, 8);
        }

        console.warn('Unexpected format for related citations');
        return [];
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

    const prompt = `Find important Indian legal citations related to the topic: "${topic}"

Include landmark cases, constitutional provisions, and key statutes.

Return as JSON array with 8-12 most important citations:
[
  {
    "type": "case" | "article" | "act",
    "citation": "full citation",
    "name": "name",
    "year": "year",
    "summary": "why this is relevant to ${topic}",
    "importance": 90
  }
]

Prioritize foundational cases and frequently cited authorities.
Return ONLY valid JSON array.`;

    try {
        const response = await callGeminiJSON(prompt, {
            temperature: 0.2,
            maxOutputTokens: 2500,
        });

        if (Array.isArray(response)) {
            const sorted = response.sort((a, b) => (b.importance || 0) - (a.importance || 0));
            return sorted.slice(0, 12);
        }

        return [];
    } catch (error) {
        console.error('❌ Topic search failed:', error);
        throw error;
    }
};
