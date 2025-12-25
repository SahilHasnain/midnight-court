/**
 * Image Search API - Proxy via Appwrite Functions
 */

const callImageFunction = async (payload) => {
  const url = process.env.EXPO_PUBLIC_IMAGE_FUNCTION_URL;
  if (!url) {
    throw new Error('Image function URL not configured (EXPO_PUBLIC_IMAGE_FUNCTION_URL)');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (_e) {
      bodyText = '';
    }
    throw new Error(`Image function failed: ${response.status}${bodyText ? ` - ${bodyText}` : ''}`);
  }

  // Handle both Appwrite execution wrapper and direct JSON response
  let parsed;
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) {
    parsed = await response.json();
  } else {
    const text = await response.text();
    try {
      parsed = JSON.parse(text);
    } catch (_err) {
      throw new Error(`Invalid JSON from image function: ${text?.slice(0, 200) || '(empty)'}`);
    }
  }

  // If this is an Appwrite execution wrapper
  if (parsed && typeof parsed === 'object' && 'status' in parsed && ('responseBody' in parsed || 'stderr' in parsed)) {
    if (parsed.status === 'failed') {
      throw new Error(`Function execution failed: ${parsed.stderr || 'unknown error'}`);
    }
    const body = parsed.responseBody;
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch (_err) {
        throw new Error(`Invalid responseBody JSON: ${body.slice(0, 200)}`);
      }
    }
    return body;
  }

  // Direct JSON response from proxy
  if (parsed && parsed.error) {
    throw new Error(`Image proxy error: ${parsed.error}${parsed.details ? ` - ${parsed.details}` : ''}`);
  }

  return parsed;
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
