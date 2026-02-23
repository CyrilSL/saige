export type MessageRole = "user" | "assistant";

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messages: Message[];
}

const S = (data: object) => `##SAIGE_STRUCTURED##${JSON.stringify(data)}`;

export const SAMPLE_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        title: "Handling insurance verification",
        lastMessage: "What's the best workflow for verifying dental benefits before an appointment?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        messages: [
            {
                id: "m1",
                role: "user",
                content: "What's the best workflow for verifying dental benefits before an appointment?",
                timestamp: new Date(Date.now() - 1000 * 60 * 10),
            },
            {
                id: "m2",
                role: "assistant",
                content: S({
                    sayThis: "I'm pulling up your benefits now. Based on what I can verify today, your estimated portion will be around $[X] — and I'll send you a written summary before you come in so there are no surprises.",
                    doThis: [
                        "Verify at least 48–72 hours before the appointment — not the day of",
                        "Check: plan type (PPO/HMO/Indemnity), annual max, remaining balance, deductible status",
                        "Confirm frequency limitations: cleanings, X-rays, crowns, perio",
                        "Check for missing tooth clause if restorative treatment is planned",
                        "Check for any waiting periods — especially for new patients",
                        "Document rep name, reference number, date/time of verification call",
                        "Send patient a pre-visit benefit summary with estimated out-of-pocket",
                    ],
                    escalateIf: [
                        "Patient has two insurance plans — COB (coordination of benefits) must be handled by billing coordinator",
                        "Insurance portal is down and hold time exceeds 20 minutes — flag to billing team, don't guess",
                        "Plan type cannot be confirmed (HMO vs PPO) — do not quote patient portion until confirmed",
                        "Coverage response contradicts what patient was told previously — escalate before confirming appointment",
                    ],
                    notes: [
                        "Always frame estimates as 'estimated based on your plan' — never guarantee a dollar amount",
                        "Eligibility ≠ coverage. Verify both — a patient can be eligible but still have a waiting period",
                        "For new patients on HMOs, confirm the correct in-network provider assignment before scheduling",
                    ],
                    confidence: "high",
                    source: "Insurance Verification SOP",
                    sourceType: "local",
                }),
                timestamp: new Date(Date.now() - 1000 * 60 * 9),
            },
        ],
    },
    {
        id: "2",
        title: "Reducing patient no-shows",
        lastMessage: "Our no-show rate is around 15%. What are the most effective ways to bring that down?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        messages: [
            {
                id: "m3",
                role: "user",
                content: "Our no-show rate is around 15%. What are the most effective ways to bring that down?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
                id: "m4",
                role: "assistant",
                content: S({
                    sayThis: "We're looking forward to seeing you tomorrow at [time] with [Provider]. If anything comes up, please give us at least 24 hours' notice — we have other patients we can help in that slot.",
                    doThis: [
                        "Implement a 3-touch confirmation: email 7 days out → text 48 hrs out → call or text morning before",
                        "Add a 'Confirm or Cancel' button in reminder texts — make it easy to cancel so you can backfill the slot",
                        "Build and maintain a same-day short-notice list of patients who want last-minute slots",
                        "Require a credit card on file for new patients — charge a no-show fee ($25–$50) consistently",
                        "For high-value appointments (implants, crowns), have the provider personally call to confirm",
                        "Track which appointment types, times, and patient segments have the highest no-show rate",
                    ],
                    escalateIf: [
                        "Patient is a chronic no-show (2+ times) — office manager should require pre-payment for next appointment",
                        "A high-production appointment (e.g., full-arch case) cancels same-day — immediately notify provider and office manager",
                    ],
                    notes: [
                        "A 15% no-show rate is costing your practice significant production — industry target is under 5%",
                        "Cancellation fee policies must be communicated at scheduling AND in reminders, not just at the time of no-show",
                        "Automated reminders alone reduce no-shows by 30–40%; combining with a short-notice list recovers most lost revenue",
                    ],
                    confidence: "high",
                    source: "Saige Knowledge Base",
                    sourceType: "global",
                }),
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
            },
        ],
    },
    {
        id: "3",
        title: "CDT coding for crown procedures",
        lastMessage: "Which CDT code do I use for a PFM crown on tooth #19?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messages: [
            {
                id: "m5",
                role: "user",
                content: "Which CDT code do I use for a PFM crown on tooth #19?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
            {
                id: "m6",
                role: "assistant",
                content: S({
                    sayThis: "For your crown on tooth #19, we'll be billing D2752 — that's a porcelain-fused-to-noble-metal crown on a posterior tooth. I'll include your X-rays and a clinical narrative with the claim.",
                    doThis: [
                        "Use CDT code D2752 — Crown, porcelain fused to noble metal (tooth #19 is a posterior molar)",
                        "Attach a current periapical X-ray clearly showing the reason for the crown (caries, fracture, failing restoration)",
                        "Write a clinical narrative: patient presentation, diagnosis, and why a crown was necessary",
                        "If a core buildup was done, bill D2950 separately with documentation",
                        "Note both the preparation date and seat date — some carriers require both for reimbursement",
                        "Include pre-op and post-op photos if your carrier is requiring them (increasingly common)",
                        "Check frequency limitations — most plans cover crowns every 5–7 years per tooth",
                    ],
                    escalateIf: [
                        "Carrier applies an alternative benefit clause (pays for amalgam instead of crown) — notify the patient before billing",
                        "Missing tooth clause applies — the claim will likely be denied; escalate to billing coordinator for appeal",
                        "This is a replacement crown within the frequency limit — prior authorization may be required",
                    ],
                    notes: [
                        "D2752 = PFM on noble metal (common). D2750 = PFM on high-noble metal. D2751 = PFM on predominantly base metal. Use the correct sub-code — it affects reimbursement",
                        "Tooth #19 is a posterior tooth — always use the posterior crown code, not anterior (D2740 series)",
                        "If the crown also required a post and core, add D2952 or D2953 with supporting endo documentation",
                    ],
                    confidence: "high",
                    source: "CDT Coding Reference",
                    sourceType: "global",
                }),
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 60000),
            },
        ],
    },
    {
        id: "4",
        title: "Setting up a recall system",
        lastMessage: "How do we build an effective hygiene recall program?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        messages: [],
    },
    {
        id: "5",
        title: "Scripting treatment plan presentations",
        lastMessage: "How should we present a $4,500 treatment plan to a patient?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        messages: [],
    },
];

export const WELCOME_MESSAGES = [
    "How can I help your practice today?",
    "What dental practice question can I answer?",
    "Ask me anything about running your dental office.",
];

export const SUGGESTED_PROMPTS = [
    {
        icon: "🗂️",
        title: "Insurance & billing",
        description: "How do I write an effective appeal letter for a denied dental claim?",
    },
    {
        icon: "📅",
        title: "Scheduling & recalls",
        description: "What's the best system to keep our hygiene schedule full?",
    },
    {
        icon: "💬",
        title: "Patient communication",
        description: "How do I respond to a negative Google review about wait times?",
    },
    {
        icon: "📊",
        title: "Practice growth",
        description: "What KPIs should a dental office track every month?",
    },
];
