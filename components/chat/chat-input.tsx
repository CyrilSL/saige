"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowUp,
    Paperclip,
    Mic,
    Globe,
    Lightbulb,
    Square,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    isStreaming?: boolean;
    onStop?: () => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, isStreaming, onStop, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleSend = () => {
        if (!value.trim() || disabled) return;
        onSend(value.trim());
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = value.trim().length > 0 && !disabled;

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    "relative rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200",
                    "focus-within:border-zinc-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-violet-100"
                )}
            >
                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Saige..."
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14px] leading-relaxed text-foreground",
                        "placeholder:text-muted-foreground/50 focus:outline-none",
                        "min-h-[52px] max-h-[200px] overflow-y-auto",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                />

                {/* Bottom toolbar */}
                <div className="flex items-center gap-1 px-3 pb-3 pt-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={disabled}
                                className="size-7 text-muted-foreground/60 hover:text-foreground rounded-lg"
                            >
                                <Paperclip className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={disabled}
                                className="size-7 text-muted-foreground/60 hover:text-foreground rounded-lg"
                            >
                                <Globe className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Web search</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={disabled}
                                className="size-7 text-muted-foreground/60 hover:text-foreground rounded-lg"
                            >
                                <Lightbulb className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Deep think</TooltipContent>
                    </Tooltip>

                    {/* Character count (subtle) */}
                    {value.length > 200 && (
                        <span className="ml-1 text-[11px] text-muted-foreground/50">
                            {value.length}
                        </span>
                    )}

                    <div className="ml-auto flex items-center gap-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    disabled={disabled}
                                    className="size-7 text-muted-foreground/60 hover:text-foreground rounded-lg"
                                >
                                    <Mic className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voice input</TooltipContent>
                        </Tooltip>

                        {isStreaming ? (
                            <Button
                                variant="default"
                                size="icon-xs"
                                onClick={onStop}
                                className="size-7 rounded-lg bg-foreground hover:bg-foreground/90"
                            >
                                <Square className="size-3 fill-background" />
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="icon-xs"
                                onClick={handleSend}
                                disabled={!canSend}
                                className={cn(
                                    "size-7 rounded-lg transition-all duration-150",
                                    canSend
                                        ? "bg-foreground hover:bg-foreground/90 scale-100"
                                        : "bg-muted text-muted-foreground/40 cursor-not-allowed scale-95"
                                )}
                            >
                                {isStreaming ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    <ArrowUp className="size-3.5" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
                Saige may make mistakes. Consider checking important information.
            </p>
        </div>
    );
}
