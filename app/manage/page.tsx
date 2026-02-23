"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Users, Brain, LayoutDashboard, Sparkles, Settings,
    Plus, Search, MoreHorizontal, FileText, Trash2, Edit3,
    Upload, X, GraduationCap, UserPlus, Globe, Lock, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, ROLES, CourseLevel, UserRole } from "@/lib/manage-data";
import { UserSwitcher } from "@/components/user-switcher";
import { useRBAC } from "@/lib/rbac";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBLesson {
    id: number; title: string; type: string; duration: string; isLocked: boolean;
}
interface DBModule {
    id: number; title: string; description: string; lessons: DBLesson[];
}
interface DBCourse {
    id: number; title: string; subtitle: string; category: string;
    level: string; status: string; thumbnail: string; color: string;
    assignedRoles: string; modules: DBModule[];
    createdAt: string; updatedAt: string;
}
interface DBUser {
    id: number; name: string; email: string; role: string;
    status: string; avatarInitials: string; createdAt: string;
    assignedCourses: Array<{ course: DBCourse }>;
}
interface DBDoc {
    id: number; title: string; type: string; sizeLabel: string;
    status: string; scope: string; tags: string; uploadedAt: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function roleLabel(r: string) {
    const map: Record<string, string> = {
        front_desk: "Front Desk", insurance_billing: "Insurance & Billing",
        assistant: "Assistant", hygiene: "Hygiene", manager: "Manager",
    };
    return map[r] ?? r;
}

function NavItem({ icon, label, active, onClick, badge }: {
    icon: React.ReactNode; label: string; active?: boolean;
    onClick?: () => void; badge?: number;
}) {
    return (
        <button onClick={onClick}
            className={cn("w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors text-left",
                active ? "font-semibold bg-[#eef2fb]" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 font-medium")}
            style={active ? { color: BRAND } : undefined}>
            {icon}
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-white" style={{ background: BRAND }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; text: string; label: string }> = {
        published: { bg: "#DCFCE7", text: "#15803D", label: "Published" },
        draft: { bg: "#FEF3C7", text: "#B45309", label: "Draft" },
        archived: { bg: "#F3F4F6", text: "#6B7280", label: "Archived" },
        active: { bg: "#DCFCE7", text: "#15803D", label: "Active" },
        invited: { bg: "#EEF2FB", text: BRAND, label: "Invited" },
        inactive: { bg: "#F3F4F6", text: "#6B7280", label: "Inactive" },
        indexed: { bg: "#DCFCE7", text: "#15803D", label: "Indexed" },
        processing: { bg: "#FEF3C7", text: "#B45309", label: "Processing" },
        failed: { bg: "#FEE2E2", text: "#DC2626", label: "Failed" },
    };
    const s = map[status] ?? { bg: "#F3F4F6", text: "#6B7280", label: status };
    return (
        <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: s.bg, color: s.text }}>
            {s.label}
        </span>
    );
}

function Spinner() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-zinc-300" />
        </div>
    );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CreateCourseModal({ onClose, onSave }: { onClose: () => void; onSave: (c: DBCourse) => void }) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [category, setCategory] = useState("front-office");
    const [level, setLevel] = useState<CourseLevel>("Beginner");
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [thumbnail, setThumbnail] = useState("📚");
    const [saving, setSaving] = useState(false);
    const emojis = ["📚", "🗂️", "🧾", "💬", "🦷", "🪥", "📊", "🛡️", "🔬", "💡", "🎯", "📋"];
    const selectedCat = CATEGORIES.find(c => c.id === category);

    function toggleRole(r: UserRole) {
        setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    }

    async function handleSave() {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/manage/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(), subtitle: subtitle.trim(), category, level,
                    status, thumbnail, color: selectedCat?.color ?? BRAND,
                    assignedRoles: roles.map(r => r.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")),
                }),
            });
            if (!res.ok) throw new Error("Failed");
            const created: DBCourse = await res.json();
            onSave({ ...created, modules: [] });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <p className="text-[15px] font-bold text-zinc-900">Create New Course</p>
                    <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"><X className="size-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Thumbnail */}
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Thumbnail</label>
                        <div className="flex flex-wrap gap-2">
                            {emojis.map(e => (
                                <button key={e} onClick={() => setThumbnail(e)}
                                    className={cn("size-9 rounded-xl text-xl flex items-center justify-center transition-all", thumbnail === e ? "ring-2 scale-110" : "bg-zinc-50 hover:bg-zinc-100")}
                                    style={thumbnail === e ? { background: `${selectedCat?.color ?? BRAND}15`, outlineColor: selectedCat?.color ?? BRAND } : undefined}
                                >{e}</button>
                            ))}
                        </div>
                    </div>
                    {/* Title */}
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Course Title *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Front Office Mastery"
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    {/* Subtitle */}
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Description</label>
                        <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Brief course description..." rows={2}
                            className="w-full px-3 py-2 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    {/* Category + Level */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Level</label>
                            <select value={level} onChange={e => setLevel(e.target.value as CourseLevel)}
                                className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                                {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Roles */}
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Assign to Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {ROLES.map(r => (
                                <button key={r} onClick={() => toggleRole(r)}
                                    className={cn("text-[12px] font-medium rounded-xl px-3 py-1.5 border transition-all", roles.includes(r) ? "border-transparent text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300")}
                                    style={roles.includes(r) ? { background: BRAND } : undefined}>{r}</button>
                            ))}
                        </div>
                    </div>
                    {/* Status */}
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Status</label>
                        <div className="flex gap-2">
                            {(["draft", "published"] as const).map(s => (
                                <button key={s} onClick={() => setStatus(s)}
                                    className={cn("flex-1 rounded-xl py-2 text-[12px] font-semibold border capitalize transition-all", status === s ? "border-transparent text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300")}
                                    style={status === s ? { background: s === "published" ? "#059669" : "#B45309" } : undefined}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={!title.trim() || saving}
                        className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                        style={{ background: BRAND }}>
                        {saving && <Loader2 className="size-3.5 animate-spin" />}
                        Create Course
                    </button>
                </div>
            </div>
        </div>
    );
}

function CoursesTab() {
    const [courses, setCourses] = useState<DBCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/manage/courses");
            const data = await res.json();
            setCourses(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onSave={c => setCourses(prev => [c, ...prev])} />}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">Courses</h1>
                    <p className="text-[12px] text-zinc-400 mt-0.5">Create and publish learning paths visible to staff</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: BRAND }}>
                    <Plus className="size-4" /> New Course
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Courses", value: courses.length },
                    { label: "Published", value: courses.filter(c => c.status === "published").length },
                    { label: "Drafts", value: courses.filter(c => c.status === "draft").length },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-white border border-zinc-100 px-4 py-4">
                        <p className="text-[22px] font-bold text-zinc-900">{loading ? "—" : s.value}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
                    <Search className="size-3.5 text-zinc-400 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
                        className="flex-1 text-[13px] bg-transparent placeholder:text-zinc-400 focus:outline-none" />
                </div>
                {loading ? <Spinner /> : filtered.length === 0
                    ? <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                        <BookOpen className="size-8 text-zinc-200" />
                        <p className="text-[13px] text-zinc-400">No courses found</p>
                    </div>
                    : filtered.map(c => (
                        <div key={c.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/80 transition-colors group border-b border-zinc-100 last:border-0">
                            <div className="size-9 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${c.color}15` }}>
                                {c.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-800 truncate">{c.title}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{c.subtitle}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-400">
                                <span className="flex items-center gap-1"><BookOpen className="size-3" />{c.modules.length} modules</span>
                                <span className="flex items-center gap-1"><FileText className="size-3" />
                                    {c.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons
                                </span>
                            </div>
                            <StatusBadge status={c.status} />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                                    <Edit3 className="size-3.5" />
                                </button>
                                <button className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSave }: { onClose: () => void; onSave: (u: DBUser) => void }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<UserRole>("Front Desk");
    const [saving, setSaving] = useState(false);

    async function handleInvite() {
        if (!email.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/manage/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), role }),
            });
            if (!res.ok) throw new Error("Failed");
            const user = await res.json();
            onSave({ ...user, assignedCourses: [] });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <p className="text-[15px] font-bold text-zinc-900">Invite Staff Member</p>
                    <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"><X className="size-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith"
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Email Address *</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="staff@practice.dental"
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)}
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
                <div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                    <button onClick={handleInvite} disabled={!email.trim() || saving}
                        className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                        style={{ background: BRAND }}>
                        {saving && <Loader2 className="size-3.5 animate-spin" />}Send Invite
                    </button>
                </div>
            </div>
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/manage/users").then(r => r.json()).then(data => {
            setUsers(data); setLoading(false);
        });
    }, []);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSave={u => setUsers(prev => [u, ...prev])} />}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">Team</h1>
                    <p className="text-[12px] text-zinc-400 mt-0.5">Manage staff access and roles</p>
                </div>
                <button onClick={() => setShowInvite(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: BRAND }}>
                    <UserPlus className="size-4" /> Invite Staff
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Staff", value: users.length },
                    { label: "Active", value: users.filter(u => u.status === "active").length },
                    { label: "Pending Invite", value: users.filter(u => u.status === "invited").length },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-white border border-zinc-100 px-4 py-4">
                        <p className="text-[22px] font-bold text-zinc-900">{loading ? "—" : s.value}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
                    <Search className="size-3.5 text-zinc-400 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
                        className="flex-1 text-[13px] bg-transparent placeholder:text-zinc-400 focus:outline-none" />
                </div>
                {loading ? <Spinner /> : filtered.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/80 transition-colors border-b border-zinc-100 last:border-0 group">
                        <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: BRAND }}>
                            {u.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-800">{u.name}</p>
                            <p className="text-[11px] text-zinc-400">{u.email}</p>
                        </div>
                        <span className="hidden md:block text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                            {roleLabel(u.role)}
                        </span>
                        <span className="hidden sm:block text-[11px] text-zinc-400">
                            {u.assignedCourses.length} courses
                        </span>
                        <StatusBadge status={u.status} />
                        <button className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="size-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Assign Tab ───────────────────────────────────────────────────────────────

function AssignTab() {
    const [users, setUsers] = useState<DBUser[]>([]);
    const [courses, setCourses] = useState<DBCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
    const [assignments, setAssignments] = useState<Record<number, number[]>>({});

    useEffect(() => {
        Promise.all([
            fetch("/api/manage/users").then(r => r.json()),
            fetch("/api/manage/courses").then(r => r.json()),
        ]).then(([u, c]) => {
            setUsers(u);
            setCourses(c);
            const map: Record<number, number[]> = {};
            (u as DBUser[]).forEach(user => {
                map[user.id] = user.assignedCourses.map((a: any) => a.course?.id).filter(Boolean);
            });
            setAssignments(map);
            setLoading(false);
        });
    }, []);

    function toggleAssign(userId: number, courseId: number) {
        setAssignments(prev => {
            const cur = prev[userId] ?? [];
            return { ...prev, [userId]: cur.includes(courseId) ? cur.filter(x => x !== courseId) : [...cur, courseId] };
        });
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-6 gap-5">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">Assign Courses</h1>
                <p className="text-[12px] text-zinc-400 mt-0.5">Select a staff member and assign learning paths</p>
            </div>
            {loading ? <Spinner /> : (
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* Staff list */}
                    <div className="w-64 shrink-0 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-zinc-100">
                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Staff Members</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {users.map(u => (
                                <button key={u.id} onClick={() => setSelectedUser(u)}
                                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-zinc-50 last:border-0",
                                        selectedUser?.id === u.id ? "bg-[#eef2fb]" : "hover:bg-zinc-50")}>
                                    <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: BRAND }}>
                                        {u.avatarInitials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-[12px] font-semibold truncate", selectedUser?.id === u.id ? "text-[#3A63C2]" : "text-zinc-700")}>{u.name}</p>
                                        <p className="text-[10px] text-zinc-400 truncate">{roleLabel(u.role)}</p>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 shrink-0">{(assignments[u.id] ?? []).length}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course assignment panel */}
                    <div className="flex-1 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col">
                        {!selectedUser
                            ? <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                                <GraduationCap className="size-10 text-zinc-200" />
                                <p className="text-[13px] text-zinc-400 font-medium">Select a staff member to assign courses</p>
                            </div>
                            : <>
                                <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-3">
                                    <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: BRAND }}>
                                        {selectedUser.avatarInitials}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-zinc-900">{selectedUser.name}</p>
                                        <p className="text-[11px] text-zinc-400">{roleLabel(selectedUser.role)} · {(assignments[selectedUser.id] ?? []).length} assigned</p>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {courses.map(c => {
                                        const assigned = (assignments[selectedUser.id] ?? []).includes(c.id);
                                        return (
                                            <div key={c.id} onClick={() => toggleAssign(selectedUser.id, c.id)}
                                                className={cn("flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                                                    assigned ? "border-[#3A63C2] bg-[#eef2fb]" : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50")}>
                                                <div className="size-9 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${c.color}15` }}>
                                                    {c.thumbnail}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-[13px] font-semibold truncate", assigned ? "text-[#3A63C2]" : "text-zinc-700")}>{c.title}</p>
                                                    <p className="text-[11px] text-zinc-400">{c.level} · {c.modules.length} modules</p>
                                                </div>
                                                <div className={cn("size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", assigned ? "border-[#3A63C2]" : "border-zinc-300")}>
                                                    {assigned && <div className="size-2.5 rounded-full" style={{ background: BRAND }} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="px-5 py-3 border-t border-zinc-100">
                                    <button className="w-full py-2 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ background: BRAND }}>
                                        Save Assignments
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Train AI Tab ─────────────────────────────────────────────────────────────

function TrainTab() {
    const [docs, setDocs] = useState<DBDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [pasteMode, setPasteMode] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [pasteTitle, setPasteTitle] = useState("");
    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/manage/docs").then(r => r.json()).then(data => {
            setDocs(data); setLoading(false);
        });
    }, []);

    async function handlePasteSave() {
        if (!pasteText.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/manage/docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: pasteTitle.trim() || "Pasted Content", rawContent: pasteText }),
            });
            if (!res.ok) throw new Error("Failed");
            const doc = await res.json();
            setDocs(prev => [doc, ...prev]);
            setPasteText(""); setPasteTitle(""); setPasteMode(false);
        } finally {
            setSaving(false);
        }
    }

    const iconMap: Record<string, string> = { pdf: "📄", docx: "📝", txt: "📃", paste: "📋" };

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">Train AI</h1>
                    <p className="text-[12px] text-zinc-400 mt-0.5">Upload office policies, scripts, and SOPs to power Saige</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPasteMode(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors">
                        <FileText className="size-4" /> Paste Text
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ background: BRAND }}>
                        <Upload className="size-4" /> Upload File
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Documents Indexed", value: docs.filter(d => d.status === "indexed").length },
                    { label: "Processing", value: docs.filter(d => d.status === "processing").length },
                    { label: "Total Uploaded", value: docs.length },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-white border border-zinc-100 px-4 py-4">
                        <p className="text-[22px] font-bold text-zinc-900">{loading ? "—" : s.value}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Paste modal */}
            {pasteMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                            <p className="text-[15px] font-bold text-zinc-900">Paste Office Content</p>
                            <button onClick={() => setPasteMode(false)} className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"><X className="size-4" /></button>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            <div>
                                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Title</label>
                                <input value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} placeholder="e.g. New Patient Phone Script"
                                    className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                    style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Content</label>
                                <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={8}
                                    placeholder="Paste your office policy, script, or SOP here..."
                                    className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none font-mono"
                                    style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-2">
                            <button onClick={() => setPasteMode(false)} className="px-4 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                            <button onClick={handlePasteSave} disabled={!pasteText.trim() || saving}
                                className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                                style={{ background: BRAND }}>
                                {saving && <Loader2 className="size-3.5 animate-spin" />} Index Content
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Drop zone */}
            <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); }}
                className={cn("rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 text-center transition-all cursor-pointer",
                    dragging ? "border-[#3A63C2] bg-[#eef2fb]" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50")}>
                <Upload className={cn("size-8 mb-3 transition-colors", dragging ? "text-[#3A63C2]" : "text-zinc-300")} />
                <p className="text-[13px] font-semibold text-zinc-600">Drop files here to upload</p>
                <p className="text-[11px] text-zinc-400 mt-1">Supports PDF, DOCX, TXT — max 10 MB per file</p>
                <button className="mt-4 px-4 py-1.5 text-[12px] font-semibold rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors">Browse Files</button>
            </div>

            {/* Docs list */}
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                    <p className="text-[12px] font-semibold text-zinc-500">Uploaded Documents</p>
                    <span className="text-[11px] text-zinc-400">{docs.length} files</span>
                </div>
                {loading ? <Spinner /> : docs.map(d => (
                    <div key={d.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/80 transition-colors border-b border-zinc-100 last:border-0 group">
                        <div className="size-8 rounded-xl bg-zinc-50 flex items-center justify-center text-base shrink-0">{iconMap[d.type] ?? "📄"}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-800 truncate">{d.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-zinc-400">{d.sizeLabel}</span>
                                <span className="text-zinc-200">·</span>
                                <span className="text-[10px] text-zinc-400">{d.uploadedAt?.split("T")[0]}</span>
                                {d.scope === "local"
                                    ? <span className="flex items-center gap-0.5 text-[10px] text-zinc-400"><Lock className="size-2.5" />Local</span>
                                    : <span className="flex items-center gap-0.5 text-[10px] text-zinc-400"><Globe className="size-2.5" />Global</span>}
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                            {(d.tags ?? "").split(",").filter(Boolean).map(t => (
                                <span key={t} className="text-[10px] rounded-full px-2 py-0.5 bg-zinc-100 text-zinc-500 font-medium">{t}</span>
                            ))}
                        </div>
                        {d.status === "processing"
                            ? <Loader2 className="size-4 text-amber-500 animate-spin shrink-0" />
                            : <StatusBadge status={d.status} />}
                        <button className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "courses" | "users" | "assign" | "train";

export default function ManagePage() {
    const [tab, setTab] = useState<Tab>("courses");
    const { currentUser, isManager } = useRBAC();

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "courses", label: "Courses", icon: <BookOpen className="size-4" /> },
        { id: "users", label: "Team", icon: <Users className="size-4" /> },
        { id: "assign", label: "Assign", icon: <GraduationCap className="size-4" /> },
        { id: "train", label: "Train AI", icon: <Brain className="size-4" /> },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
            {/* Sidebar */}
            <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white shrink-0">
                <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
                    <span className="text-[15px] font-bold tracking-tight text-zinc-900">Saige</span>
                    <span className="ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: BRAND_LIGHT, color: BRAND }}>Manager</span>
                </div>

                <div className="px-3 pt-4 pb-3">
                    <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
                        <a href="/ask" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-all">
                            <Sparkles className="size-3.5" /> Ask
                        </a>
                        <a href="/learn" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-all">
                            <BookOpen className="size-3.5" /> Learn
                        </a>
                    </div>
                </div>

                <div className="mx-3 h-px bg-zinc-100" />

                <nav className="px-3 pt-3 pb-2 space-y-0.5">
                    <div className="pb-1 px-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Manage</p>
                    </div>
                    {tabs.map(t => (
                        <NavItem key={t.id} icon={t.icon} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
                    ))}
                </nav>

                <div className="mt-auto border-t border-zinc-100 p-3">
                    <UserSwitcher />
                </div>
            </aside>

            {/* Main */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center gap-3 border-b border-zinc-100 bg-white px-6 h-14">
                    <LayoutDashboard className="size-4" style={{ color: BRAND }} />
                    <span className="text-[14px] font-bold text-zinc-800">
                        {tab === "train" ? "Train AI" : tab === "assign" ? "Assign Courses" : tab === "users" ? "Team Management" : "Courses"}
                    </span>
                    <div className="ml-auto">
                        <UserSwitcher />
                    </div>
                </header>

                {tab === "courses" && <CoursesTab />}
                {tab === "users" && <UsersTab />}
                {tab === "assign" && <AssignTab />}
                {tab === "train" && <TrainTab />}
            </main>
        </div>
    );
}
