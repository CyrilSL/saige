"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { Conversation, Message, SAMPLE_CONVERSATIONS } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import {
    Sparkles,
    MessageSquarePlus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Star,
    Archive,
    Settings,
    BookOpen,
    Bell,
    ChevronRight,
    Bot,
    Home,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── constants ────────────────────────────────────────────────────────────────

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

// ─── fake AI responses ────────────────────────────────────────────────────────

const S = (data: object) => `##SAIGE_STRUCTURED##${JSON.stringify(data)}`;

const FAKE_RESPONSES = [
    S({
        sayThis: "I can help with that! Let me pull up the benefits first. Can I get your date of birth and the insurance ID on file so I can verify your coverage before confirming your appointment?",
        doThis: [
            "Pull up the patient's profile in the PMS (Dentrix / Eaglesoft)",
            "Navigate to the insurance portal or call the benefits line",
            "Verify: plan type, annual max, deductible (individual/family), remaining balance",
            "Confirm frequency limitations — cleanings, X-rays, crowns",
            "Check for a missing tooth clause if restorative treatment is planned",
            "Document everything: rep name, call reference #, date and time",
            "Share an estimated patient portion before confirming the appointment",
        ],
        escalateIf: [
            "Patient has two active insurance plans — coordinate benefits with billing team",
            "Portal is down and phone hold exceeds 20 min — flag for billing coordinator",
            "Plan type is unclear (HMO vs PPO) — escalate before quoting any patient portion",
        ],
        notes: [
            "Always say 'estimated based on your plan' — never guarantee coverage",
            "For new patients, verify benefits at least 48–72 hrs before appointment",
        ],
        confidence: "high",
        source: "Insurance Verification SOP",
        sourceType: "local",
    }),
    S({
        sayThis: "We completely understand your concern. Let me review your account and the charges with you right now — we want to make sure everything looks right.",
        doThis: [
            "Pull the patient's ledger in the PMS",
            "Review the EOB for the date of service in question",
            "Identify whether the issue is a carrier denial, co-pay, or billing error",
            "If billing error: correct it and adjust the balance immediately",
            "If carrier denial: explain the reason and offer to help with an appeal",
            "If correct: walk through the breakdown line-by-line, calmly",
            "Document the conversation in the patient's notes",
        ],
        escalateIf: [
            "Patient threatens legal action or requests records — escalate to office manager immediately",
            "Dispute involves more than $500 — loop in billing coordinator",
            "Patient becomes aggressive or raises their voice",
        ],
        notes: [
            "Never argue or dismiss the concern — validate first, then clarify",
            "Offer a private space to discuss if other patients are nearby",
        ],
        confidence: "high",
        source: "Patient Billing Policy",
        sourceType: "local",
    }),
    S({
        sayThis: "We have an opening — before I confirm it, let me take a moment to go over what the visit will involve so you know exactly what to expect and what your estimated cost will be.",
        doThis: [
            "Identify the appointment type and duration required",
            "Check the schedule for the correct block (hygiene vs. provider)",
            "Pull insurance and calculate estimated patient portion",
            "Confirm any pre-appointment requirements (X-rays, health history update)",
            "Send confirmation with time, provider name, and what to bring",
            "Add to reminder workflow: 7-day email, 3-day text, day-before call",
        ],
        escalateIf: [
            "Patient requires sedation — confirm with clinical team before scheduling",
            "Patient has a complex medical history — flag for provider review first",
            "Requested appointment type doesn't match available block time",
        ],
        notes: [
            "Always confirm the correct provider — some patients are assigned to a specific hygienist",
            "New patients: add 15–20 min buffer for paperwork and health history",
        ],
        confidence: "high",
        source: "Scheduling Policy",
        sourceType: "local",
    }),
    S({
        sayThis: "I completely understand — let me check our records. Can I get your name and date of birth? I want to make sure we have everything updated on our end and get you taken care of right away.",
        doThis: [
            "Verify the patient's identity and pull their account",
            "Check the recall date and last visit in the PMS",
            "If overdue: acknowledge the gap without judgment and focus on rebooking",
            "Offer the next available hygiene slot that matches their preferred time",
            "Update contact information and communication preferences",
            "Set recall reminder for the next cycle before ending the call",
        ],
        escalateIf: [
            "Patient reports a dental emergency or acute pain — immediately transfer to clinical team",
            "Account has an outstanding balance that may block scheduling — check with billing",
        ],
        notes: [
            "Never shame a patient for a long gap — it creates barriers to return",
            "Patients who haven't been in over 2 years may need a new patient exam slot",
        ],
        confidence: "medium",
        source: "Saige Knowledge Base",
        sourceType: "global",
    }),
];

