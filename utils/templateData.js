import { BLOCK_TYPES } from "@/components/blocks/blockTypes";

/**
 * Template Data - Pre-configured slide structures for different legal presentation types
 * Each template includes pre-filled content blocks with legal boilerplate
 */

// Quick Templates (1-2 slides for specific purposes)
export const QUICK_TEMPLATES = {
    title: {
        name: "Blank Slide",
        icon: "⚖️",
        description: "Start with authority and presence",
        slides: [
            {
                title: "Case Title",
                subtitle: "Your legal presentation begins here",
                blocks: []
            }
        ]
    },

    case: {
        name: "Case Summary",
        icon: "📋",
        description: "Facts, issues, and parties involved",
        slides: [
            {
                title: "Case Summary",
                subtitle: "*Petitioner* vs ~Respondent~",
                blocks: [
                    {
                        id: Date.now().toString() + '1',
                        type: BLOCK_TYPES.SECTION_HEADER,
                        data: { title: "Case Overview" }
                    },
                    {
                        id: Date.now().toString() + '2',
                        type: BLOCK_TYPES.TIMELINE,
                        data: {
                            events: [
                                { date: "DD/MM/YYYY", event: "Case filed in *Lower Court*" },
                                { date: "DD/MM/YYYY", event: "First hearing - preliminary objections raised" },
                                { date: "DD/MM/YYYY", event: "Matter escalated to ~High Court~" }
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '3',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Key Issue:* State the primary legal question",
                                "~Parties:~ Petitioner(s) and Respondent(s)",
                                "_Jurisdiction:_ Court and legal provisions involved"
                            ]
                        }
                    }
                ]
            }
        ]
    },

    arguments: {
        name: "Arguments vs Counter",
        icon: "⚔️",
        description: "Present both sides with clarity",
        slides: [
            {
                title: "Legal Arguments",
                subtitle: "Analysis of opposing positions",
                blocks: [
                    {
                        id: Date.now().toString() + '1',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "warning",
                            title: "Core Legal Question",
                            description: "State the central dispute requiring court's determination"
                        }
                    },
                    {
                        id: Date.now().toString() + '2',
                        type: BLOCK_TYPES.TWO_COLUMN,
                        data: {
                            leftTitle: "Petitioner's Arguments",
                            rightTitle: "Respondent's Counter",
                            leftPoints: [
                                "Violation of *Article 21* - Right to Life",
                                "Procedural _irregularities_ in arrest",
                                "Failure to follow ~mandatory guidelines~"
                            ],
                            rightPoints: [
                                "*National security* concerns justified action",
                                "Evidence tampering risk required custody",
                                "~Followed established procedures~"
                            ]
                        }
                    }
                ]
            }
        ]
    },

    precedent: {
        name: "Legal Precedent",
        icon: "📚",
        description: "Cite landmark cases and rulings",
        slides: [
            {
                title: "Legal Precedents",
                subtitle: "Relevant case law and citations",
                blocks: [
                    {
                        id: Date.now().toString() + '1',
                        type: BLOCK_TYPES.EVIDENCE,
                        data: {
                            evidenceName: "Landmark Case Name vs State",
                            summary: "Brief summary of the ruling and its relevance to current matter. Include *ratio decidendi* and _obiter dicta_ if applicable.",
                            citation: "(YYYY) Volume SCR Page | AIR Citation"
                        }
                    },
                    {
                        id: Date.now().toString() + '2',
                        type: BLOCK_TYPES.QUOTE,
                        data: {
                            quote: "Insert relevant legal principle or quote from judgement that supports your position.",
                            citation: "Justice Name, Court (Year)"
                        }
                    },
                    {
                        id: Date.now().toString() + '3',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Precedent establishes* the legal principle",
                                "~Applicable to current facts~ based on similarity",
                                "_Distinguishing factors_ if any variations exist"
                            ]
                        }
                    }
                ]
            }
        ]
    },

    verdict: {
        name: "Verdict & Conclusion",
        icon: "🏛️",
        description: "Final stand and key takeaways",
        slides: [
            {
                title: "Court's Decision",
                subtitle: "*Final Verdict* and implications",
                blocks: [
                    {
                        id: Date.now().toString() + '1',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "critical",
                            title: "Verdict Summary",
                            description: "Court's final decision on the matter with brief reasoning"
                        }
                    },
                    {
                        id: Date.now().toString() + '2',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Relief granted:* Specific orders passed by court",
                                "~Compensation awarded:~ If any monetary relief",
                                "_Directions issued:_ Mandatory compliance requirements",
                                "*Appeals filed:* Current status of the matter"
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '3',
                        type: BLOCK_TYPES.DIVIDER,
                        data: { style: "gradient" }
                    },
                    {
                        id: Date.now().toString() + '4',
                        type: BLOCK_TYPES.SECTION_HEADER,
                        data: { title: "Key Takeaways" }
                    },
                    {
                        id: Date.now().toString() + '5',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "Legal principle established by this case",
                                "Impact on similar matters going forward",
                                "Broader implications for jurisprudence"
                            ]
                        }
                    }
                ]
            }
        ]
    }
};

