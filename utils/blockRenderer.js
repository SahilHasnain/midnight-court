import { BLOCK_TYPES } from "@/components/blocks/blockTypes";

/**
 * Parse markdown-style text for PDF rendering
 * Supports: *gold*, ~red~, _blue_
 */
const parseMarkdownToHTML = (text) => {
    if (!text) return '';

    // Replace *gold* with gold span
    text = text.replace(/\*([^*]+)\*/g, '<span style="color:#CBA44A;font-weight:600;">$1</span>');

    // Replace ~red~ with red span
    text = text.replace(/~([^~]+)~/g, '<span style="color:#ef4444;font-weight:600;">$1</span>');

    // Replace _blue_ with blue span
    text = text.replace(/_([^_]+)_/g, '<span style="color:#3b82f6;font-weight:600;">$1</span>');

    return text;
};

/**
 * Renders blocks to HTML for PDF generation
 */
export const renderBlockToHTML = (block) => {
    if (!block || !block.type) return '';

    switch (block.type) {
        case BLOCK_TYPES.TEXT:
            return renderTextBlock(block);

        case BLOCK_TYPES.PARAGRAPH:
            return renderParagraphBlock(block);

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
        const pointText = typeof p === 'string' ? p : p.text || p;
        return pointText && pointText.trim().length > 0;
    });

    if (validPoints.length === 0) return '';

    return `
        <div class="points">
            ${validPoints.map(point => {
        const pointText = typeof point === 'string' ? point : point.text || point;
        const formattedText = parseMarkdownToHTML(pointText);
        return `<div class="point">${formattedText}</div>`;
    }).join('')}
        </div>
    `;
};

const renderParagraphBlock = (block) => {
    const { text } = block.data;

    if (!text || text.trim().length === 0) return '';

    const formattedText = parseMarkdownToHTML(text);

    return `
        <div class="paragraph">
            <p>${formattedText}</p>
        </div>
    `;
};

// Add more block renderers as we implement them
// const renderQuoteBlock = (block) => { ... };
// etc...

