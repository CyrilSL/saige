"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { Conversation, Message, SAMPLE_CONVERSATIONS } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, Sparkles } from "lucide-react";

// Simulated AI response pool
const FAKE_RESPONSES = [
    "That's a great question! Let me think through this carefully.\n\nBased on what you've shared, I'd suggest approaching this step by step:\n\n**First**, break down the problem into smaller, manageable pieces. This makes it easier to identify where the issue lies.\n\n**Second**, consider the edge cases — what happens when the input is empty, null, or an unexpected type?\n\n**Finally**, don't forget to test your solution thoroughly. Would you like me to help with any specific part?",
    "I understand what you're looking for. Here's an example approach:\n\n```typescript\nfunction solution(input: string): string {\n  // Validate input\n  if (!input || input.trim() === '') {\n    throw new Error('Input cannot be empty');\n  }\n  \n  // Process and return\n  return input\n    .trim()\n    .toLowerCase()\n    .replace(/\\s+/g, '-');\n}\n```\n\nThis handles the main cases you mentioned. Let me know if you need adjustments!",
    "Great point! There are several ways to approach this:\n\n1. **Option A** — Simple and straightforward, works for most use cases\n2. **Option B** — More flexible, better for complex scenarios\n3. **Option C** — Optimal performance, but requires more setup\n\nGiven your requirements, I'd recommend **Option A** to start. It's easier to understand and maintain, and you can always optimize later if needed.\n\nWould you like me to elaborate on any of these options?",
    "Absolutely! Here's what I'd recommend:\n\nThe key insight here is that you need to think about this from the user's perspective. What problem are they actually trying to solve?\n\nOnce you understand that, the technical solution usually becomes clearer. In your case, it sounds like the real need is **consistency** and **reliability** rather than raw performance.\n\nDoes that match your understanding of the requirements?",
];

let responseIndex = 0;
function getNextResponse() {
    const response = FAKE_RESPONSES[responseIndex % FAKE_RESPONSES.length];
    responseIndex++;
    return response;
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>("1");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

    // Auto-scroll to bottom on new messages
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

            // Simulate streaming response
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

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex h-screen w-full overflow-hidden bg-white">
                {/* Sidebar */}
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeId}
                    onSelectConversation={setActiveId}
                    onNewChat={handleNewChat}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
                />

                {/* Main chat area */}
                <div className="flex flex-1 flex-col overflow-hidden bg-white">
                    {/* Top bar */}
                    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-100 px-4">
                        {sidebarCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSidebarCollapsed(false)}
                                className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            >
                                <PanelLeft className="size-4" />
                            </Button>
                        )}

                        {activeConversation && activeConversation.messages.length > 0 ? (
                            <h2 className="text-sm font-medium text-zinc-700 truncate max-w-[400px]">
                                {activeConversation.title}
                            </h2>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600">
                                    <Sparkles className="size-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-zinc-500">New chat</span>
                            </div>
                        )}

                        <div className="ml-auto">
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </div>
                        </div>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto">
                        {showWelcome ? (
                            <ChatWelcome onPromptClick={handlePromptClick} />
                        ) : (
                            <div className="mx-auto max-w-3xl py-4">
                                {messages.map((msg, i) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        isLast={
                                            i === messages.length - 1 && msg.role === "assistant"
                                        }
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
                                        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shrink-0">
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

                    {/* Input */}
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
                </div>
            </div>
        </TooltipProvider>
    );
}
