"use client";

import { Sparkles, BookOpen, LayoutDashboard } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";

/**
 * Role-aware mode switcher for the sidebar.
 * Manager  → Ask | Manage
 * Staff    → Ask | Learn
 */
export function ModeSwitcher() {
    const { isManager } = useRBAC();
    const path = usePathname();

    const tabs = isManager
        ? [
            { href: "/ask", label: "Ask", icon: <Sparkles className="size-3.5" /> },
            { href: "/manage", label: "Manage", icon: <LayoutDashboard className="size-3.5" /> },
        ]
        : [
            { href: "/ask", label: "Ask", icon: <Sparkles className="size-3.5" /> },
            { href: "/learn", label: "Learn", icon: <BookOpen className="size-3.5" /> },
        ];

    return (
        <div className="px-3 pt-4 pb-3">
            <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
                {tabs.map(tab => {
                    const active = path === tab.href || (tab.href !== "/" && path.startsWith(tab.href));
                    return (
                        <a
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] transition-all",
                                active
                                    ? "font-semibold text-zinc-800 bg-white shadow-sm"
                                    : "font-medium text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <span style={active ? { color: BRAND } : undefined}>{tab.icon}</span>
                            {tab.label}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
