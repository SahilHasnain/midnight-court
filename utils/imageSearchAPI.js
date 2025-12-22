/**
 * Image Search API - Proxy via Appwrite Functions
 */

const callImageFunction = async (payload) => {
  const url = process.env.EXPO_PUBLIC_IMAGE_FUNCTION_URL; // Will be set from env

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Image function failed: ${response.status}`);
  }

  const execution = await response.json();

  if (execution.status === 'failed') {
    throw new Error(`Function execution failed: ${execution.stderr}`);
  }

  return JSON.parse(execution.responseBody);
};

// Search images from Unsplash via Appwrite
const searchUnsplash = async (query) => {
  try {
    const data = await callImageFunction({ query, source: 'unsplash' });

    return (
      data.results?.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnail: photo.urls.regular,
        source: "unsplash",
      })) || []
    );
  } catch (error) {
    console.error("Unsplash search error:", error);
    return [];
  }
};

// Search images from Pexels via Appwrite
const searchPexels = async (query) => {
  try {
    const data = await callImageFunction({ query, source: 'pexels' });

    return (
      data.photos?.map((photo) => ({
        id: photo.id.toString(),
        url: photo.src.large,
        thumbnail: photo.src.large,
        source: "pexels",
      })) || []
    );
  } catch (error) {
    console.error("Pexels search error:", error);
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
