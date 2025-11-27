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

    const validPoints = points.filter(p => {
        const pointText = typeof p === 'string' ? p : p.text;
        return pointText && pointText.trim().length > 0;
    });

    if (validPoints.length === 0) return '';

    return `
        <div class="points">
            ${validPoints.map(point => {
                const pointData = typeof point === 'string' 
                    ? { text: point, highlighted: false, highlightStyle: 'background' }
                    : point;
                
                const { text, highlighted, highlightStyle = 'background' } = pointData;

                if (highlighted) {
                    const highlightedText = highlightStyle === 'background'
                        ? `<span style="background-color:#CBA44A;color:#0B1120;padding:4px 8px;border-radius:4px;font-weight:700;">${text}</span>`
                        : `<span style="border-bottom:3px solid #CBA44A;font-weight:700;">${text}</span>`;
                    return `<div class="point">${highlightedText}</div>`;
                } else {
                    return `<div class="point">${text}</div>`;
                }
            }).join('')}
        </div>
    `;
};

// Add more block renderers as we implement them
// const renderQuoteBlock = (block) => { ... };
// etc...

