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
 * Slide Generation Schemas - For AI-powered slide creation
 * Detailed schemas for each block type
 */

// Text Block - Bullet points
export const textBlockDataSchema = {
    type: "object",
    properties: {
        points: {
            type: "array",
            description: "Array of bullet points (2-5 points recommended)",
            items: {
                type: "string"
            },
            minItems: 1,
            maxItems: 6
        }
    },
    required: ["points"],
    additionalProperties: false
};

// Quote Block - Citations and quotes
export const quoteBlockDataSchema = {
    type: "object",
    properties: {
        quote: {
            type: "string",
            description: "The quoted text or legal principle"
        },
        citation: {
            type: "string",
            description: "Citation source (case name, article, etc.)"
        }
    },
    required: ["quote", "citation"],
    additionalProperties: false
};

// Callout Block - Important highlights
export const calloutBlockDataSchema = {
    type: "object",
    properties: {
        text: {
            type: "string",
            description: "Important text to highlight"
        },
        type: {
            type: "string",
            enum: ["info", "warning", "success", "error"],
            description: "Callout type for visual styling"
        }
    },
    required: ["text", "type"],
    additionalProperties: false
};

// Timeline Block - Chronological events
export const timelineBlockDataSchema = {
    type: "object",
    properties: {
        events: {
            type: "array",
            description: "Array of timeline events (3-6 events recommended)",
            items: {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        description: "Date or time period"
                    },
                    title: {
                        type: "string",
                        description: "Event title"
                    },
                    description: {
                        type: "string",
                        description: "Brief event description"
                    }
                },
                required: ["date", "title"],
                additionalProperties: false
            },
            minItems: 2,
            maxItems: 8
        }
    },
    required: ["events"],
    additionalProperties: false
};

// Evidence Block - Case evidence
export const evidenceBlockDataSchema = {
    type: "object",
    properties: {
        items: {
            type: "array",
            description: "Array of evidence items (2-5 items recommended)",
            items: {
                type: "object",
                properties: {
                    label: {
                        type: "string",
                        description: "Evidence label or type"
                    },
                    description: {
                        type: "string",
                        description: "Evidence description"
                    }
                },
                required: ["label", "description"],
                additionalProperties: false
            },
            minItems: 1,
            maxItems: 6
        }
    },
    required: ["items"],
    additionalProperties: false
};

// Two Column Block - Comparative arguments
export const twoColumnBlockDataSchema = {
    type: "object",
    properties: {
        leftTitle: {
            type: "string",
            description: "Title for left column"
        },
        leftPoints: {
            type: "array",
            description: "Points for left column (2-4 points recommended)",
            items: {
                type: "string"
            },
            minItems: 1,
            maxItems: 5
        },
        rightTitle: {
            type: "string",
            description: "Title for right column"
        },
        rightPoints: {
            type: "array",
            description: "Points for right column (2-4 points recommended)",
            items: {
                type: "string"
            },
            minItems: 1,
            maxItems: 5
        }
    },
    required: ["leftTitle", "leftPoints", "rightTitle", "rightPoints"],
    additionalProperties: false
};

// Simplified, flattened schema for Gemini API (avoids nesting depth limit)
// Ultra-simplified schema to avoid nesting depth issues
export const slideDeckSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        totalSlides: { type: "number" },
        slides: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    suggestedImages: {
                        type: "array",
                        description: "Array of suggested image search keywords for this slide",
                        items: { type: "string" }
                    },
                    blocks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                // Keep data as free-form to reduce schema complexity
                                data: {}
                            },
                            required: ["type", "data"]
                        }
                    }
                },
                required: ["title", "blocks"]
            }
        }
    },
    required: ["title", "totalSlides", "slides"]
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
