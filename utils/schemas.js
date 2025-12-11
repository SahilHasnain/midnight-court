import { z } from 'zod';

/**
 * Citation Schema - Structured output for legal citations
 * Ensures predictable JSON structure from Gemini API
 */
export const citationSchema = z.object({
    type: z.enum(['article', 'case', 'act', 'section']).describe('Type of citation'),
    name: z.string().describe('Name of the citation (e.g., "Article 21", "K.S. Puttaswamy v. Union of India")'),
    year: z.string().optional().describe('Year of case/statute'),
    fullTitle: z.string().describe('Full title or description'),
    summary: z.string().describe('Brief summary of the citation'),
    relevance: z.number().min(0).max(100).describe('Relevance score (0-100)'),
    url: z.string().optional().describe('URL to full text if available'),
});

/**
 * Citation Search Results Schema
 * Returns array of citations matching the search query
 */
export const citationSearchResultsSchema = z.object({
    query: z.string().describe('The search query'),
    citations: z.array(citationSchema).describe('Array of relevant citations'),
    totalFound: z.number().describe('Total number of citations found'),
    searchTime: z.string().describe('Time taken for search'),
});

/**
 * Citation Details Schema - Comprehensive information about a single citation
 */
export const citationDetailsSchema = z.object({
    citation: citationSchema,
    fullText: z.string().optional().describe('Full text of the citation if available'),
    keyPoints: z.array(z.string()).describe('Key points from the citation'),
    relatedCitations: z.array(z.object({
        name: z.string(),
        relevance: z.number(),
    })).describe('Related citations'),
    currentStatus: z.enum(['active', 'overruled', 'modified', 'unknown']).describe('Current legal status'),
    applicableJurisdictions: z.array(z.string()).describe('Jurisdictions where this citation applies'),
});

/**
 * Slide Generation Schema - For AI-powered slide creation
 */
export const slideBlockSchema = z.object({
    type: z.enum(['text', 'quote', 'callout', 'timeline', 'evidence', 'twoColumn']).describe('Block type'),
    data: z.record(z.any()).describe('Block-specific data'),
});

export const slideSchema = z.object({
    title: z.string().describe('Slide title'),
    subtitle: z.string().optional().describe('Slide subtitle'),
    blocks: z.array(slideBlockSchema).describe('Content blocks on the slide'),
});

export const slideDeckSchema = z.object({
    slides: z.array(slideSchema).describe('Array of slides'),
    title: z.string().describe('Presentation title'),
    totalSlides: z.number().describe('Total number of slides'),
});

/**
 * Image Search Results Schema
 */
export const imageSchema = z.object({
    url: z.string().describe('Image URL'),
    title: z.string().describe('Image title'),
    attribution: z.string().describe('Attribution text'),
    source: z.enum(['unsplash', 'pexels', 'pixabay']).describe('Image source'),
    relevance: z.number().min(0).max(100).describe('Relevance score'),
});

export const imageSearchResultsSchema = z.object({
    query: z.string().describe('Search query'),
    images: z.array(imageSchema).describe('Array of relevant images'),
    totalFound: z.number().describe('Total images found'),
});
