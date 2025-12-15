/**
 * Test Dataset for Smart Slide Generation
 * Sample case descriptions for testing Gemini AI slide generation
 */

export const testCases = [
    {
        id: 1,
        title: "Short Constitutional Case",
        input: "Article 21 case about right to privacy. Supreme Court held that privacy is a fundamental right. Key judgment: K.S. Puttaswamy v. Union of India (2017).",
        expectedSlides: 2,
        complexity: "simple"
    },
    {
        id: 2,
        title: "Medium Criminal Case",
        input: "Section 377 IPC challenged on grounds of violating Article 14, 15, and 21. Petitioners argued that criminalizing consensual homosexual acts between adults is discriminatory and violates the right to privacy and dignity. The Supreme Court in Navtej Singh Johar v. Union of India (2018) decriminalized homosexuality, holding that Section 377 is unconstitutional to the extent it criminalizes consensual sexual acts between adults.",
        expectedSlides: 3,
        complexity: "medium"
    },
    {
        id: 3,
        title: "Complex Landmark Case",
        input: "Kesavananda Bharati v. State of Kerala (1973) is a landmark case that established the Basic Structure Doctrine. The case arose from a challenge to the Kerala government's land reform laws. The Supreme Court held that Parliament cannot amend the Constitution in a way that destroys its basic structure. Key aspects of the basic structure include: supremacy of the Constitution, rule of law, judicial review, separation of powers, federalism, secularism, and sovereignty. This doctrine has become the cornerstone of Indian constitutional law, protecting fundamental rights from arbitrary amendments. The 13-judge bench delivered a split verdict (7-6), with Justice H.R. Khanna writing a powerful dissent.",
        expectedSlides: 5,
        complexity: "complex"
    },
    {
        id: 4,
        title: "Evidence-Heavy Case",
        input: "Murder case under Section 302 IPC. Prosecution presented 15 witnesses including eyewitnesses, forensic evidence (blood samples, fingerprints), and CCTV footage. Defense argued alibi and questioned credibility of witnesses. Key evidence: 1) CCTV showed accused near crime scene at 11:45 PM, 2) Forensic report matched blood type with victim, 3) Two eyewitnesses identified accused. Court found accused guilty beyond reasonable doubt, sentenced to life imprisonment.",
        expectedSlides: 4,
        complexity: "medium"
    },
    {
        id: 5,
        title: "Timeline-Heavy Case",
        input: "Breach of contract case with clear timeline: Jan 2020 - Contract signed for delivery of goods, March 2020 - First payment made, June 2020 - Delivery due but not received, July 2020 - Legal notice sent, Sept 2020 - Suit filed, Dec 2020 - Interim order passed, March 2021 - Final judgment with damages awarded.",
        expectedSlides: 3,
        complexity: "medium"
    },
    {
        id: 6,
        title: "Comparative Arguments Case",
        input: "Custody battle between divorced parents. Mother's argument: Child's primary caregiver, stable home environment, better educational facilities in her city. Father's argument: Higher income, extended family support, child's preference to live with father. Court's consideration: Best interest of child, child's age (12 years), psychological report favoring joint custody.",
        expectedSlides: 3,
        complexity: "medium"
    },
    {
        id: 7,
        title: "Very Short Case",
        input: "Bail application under Section 437 CrPC granted due to lack of evidence.",
        expectedSlides: 1,
        complexity: "simple"
    },
    {
        id: 8,
        title: "Constitutional Rights Case",
        input: "Article 19(1)(a) freedom of speech case. Petitioner challenged Section 66A of IT Act for being vague and overbroad. Supreme Court in Shreya Singhal v. Union of India (2015) struck down Section 66A as unconstitutional. Court held that the section violated freedom of speech and expression by creating a chilling effect on online speech.",
        expectedSlides: 3,
        complexity: "medium"
    },
    {
        id: 9,
        title: "Property Dispute",
        input: "Title suit for declaration of ownership. Plaintiff claimed ancestral property rights through succession. Defendant counter-claimed adverse possession for 25 years. Key documents: Sale deed of 1985, Tax receipts from 1990-2015, Witness testimony of continuous possession. Court ruled in favor of defendant based on proven adverse possession.",
        expectedSlides: 3,
        complexity: "medium"
    },
    {
        id: 10,
        title: "Long Complex Case",
        input: "Vodafone International Holdings BV v. Union of India (2012) is a landmark tax case involving the acquisition of Hutchison's Indian telecom business by Vodafone. The key issue was whether Vodafone's offshore transaction (in Cayman Islands) was taxable in India. The transaction involved complex corporate structures with multiple holding companies. The Income Tax Department claimed that Vodafone should have withheld tax on capital gains. Supreme Court held that the transaction was not taxable in India as it was an offshore deal. The court emphasized the importance of looking at the substance of the transaction, not just the form. This case established important principles for international taxation, cross-border transactions, and corporate structuring. It also highlighted the need for clear tax laws to attract foreign investment. The judgment had significant implications for India's investment climate and led to retrospective tax amendments by Parliament, which were later withdrawn in 2021.",
        expectedSlides: 5,
        complexity: "complex"
    }
];

