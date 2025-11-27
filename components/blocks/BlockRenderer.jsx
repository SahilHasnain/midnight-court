import TextBlock from "./TextBlock";
import { BLOCK_TYPES } from "./blockTypes";

/**
 * BlockRenderer - Renders the appropriate block component based on block type
 * This is the central component that handles all block rendering
 */
export default function BlockRenderer({ block, onUpdate, onDelete }) {
    if (!block || !block.type) {
        return null;
    }

    switch (block.type) {
        case BLOCK_TYPES.TEXT:
            return <TextBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // Future block types will be added here as we implement them
        // case BLOCK_TYPES.HIGHLIGHT:
        //     return <HighlightBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.QUOTE:
        //     return <QuoteBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.CALLOUT:
        //     return <CalloutBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.TWO_COLUMN:
        //     return <TwoColumnBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.TIMELINE:
        //     return <TimelineBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.EVIDENCE:
        //     return <EvidenceBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.DIVIDER:
        //     return <DividerBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.SECTION_HEADER:
        //     return <SectionHeaderBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        // case BLOCK_TYPES.IMAGE_GRID:
        //     return <ImageGridBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
        
        default:
            // Fallback to text block for unknown types
            return <TextBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;
    }
}
