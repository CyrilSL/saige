"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Copy,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Sparkles,
    Check,
    MessageSquare,
    ListChecks,
    AlertTriangle,
    StickyNote,
    ShieldCheck,
    FileText,
    Globe,
} from "lucide-react";
import { Message } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

const STRUCTURED_PREFIX = "##SAIGE_STRUCTURED##";

interface StructuredResponse {
    sayThis: string;
    doThis: string[];
    escalateIf: string[];
    notes: string[];
    confidence: "high" | "medium" | "low";
    source: string;
    sourceType: "local" | "global";
}

interface ChatMessageProps {
    message: Message;
    isLast?: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseStructured(content: string): StructuredResponse | null {
    if (!content.startsWith(STRUCTURED_PREFIX)) return null;
    try {
        return JSON.parse(content.slice(STRUCTURED_PREFIX.length).trim());
    } catch {
        return null;
    }
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="my-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-zinc-100/60">
                <span className="text-[11px] font-mono text-zinc-500 font-medium">{language || "code"}</span>
                <Button variant="ghost" size="icon-xs" onClick={handleCopy} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 h-6 w-6">
                    {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                </Button>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                <code className="font-mono text-zinc-800">{code}</code>
            </pre>
        </div>
    );
}

function parseContent(content: string) {
    const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
        parts.push({ type: "code", content: match[2].trim(), language: match[1] || undefined });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) parts.push({ type: "text", content: content.slice(lastIndex) });
    return parts;
}

