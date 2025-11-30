import { BLOCK_TYPES } from "@/components/blocks/blockTypes";

/**
 * DUMMY DATA FOR TESTING - Professional law-focused content
 * This file is ONLY used in development mode for quick testing
 * Zero impact on production builds
 */

export const getDummySlides = () => {
    return [
        // Slide 1: Case Overview (Minimal - Title focus)
        {
            title: "Case Summary",
            subtitle: "Sharma vs. State of Maharashtra",
            blocks: [
                {
                    id: `section_${Date.now()}_0`,
                    type: BLOCK_TYPES.SECTION_HEADER,
                    data: {
                        title: "Case Chronology"
                    }
                },
                {
                    id: `timeline_${Date.now()}_1`,
                    type: BLOCK_TYPES.TIMELINE,
                    data: {
                        events: [
                            { date: "10 Jan 2024", event: "Petitioner *arrested* without warrant" },
                            { date: "11 Jan 2024", event: "~No FIR filed~ within 24 hours" },
                            { date: "15 Jan 2024", event: "Writ petition filed under _Article 226_" }
                        ]
                    }
                },
                {
                    id: `quote_${Date.now()}_3`,
                    type: BLOCK_TYPES.QUOTE,
                    data: {
                        quote: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
                        citation: "Article 21, Constitution of India"
                    }
                }
            ]
        },

        // Slide 2: Two Column Layout Test
        {
            title: "Arguments Presented",
            subtitle: "Petitioner vs State",
            blocks: [
                {
                    id: `callout_${Date.now()}_4`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "Key Legal Issue",
                        description: "Whether detention without magistrate presentation within 24 hours violates constitutional guarantees.",
                        variant: "warning"
                    }
                },
                {
                    id: `twocolumn_${Date.now()}_5`,
                    type: BLOCK_TYPES.TWO_COLUMN,
                    data: {
                        leftTitle: "Petitioner's Arguments",
                        rightTitle: "State's Counter",
                        leftPoints: [
                            "*No formal FIR* filed within 24 hours",
                            "Magistrate presentation delayed by ~48 hours~",
                            "Violation of _CRPC Section 57_"
                        ],
                        rightPoints: [
                            "National security concerns justified delay",
                            "Risk of evidence tampering",
                            "~Failed to produce~ documentary proof"
                        ]
                    }
                }
            ]
        },

        // Slide 3: Evidence & Callout Test
        {
            title: "State's Response",
            subtitle: "Counter-Arguments",
            blocks: [
                {
                    id: `evidence_${Date.now()}_9`,
                    type: BLOCK_TYPES.EVIDENCE,
                    data: {
                        evidenceName: "Exhibit A - Police Report",
                        summary: "Initial detention order citing *suspected involvement* in unlawful activities. Claims ~urgent need~ for custody to prevent tampering.",
                        citation: "Police Station Diary Entry No. 42/2024"
                    }
                },
                {
                    id: `divider_${Date.now()}_3a`,
                    type: BLOCK_TYPES.DIVIDER,
                    data: {
                        style: "gradient"
                    }
                },
                {
                    id: `text_${Date.now()}_11`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "National security under *UAPA provisions*",
                            "_Public order_ maintenance required",
                            "~However~, no documentary evidence produced"
                        ]
                    }
                }
            ]
        },

        // Slide 4: Judgment with Multiple Block Types
        {
            title: "Court's Verdict",
            subtitle: "Final Decision",
            blocks: [
                {
                    id: `callout_${Date.now()}_12`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "Critical Violation Found",
                        description: "Court found flagrant violation of Article 21 and CRPC Section 57.",
                        variant: "critical"
                    }
                },
                {
                    id: `text_${Date.now()}_14`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "*Immediate release* ordered with compensation",
                            "₹5 lakhs awarded for _unlawful detention_",
                            "~Inquiry~ mandated against officers"
                        ]
                    }
                },
                {
                    id: `quote_${Date.now()}_15`,
                    type: BLOCK_TYPES.QUOTE,
                    data: {
                        quote: "Liberty is the most precious of all rights. When the State acts arbitrarily, courts must intervene decisively.",
                        citation: "Hon'ble Justice Sharma, High Court (2024)"
                    }
                }
            ]
        },

        // Slide 5: Center Image Layout Test
        {
            title: "Documentary Evidence",
            subtitle: "Visual Exhibits",
            blocks: [
                {
                    id: `paragraph_${Date.now()}_5b`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "The following evidence was submitted, demonstrating clear violations of *procedural safeguards*."
                    }
                },
                {
                    id: `image_${Date.now()}_5c`,
                    type: BLOCK_TYPES.IMAGE,
                    data: {
                        uri: null,
                        caption: "*Detention Order* - Unsigned document",
                        layout: "center",
                        size: "medium"
                    }
                },
                {
                    id: `evidence_${Date.now()}_5d`,
                    type: BLOCK_TYPES.EVIDENCE,
                    data: {
                        evidenceName: "Exhibit B - Station Diary",
                        summary: "Records showing *delayed FIR* and ~missing timestamps~.",
                        citation: "Police Records, Jan 2024"
                    }
                }
            ]
        },

        // Slide 6: Float Left Image Test
        {
            title: "Legal Precedents",
            subtitle: "D.K. Basu Guidelines",
            blocks: [
                {
                    id: `image_${Date.now()}_6b`,
                    type: BLOCK_TYPES.IMAGE,
                    data: {
                        uri: null,
                        caption: "*D.K. Basu vs West Bengal* (1997)",
                        layout: "floatLeft",
                        size: "small"
                    }
                },
                {
                    id: `paragraph_${Date.now()}_6b1`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "The landmark *D.K. Basu* judgment established comprehensive guidelines for arrests. The court mandated strict timelines to prevent _custodial abuse_ and protect Article 21 rights."
                    }
                },
                {
                    id: `divider_${Date.now()}_6d`,
                    type: BLOCK_TYPES.DIVIDER,
                    data: {
                        style: "dotted"
                    }
                },
                {
                    id: `text_${Date.now()}_6e`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "*Arrest memo* required immediately",
                            "Family informed within _24 hours_",
                            "Magistrate presentation *mandatory*"
                        ]
                    }
                }
            ]
        },

        // Slide 7: Float Right Image Test
        {
            title: "Impact & Recommendations",
            subtitle: "Systemic Changes",
            blocks: [
                {
                    id: `image_${Date.now()}_7b`,
                    type: BLOCK_TYPES.IMAGE,
                    data: {
                        uri: null,
                        caption: "*Detention violations* across Maharashtra",
                        layout: "floatRight",
                        size: "small"
                    }
                },
                {
                    id: `paragraph_${Date.now()}_7c`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "This case highlights *systemic issues* in detention procedures. The data reveals ~procedural violations~ in multiple stations, setting precedent for _stricter enforcement_."
                    }
                },
                {
                    id: `callout_${Date.now()}_7e`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "Court's Direction",
                        description: "Implement automated tracking system within 6 months.",
                        variant: "info"
                    }
                }
            ]
        },

        // Slide 8: Float Left Image with Bullet Points
        {
            title: "Key Findings",
            subtitle: "Evidence-Based Analysis",
            blocks: [
                {
                    id: `image_${Date.now()}_8a`,
                    type: BLOCK_TYPES.IMAGE,
                    data: {
                        uri: null,
                        caption: "Documentary evidence from *police records*",
                        layout: "floatLeft",
                        size: "medium"
                    }
                },
                {
                    id: `text_${Date.now()}_8b`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "*72-hour delay* in magistrate presentation",
                            "~No written FIR~ on record",
                            "Missing signatures on _detention order_",
                            "Family not informed for *48 hours*",
                            "Medical examination delayed beyond legal limits"
                        ]
                    }
                }
            ]
        },

        // Slide 9: Float Right Image with Bullet Points (Vice Versa)
        {
            title: "Constitutional Violations",
            subtitle: "Rights Infringement Summary",
            blocks: [
                {
                    id: `image_${Date.now()}_9a`,
                    type: BLOCK_TYPES.IMAGE,
                    data: {
                        uri: null,
                        caption: "*Article 21* - Right to Life and Personal Liberty",
                        layout: "floatRight",
                        size: "medium"
                    }
                },
                {
                    id: `text_${Date.now()}_9b`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "Violation of *Article 21* - Personal Liberty",
                            "Non-compliance with ~CRPC Section 57~",
                            "Breach of _D.K. Basu guidelines_",
                            "Denial of *legal representation* rights",
                            "Arbitrary detention without due process"
                        ]
                    }
                }
            ]
        }
    ];
};

/**
 * Get dummy data for a specific template type
 */
export const getDummyDataForTemplate = (template) => {
    const slides = getDummySlides();

    // Return first slide for quick testing, or all slides for full test
    return slides;
};