/**
 * Test expectations for validation
 */
export const validationCriteria = {
    minSlides: 1,
    maxSlides: 8,
    requiredFields: {
        slide: ['title', 'blocks'],
        block: ['type', 'data'],
    },
    validBlockTypes: ['text', 'quote', 'callout', 'timeline', 'evidence', 'twoColumn', 'sectionHeader', 'divider', 'image'],
    minBlocksPerSlide: 1,
    maxBlocksPerSlide: 5,
};

/**
 * Helper to validate generated slide structure
 */
export const validateSlideStructure = (generatedOutput) => {
    const errors = [];

    // Check if output exists
    if (!generatedOutput) {
        errors.push("No output generated");
        return { valid: false, errors };
    }

    // Check required top-level fields
    if (!generatedOutput.slides || !Array.isArray(generatedOutput.slides)) {
        errors.push("Missing or invalid 'slides' array");
    }

    if (!generatedOutput.title || typeof generatedOutput.title !== 'string') {
        errors.push("Missing or invalid 'title' field");
    }

    if (typeof generatedOutput.totalSlides !== 'number') {
        errors.push("Missing or invalid 'totalSlides' field");
    }

    // Validate slide count
    if (generatedOutput.slides) {
        const slideCount = generatedOutput.slides.length;
        if (slideCount < validationCriteria.minSlides || slideCount > validationCriteria.maxSlides) {
            errors.push(`Slide count ${slideCount} outside valid range (${validationCriteria.minSlides}-${validationCriteria.maxSlides})`);
        }

        // Validate each slide
        generatedOutput.slides.forEach((slide, index) => {
            // Check slide structure
            if (!slide.title) {
                errors.push(`Slide ${index + 1}: Missing 'title' field`);
            }

            if (!slide.blocks || !Array.isArray(slide.blocks)) {
                errors.push(`Slide ${index + 1}: Missing or invalid 'blocks' array`);
            } else {
                // Validate blocks count
                const blockCount = slide.blocks.length;
                if (blockCount < validationCriteria.minBlocksPerSlide || blockCount > validationCriteria.maxBlocksPerSlide) {
                    errors.push(`Slide ${index + 1}: Block count ${blockCount} outside valid range (${validationCriteria.minBlocksPerSlide}-${validationCriteria.maxBlocksPerSlide})`);
                }

                // Validate each block
                slide.blocks.forEach((block, blockIndex) => {
                    if (!block.type) {
                        errors.push(`Slide ${index + 1}, Block ${blockIndex + 1}: Missing 'type' field`);
                    } else if (!validationCriteria.validBlockTypes.includes(block.type)) {
                        errors.push(`Slide ${index + 1}, Block ${blockIndex + 1}: Invalid block type '${block.type}'`);
                    }

                    if (!block.data || typeof block.data !== 'object') {
                        errors.push(`Slide ${index + 1}, Block ${blockIndex + 1}: Missing or invalid 'data' field`);
                    }
                });
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        slideCount: generatedOutput.slides?.length || 0,
    };
};

export default {
    testCases,
    validationCriteria,
    validateSlideStructure,
};