function renderTextWithFormatting(text: string) {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
        const segments: React.ReactNode[] = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        const inlineCodeRegex = /`([^`]+)`/g;
        let lastIdx = 0;
        const allMatches: Array<{ index: number; end: number; type: "bold" | "code"; content: string }> = [];
        let m: RegExpExecArray | null;
        boldRegex.lastIndex = 0;
        while ((m = boldRegex.exec(line)) !== null) allMatches.push({ index: m.index, end: m.index + m[0].length, type: "bold", content: m[1] });
        inlineCodeRegex.lastIndex = 0;
        while ((m = inlineCodeRegex.exec(line)) !== null) allMatches.push({ index: m.index, end: m.index + m[0].length, type: "code", content: m[1] });
        allMatches.sort((a, b) => a.index - b.index);
        allMatches.forEach((match, i) => {
            if (match.index > lastIdx) segments.push(<span key={`t-${lineIdx}-${i}`}>{line.slice(lastIdx, match.index)}</span>);
            if (match.type === "bold") segments.push(<strong key={`b-${lineIdx}-${i}`} className="font-semibold text-zinc-900">{match.content}</strong>);
            else segments.push(<code key={`c-${lineIdx}-${i}`} className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[12px] font-mono text-zinc-700 border border-zinc-200">{match.content}</code>);
            lastIdx = match.end;
        });
        if (lastIdx < line.length) segments.push(<span key={`tail-${lineIdx}`}>{line.slice(lastIdx)}</span>);
        const trimmed = line.trimStart();
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) return <li key={lineIdx} className="ml-4 list-disc marker:text-zinc-400">{segments}</li>;
        return <span key={lineIdx}>{segments}{lineIdx < lines.length - 1 && <br />}</span>;
    });
}

// ─── 4-box structured card ────────────────────────────────────────────────────

const CONFIDENCE_CONFIG = {
    high: { label: "High confidence", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    medium: { label: "Medium confidence", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    low: { label: "Low confidence", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

function StructuredCard({ data }: { data: StructuredResponse }) {
    const conf = CONFIDENCE_CONFIG[data.confidence];
    return (
        <div className="space-y-2 w-full">
            {/* Say This */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-100/50">
                    <MessageSquare className="size-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Say This</span>
                </div>
                <div className="px-3 py-2.5 text-[13px] text-zinc-800 leading-relaxed italic">
                    &ldquo;{data.sayThis}&rdquo;
                </div>
            </div>

            {/* Do This */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-100 bg-emerald-100/50">
                    <ListChecks className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Do This</span>
                </div>
                <ol className="px-3 py-2.5 space-y-1.5">
                    {data.doThis.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-700 leading-relaxed">
                            <span
                                className="shrink-0 mt-0.5 size-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ background: "#059669" }}
                            >
                                {i + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>

            {/* Escalate If */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-100 bg-amber-100/50">
                    <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Escalate If</span>
                </div>
                <ul className="px-3 py-2.5 space-y-1.5">
                    {data.escalateIf.map((trigger, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-700 leading-relaxed">
                            <span className="mt-1.5 size-1.5 rounded-full bg-amber-400 shrink-0" />
                            {trigger}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Notes */}
            {data.notes.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200 bg-zinc-100/60">
                        <StickyNote className="size-3.5 text-zinc-500 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Notes</span>
                    </div>
                    <ul className="px-3 py-2.5 space-y-1.5">
                        {data.notes.map((note, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-500 leading-relaxed">
                                <span className="mt-1.5 size-1.5 rounded-full bg-zinc-300 shrink-0" />
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Footer: confidence only */}
            <div className="flex items-center gap-2 pt-1">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border", conf.badge)}>
                    <span className={cn("size-1.5 rounded-full", conf.dot)} />
                    {conf.label}
                </span>
            </div>
        </div>
    );
}

// ─── streaming skeleton ──────────────────────────────────────────────────────

function SkeletonLine({ width = "full", dim = false }: { width?: string; dim?: boolean }) {
    return (
        <div
            className={cn(
                "h-2.5 rounded-full animate-pulse",
                dim ? "bg-zinc-100" : "bg-zinc-200/80",
                width === "full" ? "w-full" : width === "3/4" ? "w-3/4" : width === "2/3" ? "w-2/3" : "w-1/2"
            )}
        />
    );
}

function StructuredSkeleton() {
    return (
        <div className="space-y-2 w-full">
            {/* Say This skeleton */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-100/50">
                    <MessageSquare className="size-3.5 text-blue-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Say This</span>
                </div>
                <div className="px-3 py-3 space-y-2">
                    <SkeletonLine width="full" />
                    <SkeletonLine width="3/4" />
                </div>
            </div>

            {/* Do This skeleton */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-100 bg-emerald-100/50">
                    <ListChecks className="size-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Do This</span>
                </div>
                <div className="px-3 py-3 space-y-2.5">
                    {["full", "3/4", "full", "2/3", "3/4"].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="size-4 rounded-full bg-emerald-200/60 animate-pulse shrink-0" />
                            <SkeletonLine width={w} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Escalate If skeleton */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-100 bg-amber-100/50">
                    <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Escalate If</span>
                </div>
                <div className="px-3 py-3 space-y-2">
                    {["3/4", "full", "2/3"].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-amber-300/60 animate-pulse shrink-0" />
                            <SkeletonLine width={w} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes skeleton */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200 bg-zinc-100/60">
                    <StickyNote className="size-3.5 text-zinc-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Notes</span>
                </div>
                <div className="px-3 py-3 space-y-2">
                    <SkeletonLine width="full" dim />
                    <SkeletonLine width="2/3" dim />
                </div>
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center gap-2 pt-1">
                <div className="h-5 w-32 rounded-full bg-zinc-100 animate-pulse" />
                <div className="ml-auto h-4 w-40 rounded-full bg-zinc-100 animate-pulse" />
            </div>
        </div>
    );
}

// ─── main export ──────────────────────────────────────────────────────────────

export function ChatMessage({ message, isLast }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";
    const hasStructuredPrefix = !isUser && message.content.startsWith(STRUCTURED_PREFIX);
    const structured = hasStructuredPrefix ? parseStructured(message.content) : null;
    // show skeleton while JSON is still streaming in (prefix present but can't parse yet)
    const isStructuredLoading = hasStructuredPrefix && !structured;
    const parts = (structured || isStructuredLoading) ? [] : parseContent(message.content);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <div className="flex justify-end px-4 py-3 group">
                <div className="max-w-[75%]">
                    <div
                        className="rounded-2xl rounded-tr-sm text-white px-4 py-3 text-[14px] leading-relaxed"
                        style={{ background: BRAND, boxShadow: "0 1px 3px rgba(58,99,194,0.2)" }}
                    >
                        {message.content}
                    </div>
                    <div className="mt-1 flex justify-end">
                        <span className="text-[11px] text-zinc-400">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3 px-4 py-3 group">
            {/* AI Avatar */}
            <div className="shrink-0 mt-0.5">
                <div className="flex size-8 items-center justify-center rounded-full shadow-sm" style={{ background: BRAND }}>
                    <Sparkles className="size-3.5 text-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0" style={{ maxWidth: (structured || isStructuredLoading) ? "100%" : "85%" }}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] font-semibold text-zinc-900">Saige</span>
                    <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 h-3.5 font-medium border-0"
                        style={{ background: BRAND_LIGHT, color: BRAND }}
                    >
                        AI
                    </Badge>
                    {structured && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5 font-medium border border-zinc-200 text-zinc-500 bg-zinc-50 ml-1">
                            <ShieldCheck className="size-2.5 mr-0.5" />
                            Structured
                        </Badge>
                    )}
                    {isStructuredLoading && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5 font-medium border border-blue-100 text-blue-400 bg-blue-50 ml-1">
                            Building response…
                        </Badge>
                    )}
                    <span className="text-[11px] text-zinc-400 ml-auto">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>

                {structured ? (
                    <StructuredCard data={structured} />
                ) : isStructuredLoading ? (
                    <StructuredSkeleton />
                ) : (
                    <div className="text-[14px] leading-relaxed text-zinc-700">
                        {parts.map((part, i) => {
                            if (part.type === "code") return <CodeBlock key={i} code={part.content} language={part.language} />;
                            return <span key={i} className="whitespace-pre-wrap">{renderTextWithFormatting(part.content)}</span>;
                        })}
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-xs" onClick={handleCopy} className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100">
                                {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-xs" className="size-7 text-zinc-400 hover:text-green-500 hover:bg-green-50">
                                <ThumbsUp className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Good response</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-xs" className="size-7 text-zinc-400 hover:text-red-500 hover:bg-red-50">
                                <ThumbsDown className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bad response</TooltipContent>
                    </Tooltip>
                    {isLast && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon-xs" className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100">
                                    <RefreshCw className="size-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Regenerate</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
}
