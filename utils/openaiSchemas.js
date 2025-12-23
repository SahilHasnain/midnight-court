/**
 * OpenAI-Compatible JSON Schemas
 * Structured output schemas optimized for OpenAI's strict mode
 * These schemas are compatible with OpenAI's json_schema response format
 */

/**
 * Citation Schema - Individual legal citation
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
            description: "Year of case/statute or empty string"
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
            description: "Relevance score (0-100)"
        },
        url: {
            type: "string",
            description: "URL to full text or empty string"
        },
    },
    required: ["type", "name", "year", "fullTitle", "summary", "relevance", "url"],
    additionalProperties: false
};

/**
 * Citation Search Results Schema
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
 * Citation Details Schema
 */
export const citationDetailsSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Citation name"
        },
        fullTitle: {
            type: "string",
            description: "Full citation title"
        },
        year: {
            type: "string",
            description: "Year or empty string"
        },
        summary: {
            type: "string",
            description: "Comprehensive summary"
        },
        significance: {
            type: "string",
            description: "Legal significance"
        },
        keyPrinciples: {
            type: "array",
            description: "Key legal principles",
            items: {
                type: "string"
            }
        }
    },
    required: ["name", "fullTitle", "year", "summary", "significance", "keyPrinciples"],
    additionalProperties: false
};

/**
 * Text Block Data Schema
 */
export const textBlockDataSchema = {
    type: "object",
    properties: {
        points: {
            type: "array",
            description: "Array of bullet points",
            items: {
                type: "string"
            }
        }
    },
    required: ["points"],
    additionalProperties: false
};

/**
 * Quote Block Data Schema
 */
export const quoteBlockDataSchema = {
    type: "object",
    properties: {
        quote: {
            type: "string",
            description: "The quoted text"
        },
        citation: {
            type: "string",
            description: "Citation source"
        }
    },
    required: ["quote", "citation"],
    additionalProperties: false
};

/**
 * Callout Block Data Schema
 */
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
            description: "Callout type"
        }
    },
    required: ["text", "type"],
    additionalProperties: false
};

/**
 * Timeline Event Schema
 */
const timelineEventSchema = {
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
    required: ["date", "title", "description"],
    additionalProperties: false
};

/**
 * Timeline Block Data Schema
 */
export const timelineBlockDataSchema = {
    type: "object",
    properties: {
        events: {
            type: "array",
            description: "Array of timeline events",
            items: timelineEventSchema
        }
    },
    required: ["events"],
    additionalProperties: false
};

/**
 * Evidence Item Schema
 */
const evidenceItemSchema = {
    type: "object",
    properties: {
        label: {
            type: "string",
            description: "Evidence label"
        },
        description: {
            type: "string",
            description: "Evidence description"
        }
    },
    required: ["label", "description"],
    additionalProperties: false
};

/**
 * Evidence Block Data Schema
 */
export const evidenceBlockDataSchema = {
    type: "object",
    properties: {
        items: {
            type: "array",
            description: "Array of evidence items",
            items: evidenceItemSchema
        }
    },
    required: ["items"],
    additionalProperties: false
};

/**
 * Two Column Block Data Schema
 */
export const twoColumnBlockDataSchema = {
    type: "object",
    properties: {
        leftTitle: {
            type: "string",
            description: "Title for left column"
        },
        leftPoints: {
            type: "array",
            description: "Points for left column",
            items: {
                type: "string"
            }
        },
        rightTitle: {
            type: "string",
            description: "Title for right column"
        },
        rightPoints: {
            type: "array",
            description: "Points for right column",
            items: {
                type: "string"
            }
        }
    },
    required: ["leftTitle", "leftPoints", "rightTitle", "rightPoints"],
    additionalProperties: false
};

/**
 * Slide Block Schema - Flexible data field
 */
const slideBlockSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            description: "Block type: text, quote, callout, timeline, evidence, twoColumn, divider, sectionHeader",
            enum: ["text", "quote", "callout", "timeline", "evidence", "twoColumn", "divider", "sectionHeader"]
        },
        data: {
            type: "object",
            description: "Block data - structure depends on block type",
            additionalProperties: true
        }
    },
    required: ["type", "data"],
    additionalProperties: false
};

/**
 * Slide Schema
 */
const slideSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "Slide title - short and formal"
        },
        subtitle: {
            type: "string",
            description: "Optional subtitle or empty string"
        },
        suggestedImages: {
            type: "array",
            description: "Image search keywords for this slide",
            items: {
                type: "string"
            }
        },
        blocks: {
            type: "array",
            description: "Content blocks for the slide (1-2 blocks recommended)",
            items: slideBlockSchema
        }
    },
    required: ["title", "subtitle", "suggestedImages", "blocks"],
    additionalProperties: false
};

/**
 * Slide Deck Schema - Main schema for slide generation
 * Optimized for OpenAI's strict JSON schema mode
 */
export const slideDeckSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "Presentation title"
        },
        totalSlides: {
            type: "number",
            description: "Total number of slides (3-8)"
        },
        slides: {
            type: "array",
            description: "Array of presentation slides",
            items: slideSchema
        }
    },
    required: ["title", "totalSlides", "slides"],
    additionalProperties: false
};

/**
 * Image Schema
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
            description: "Relevance score (0-100)"
        },
    },
    required: ["url", "title", "attribution", "source", "relevance"],
    additionalProperties: false
};

/**
 * Image Search Results Schema
 */
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

/**
 * Export all schemas
 */
export default {
    citationSchema,
    citationSearchResultsSchema,
    citationDetailsSchema,
    textBlockDataSchema,
    quoteBlockDataSchema,
    calloutBlockDataSchema,
    timelineBlockDataSchema,
    evidenceBlockDataSchema,
    twoColumnBlockDataSchema,
    slideDeckSchema,
    imageSchema,
    imageSearchResultsSchema,
};
