// Block type definitions for Midnight Court presentation builder

export const BLOCK_TYPES = {
    TEXT: 'text',                    // Simple bullet points (existing)
    HIGHLIGHT: 'highlight',          // Gold highlighted important text
    QUOTE: 'quote',                  // Legal quote with citation
    CALLOUT: 'callout',              // Important point box with icon
    TWO_COLUMN: 'twoColumn',         // Arguments vs Counter layout
    TIMELINE: 'timeline',            // Case progression timeline
    EVIDENCE: 'evidence',            // Evidence card with details
    DIVIDER: 'divider',              // Visual separator
    SECTION_HEADER: 'sectionHeader', // Big title section break
    IMAGE_GRID: 'imageGrid',         // 2x2 or 2x3 image grid
};

// Block metadata for UI display
export const BLOCK_METADATA = {
    [BLOCK_TYPES.TEXT]: {
        name: 'Text Points',
        icon: '📝',
        description: 'Simple bullet points',
        category: 'basic'
    },
    [BLOCK_TYPES.HIGHLIGHT]: {
        name: 'Highlight',
        icon: '✨',
        description: 'Gold highlighted text',
        category: 'emphasis'
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
    [BLOCK_TYPES.IMAGE_GRID]: {
        name: 'Image Grid',
        icon: '🖼️',
        description: '2x2 image layout',
        category: 'advanced'
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

        case BLOCK_TYPES.HIGHLIGHT:
            return {
                id: blockId,
                type: BLOCK_TYPES.HIGHLIGHT,
                data: {
                    text: '',
                    style: 'background' // or 'underline'
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

        case BLOCK_TYPES.IMAGE_GRID:
            return {
                id: blockId,
                type: BLOCK_TYPES.IMAGE_GRID,
                data: {
                    images: [
                        { uri: null, caption: '' },
                        { uri: null, caption: '' },
                        { uri: null, caption: '' },
                        { uri: null, caption: '' }
                    ],
                    layout: '2x2' // '2x2' or '2x3'
                }
            };

        default:
            return createDefaultBlock(BLOCK_TYPES.TEXT);
    }
};
