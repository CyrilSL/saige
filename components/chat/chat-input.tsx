"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowUp,
    Square,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";

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
                    "relative rounded-2xl border border-zinc-200 bg-zinc-50/80 transition-all duration-200",
                    "focus-within:border-[#3A63C2]/40 focus-within:ring-2 focus-within:ring-[#3A63C2]/10"
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
                        "w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14px] leading-relaxed text-zinc-800",
                        "placeholder:text-zinc-400 focus:outline-none",
                        "min-h-[52px] max-h-[200px] overflow-y-auto",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                />

                {/* Bottom toolbar */}
                <div className="flex items-center gap-1 px-3 pb-3 pt-1">
                    {/* Character count (subtle) */}
                    {value.length > 200 && (
                        <span className="text-[11px] text-zinc-400">
                            {value.length}
                        </span>
                    )}

                    <div className="ml-auto flex items-center gap-1.5">
                        {isStreaming ? (
                            <Button
                                variant="default"
                                size="icon-xs"
                                onClick={onStop}
                                className="size-7 rounded-lg text-white hover:opacity-90"
                                style={{ background: BRAND }}
                            >
                                <Square className="size-3 fill-white" />
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
                                        ? "text-white hover:opacity-90 scale-100"
                                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed scale-95"
                                )}
                                style={canSend ? { background: BRAND } : undefined}
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

            <p className="mt-2 text-center text-[11px] text-zinc-400">
                Saige may make mistakes. Consider checking important information.
            </p>
        </div>
    );
}
