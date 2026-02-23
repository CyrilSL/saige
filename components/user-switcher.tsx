"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";

const ROLE_LABELS: Record<string, string> = {
    manager: "Manager",
    front_desk: "Front Desk",
    insurance_billing: "Insurance & Billing",
    assistant: "Assistant",
    hygiene: "Hygiene",
};

const ROLE_COLORS: Record<string, string> = {
    manager: "#7C3AED",
    front_desk: BRAND,
    insurance_billing: "#059669",
    assistant: "#EA580C",
    hygiene: "#0891B2",
};

export function UserSwitcher() {
    const { currentUser, setCurrentUser, allUsers, loadingUsers } = useRBAC();
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Position the portal menu above the button
    function updatePosition() {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const menuHeight = 360; // max approximate height
        const spaceAbove = rect.top;
        const openUpward = spaceAbove > menuHeight || rect.bottom + menuHeight > window.innerHeight;

        setMenuStyle({
            position: "fixed",
            width: 288,
            left: rect.left,
            ...(openUpward
                ? { bottom: window.innerHeight - rect.top + 8 }
                : { top: rect.bottom + 8 }),
            zIndex: 9999,
        });
    }

    function handleToggle() {
        if (!open) updatePosition();
        setOpen(v => !v);
    }

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                btnRef.current && !btnRef.current.contains(target) &&
                menuRef.current && !menuRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    if (loadingUsers || !currentUser) {
        return (
            <div className="h-9 rounded-xl bg-zinc-50 animate-pulse" />
        );
    }

    const roleColor = ROLE_COLORS[currentUser.role] ?? BRAND;

    const dropdownContent = open ? (
        <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
        >
            <div className="px-3 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Switch View As</p>
                <p className="text-[10px] text-zinc-400">{currentUser.practiceName}</p>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                {allUsers.map(u => {
                    const isActive = u.id === currentUser.id;
                    const color = ROLE_COLORS[u.role] ?? BRAND;
                    return (
                        <button
                            key={u.id}
                            onClick={() => { setCurrentUser(u); setOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-zinc-50 last:border-0",
                                isActive ? "bg-[#eef2fb]" : "hover:bg-zinc-50"
                            )}
                        >
                            <div
                                className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ background: color }}
                            >
                                {u.avatarInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-[12px] font-semibold truncate", isActive ? "text-[#3A63C2]" : "text-zinc-700")}>
                                    {u.name}
                                </p>
                                <p className="text-[10px] text-zinc-400 truncate">
                                    {ROLE_LABELS[u.role] ?? u.role}
                                    {u.status === "invited" && (
                                        <span className="ml-1.5 text-amber-500 font-medium">· Invited</span>
                                    )}
                                </p>
                            </div>
                            {isActive && <CheckCircle2 className="size-4 shrink-0" style={{ color: BRAND }} />}
                            {u.role === "manager" && !isActive && (
                                <span className="text-[9px] font-semibold rounded-full px-1.5 py-0.5 text-purple-600 bg-purple-50 shrink-0">MGR</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="px-3 py-2 border-t border-zinc-100 bg-zinc-50">
                <p className="text-[10px] text-zinc-400 text-center">Dev mode — auth coming soon</p>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleToggle}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-50 transition-colors text-left group"
            >
                {/* Avatar */}
                <div
                    className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: roleColor }}
                >
                    {currentUser.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-zinc-800 truncate leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 truncate leading-none">
                        {ROLE_LABELS[currentUser.role]} · {currentUser.practiceName}
                    </p>
                </div>
                <ChevronDown className={cn("size-3.5 text-zinc-400 shrink-0 transition-transform", open && "rotate-180")} />
            </button>

            {/* Portalled dropdown — escapes overflow-hidden containers */}
            {typeof document !== "undefined" && dropdownContent
                ? createPortal(dropdownContent, document.body)
                : null}
        </>
    );
}
