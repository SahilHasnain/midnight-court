// Block type definitions for Midnight Court presentation builder

export const BLOCK_TYPES = {
    TEXT: 'text',                    // Simple bullet points with highlight option
    PARAGRAPH: 'paragraph',          // Plain paragraph text
    QUOTE: 'quote',                  // Legal quote with citation
    CALLOUT: 'callout',              // Important point box with icon
    TWO_COLUMN: 'twoColumn',         // Arguments vs Counter layout
    TIMELINE: 'timeline',            // Case progression timeline
    EVIDENCE: 'evidence',            // Evidence card with details
    DIVIDER: 'divider',              // Visual separator
    SECTION_HEADER: 'sectionHeader', // Big title section break
    IMAGE: 'image',                  // Single image with caption
};

// Block metadata for UI display
export const BLOCK_METADATA = {
    [BLOCK_TYPES.TEXT]: {
        name: 'Text Points',
        icon: '📝',
        description: 'Bullet points with highlight option',
        category: 'basic'
    },
    [BLOCK_TYPES.PARAGRAPH]: {
        name: 'Paragraph',
        icon: '📄',
        description: 'Plain paragraph text',
        category: 'basic'
    },
    [BLOCK_TYPES.QUOTE]: {
        name: 'Legal Quote',
        icon: '📜',
        description: 'Quote with citation',
        category: 'emphasis'
    },
    [BLOCK_TYPES.CALLOUT]: {
        name: 'Important Point',
        icon: '⚠️',
        description: 'Highlighted callout box',
        category: 'emphasis'
    },
    [BLOCK_TYPES.TWO_COLUMN]: {
        name: 'Two Columns',
        icon: '⚔️',
        description: 'Arguments vs Counter',
        category: 'layout'
    },
    [BLOCK_TYPES.TIMELINE]: {
        name: 'Timeline',
        icon: '📅',
        description: 'Case progression',
        category: 'advanced'
    },
    [BLOCK_TYPES.EVIDENCE]: {
        name: 'Evidence Box',
        icon: '🗂️',
        description: 'Structured evidence card',
        category: 'advanced'
    },
    [BLOCK_TYPES.DIVIDER]: {
        name: 'Divider',
        icon: '─',
        description: 'Visual separator',
        category: 'basic'
    },
    [BLOCK_TYPES.SECTION_HEADER]: {
        name: 'Section Header',
        icon: '🌟',
        description: 'Big section title',
        category: 'basic'
    },
    [BLOCK_TYPES.IMAGE]: {
        name: 'Image',
        icon: '📷',
        description: 'Image with caption',
        category: 'layout'
    },
};

// Create default block data based on type
export const createDefaultBlock = (type) => {
    const blockId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (type) {
        case BLOCK_TYPES.TEXT:
            return {
                id: blockId,
                type: BLOCK_TYPES.TEXT,
                data: {
                    points: ['']
                }
            };

        case BLOCK_TYPES.PARAGRAPH:
            return {
                id: blockId,
                type: BLOCK_TYPES.PARAGRAPH,
                data: {
                    text: ''
                }
            };

        case BLOCK_TYPES.QUOTE:
            return {
                id: blockId,
                type: BLOCK_TYPES.QUOTE,
                data: {
                    quote: '',
                    citation: ''
                }
            };

        case BLOCK_TYPES.CALLOUT:
            return {
                id: blockId,
                type: BLOCK_TYPES.CALLOUT,
                data: {
                    title: '',
                    description: '',
                    variant: 'info' // 'info', 'warning', 'critical'
                }
            };

        case BLOCK_TYPES.TWO_COLUMN:
            return {
                id: blockId,
                type: BLOCK_TYPES.TWO_COLUMN,
                data: {
                    leftTitle: 'Arguments',
                    rightTitle: 'Counter Arguments',
                    leftPoints: [''],
                    rightPoints: ['']
                }
            };

        case BLOCK_TYPES.TIMELINE:
            return {
                id: blockId,
                type: BLOCK_TYPES.TIMELINE,
                data: {
                    events: [
                        { date: '', event: '' }
                    ]
                }
            };

        case BLOCK_TYPES.EVIDENCE:
            return {
                id: blockId,
                type: BLOCK_TYPES.EVIDENCE,
                data: {
                    evidenceName: '',
                    summary: '',
                    citation: '',
                    image: null
                }
            };

        case BLOCK_TYPES.DIVIDER:
            return {
                id: blockId,
                type: BLOCK_TYPES.DIVIDER,
                data: {
                    style: 'solid' // 'solid', 'dotted', 'gradient'
                }
            };

        case BLOCK_TYPES.SECTION_HEADER:
            return {
                id: blockId,
                type: BLOCK_TYPES.SECTION_HEADER,
                data: {
                    title: ''
                }
            };

        case BLOCK_TYPES.IMAGE:
            return {
                id: blockId,
                type: BLOCK_TYPES.IMAGE,
                data: {
                    uri: null,
                    caption: '',
                    layout: 'center', // 'center', 'floatLeft', 'floatRight'
                    size: 'medium' // 'small', 'medium', 'large'
                }
            };

        default:
            return createDefaultBlock(BLOCK_TYPES.TEXT);
    }
};
