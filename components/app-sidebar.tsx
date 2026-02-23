"use client";

import { Sparkles, BookOpen, LayoutDashboard } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { UserSwitcher } from "@/components/user-switcher";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
    manager: { label: "Manager", bg: "#F3E8FF", color: "#7C3AED" },
    front_desk: { label: "Front Desk", bg: BRAND_LIGHT, color: BRAND },
    insurance_billing: { label: "Billing", bg: "#DCFCE7", color: "#15803D" },
    assistant: { label: "Assistant", bg: "#FEF3C7", color: "#B45309" },
    hygiene: { label: "Hygiene", bg: "#E0F2FE", color: "#0891B2" },
};

interface AppSidebarProps {
    /** Active route label shown in the brand badge area — e.g. "Learn", "Manage" */
    badge?: string;
    /** Page-specific nav items (categories, tabs, links…) */
    children?: React.ReactNode;
}

/**
 * Shared sidebar shell used across all pages.
 * Role-aware:
 *   Manager →  Ask | Manage  mode switcher
 *   Staff   →  Ask | Learn   mode switcher
 */
export function AppSidebar({ badge, children }: AppSidebarProps) {
    const { isManager, currentUser } = useRBAC();
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

    const roleBadge = currentUser ? (ROLE_BADGE[currentUser.role] ?? ROLE_BADGE.front_desk) : null;

    return (
        <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
                <span className="text-[15px] font-bold tracking-tight text-zinc-900">Saige</span>
                {roleBadge && (
                    <span
                        className="ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: roleBadge.bg, color: roleBadge.color }}
                    >
                        {roleBadge.label}
                    </span>
                )}
            </div>

            {/* Mode switcher — role-aware */}
            <div className="px-3 pt-4 pb-3">
                <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
                    {tabs.map(tab => {
                        const active =
                            path === tab.href ||
                            (tab.href !== "/" && path.startsWith(tab.href));
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
                                <span style={active ? { color: BRAND } : undefined}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </a>
                        );
                    })}
                </div>
            </div>

            <div className="mx-3 h-px bg-zinc-100" />

            {/* Page-specific nav */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>

            {/* User switcher footer */}
            <div className="border-t border-zinc-100 p-3">
                <UserSwitcher />
            </div>
        </aside>
    );
}