let responseIndex = 0;
// Plain conversational responses (Assist Mode OFF)
const CHAT_RESPONSES = [
    "Insurance coverage can vary a lot depending on the patient's plan. Generally speaking, most PPO plans cover preventive care (cleanings, exams, X-rays) at 80–100%, basic restorative at 70–80%, and major restorative at 50%. But every plan is different — always check the specific EOB or call the carrier to get accurate numbers before quoting a patient.",
    "No-shows are one of the most frustrating parts of running a dental practice. The biggest factors are usually poor reminder systems, patients who feel disconnected from the practice, and no real consequence for missing. A consistent reminder cadence (email + text + call) combined with a posted cancellation policy tends to make the biggest difference over time.",
    "For a PFM crown on a posterior tooth like #19, you'd typically use D2752 (porcelain fused to noble metal). Make sure to document the clinical reason for the crown and attach your periapical X-ray. Some carriers also want pre-op photos these days, so it's worth checking your specific plan guidelines.",
    "A good recall system is really the heartbeat of a hygiene department. The key is making sure every patient is reappointed before they leave the chair — that alone can keep your hygiene schedule 80–90% full. For patients who slip through, a 3-step outreach (text, email, call) over a couple of weeks tends to work well.",
];

let chatIndex = 0;
function getNextChatResponse() {
    const r = CHAT_RESPONSES[chatIndex % CHAT_RESPONSES.length];
    chatIndex++;
    return r;
}

function getNextResponse(assistMode: boolean) {
    if (assistMode) {
        const response = FAKE_RESPONSES[responseIndex % FAKE_RESPONSES.length];
        responseIndex++;
        return response;
    } else {
        return getNextChatResponse();
    }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function groupConversations(convs: Conversation[]) {
    const now = new Date();
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const older: Conversation[] = [];
    convs.forEach((c) => {
        const d = Math.floor((now.getTime() - c.timestamp.getTime()) / 86400000);
        if (d === 0) today.push(c);
        else if (d === 1) yesterday.push(c);
        else older.push(c);
    });
    return { today, yesterday, older };
}

// ─── sidebar ─────────────────────────────────────────────────────────────────

function ConversationItem({
    conv,
    isActive,
    onSelect,
}: {
    conv: Conversation;
    isActive: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={cn(
                "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 select-none",
                isActive
                    ? "bg-white shadow-sm text-zinc-900 border border-zinc-100"
                    : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900"
            )}
            onClick={onSelect}
        >
            {isActive && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: BRAND }}
                />
            )}
            <div className="flex-1 min-w-0">
                <p
                    className="truncate text-[13px] font-medium leading-5"
                    style={isActive ? { color: BRAND } : undefined}
                >
                    {conv.title}
                </p>
                <p className="truncate text-[11px] text-zinc-400 mt-0.5">
                    {formatTimeAgo(conv.timestamp)}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="opacity-0 group-hover:opacity-100 shrink-0 size-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="size-3.5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2 text-sm">
                        <Pencil className="size-3.5" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm">
                        <Star className="size-3.5" /> Favourite
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm">
                        <Archive className="size-3.5" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm text-red-500 focus:text-red-600">
                        <Trash2 className="size-3.5" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// ─── nav item ─────────────────────────────────────────────────────────────────

