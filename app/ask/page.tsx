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

const FAKE_RESPONSES = [
    "Great question! Here's what works best in high-performing dental practices:\n\nFor scheduling efficiency, the key is **blocking your schedule intentionally** rather than filling every opening slot:\n\n**1. Designate block scheduling zones**\nReserve morning blocks for high-production procedures (crowns, implants, root canals) and afternoons for hygiene and new patient exams.\n\n**2. Establish a 'Yes, And' cancellation policy**\nWhen a patient cancels, immediately offer the next available slot *and* add them to a same-day list so you can call when openings appear.\n\n**3. Track your schedule analysis weekly**\nMeasure scheduled production vs. actual production. A healthy practice runs at 95%+ of scheduled production.\n\nWould you like a script for your front desk to handle last-minute cancellations?",
    "Absolutely — here's how top dental offices handle insurance appeals:\n\n**Step 1: Request the EOB and denial reason**\nAlways get the Explanation of Benefits in writing before writing your appeal.\n\n**Step 2: Write a clinical narrative**\nYour appeal letter should include:\n- The patient's clinical presentation\n- Why the treatment was medically necessary\n- Supporting documentation (X-rays, periodontal charting, photos)\n\n**Step 3: Reference the plan's own language**\nQuote directly from the patient's Certificate of Coverage where possible. Insurers are more likely to reverse a denial when you cite their own policy.\n\n**Step 4: Set a follow-up reminder**\nMost carriers are required to respond within 30–60 days. Track every appeal with a due date.\n\nWould you like me to draft a template appeal letter you can customize?",
    "This is one of the most common front office challenges. Here are proven strategies:\n\n**Treatment Presentation Best Practices**\n\n1. **Lead with the patient's concern, not the diagnosis**\n   Start with what *they* said matters — 'You mentioned sensitivity when you eat cold foods...'\n\n2. **Present the full treatment plan first, then break it down**\n   Show the complete picture, then offer phasing options. Never pre-judge what a patient can afford.\n\n3. **Use visual aids**\n   Intraoral photos, X-rays with annotations, and 3D imaging dramatically improve case acceptance.\n\n4. **Quote confidently**\n   Don't apologize for fees. Present the investment clearly: 'Your portion after insurance is estimated at $850.'\n\n5. **Offer financing options proactively**\n   Mention CareCredit/Sunbit before the patient asks — it removes the price barrier entirely.\n\nCase acceptance improves by 20–30% in practices that follow a consistent presentation script. Want me to write one for your team?",
    "Tracking the right metrics is the difference between guessing and growing. Here are the KPIs every dental practice should monitor monthly:\n\n**Production**\n- Total production (by provider)\n- Collection rate (should be 98%+)\n- Average production per visit\n\n**Scheduling**\n- Schedule utilization rate (scheduled vs. available hours)\n- No-show & cancellation rate (target: under 5%)\n- New patient numbers\n\n**Patient Experience**\n- Online review rating & volume\n- Patient retention rate (are existing patients returning?)\n- Referral source tracking\n\n**Clinical**\n- Case acceptance rate (target: 85%+ for diagnosed treatment)\n- Hygiene reappointment rate (target: 85%+)\n\nI'd recommend a simple dashboard reviewed in a weekly team huddle. Would you like a template spreadsheet for tracking these?",
];

let responseIndex = 0;
function getNextResponse() {
    const response = FAKE_RESPONSES[responseIndex % FAKE_RESPONSES.length];
    responseIndex++;
    return response;
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
            const fullResponse = getNextResponse();

            let i = 0;
            const interval = setInterval(() => {
                i += Math.floor(Math.random() * 4) + 2;
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
            }, 20);
        },
        [activeId, isStreaming]
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

                        <div className="ml-auto flex items-center gap-2">
                            {/* Online badge */}
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </div>
                            <button className="relative size-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                                <Bell className="size-4" />
                                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
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
