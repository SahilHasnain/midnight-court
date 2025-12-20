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

        case BLOCK_TYPES.QUOTE:
            return renderQuoteBlock(block);

        case BLOCK_TYPES.CALLOUT:
            return renderCalloutBlock(block);

        case BLOCK_TYPES.TWO_COLUMN:
            return renderTwoColumnBlock(block);

        case BLOCK_TYPES.TIMELINE:
            return renderTimelineBlock(block);

        case BLOCK_TYPES.EVIDENCE:
            return renderEvidenceBlock(block);

        case BLOCK_TYPES.SECTION_HEADER:
            return renderSectionHeaderBlock(block);

        case BLOCK_TYPES.DIVIDER:
            return renderDividerBlock(block);

        case BLOCK_TYPES.IMAGE:
            return renderImageBlock(block);

        // Future block types will be added here

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
        return `<div class="point" style="color: #F5F5DC;">${formattedText}</div>`;
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
            <p style="color: #D1D5DB; font-size: 20px; line-height: 1.8; margin: 12px 0;">${formattedText}</p>
        </div>
    `;
};

const renderQuoteBlock = (block) => {
    const { quote, citation } = block.data;

    if (!quote || quote.trim().length === 0) return '';

    const citationHTML = citation
        ? `<div class="quote-citation" style="color: #9CA3AF;">— ${citation}</div>`
        : '';

    return `
        <div class="quote-block">
            <div class="quote-border"></div>
            <div class="quote-content">
                <span class="quote-symbol" style="color: #CBA44A;">"</span>
                <p class="quote-text" style="color: #F5F5DC;">${quote}</p>
                <span class="quote-symbol" style="color: #CBA44A;">"</span>
            </div>
            ${citationHTML}
        </div>
    `;
};

const renderCalloutBlock = (block) => {
    const { title, description, variant } = block.data;

    if (!title && !description) return '';

    // Get variant configuration
    const getVariantConfig = (variant) => {
        switch (variant) {
            case 'info':
                return { icon: 'ℹ️', borderColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)' };
            case 'warning':
                return { icon: '⚠️', borderColor: '#CBA44A', bgColor: 'rgba(203, 164, 74, 0.08)' };
            case 'critical':
                return { icon: '🚨', borderColor: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.08)' };
            default:
                return { icon: 'ℹ️', borderColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)' };
        }
    };

    const config = getVariantConfig(variant);

    return `
        <div class="callout-block" style="border-left: 4px solid ${config.borderColor}; background-color: ${config.bgColor}; padding: 16px; border-radius: 8px; margin: 12px 0; display: flex; align-items: flex-start;">
            <div style="font-size: 24px; margin-right: 12px;">${config.icon}</div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 8px 0; color: #F5F5DC; font-size: 15px; font-weight: 700;">${title}</h4>
                <p style="margin: 0; color: #9CA3AF; font-size: 14px; line-height: 1.5;">${description}</p>
            </div>
        </div>
    `;
};

const renderTwoColumnBlock = (block) => {
    const { leftTitle, rightTitle, leftPoints, rightPoints } = block.data;

    const validLeftPoints = leftPoints.filter(p => p && p.trim().length > 0);
    const validRightPoints = rightPoints.filter(p => p && p.trim().length > 0);

    if (validLeftPoints.length === 0 && validRightPoints.length === 0) return '';

    const leftHTML = `
        <div style="flex: 1; padding-right: 16px;">
            <h4 style="color: #CBA44A; font-size: 15px; font-weight: 700; margin: 0 0 12px 0;">${leftTitle || 'Arguments'}</h4>
            ${validLeftPoints.map(point => {
        const formattedText = parseMarkdownToHTML(point);
        return `<div style="margin-bottom: 8px; padding-left: 12px; border-left: 2px solid #CBA44A; color: #F5F5DC; font-size: 14px; line-height: 1.5;">${formattedText}</div>`;
    }).join('')}
        </div>
    `;

    const rightHTML = `
        <div style="flex: 1; padding-left: 16px; border-left: 2px solid #CBA44A;">
            <h4 style="color: #ef4444; font-size: 15px; font-weight: 700; margin: 0 0 12px 0;">${rightTitle || 'Counter Arguments'}</h4>
            ${validRightPoints.map(point => {
        const formattedText = parseMarkdownToHTML(point);
        return `<div style="margin-bottom: 8px; padding-left: 12px; border-left: 2px solid #ef4444; color: #F5F5DC; font-size: 14px; line-height: 1.5;">${formattedText}</div>`;
    }).join('')}
        </div>
    `;

    return `
        <div class="two-column-block" style="display: flex; gap: 16px; margin: 12px 0;">
            ${leftHTML}
            ${rightHTML}
        </div>
    `;
};

const renderTimelineBlock = (block) => {
    const { events } = block.data;

    const validEvents = events.filter(e => (e.date && e.date.trim()) || (e.event && e.event.trim()));

    if (validEvents.length === 0) return '';

    const eventsHTML = validEvents.map((event, index) => {
        const formattedEvent = parseMarkdownToHTML(event.event || '');
        const isLast = index === validEvents.length - 1;

        return `
            <div style="position: relative; display: flex; min-height: ${isLast ? '60px' : '80px'};">
                <!-- Timeline Dot -->
                <div style="width: 12px; height: 12px; border-radius: 6px; background-color: #CBA44A; margin-top: 4px; z-index: 2; border: 2px solid #1a1a1a; flex-shrink: 0;"></div>
                
                <!-- Connector Line -->
                ${!isLast ? '<div style="position: absolute; left: 5px; top: 16px; bottom: 0; width: 2px; background-color: rgba(203, 164, 74, 0.3); z-index: 1;"></div>' : ''}
                
                <!-- Event Content -->
                <div style="flex: 1; margin-left: 16px; padding-bottom: 16px;">
                    <div style="color: #CBA44A; font-size: 13px; font-weight: 700; margin-bottom: 6px;">${event.date || 'No date'}</div>
                    <div style="color: #F5F5DC; font-size: 14px; line-height: 1.5;">${formattedEvent || 'No event'}</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="timeline-block" style="padding-left: 8px; margin: 12px 0;">
            ${eventsHTML}
        </div>
    `;
};

const renderEvidenceBlock = (block) => {
    const { evidenceName, summary, citation } = block.data;

    if (!evidenceName && !summary) return '';

    const formattedSummary = parseMarkdownToHTML(summary || '');

    const citationHTML = citation
        ? `
            <div style="padding-top: 12px; border-top: 1px solid rgba(203, 164, 74, 0.3); margin-top: 12px; display: flex; gap: 6px; align-items: flex-start;">
                <span style="color: #CBA44A; font-size: 12px; font-weight: 600;">Source:</span>
                <span style="color: #9CA3AF; font-size: 12px; font-style: italic;">${citation}</span>
            </div>
        `
        : '';

    return `
        <div class="evidence-block" style="background-color: rgba(26, 26, 26, 0.5); border-radius: 10px; padding: 16px; border-left: 4px solid #CBA44A; margin: 12px 0;">
            <div style="color: #CBA44A; font-size: 16px; font-weight: 700; margin-bottom: 12px;">${evidenceName || 'Evidence'}</div>
            <div style="color: #F5F5DC; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">${formattedSummary || 'No summary'}</div>
            ${citationHTML}
        </div>
    `;
};

const renderSectionHeaderBlock = (block) => {
    const { title } = block.data;

    if (!title || title.trim().length === 0) return '';

    const formattedTitle = parseMarkdownToHTML(title);

    return `
        <div class="section-header-block" style="text-align: center; padding: 40px 20px; margin: 24px 0;">
            <h2 style="color: #CBA44A; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.4;">${formattedTitle}</h2>
        </div>
    `;
};

const renderDividerBlock = (block) => {
    const { style } = block.data;

    switch (style) {
        case 'solid':
            return `
                <div class="divider-solid" style="display: flex; align-items: center; gap: 16px; margin: 24px 0;">
                    <div style="flex: 1; height: 2px; background-color: #CBA44A;"></div>
                    <span style="font-size: 20px;">⚖️</span>
                    <div style="flex: 1; height: 2px; background-color: #CBA44A;"></div>
                </div>
            `;
        case 'dotted':
            return `
                <div class="divider-dotted" style="display: flex; justify-content: space-around; align-items: center; margin: 24px 0; padding: 12px 0;">
                    ${[...Array(15)].map(() => '<div style="width: 4px; height: 4px; border-radius: 2px; background-color: #CBA44A;"></div>').join('')}
                </div>
            `;
        case 'gradient':
            return `
                <div class="divider-gradient" style="margin: 24px 0;">
                    <div style="height: 2px; background-color: #CBA44A; opacity: 0.1; margin-bottom: 4px;"></div>
                    <div style="height: 2px; background-color: #CBA44A; opacity: 0.3; margin-bottom: 4px;"></div>
                    <div style="height: 2px; background-color: #CBA44A; opacity: 0.6; margin-bottom: 4px;"></div>
                    <div style="height: 2px; background-color: #CBA44A; opacity: 0.3; margin-bottom: 4px;"></div>
                    <div style="height: 2px; background-color: #CBA44A; opacity: 0.1;"></div>
                </div>
            `;
        default:
            return `<div style="height: 2px; background-color: #CBA44A; margin: 24px 0;"></div>`;
    }
};

const renderImageBlock = (block, nextBlock) => {
    const { uri, caption, layout, size } = block.data;

    if (!uri) return '';

    // Note: For side-by-side (floatLeft/floatRight), width is controlled in export/index.jsx
    const formattedCaption = caption ? parseMarkdownToHTML(caption) : '';

    const captionHTML = caption
        ? `<div style="text-align: center; color: #9CA3AF; font-size: 12px; font-style: italic; margin-top: 8px; line-height: 1.4;">${formattedCaption}</div>`
        : '';

    // Full width center layout
    if (layout === 'center') {
        const centerWidth = size === 'small' ? '60%' : size === 'medium' ? '80%' : '100%';
        return `
            <div class="image-block" style="margin: 20px 0; display: flex; flex-direction: column; align-items: center;">
                <img 
                    src="${uri}" 
                    style="width: ${centerWidth}; max-width: 800px; border-radius: 8px; border: 1px solid rgba(203, 164, 74, 0.3); height: auto;"
                    alt="${caption || 'Slide image'}"
                />
                ${captionHTML}
            </div>
        `;
    }

    // Side-by-side layouts (floatLeft/floatRight) - mark as grouped
    // Note: Width is controlled by export/index.jsx. Keep inner wrapper at 100% to avoid extra inner gaps.
    return `
        <div class="image-block-grouped" data-layout="${layout}" data-size="${size}" style="display: none;">
            <div style="width: 100%;">
                <img 
                    src="${uri}" 
                    style="width: 100%; border-radius: 8px; border: 1px solid rgba(203, 164, 74, 0.3); height: auto;"
                    alt="${caption || 'Slide image'}"
                />
                ${captionHTML}
            </div>
        </div>
    `;
};

// Add more block renderers as we implement them

