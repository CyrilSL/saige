"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, Building2 } from "lucide-react";
import { useRBAC, AppUser } from "@/lib/rbac";
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
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    if (loadingUsers || !currentUser) return null;

    // Group users by practice
    const grouped: Record<string, { practiceName: string; users: AppUser[] }> = {};
    for (const u of allUsers) {
        const key = String(u.practiceId);
        if (!grouped[key]) grouped[key] = { practiceName: u.practiceName, users: [] };
        grouped[key].users.push(u);
    }

    const roleColor = ROLE_COLORS[currentUser.role] ?? BRAND;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
            >
                {/* Avatar */}
                <div
                    className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: roleColor }}
                >
                    {currentUser.avatarInitials}
                </div>
                <div className="text-left">
                    <p className="text-[12px] font-semibold text-zinc-800 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">
                        {ROLE_LABELS[currentUser.role]} · {currentUser.practiceName}
                    </p>
                </div>
                <ChevronDown className={cn("size-3.5 text-zinc-400 transition-transform ml-1", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-zinc-100">
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Switch View As</p>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {Object.values(grouped).map(({ practiceName, users }) => (
                            <div key={practiceName}>
                                {/* Practice header */}
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border-b border-zinc-100">
                                    <Building2 className="size-3 text-zinc-400" />
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">{practiceName}</p>
                                </div>

                                {users.map(u => {
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
                                                    {ROLE_LABELS[u.role]}
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
                        ))}
                    </div>

                    <div className="px-3 py-2.5 border-t border-zinc-100 bg-zinc-50">
                        <p className="text-[10px] text-zinc-400 text-center">Switching users is for development only — auth coming soon</p>
                    </div>
                </div>
            )}
        </div>
    );
}
