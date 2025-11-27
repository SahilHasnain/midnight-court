import { BLOCK_TYPES } from "@/components/blocks/blockTypes";

/**
 * Renders blocks to HTML for PDF generation
 */
export const renderBlockToHTML = (block) => {
    if (!block || !block.type) return '';

    switch (block.type) {
        case BLOCK_TYPES.TEXT:
            return renderTextBlock(block);

        // Future block types will be added here
        // case BLOCK_TYPES.HIGHLIGHT:
        //     return renderHighlightBlock(block);

        // case BLOCK_TYPES.QUOTE:
        //     return renderQuoteBlock(block);

        // etc...

        default:
            return renderTextBlock(block);
    }
};

const renderTextBlock = (block) => {
    const { points } = block.data;

    if (!points || points.length === 0) return '';

    const validPoints = points.filter(p => p && p.trim().length > 0);

    if (validPoints.length === 0) return '';

    return `
        <div class="points">
            ${validPoints.map(point => `
                <div class="point">${point}</div>
            `).join('')}
        </div>
    `;
};

// Add more block renderers as we implement them
// const renderHighlightBlock = (block) => { ... };
// const renderQuoteBlock = (block) => { ... };
// etc...