// Full Templates (5-7 slides for complete presentations)
export const FULL_TEMPLATES = {
    complete_case: {
        name: "Complete Case Presentation",
        icon: "📑",
        description: "Full 7-slide case analysis from facts to verdict",
        slides: [
            // Slide 1: Title & Introduction
            {
                title: "Case Name",
                subtitle: "*Petitioner* vs ~Respondent~ | Court Name (Year)",
                blocks: [
                    {
                        id: Date.now().toString() + '_intro_1',
                        type: BLOCK_TYPES.PARAGRAPH,
                        data: {
                            text: "Brief introduction to the case nature and legal significance. This case addresses *fundamental questions* of law that have ~far-reaching implications~."
                        }
                    },
                    {
                        id: Date.now().toString() + '_intro_2',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Court:* High Court / Supreme Court",
                                "~Bench:~ Single Judge / Division Bench / Constitutional Bench",
                                "_Date of Filing:_ DD/MM/YYYY"
                            ]
                        }
                    }
                ]
            },
            // Slide 2: Facts & Timeline
            {
                title: "Facts & Chronology",
                subtitle: "Sequence of events leading to litigation",
                blocks: [
                    {
                        id: Date.now().toString() + '_facts_1',
                        type: BLOCK_TYPES.TIMELINE,
                        data: {
                            events: [
                                { date: "DD/MM/YYYY", event: "*Incident occurred* - describe the triggering event" },
                                { date: "DD/MM/YYYY", event: "First legal notice issued to ~respondent~" },
                                { date: "DD/MM/YYYY", event: "_Lower court proceedings_ initiated" },
                                { date: "DD/MM/YYYY", event: "Matter *escalated* to higher court" }
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '_facts_2',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "info",
                            title: "Material Facts",
                            description: "Key facts that are undisputed and form the basis of legal arguments"
                        }
                    }
                ]
            },
            // Slide 3: Legal Issues
            {
                title: "Legal Issues Raised",
                subtitle: "Questions for judicial determination",
                blocks: [
                    {
                        id: Date.now().toString() + '_issues_1',
                        type: BLOCK_TYPES.SECTION_HEADER,
                        data: { title: "Core Legal Questions" }
                    },
                    {
                        id: Date.now().toString() + '_issues_2',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Issue 1:* Whether the action violated fundamental rights under Constitution?",
                                "~Issue 2:~ Was the procedure followed in accordance with established law?",
                                "_Issue 3:_ Are the constitutional provisions attracted in this case?",
                                "*Issue 4:* What relief, if any, is the petitioner entitled to?"
                            ]
                        }
                    }
                ]
            },
            // Slide 4: Arguments (Both Sides)
            {
                title: "Arguments Presented",
                subtitle: "Competing legal positions",
                blocks: [
                    {
                        id: Date.now().toString() + '_args_1',
                        type: BLOCK_TYPES.TWO_COLUMN,
                        data: {
                            leftTitle: "Petitioner's Contentions",
                            rightTitle: "Respondent's Reply",
                            leftPoints: [
                                "*Constitutional violation* under Article __",
                                "Established precedents support our position",
                                "~Procedural safeguards~ were not followed",
                                "_Public interest_ requires intervention"
                            ],
                            rightPoints: [
                                "Action within *legal framework* and authority",
                                "~Distinguished from cited precedents~",
                                "Mandatory procedures were duly followed",
                                "_Public order_ considerations justified action"
                            ]
                        }
                    }
                ]
            },
            // Slide 5: Precedents & Legal Framework
            {
                title: "Legal Precedents",
                subtitle: "Relevant case law and statutory provisions",
                blocks: [
                    {
                        id: Date.now().toString() + '_prec_1',
                        type: BLOCK_TYPES.EVIDENCE,
                        data: {
                            evidenceName: "Landmark Case 1 vs State (Year)",
                            summary: "Established the principle that *fundamental rights cannot be arbitrarily suspended*. Held that procedural fairness is integral to _Article 21_.",
                            citation: "(YYYY) Vol SCR Page | AIR Citation"
                        }
                    },
                    {
                        id: Date.now().toString() + '_prec_2',
                        type: BLOCK_TYPES.QUOTE,
                        data: {
                            quote: "The procedure established by law must be right, just and fair, not arbitrary, fanciful or oppressive.",
                            citation: "Maneka Gandhi vs Union of India, Supreme Court (1978)"
                        }
                    },
                    {
                        id: Date.now().toString() + '_prec_3',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Statutory Framework:* Constitution Articles, CrPC Sections, Special Acts",
                                "~International Conventions~ if applicable (ICCPR, UDHR)",
                                "_Administrative Guidelines_ (D.K. Basu, Arnesh Kumar)"
                            ]
                        }
                    }
                ]
            },
            // Slide 6: Court's Analysis & Verdict
            {
                title: "Judicial Analysis",
                subtitle: "Court's reasoning and decision",
                blocks: [
                    {
                        id: Date.now().toString() + '_verdict_1',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "critical",
                            title: "Court's Findings",
                            description: "Summary of court's factual and legal findings on disputed issues"
                        }
                    },
                    {
                        id: Date.now().toString() + '_verdict_2',
                        type: BLOCK_TYPES.PARAGRAPH,
                        data: {
                            text: "The court examined the *constitutional validity* of the action and found that there was a clear ~violation of procedural safeguards~. The respondent failed to demonstrate _justification_ for the departure from established guidelines."
                        }
                    },
                    {
                        id: Date.now().toString() + '_verdict_3',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Held:* Court's determination on each issue",
                                "~Relief Granted:~ Specific orders and directions",
                                "_Compensation:_ Monetary relief if awarded",
                                "*Costs:* Litigation costs imposed"
                            ]
                        }
                    }
                ]
            },
            // Slide 7: Impact & Conclusion
            {
                title: "Impact & Significance",
                subtitle: "Broader implications and key takeaways",
                blocks: [
                    {
                        id: Date.now().toString() + '_impact_1',
                        type: BLOCK_TYPES.SECTION_HEADER,
                        data: { title: "Legal Significance" }
                    },
                    {
                        id: Date.now().toString() + '_impact_2',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Precedent Value:* This judgement will guide future cases",
                                "~Procedural Reforms:~ Mandated changes in administrative practice",
                                "_Rights Protection:_ Strengthened safeguards for citizens",
                                "*Policy Impact:* Implications for government agencies"
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '_impact_3',
                        type: BLOCK_TYPES.DIVIDER,
                        data: { style: "gradient" }
                    },
                    {
                        id: Date.now().toString() + '_impact_4',
                        type: BLOCK_TYPES.QUOTE,
                        data: {
                            quote: "Justice delayed is justice denied, but justice hurried is justice buried.",
                            citation: "Legal Maxim"
                        }
                    }
                ]
            }
        ]
    },

    habeas_corpus: {
        name: "Habeas Corpus Petition",
        icon: "🔓",
        description: "5-slide presentation for unlawful detention cases",
        slides: [
            // Slide 1: Petition Details
            {
                title: "Habeas Corpus Petition",
                subtitle: "Challenging *unlawful detention*",
                blocks: [
                    {
                        id: Date.now().toString() + '_hc_1',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "critical",
                            title: "Writ of Habeas Corpus",
                            description: "Fundamental right to personal liberty under Article 21 and 32/226 of Constitution"
                        }
                    },
                    {
                        id: Date.now().toString() + '_hc_2',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Detenu:* Name of person detained",
                                "~Date of Detention:~ DD/MM/YYYY",
                                "_Place of Detention:_ Police Station/Jail Name",
                                "*Legal Basis:_ Provisions under which detained"
                            ]
                        }
                    }
                ]
            },
            // Slide 2: Grounds for Detention
            {
                title: "Detention Timeline",
                subtitle: "Sequence of events",
                blocks: [
                    {
                        id: Date.now().toString() + '_hc_timeline',
                        type: BLOCK_TYPES.TIMELINE,
                        data: {
                            events: [
                                { date: "DD/MM/YYYY", event: "*Arrest made* without warrant" },
                                { date: "DD/MM/YYYY + 1", event: "~No FIR filed~ within 24 hours" },
                                { date: "DD/MM/YYYY + 2", event: "_Magistrate presentation_ delayed beyond legal limit" },
                                { date: "DD/MM/YYYY + 3", event: "*Petition filed* in High Court" }
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '_hc_violations',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "~Violation:~ CrPC Section 57 - 24-hour magistrate rule",
                                "*Violation:* Article 22(2) - Failure to inform grounds",
                                "_Violation:_ D.K. Basu Guidelines not followed"
                            ]
                        }
                    }
                ]
            },
            // Slide 3: Legal Arguments
            {
                title: "Legal Arguments",
                subtitle: "Grounds for immediate release",
                blocks: [
                    {
                        id: Date.now().toString() + '_hc_args',
                        type: BLOCK_TYPES.TWO_COLUMN,
                        data: {
                            leftTitle: "Petitioner's Grounds",
                            rightTitle: "State's Response",
                            leftPoints: [
                                "*Illegal detention* beyond 24 hours",
                                "~No valid grounds~ communicated",
                                "_Procedural violations_ under CrPC",
                                "*Constitutional breach* of Article 21/22"
                            ],
                            rightPoints: [
                                "Investigation complexity required time",
                                "~Security concerns~ justified custody",
                                "_Evidence tampering_ risk existed",
                                "*Following standard procedure*"
                            ]
                        }
                    }
                ]
            },
            // Slide 4: Precedents
            {
                title: "Relevant Precedents",
                subtitle: "Constitutional protection against detention",
                blocks: [
                    {
                        id: Date.now().toString() + '_hc_prec1',
                        type: BLOCK_TYPES.EVIDENCE,
                        data: {
                            evidenceName: "D.K. Basu vs State of West Bengal (1997)",
                            summary: "*Landmark judgement* establishing mandatory safeguards for arrest and detention. Requires arrest memo, magistrate presentation within 24 hours, and informing family members.",
                            citation: "(1997) 1 SCC 416"
                        }
                    },
                    {
                        id: Date.now().toString() + '_hc_prec2',
                        type: BLOCK_TYPES.QUOTE,
                        data: {
                            quote: "Personal liberty is a precious right. When the State acts arbitrarily, the courts must protect the citizen.",
                            citation: "Supreme Court of India"
                        }
                    }
                ]
            },
            // Slide 5: Prayer & Relief
            {
                title: "Relief Sought",
                subtitle: "Court's decision and directions",
                blocks: [
                    {
                        id: Date.now().toString() + '_hc_relief',
                        type: BLOCK_TYPES.CALLOUT,
                        data: {
                            variant: "warning",
                            title: "Prayer for Relief",
                            description: "Immediate release of detenu and compensation for illegal detention"
                        }
                    },
                    {
                        id: Date.now().toString() + '_hc_orders',
                        type: BLOCK_TYPES.TEXT,
                        data: {
                            points: [
                                "*Immediate Release* ordered by the court",
                                "~Compensation:~ ₹X lakhs for unlawful detention",
                                "_Inquiry Directed:_ Investigation into police conduct",
                                "*Compliance Timeline:* Implementation within 24/48 hours"
                            ]
                        }
                    },
                    {
                        id: Date.now().toString() + '_hc_divider',
                        type: BLOCK_TYPES.DIVIDER,
                        data: { style: "solid" }
                    },
                    {
                        id: Date.now().toString() + '_hc_takeaway',
                        type: BLOCK_TYPES.SECTION_HEADER,
                        data: { title: "Key Takeaway" }
                    },
                    {
                        id: Date.now().toString() + '_hc_conclusion',
                        type: BLOCK_TYPES.PARAGRAPH,
                        data: {
                            text: "Liberty is the *most fundamental* right. Courts remain vigilant guardians against ~arbitrary state action~."
                        }
                    }
                ]
            }
        ]
    }
};

/**
 * Get template by ID (checks both quick and full templates)
 */
export const getTemplateById = (templateId, templateType = 'quick') => {
    if (templateType === 'full') {
        return FULL_TEMPLATES[templateId] || null;
    }
    return QUICK_TEMPLATES[templateId] || null;
};

/**
 * Get all available templates (both quick and full)
 */
export const getAllTemplates = () => {
    return {
        quick: Object.keys(QUICK_TEMPLATES).map(key => ({
            id: key,
            type: 'quick',
            ...QUICK_TEMPLATES[key]
        })),
        full: Object.keys(FULL_TEMPLATES).map(key => ({
            id: key,
            type: 'full',
            ...FULL_TEMPLATES[key]
        }))
    };
};
