/**
 * Citation API - Proxy via Appwrite Functions
 */

const callCitationFunction = async (payload) => {
  const url = process.env.EXPO_PUBLIC_CITATION_FUNCTION_URL; // Will be set from env

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Citation function failed: ${response.status}`);
  }

  const execution = await response.json();

  if (execution.status === 'failed') {
    throw new Error(`Function execution failed: ${execution.stderr}`);
  }

  return JSON.parse(execution.responseBody);
};

/**
 * Find legal citations using Gemini AI via Appwrite
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

  console.log('🤖 Citation search:', query);
  const startTime = Date.now();

  try {
    const response = await callCitationFunction({
      query,
      action: 'search'
    });

    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from citation search");
    }

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    
    // Filter valid citations
    const validCitations = result.citations.filter(citation => 
      citation.name && citation.fullTitle && citation.summary && typeof citation.relevance === 'number'
    );

    const searchTime = `${Date.now() - startTime}ms`;

    console.log(`✅ Found ${validCitations.length} citations in ${searchTime}`);
    
    return {
      query: result.query || query,
      citations: validCitations,
      totalFound: validCitations.length,
      searchTime,
    };
  } catch (error) {
    console.error("❌ Citation search failed:", error);
    throw error;
  }
};

/**
 * Get detailed information about a specific citation
 */
export const getCitationDetails = async (citationName) => {
  console.log('🤖 Fetching citation details:', citationName);

  try {
    const response = await callCitationFunction({
      query: citationName,
      action: 'details'
    });

    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response");
    }

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    console.log('✅ Citation details retrieved');
    return result;
  } catch (error) {
    console.error('❌ Failed to get citation details:', error);
    throw error;
  }
};

/**
 * Verify if a citation is accurate
 */
export const verifyCitation = async (citation) => {
  console.log('🔍 Verifying citation:', citation);
  return getCitationDetails(citation);
};

/**
 * Get related citations
 */
export const getRelatedCitations = async (citation) => {
  console.log('🔗 Finding related citations:', citation);
  return findCitations(`related citations for ${citation}`);
};

/**
 * Search citations by topic
 */
export const searchByTopic = async (topic) => {
  console.log('📚 Searching by topic:', topic);
  return findCitations(topic);
};
