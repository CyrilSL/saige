"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MessageSquarePlus,
    Search,
    ChevronLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    Star,
    Archive,
    Bot,
    Settings,
    HelpCircle,
    Sparkles,
} from "lucide-react";
import { Conversation } from "@/lib/chat-data";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

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

function groupConversations(conversations: Conversation[]) {
    const now = new Date();
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const older: Conversation[] = [];

    conversations.forEach((conv) => {
        const diffMs = now.getTime() - conv.timestamp.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) today.push(conv);
        else if (diffDays === 1) yesterday.push(conv);
        else if (diffDays < 7) thisWeek.push(conv);
        else older.push(conv);
    });

    return { today, yesterday, thisWeek, older };
}

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

export function ChatSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    collapsed,
    onToggleCollapse,
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { today, yesterday, thisWeek, older } = groupConversations(filtered);

    const renderGroup = (label: string, items: Conversation[]) => {
        if (items.length === 0) return null;
        return (
            <div key={label} className="mb-4">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 select-none">
                    {label}
                </p>
                <div className="space-y-0.5">
                    {items.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conv={conv}
                            isActive={conv.id === activeConversationId}
                            onSelect={() => onSelectConversation(conv.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (collapsed) {
        return (
            <div className="flex h-full w-14 flex-col items-center gap-3 border-r border-zinc-100 bg-zinc-50 py-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNewChat}
                            className="size-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                        >
                            <MessageSquarePlus className="size-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Chat</TooltipContent>
                </Tooltip>

                <div className="w-8 h-px bg-zinc-200" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleCollapse}
                            className="size-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                        >
                            <ChevronLeft className="size-4 rotate-180" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Expand Sidebar</TooltipContent>
                </Tooltip>

                <div className="mt-auto space-y-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            >
                                <Settings className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-64 flex-col border-r border-zinc-100 bg-zinc-50">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-4">
                <div className="flex items-center gap-2 flex-1">
                    <div
                        className="flex size-7 items-center justify-center rounded-lg shadow-sm"
                        style={{ background: BRAND }}
                    >
                        <Sparkles className="size-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-zinc-900">Saige</span>
                    <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] px-1.5 py-0 h-4 font-medium border-0"
                        style={{ background: BRAND_LIGHT, color: BRAND }}
                    >
                        Beta
                    </Badge>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onToggleCollapse}
                            className="shrink-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Collapse sidebar</TooltipContent>
                </Tooltip>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pb-3">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 rounded-xl text-white font-medium shadow-sm"
                    size="sm"
                    style={{ background: BRAND }}
                >
                    <MessageSquarePlus className="size-4" />
                    New chat
                </Button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                    <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-sm bg-white border-zinc-200 rounded-lg placeholder:text-zinc-400 focus-visible:ring-1"
                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                    />
                </div>
            </div>

            <div className="mx-3 h-px bg-zinc-100" />

            {/* Conversations list */}
            <ScrollArea className="flex-1 px-2 py-3">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bot className="size-8 text-zinc-300 mb-3" />
                        <p className="text-sm text-zinc-400">No conversations found</p>
                    </div>
                ) : (
                    <>
                        {renderGroup("Today", today)}
                        {renderGroup("Yesterday", yesterday)}
                        {renderGroup("This Week", thisWeek)}
                        {renderGroup("Older", older)}
                    </>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="mx-3 h-px bg-zinc-100" />
            <div className="flex items-center gap-1 p-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                >
                    <HelpCircle className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                >
                    <Settings className="size-4" />
                </Button>
                <div className="ml-auto">
                    <div
                        className="flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                        style={{ background: BRAND }}
                    >
                        U
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConversationItem({
    conv,
    isActive,
    onSelect,
}: {
    conv: Conversation;
    isActive: boolean;
    onSelect: () => void;
}) {
    const BRAND = "#3A63C2";
    const BRAND_LIGHT = "#eef2fb";

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
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100 shrink-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="size-3.5" />
                    </Button>
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
