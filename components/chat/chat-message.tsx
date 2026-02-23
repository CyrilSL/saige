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
} from "lucide-react";
import { Message } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

interface ChatMessageProps {
    message: Message;
    isLast?: boolean;
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
                <span className="text-[11px] font-mono text-zinc-500 font-medium">
                    {language || "code"}
                </span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 h-6 w-6"
                >
                    {copied ? (
                        <Check className="size-3 text-green-500" />
                    ) : (
                        <Copy className="size-3" />
                    )}
                </Button>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                <code className="font-mono text-zinc-800">{code}</code>
            </pre>
        </div>
    );
}

function parseContent(content: string) {
    const parts: Array<{
        type: "text" | "code";
        content: string;
        language?: string;
    }> = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
        }
        parts.push({
            type: "code",
            content: match[2].trim(),
            language: match[1] || undefined,
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push({ type: "text", content: content.slice(lastIndex) });
    }

    return parts;
}

function renderTextWithFormatting(text: string) {
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
        const segments: React.ReactNode[] = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        const inlineCodeRegex = /`([^`]+)`/g;

        let lastIdx = 0;
        const allMatches: Array<{
            index: number;
            end: number;
            type: "bold" | "code";
            content: string;
        }> = [];

        let m: RegExpExecArray | null;
        boldRegex.lastIndex = 0;
        while ((m = boldRegex.exec(line)) !== null) {
            allMatches.push({ index: m.index, end: m.index + m[0].length, type: "bold", content: m[1] });
        }
        inlineCodeRegex.lastIndex = 0;
        while ((m = inlineCodeRegex.exec(line)) !== null) {
            allMatches.push({ index: m.index, end: m.index + m[0].length, type: "code", content: m[1] });
        }
        allMatches.sort((a, b) => a.index - b.index);

        allMatches.forEach((match, i) => {
            if (match.index > lastIdx) {
                segments.push(<span key={`t-${lineIdx}-${i}`}>{line.slice(lastIdx, match.index)}</span>);
            }
            if (match.type === "bold") {
                segments.push(
                    <strong key={`b-${lineIdx}-${i}`} className="font-semibold text-zinc-900">
                        {match.content}
                    </strong>
                );
            } else {
                segments.push(
                    <code
                        key={`c-${lineIdx}-${i}`}
                        className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[12px] font-mono text-zinc-700 border border-zinc-200"
                    >
                        {match.content}
                    </code>
                );
            }
            lastIdx = match.end;
        });

        if (lastIdx < line.length) {
            segments.push(<span key={`tail-${lineIdx}`}>{line.slice(lastIdx)}</span>);
        }

        const trimmed = line.trimStart();
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            return (
                <li key={lineIdx} className="ml-4 list-disc marker:text-zinc-400">
                    {segments}
                </li>
            );
        }

        return (
            <span key={lineIdx}>
                {segments}
                {lineIdx < lines.length - 1 && <br />}
            </span>
        );
    });
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";
    const parts = parseContent(message.content);

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
                <div
                    className="flex size-8 items-center justify-center rounded-full shadow-sm"
                    style={{ background: BRAND }}
                >
                    <Sparkles className="size-3.5 text-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0 max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] font-semibold text-zinc-900">Saige</span>
                    <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 h-3.5 font-medium border-0"
                        style={{ background: BRAND_LIGHT, color: BRAND }}
                    >
                        AI
                    </Badge>
                    <span className="text-[11px] text-zinc-400 ml-auto">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>

                <div className="text-[14px] leading-relaxed text-zinc-700">
                    {parts.map((part, i) => {
                        if (part.type === "code") {
                            return <CodeBlock key={i} code={part.content} language={part.language} />;
                        }
                        return (
                            <span key={i} className="whitespace-pre-wrap">
                                {renderTextWithFormatting(part.content)}
                            </span>
                        );
                    })}
                </div>

                {/* Action buttons on hover */}
                <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={handleCopy}
                                className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            >
                                {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 text-zinc-400 hover:text-green-500 hover:bg-green-50"
                            >
                                <ThumbsUp className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Good response</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <ThumbsDown className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bad response</TooltipContent>
                    </Tooltip>
                    {isLast && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                                >
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
