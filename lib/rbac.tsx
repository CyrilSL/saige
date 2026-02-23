"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole = "manager" | "front_desk" | "insurance_billing" | "assistant" | "hygiene";

export interface AppUser {
    id: number;
    name: string;
    email: string;
    role: AppRole;
    status: string;
    avatarInitials: string;
    practiceId: number;
    practiceName: string;
}

interface RBACContextValue {
    currentUser: AppUser | null;
    setCurrentUser: (user: AppUser) => void;
    isManager: boolean;
    isStaff: boolean;
    canAccess: (route: "manage" | "learn" | "ask") => boolean;
    allUsers: AppUser[];
    loadingUsers: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RBACContext = createContext<RBACContextValue | null>(null);

const STORAGE_KEY = "saige_active_user_id";

export function RBACProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUserState] = useState<AppUser | null>(null);
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Load all users on mount
    useEffect(() => {
        fetch("/api/users/all")
            .then(r => r.json())
            .then((users: AppUser[]) => {
                setAllUsers(users);

                // Restore saved user or default to first manager
                const savedId = typeof window !== "undefined"
                    ? parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10)
                    : 0;

                const savedUser = savedId ? users.find(u => u.id === savedId) : null;
                const defaultUser = savedUser ?? users.find(u => u.role === "manager") ?? users[0];
                if (defaultUser) setCurrentUserState(defaultUser);
            })
            .finally(() => setLoadingUsers(false));
    }, []);

    function setCurrentUser(user: AppUser) {
        setCurrentUserState(user);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, String(user.id));
        }
    }

    const isManager = currentUser?.role === "manager";
    const isStaff = currentUser !== null && !isManager;

    function canAccess(route: "manage" | "learn" | "ask") {
        if (!currentUser) return false;
        if (route === "manage") return isManager;
        return true; // learn + ask available to everyone
    }

    return (
        <RBACContext.Provider value={{ currentUser, setCurrentUser, isManager, isStaff, canAccess, allUsers, loadingUsers }}>
            {children}
        </RBACContext.Provider>
    );
}

export function useRBAC() {
    const ctx = useContext(RBACContext);
    if (!ctx) throw new Error("useRBAC must be used inside <RBACProvider>");
    return ctx;
}
