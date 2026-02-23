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
                content: `Great question! Here's a reliable insurance verification workflow for dental practices:

**1. Verify 48–72 hours before the appointment**
Don't wait until the day of. Call or use your carrier's online portal at least 2 days ahead to allow time to resolve any issues.

**2. Confirm the key benefit details**
- Plan type (PPO, HMO, Indemnity)
- Annual maximum & remaining balance
- Deductible (individual/family) & amount met
- Preventive, basic, and major coverage percentages
- Waiting periods for new patients
- Missing tooth clause & frequency limitations

**3. Check eligibility, not just coverage**
A patient can have coverage but still be ineligible (e.g., not yet past their waiting period). Always verify both.

**4. Document everything**
Record the rep's name, call reference number, date/time, and what was confirmed. This protects you if there's a dispute later.

**5. Communicate with the patient**
Share a pre-visit benefit summary so patients understand their estimated out-of-pocket costs before sitting in the chair.

Would you like a script your front office team can use when calling insurance companies?`,
                timestamp: new Date(Date.now() - 1000 * 60 * 9),
            },
        ],
    },
    {
        id: "2",
        title: "Reducing patient no-shows",
        lastMessage: "How can we reduce our no-show rate?",
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
                content: `A 15% no-show rate is costly — here's a proven strategy to get it under 5%:

**Short-term fixes (implement this week)**
- **3-touch confirmation system:** Send an email 1 week out, a text 3 days out, and a call/text the morning before.
- **Require credit card on file** for new patients. Charge a no-show fee ($25–$50) — this alone can cut no-shows significantly.

**Medium-term systems**
- Use automated reminders via your PMS (Dentrix, Eaglesoft, etc.)
- Add a **"Confirm or Cancel" button** in reminder texts. Make it easy to cancel so you can backfill the slot.
- Build a **short-notice cancellation list** of patients who want to come in last-minute.

**Relationship-driven tactics**
- Personalized calls from the doctor or hygienist for high-value appointments (crowns, implant consults)
- For chronic no-show patients, require pre-payment for appointments

**Track your data**
Identify which appointment types, times of day, and patient demographics are highest-risk, then adjust your reminder cadence accordingly.

What's your current reminder system? I can help you optimize it.`,
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
                content: `For a porcelain-fused-to-metal (PFM) crown on tooth #19 (a posterior molar), use:

**D2752** — Crown, porcelain fused to noble metal

> Tooth #19 is a molar, so you're billing for a posterior crown. Most carriers distinguish between anterior (front) and posterior (back) crowns, so make sure you're using the correct code.

**Key documentation to support the claim:**
- X-rays showing the condition that necessitated the crown (caries, fracture, failing restoration)
- Narrative describing why a crown was the appropriate treatment
- Pre-op and post-op photos (increasingly required)
- Date of preparation and date of seat (some carriers require both)

**Common denials to watch for:**
- Missing tooth clause (if tooth was extracted before plan inception)
- Frequency limitation (most plans cover crowns every 5–7 years)
- Alternative benefit clause (carrier may pay for an amalgam instead)

**Related codes you may also need:**
- D0220/D0230 — Periapical X-rays (if taken as part of diagnosis)
- D2950 — Core buildup (if applicable, document separately)
- D9930 — Treatment of complications of previous crown (if a redo)

Would you like help writing the narrative for this claim?`,
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