function NavItem({
    icon,
    label,
    href,
    active,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
}) {
    return (
        <a
            href={href}
            className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active
                    ? "font-semibold bg-[#eef2fb]"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 font-medium"
            )}
            style={active ? { color: BRAND } : undefined}
        >
            {icon}
            <span className="flex-1">{label}</span>
        </a>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AskPage() {
    const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>("1");
    const [searchQuery, setSearchQuery] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [assistMode, setAssistMode] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

    // Auto-scroll on new content
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConversation?.messages.length, streamingText]);

    const handleNewChat = useCallback(() => {
        const newConv: Conversation = {
            id: Date.now().toString(),
            title: "New conversation",
            lastMessage: "",
            timestamp: new Date(),
            messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
    }, []);

    const handleSend = useCallback(
        (content: string) => {
            if (!activeId || isStreaming) return;

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content,
                timestamp: new Date(),
            };

            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== activeId) return c;
                    const isFirst = c.messages.length === 0;
                    return {
                        ...c,
                        title: isFirst
                            ? content.slice(0, 50) + (content.length > 50 ? "…" : "")
                            : c.title,
                        lastMessage: content,
                        timestamp: new Date(),
                        messages: [...c.messages, userMessage],
                    };
                })
            );

            setIsStreaming(true);
            setStreamingText("");
            const fullResponse = getNextResponse(assistMode);

            let i = 0;
            const interval = setInterval(() => {
                i += Math.floor(Math.random() * 12) + 18; // 18–30 chars per tick
                setStreamingText(fullResponse.slice(0, i));
                if (i >= fullResponse.length) {
                    clearInterval(interval);
                    setIsStreaming(false);
                    setStreamingText("");
                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: fullResponse,
                        timestamp: new Date(),
                    };
                    setConversations((prev) =>
                        prev.map((c) =>
                            c.id === activeId
                                ? { ...c, messages: [...c.messages, aiMessage] }
                                : c
                        )
                    );
                }
            }, 8); // tick every 8ms
        },
        [activeId, isStreaming, assistMode]
    );

    const handlePromptClick = useCallback(
        (prompt: string) => {
            if (!activeId || (activeConversation && activeConversation.messages.length > 0)) {
                const newConv: Conversation = {
                    id: Date.now().toString(),
                    title: "New conversation",
                    lastMessage: "",
                    timestamp: new Date(),
                    messages: [],
                };
                setConversations((prev) => [newConv, ...prev]);
                setActiveId(newConv.id);
                setTimeout(() => handleSend(prompt), 50);
            } else {
                handleSend(prompt);
            }
        },
        [activeId, activeConversation, handleSend]
    );

    const handleStop = useCallback(() => {
        setIsStreaming(false);
        setStreamingText("");
    }, []);

    const messages = activeConversation?.messages ?? [];
    const showWelcome = messages.length === 0 && !isStreaming;

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const { today, yesterday, older } = groupConversations(filtered);

    const renderGroup = (label: string, items: Conversation[]) => {
        if (items.length === 0) return null;
        return (
            <div key={label} className="mb-4">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
                    {label}
                </p>
                <div className="space-y-0.5">
                    {items.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conv={conv}
                            isActive={conv.id === activeId}
                            onSelect={() => setActiveId(conv.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
                {/* ── Left Sidebar ── */}
                <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white shrink-0">
                    {/* Brand */}
                    <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
                        <span className="text-[15px] font-bold tracking-tight text-zinc-900">Saige</span>
                        <span
                            className="ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5"
                            style={{ background: BRAND_LIGHT, color: BRAND }}
                        >
                            Ask
                        </span>
                    </div>

                    {/* Mode switcher */}
                    <div className="px-3 pt-4 pb-3">
                        <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
                            <a
                                href="/ask"
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold text-zinc-800 bg-white shadow-sm transition-all"
                            >
                                <Sparkles className="size-3.5" style={{ color: BRAND }} />
                                Ask
                            </a>
                            <a
                                href="/learn"
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-all"
                            >
                                <BookOpen className="size-3.5" />
                                Learn
                            </a>
                        </div>
                    </div>

                    <div className="mx-3 h-px bg-zinc-100" />

                    {/* Home nav */}
                    <nav className="px-3 pt-2 pb-1">
                        <NavItem icon={<Home className="size-4" />} label="Home" href="/" />
                    </nav>

                    <div className="mx-3 h-px bg-zinc-100" />

                    {/* New chat button */}
                    <div className="px-3 pb-3">
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                            style={{ background: BRAND }}
                        >
                            <MessageSquarePlus className="size-4" />
                            New chat
                        </button>
                    </div>

                    {/* Search conversations */}
                    <div className="px-3 pb-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                            <input
                                placeholder="Search chats..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-8 pl-8 pr-3 text-[12px] rounded-lg border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Conversation list */}
                    <ScrollArea className="flex-1 px-2">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Bot className="size-7 text-zinc-200 mb-2" />
                                <p className="text-[12px] text-zinc-400">No conversations found</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {renderGroup("Today", today)}
                                {renderGroup("Yesterday", yesterday)}
                                {renderGroup("Older", older)}
                            </div>
                        )}
                    </ScrollArea>

                    {/* User footer */}
                    <div className="border-t border-zinc-100 p-3 flex items-center gap-2.5">
                        <div
                            className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0"
                            style={{ background: BRAND }}
                        >
                            U
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-zinc-800 truncate">Your Account</p>
                            <p className="text-[10px] text-zinc-400">Dental Professional</p>
                        </div>
                        <Settings className="size-4 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors shrink-0" />
                    </div>
                </aside>

                {/* ── Main chat area ── */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Top bar */}
                    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-100 bg-white px-6">
                        {activeConversation && activeConversation.messages.length > 0 ? (
                            <div className="flex items-center gap-2 min-w-0">
                                <ChevronRight className="size-3.5 text-zinc-400 shrink-0" />
                                <h2 className="text-[13px] font-medium text-zinc-700 truncate max-w-[400px]">
                                    {activeConversation.title}
                                </h2>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex size-6 items-center justify-center rounded-lg shadow-sm"
                                    style={{ background: BRAND }}
                                >
                                    <Sparkles className="size-3.5 text-white" />
                                </div>
                                <span className="text-[13px] font-semibold text-zinc-700">Ask Saige</span>
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-3">
                            {/* Assist mode toggle */}
                            <button
                                onClick={() => setAssistMode((v) => !v)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-all duration-200",
                                    assistMode
                                        ? "text-white border-transparent shadow-sm"
                                        : "text-zinc-500 border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                                )}
                                style={assistMode ? { background: BRAND } : undefined}
                            >
                                {assistMode ? "Assist mode" : "Chat mode"}
                            </button>

                        </div>
                    </header>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto">
                        {showWelcome ? (
                            <ChatWelcome onPromptClick={handlePromptClick} />
                        ) : (
                            <div className="mx-auto max-w-3xl py-4">
                                {messages.map((msg, i) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        isLast={i === messages.length - 1 && msg.role === "assistant"}
                                    />
                                ))}

                                {/* Streaming message */}
                                {isStreaming && streamingText && (
                                    <ChatMessage
                                        message={{
                                            id: "streaming",
                                            role: "assistant",
                                            content: streamingText,
                                            timestamp: new Date(),
                                        }}
                                        isLast={true}
                                    />
                                )}

                                {/* Typing dots */}
                                {isStreaming && !streamingText && (
                                    <div className="flex gap-3 px-4 py-3">
                                        <div
                                            className="flex size-8 items-center justify-center rounded-full shadow-md shrink-0"
                                            style={{ background: BRAND }}
                                        >
                                            <Sparkles className="size-3.5 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="size-1.5 rounded-full bg-zinc-300 typing-dot"
                                                    style={{ animationDelay: `${i * 0.2}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} className="h-4" />
                            </div>
                        )}
                    </div>

                    {/* Input bar */}
                    <div className="shrink-0 border-t border-zinc-100 bg-white px-4 py-4">
                        <div className="mx-auto max-w-3xl">
                            <ChatInput
                                onSend={handleSend}
                                isStreaming={isStreaming}
                                onStop={handleStop}
                                disabled={!activeId}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
