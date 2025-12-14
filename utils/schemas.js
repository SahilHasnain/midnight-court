/**
 * Citation Schema - Structured output for legal citations
 * Ensures predictable JSON structure from Gemini API
 */
export const citationSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            enum: ['article', 'case', 'act', 'section'],
            description: "Type of citation"
        },
        name: {
            type: "string",
            description: "Name of the citation (e.g., 'Article 21', 'K.S. Puttaswamy v. Union of India')"
        },
        year: {
            type: "string",
            description: "Year of case/statute"
        },
        fullTitle: {
            type: "string",
            description: "Full title or description"
        },
        summary: {
            type: "string",
            description: "Brief summary of the citation"
        },
        relevance: {
            type: "number",
            description: "Relevance score (0-100)",
            minimum: 0,
            maximum: 100
        },
        url: {
            type: "string",
            description: "URL to full text if available"
        },
    },
    required: ["type", "name", "fullTitle", "summary", "relevance"],
    additionalProperties: false
};

/**
 * Citation Search Results Schema
 * Returns array of citations matching the search query
 */
export const citationSearchResultsSchema = {
    type: "object",
    properties: {
        query: {
            type: "string",
            description: "The search query"
        },
        citations: {
            type: "array",
            description: "Array of relevant citations",
            items: citationSchema
        },
        totalFound: {
            type: "number",
            description: "Total number of citations found"
        },
        searchTime: {
            type: "string",
            description: "Time taken for search"
        },
    },
    required: ["query", "citations", "totalFound", "searchTime"],
    additionalProperties: false
};

/**
 * Citation Details Schema - Comprehensive information about a single citation
 */
export const citationDetailsSchema = {
    type: "object",
    properties: {
        citation: citationSchema,
        fullText: {
            type: "string",
            description: "Full text of the citation if available"
        },
        keyPoints: {
            type: "array",
            description: "Key points from the citation",
            items: {
                type: "string"
            }
        },
        relatedCitations: {
            type: "array",
            description: "Related citations",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    relevance: { type: "number" }
                },
                required: ["name", "relevance"],
                additionalProperties: false
            }
        },
        currentStatus: {
            type: "string",
            enum: ['active', 'overruled', 'modified', 'unknown'],
            description: "Current legal status"
        },
        applicableJurisdictions: {
            type: "array",
            description: "Jurisdictions where this citation applies",
            items: {
                type: "string"
            }
        },
    },
    required: ["citation", "keyPoints", "relatedCitations", "currentStatus", "applicableJurisdictions"],
    additionalProperties: false
};

/**
 * Slide Generation Schema - For AI-powered slide creation
 */
export const slideBlockSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            enum: ['text', 'quote', 'callout', 'timeline', 'evidence', 'twoColumn'],
            description: "Block type"
        },
        data: {
            type: "object",
            description: "Block-specific data"
        },
    },
    required: ["type", "data"],
    additionalProperties: false
};

export const slideSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "Slide title"
        },
        subtitle: {
            type: "string",
            description: "Slide subtitle"
        },
        blocks: {
            type: "array",
            description: "Content blocks on the slide",
            items: slideBlockSchema
        },
    },
    required: ["title", "blocks"],
    additionalProperties: false
};

export const slideDeckSchema = {
    type: "object",
    properties: {
        slides: {
            type: "array",
            description: "Array of slides",
            items: slideSchema
        },
        title: {
            type: "string",
            description: "Presentation title"
        },
        totalSlides: {
            type: "number",
            description: "Total number of slides"
        },
    },
    required: ["slides", "title", "totalSlides"],
    additionalProperties: false
};

/**
 * Image Search Results Schema
 */
export const imageSchema = {
    type: "object",
    properties: {
        url: {
            type: "string",
            description: "Image URL"
        },
        title: {
            type: "string",
            description: "Image title"
        },
        attribution: {
            type: "string",
            description: "Attribution text"
        },
        source: {
            type: "string",
            enum: ['unsplash', 'pexels', 'pixabay'],
            description: "Image source"
        },
        relevance: {
            type: "number",
            description: "Relevance score",
            minimum: 0,
            maximum: 100
        },
    },
    required: ["url", "title", "attribution", "source", "relevance"],
    additionalProperties: false
};

export const imageSearchResultsSchema = {
    type: "object",
    properties: {
        query: {
            type: "string",
            description: "Search query"
        },
        images: {
            type: "array",
            description: "Array of relevant images",
            items: imageSchema
        },
        totalFound: {
            type: "number",
            description: "Total images found"
        },
    },
    required: ["query", "images", "totalFound"],
    additionalProperties: false
};
