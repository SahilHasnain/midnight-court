import { BLOCK_TYPES } from "@/components/blocks/blockTypes";

/**
 * DUMMY DATA FOR TESTING - Professional law-focused content
 * This file is ONLY used in development mode for quick testing
 * Zero impact on production builds
 */

export const getDummySlides = () => {
    return [
        // Slide 1: Case Overview
        {
            title: "Case Summary",
            subtitle: "Sharma vs. State of Maharashtra",
            image: null,
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
                            { date: "10 Jan 2024", event: "Petitioner *arrested* without warrant by state police" },
                            { date: "11 Jan 2024", event: "~No FIR filed~ within 24-hour mandatory period" },
                            { date: "13 Jan 2024", event: "Finally presented before magistrate after *72 hours*" },
                            { date: "15 Jan 2024", event: "Writ petition filed in High Court under _Article 226_" },
                            { date: "20 Jan 2024", event: "Court issues notice to State, orders immediate release" }
                        ]
                    }
                },
                {
                    id: `divider_${Date.now()}_1a`,
                    type: BLOCK_TYPES.DIVIDER,
                    data: {
                        style: "solid"
                    }
                },
                {
                    id: `paragraph_${Date.now()}_2`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "This landmark case involves *constitutional rights* under Article 21, where the petitioner challenged ~arbitrary detention~ by state authorities without due process."
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

        // Slide 2: Legal Arguments
        {
            title: "Arguments Presented",
            subtitle: "Petitioner vs State - Side by Side",
            image: null,
            blocks: [
                {
                    id: `section_${Date.now()}_2a`,
                    type: BLOCK_TYPES.SECTION_HEADER,
                    data: {
                        title: "Legal Contentions"
                    }
                },
                {
                    id: `divider_${Date.now()}_2b`,
                    type: BLOCK_TYPES.DIVIDER,
                    data: {
                        style: "dotted"
                    }
                },
                {
                    id: `callout_${Date.now()}_4`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "Key Legal Issue",
                        description: "Whether detention without magistrate presentation within 24 hours violates constitutional guarantees under Article 21.",
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
                            "*No formal FIR* filed within mandatory 24-hour period",
                            "Magistrate presentation delayed by ~48 hours~ beyond legal limit",
                            "Evidence of _prima facie_ violation of CRPC Section 57",
                            "Comparable to *D.K. Basu guidelines* non-compliance"
                        ],
                        rightPoints: [
                            "National security concerns under *UAPA provisions* justified delay",
                            "Risk of evidence tampering if released prematurely",
                            "_Public order_ maintenance required extended custody",
                            "~However~, failed to produce documentary evidence"
                        ]
                    }
                },
                {
                    id: `quote_${Date.now()}_6`,
                    type: BLOCK_TYPES.QUOTE,
                    data: {
                        quote: "The State must not only act fairly but must be seen to act fairly. Procedural fairness is the soul of natural justice.",
                        citation: "Supreme Court in Mohinder Singh Gill vs Chief Election Commissioner (1978)"
                    }
                }
            ]
        },

        // Slide 3: Counter Arguments
        {
            title: "State's Response",
            subtitle: "Counter-Arguments & Justification",
            image: null,
            blocks: [
                {
                    id: `callout_${Date.now()}_8`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "State's Defense Position",
                        description: "Claimed exceptional circumstances under preventive detention framework, citing national security concerns.",
                        variant: "info"
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
                    id: `evidence_${Date.now()}_9`,
                    type: BLOCK_TYPES.EVIDENCE,
                    data: {
                        evidenceName: "Exhibit A - Police Report",
                        summary: "Initial detention order citing *suspected involvement* in unlawful activities. Report claims ~urgent need~ for custody to prevent evidence tampering and ensure _public safety_.",
                        citation: "Police Station Diary Entry No. 42/2024, dated 10 January 2024, Page 3-4"
                    }
                },
                {
                    id: `paragraph_${Date.now()}_10`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "The State contended that ~exceptional circumstances~ warranted extended detention under _preventive detention laws_."
                    }
                },
                {
                    id: `text_${Date.now()}_11`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "National security concerns under *UAPA provisions*",
                            "Risk of evidence tampering if released prematurely",
                            "_Public order_ maintenance justified extended custody",
                            "~However~, failed to produce documentary evidence"
                        ]
                    }
                },
                {
                    id: `quote_${Date.now()}_11`,
                    type: BLOCK_TYPES.QUOTE,
                    data: {
                        quote: "While national security is paramount, it cannot be used as a blanket justification to override fundamental rights without proper documentation.",
                        citation: "Delhi High Court in Previous Precedent (2019)"
                    }
                }
            ]
        },

        // Slide 4: Court's Verdict
        {
            title: "Judgement & Relief",
            subtitle: "Final Decision by Honorable Court",
            image: null,
            blocks: [
                {
                    id: `section_${Date.now()}_4a`,
                    type: BLOCK_TYPES.SECTION_HEADER,
                    data: {
                        title: "Final Order"
                    }
                },
                {
                    id: `divider_${Date.now()}_4b`,
                    type: BLOCK_TYPES.DIVIDER,
                    data: {
                        style: "solid"
                    }
                },
                {
                    id: `callout_${Date.now()}_12`,
                    type: BLOCK_TYPES.CALLOUT,
                    data: {
                        title: "Critical Violation Found",
                        description: "Court found flagrant violation of Article 21 and CRPC Section 57. Procedural safeguards completely ignored.",
                        variant: "critical"
                    }
                },
                {
                    id: `paragraph_${Date.now()}_13`,
                    type: BLOCK_TYPES.PARAGRAPH,
                    data: {
                        text: "The court ruled *in favor* of the petitioner, citing clear violations of constitutional safeguards and procedural requirements."
                    }
                },
                {
                    id: `text_${Date.now()}_14`,
                    type: BLOCK_TYPES.TEXT,
                    data: {
                        points: [
                            "*Immediate release* ordered with compensation",
                            "₹5 lakhs awarded for _unlawful detention_",
                            "~Departmental inquiry~ mandated against responsible officers",
                            "New guidelines issued for future arrests"
                        ]
                    }
                },
                {
                    id: `quote_${Date.now()}_15`,
                    type: BLOCK_TYPES.QUOTE,
                    data: {
                        quote: "Liberty is the most precious of all rights. When the State acts arbitrarily, courts must intervene decisively to protect individual freedoms.",
                        citation: "Hon'ble Justice Sharma, High Court of Maharashtra (2024)"
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
