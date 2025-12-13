// Image Search API - Integrates with Unsplash and Pexels
// Both offer free APIs with no cost
// Get free API keys:
// - Unsplash: https://unsplash.com/oauth/applications
// - Pexels: https://www.pexels.com/api/

const UNSPLASH_KEY = process.env.EXPO_PUBLIC_UNSPLASH_KEY;
const PEXELS_KEY = process.env.EXPO_PUBLIC_PEXELS_KEY;

// Search images from Unsplash (Free tier: 50 requests/hour)
const searchUnsplash = async (query) => {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`,
            {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_KEY}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();

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

// Search images from Pexels (Free tier: 200 requests/hour)
const searchPexels = async (query) => {
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`,
            {
                headers: {
                    Authorization: PEXELS_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.status}`);
        }

        const data = await response.json();

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

// Main search function - Routes to appropriate API
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

// Cache image locally (currently returns URI as-is)
export const cacheImageLocally = async (imageUri) => {
    return imageUri;
};

// Get suggested queries for legal presentations
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
