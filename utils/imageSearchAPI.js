/**
 * Image Search API - Proxy via Appwrite Functions
 */

const callImageFunction = async (payload) => {
  const url = process.env.EXPO_PUBLIC_IMAGE_FUNCTION_URL; // Will be set from env

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = '(no body)';
      }
      const errorMsg = `Image function HTTP ${response.status}: ${errorBody}`;
      console.error(`[ImageSearchAPI] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const execution = await response.json();

    if (execution.status === 'failed') {
      const errorMsg = `Function execution failed: ${execution.stderr}`;
      console.error(`[ImageSearchAPI] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return JSON.parse(execution.responseBody);
  } catch (err) {
    console.error(`[ImageSearchAPI] callImageFunction error:`, err.message);
    throw err;
  }
};

// Search images from Unsplash via Appwrite
const searchUnsplash = async (query) => {
  try {
    console.log(`[ImageSearchAPI] Searching Unsplash: "${query}"`);
    const data = await callImageFunction({ query, source: 'unsplash' });
    const results = data.results?.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.regular,
      source: "unsplash",
    })) || [];
    console.log(`[ImageSearchAPI] Unsplash returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[ImageSearchAPI] Unsplash search error:", {
      message: error.message,
      query,
      timestamp: new Date().toISOString(),
    });
    return [];
  }
};

// Search images from Pexels via Appwrite
const searchPexels = async (query) => {
  try {
    console.log(`[ImageSearchAPI] Searching Pexels: "${query}"`);
    const data = await callImageFunction({ query, source: 'pexels' });
    const results = data.photos?.map((photo) => ({
      id: photo.id.toString(),
      url: photo.src.large,
      thumbnail: photo.src.large,
      source: "pexels",
    })) || [];
    console.log(`[ImageSearchAPI] Pexels returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[ImageSearchAPI] Pexels search error:", {
      message: error.message,
      query,
      timestamp: new Date().toISOString(),
    });
    return [];
  }
};

// Main search function
export const searchImages = async (query, source = "pexels") => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  if (source === "unsplash") {
    return searchUnsplash(query);
  } else {
    return searchPexels(query);
  }
};

// Cache image locally
export const cacheImageLocally = async (imageUri) => {
  return imageUri;
};

// Get suggested queries
export const getLegalSearchSuggestions = () => [
  "courtroom",
  "legal scales",
  "justice",
  "Supreme Court",
  "High Court",
  "gavel",
  "law books",
  "documents",
  "evidence",
  "trial",
  "case study",
  "verdict",
  "litigation",
];
