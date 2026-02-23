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
        title: "Getting started with Next.js",
        lastMessage: "What are the best practices for Next.js 15?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        messages: [
            {
                id: "m1",
                role: "user",
                content: "What are the best practices for Next.js 15?",
                timestamp: new Date(Date.now() - 1000 * 60 * 10),
            },
            {
                id: "m2",
                role: "assistant",
                content: `Here are the key best practices for Next.js 15:

**1. Use the App Router**
The App Router is now the recommended way to build Next.js applications. It supports React Server Components by default, which means less JavaScript shipped to the client.

**2. Leverage Server Components**
Use React Server Components for data fetching and rendering. They run on the server and don't add to your bundle size.

**3. Optimize Images**
Always use the \`next/image\` component for automatic image optimization, lazy loading, and WebP conversion.

**4. Implement Proper Caching**
Take advantage of Next.js's built-in caching strategies — static, dynamic, and on-demand revalidation.

**5. Use TypeScript**
TypeScript is fully supported and provides better developer experience with type safety.

Would you like me to dive deeper into any of these topics?`,
                timestamp: new Date(Date.now() - 1000 * 60 * 9),
            },
        ],
    },
    {
        id: "2",
        title: "Tailwind CSS tips & tricks",
        lastMessage: "How do I create a glass morphism effect?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        messages: [
            {
                id: "m3",
                role: "user",
                content: "How do I create a glass morphism effect with Tailwind CSS?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
                id: "m4",
                role: "assistant",
                content: `Creating a glassmorphism effect with Tailwind CSS is straightforward! Here's how:

\`\`\`html
<div class="
  bg-white/10 
  backdrop-blur-md 
  border border-white/20 
  rounded-2xl 
  shadow-lg
  p-6
">
  Glass morphism card
</div>
\`\`\`

**Key classes:**
- \`bg-white/10\` — semi-transparent white background
- \`backdrop-blur-md\` — blurs content behind the element
- \`border-white/20\` — subtle white border
- \`shadow-lg\` — soft shadow for depth

You can adjust the opacity values to get the exact look you want. Try \`bg-white/5\` for a more subtle effect or \`bg-white/20\` for a stronger glass look.`,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
            },
        ],
    },
    {
        id: "3",
        title: "React Server Components explained",
        lastMessage: "When should I use 'use client'?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messages: [
            {
                id: "m5",
                role: "user",
                content: "When should I use 'use client' directive in Next.js?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
            {
                id: "m6",
                role: "assistant",
                content: `Great question! Use the \`"use client"\` directive when your component needs:

**✅ Use 'use client' for:**
- **Event handlers** — onClick, onChange, onSubmit, etc.
- **React hooks** — useState, useEffect, useRef, useContext
- **Browser APIs** — localStorage, window, document
- **Real-time updates** — WebSockets, live data
- **Third-party libraries** that rely on browser APIs

**❌ Keep on Server (default) for:**
- Data fetching from databases or APIs
- Components that only render static content
- Components that don't need interactivity
- Large dependencies you don't want in the bundle

**Pro tip:** Place \`"use client"\` as low in the component tree as possible. Only the component and its children become client components — parent components remain server components.

This approach minimizes the JavaScript bundle sent to the browser.`,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 60000),
            },
        ],
    },
    {
        id: "4",
        title: "Database design patterns",
        lastMessage: "What's the difference between SQL and NoSQL?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        messages: [],
    },
    {
        id: "5",
        title: "Building a REST API",
        lastMessage: "How do I handle authentication in API routes?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        messages: [],
    },
];

export const WELCOME_MESSAGES = [
    "How can I help you today?",
    "What would you like to explore?",
    "Ask me anything — I'm here to help.",
];

export const SUGGESTED_PROMPTS = [
    {
        icon: "✨",
        title: "Write better code",
        description: "Help me refactor this function to be more readable",
    },
    {
        icon: "🔍",
        title: "Debug an issue",
        description: "Why is my useEffect running infinitely?",
    },
    {
        icon: "📚",
        title: "Explain a concept",
        description: "How does React's reconciliation algorithm work?",
    },
    {
        icon: "🚀",
        title: "Optimize performance",
        description: "What are the best strategies for reducing bundle size?",
    },
];
