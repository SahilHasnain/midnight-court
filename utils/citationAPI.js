import AsyncStorage from '@react-native-async-storage/async-storage';
import { callGemini, callGeminiJSON } from './geminiAPI';
import legalDatabase from './legalDatabase.json';

/**
 * Citation API - Find legal citations using local database + Gemini AI
 * Features:
 * - Local fuzzy search for instant results
 * - Gemini AI for complex queries
 * - AsyncStorage caching to reduce API calls
 * - Rate limiting built into geminiAPI
 */

const CACHE_KEY = 'legal_citations_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fuzzy search in local database
 * Checks constitutional articles, landmark cases, and acts
 */
const searchLocalDatabase = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  // Search constitutional articles
  legalDatabase.constitutional_articles.forEach((article) => {
    const relevance = calculateRelevance(normalizedQuery, article);
    if (relevance > 0) {
      results.push({
        type: 'constitutional_article',
        number: article.number,
        title: article.title,
        description: article.description,
        citation: `Article ${article.number}, Constitution of India`,
        relevance,
      });
    }
  });

  // Search landmark cases
  legalDatabase.landmark_cases.forEach((case_) => {
    const relevance = calculateRelevance(normalizedQuery, case_);
    if (relevance > 0) {
      results.push({
        type: 'case',
        name: case_.name,
        year: case_.year,
        citation: case_.citation,
        summary: case_.summary,
        relevance,
      });
    }
  });

  // Search acts
  legalDatabase.important_acts.forEach((act) => {
    const relevance = calculateRelevance(normalizedQuery, act);
    if (relevance > 0) {
      results.push({
        type: 'act',
        name: act.name,
        year: act.year,
        abbreviation: act.abbreviation,
        description: act.description,
        citation: `${act.name}, ${act.year}`,
        relevance,
      });
    }
  });

  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
};

/**
 * Calculate relevance score (0-100) for search query
 */
const calculateRelevance = (query, item) => {
  let score = 0;

  // Check if keywords match
  if (item.keywords) {
    item.keywords.forEach((keyword) => {
      if (query.includes(keyword.toLowerCase())) {
        score += 30;
      }
      // Partial match
      if (keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase().substring(0, 4))) {
        score += 10;
      }
    });
  }

  // Check title/name match
  const titleField = item.title || item.name || '';
  if (titleField.toLowerCase().includes(query)) {
    score += 40;
  }

  // Check description/summary match
  const descField = item.description || item.summary || '';
  if (descField.toLowerCase().includes(query)) {
    score += 20;
  }

  // Check number match (for articles)
  if (item.number && query.includes(item.number)) {
    score += 50;
  }

  return Math.min(score, 100);
};

/**
 * Get cached results from AsyncStorage
 */
const getCachedResults = async (query) => {
  try {
    const cacheString = await AsyncStorage.getItem(CACHE_KEY);
    if (!cacheString) return null;

    const cache = JSON.parse(cacheString);
    const cached = cache[query];

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log('✅ Citation cache hit for:', query);
      return cached.results;
    }

    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

/**
 * Save results to cache
 */
const saveCachedResults = async (query, results) => {
  try {
    const cacheString = await AsyncStorage.getItem(CACHE_KEY);
    const cache = cacheString ? JSON.parse(cacheString) : {};

    cache[query] = {
      results,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('✅ Cached citation results for:', query);
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

/**
 * Use Gemini AI to find citations
 */
const searchWithGemini = async (query) => {
  const prompt = `Find relevant Indian legal citations for the query: "${query}"

Include:
1. Constitutional articles (with article number and brief description)
2. Landmark Supreme Court cases (with case name, year, and citation)
3. Relevant acts or sections

Return as JSON array with this structure:
[
  {
    "type": "constitutional_article" | "case" | "act",
    "citation": "full citation text",
    "name": "name or title",
    "year": "year if applicable",
    "summary": "brief 1-line summary",
    "relevance": 1-100 score
  }
]

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callGeminiJSON(prompt, {
      temperature: 0.2, // Low for accuracy
      maxOutputTokens: 1500,
    });

    if (Array.isArray(response)) {
      return response.slice(0, 10); // Max 10 results
    }

    // If not array, try to extract from response
    if (typeof response === 'object' && response.citations) {
      return response.citations.slice(0, 10);
    }

    console.warn('Gemini returned unexpected format:', response);
    return [];
  } catch (error) {
    console.error('Gemini search error:', error);
    throw error;
  }
};

/**
 * Main citation search function
 * Strategy:
 * 1. Check cache first
 * 2. Try local database search
 * 3. If no local results, use Gemini AI
 * 4. Cache Gemini results
 */
export const findCitations = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Step 1: Check cache
  const cached = await getCachedResults(normalizedQuery);
  if (cached) {
    return cached;
  }

  // Step 2: Local database search
  const localResults = searchLocalDatabase(normalizedQuery);

  // If we have good local results (relevance > 30), return them
  if (localResults.length > 0 && localResults[0].relevance > 30) {
    console.log(`✅ Found ${localResults.length} local citations for:`, query);
    await saveCachedResults(normalizedQuery, localResults);
    return localResults;
  }

  // Step 3: Use Gemini for complex queries
  console.log('🤖 Using Gemini AI for citation search:', query);
  try {
    const geminiResults = await searchWithGemini(query);

    // Combine local + Gemini results
    const combined = [...localResults, ...geminiResults];
    const unique = Array.from(
      new Map(combined.map((item) => [item.citation, item])).values()
    );

    const sorted = unique.sort((a, b) => (b.relevance || 0) - (a.relevance || 0)).slice(0, 10);

    await saveCachedResults(normalizedQuery, sorted);
    return sorted;
  } catch (error) {
    console.error('Gemini search failed, returning local results:', error);
    // Fallback to local results even if low relevance
    return localResults;
  }
};

/**
 * Get citation details for a specific article/case
 */
export const getCitationDetails = async (citation) => {
  // Check if it's an article number
  const articleMatch = citation.match(/article\s+(\d+[a-z]?)/i);
  if (articleMatch) {
    const number = articleMatch[1];
    const article = legalDatabase.constitutional_articles.find(
      (a) => a.number === number
    );
    if (article) {
      return {
        type: 'constitutional_article',
        number: article.number,
        title: article.title,
        description: article.description,
        citation: `Article ${article.number}, Constitution of India`,
      };
    }
  }

  // Check landmark cases
  const case_ = legalDatabase.landmark_cases.find(
    (c) => c.citation === citation || c.name.toLowerCase().includes(citation.toLowerCase())
  );
  if (case_) {
    return {
      type: 'case',
      name: case_.name,
      year: case_.year,
      citation: case_.citation,
      summary: case_.summary,
    };
  }

  // Use Gemini to get details
  try {
    const prompt = `Provide details about this legal citation: "${citation}"
    
    Return as JSON with:
    {
      "type": "case" | "article" | "act",
      "name": "full name",
      "citation": "complete citation",
      "summary": "brief description"
    }`;

    const response = await callGeminiJSON(prompt, { temperature: 0.1 });
    return response;
  } catch (error) {
    console.error('Failed to get citation details:', error);
    return null;
  }
};

/**
 * Clear citation cache
 */
export const clearCitationCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('✅ Citation cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const cacheString = await AsyncStorage.getItem(CACHE_KEY);
    if (!cacheString) {
      return { entries: 0, size: 0 };
    }

    const cache = JSON.parse(cacheString);
    return {
      entries: Object.keys(cache).length,
      size: cacheString.length,
      queries: Object.keys(cache),
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { entries: 0, size: 0 };
  }
};
