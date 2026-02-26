"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Users, Brain, Sparkles, LayoutDashboard,
    Plus, Search, FileText, Trash2, Edit3,
    Upload, X, GraduationCap, UserPlus, Globe, Lock, Loader2,
    ClipboardList, ArrowLeft, CheckCircle2, Eye, EyeOff, Save,
    ChevronDown, ChevronUp, Shield, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, PREDEFINED_ROLES } from "@/lib/constants";
import { AppSidebar } from "@/components/app-sidebar";
import { useRBAC } from "@/lib/rbac";

const BRAND = "#3A63C2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBLesson {
    id: number; title: string; type: string; duration: string; isLocked: boolean;
}
interface DBModule {
    id: number; title: string; description: string; lessons: DBLesson[];
}
interface DBCourse {
    id: number; title: string; subtitle: string; category: string;
    status: string; thumbnail: string; color: string;
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
interface DBRole {
    id: number; name: string; value: string; color: string; createdAt: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function roleLabel(r: string) {
    if (!r) return "";
    const map: Record<string, string> = {
        front_desk: "Front Desk", insurance_billing: "Insurance & Billing",
        assistant: "Assistant", hygiene: "Hygiene", manager: "Manager",
    };
    return r.split(",").map(rm => map[rm.trim()] ?? rm.trim().replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())).join(", ");
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
    if (status === "active") return null;
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

// ─── Quick-create Course Modal ────────────────────────────────────────────────

function CreateCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: DBCourse) => void }) {
    const [title, setTitle] = useState("");
    const [thumbnail, setThumbnail] = useState("📚");
    const [category, setCategory] = useState("front-office");
    const [saving, setSaving] = useState(false);
    const emojis = ["📚", "🗂️", "🧾", "💬", "🦷", "🪥", "📊", "🛡️", "🔬", "💡", "🎯", "📋"];
    const selectedCat = CATEGORIES.find(c => c.id === category);

    async function handleCreate() {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/manage/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), subtitle: "", category, status: "draft", thumbnail, color: selectedCat?.color ?? BRAND, assignedRoles: [] }),
            });
            if (!res.ok) throw new Error("Failed");
            onCreated(await res.json());
        } finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                    <p className="text-[15px] font-bold text-zinc-900">New Course</p>
                    <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"><X className="size-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-4">
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {emojis.map(e => (
                                <button key={e} onClick={() => setThumbnail(e)}
                                    className={cn("size-9 rounded-xl text-xl flex items-center justify-center transition-all",
                                        thumbnail === e ? "ring-2 scale-110" : "bg-zinc-50 hover:bg-zinc-100")}
                                    style={thumbnail === e ? { background: `${selectedCat?.color ?? BRAND}15`, outlineColor: selectedCat?.color ?? BRAND } : undefined}
                                >{e}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Course Title *</label>
                        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
                            placeholder="e.g. Front Office Mastery"
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={!title.trim() || saving}
                        className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                        style={{ background: BRAND }}>
                        {saving && <Loader2 className="size-3.5 animate-spin" />}
                        Create & Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Inline Question Card ─────────────────────────────────────────────────────

interface QuestionDraft {
    _id: string;
    text: string;
    optionA: string; optionB: string; optionC: string; optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    explanation: string;
}
interface QnDraft {
    id?: number;
    title: string; description: string; passingScore: number;
    questions: QuestionDraft[];
}
const OPT_LABELS = ["A", "B", "C", "D"] as const;
function emptyQ(): QuestionDraft {
    return { _id: crypto.randomUUID(), text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", explanation: "" };
}
function emptyQn(courseTitle: string, count: number): QnDraft { return { title: `${courseTitle} Question Set ${count + 1}`, description: "", passingScore: 70, questions: [emptyQ()] }; }

function InlineQuestionCard({ q, index, onChange, onDelete, isOnly }: {
    q: QuestionDraft; index: number;
    onChange: (u: QuestionDraft) => void;
    onDelete: () => void; isOnly: boolean;
}) {
    const [open, setOpen] = useState(true);
    const complete = q.text.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim();
    return (
        <div className={cn("rounded-xl border bg-white overflow-hidden", complete ? "border-zinc-200" : "border-amber-200")}>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left" onClick={() => setOpen(v => !v)}>
                <span className={cn("size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    complete ? "bg-[#eef2fb] text-[#3A63C2]" : "bg-amber-100 text-amber-600")}>{index + 1}</span>
                <p className="flex-1 text-[13px] font-medium text-zinc-700 truncate">
                    {q.text.trim() || <span className="text-zinc-300 italic">Question text…</span>}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                    {!isOnly && <span onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="size-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-colors">
                        <Trash2 className="size-3.5" /></span>}
                    {open ? <ChevronUp className="size-4 text-zinc-300" /> : <ChevronDown className="size-4 text-zinc-300" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-100">
                    <textarea placeholder="Enter your question…" value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
                        className="w-full text-[13px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties} rows={2} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OPT_LABELS.map(opt => {
                            const key = `option${opt}` as keyof QuestionDraft;
                            const isCorrect = q.correctOption === opt;
                            return (
                                <div key={opt} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                                    isCorrect ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50")}>
                                    <button type="button" onClick={() => onChange({ ...q, correctOption: opt })}
                                        className={cn("size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                            isCorrect ? "border-emerald-500 bg-emerald-500" : "border-zinc-300 hover:border-emerald-400")}>
                                        {isCorrect && <CheckCircle2 className="size-3 text-white" />}
                                    </button>
                                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">{opt}</span>
                                    <input placeholder={`Option ${opt}`} value={q[key] as string}
                                        onChange={e => onChange({ ...q, [key]: e.target.value })}
                                        className="flex-1 text-[12px] bg-transparent focus:outline-none placeholder:text-zinc-300 text-zinc-700 min-w-0" />
                                </div>
                            );
                        })}
                    </div>
                    <input placeholder="Explanation (optional) — shown after questions" value={q.explanation}
                        onChange={e => onChange({ ...q, explanation: e.target.value })}
                        className="w-full text-[12px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent text-zinc-500"
                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                </div>
            )}
        </div>
    );
}

// ─── Inline Quiz Editor ───────────────────────────────────────────────────────

function InlineQuizEditor({ courseId, courseTitle }: { courseId: number, courseTitle: string }) {
    const [saved, setSaved] = useState<Array<{ id: number; title: string; description: string; passingScore: number; questions: any[] }>>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState<QnDraft | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/manage/questionnaires?courseId=${courseId}`)
            .then(r => r.json()).then(d => setSaved(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, [courseId]);

    function updateQ(i: number, u: QuestionDraft) {
        if (!draft) return;
        const qs = [...draft.questions]; qs[i] = u; setDraft({ ...draft, questions: qs });
    }

    async function saveQn() {
        if (!draft) return;
        setSaving(true);
        try {
            const payload = { courseId, title: draft.title, description: draft.description, passingScore: draft.passingScore, questions: draft.questions };
            const res = draft.id
                ? await fetch(`/api/manage/questionnaires/${draft.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                : await fetch("/api/manage/questionnaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const result = await res.json();
            setSaved(p => draft.id ? p.map(s => s.id === result.id ? result : s) : [result, ...p]);
            setDraft(null);
        } finally { setSaving(false); }
    }

    async function deleteQn(id: number) {
        setDeletingId(id);
        await fetch(`/api/manage/questionnaires/${id}`, { method: "DELETE" });
        setSaved(p => p.filter(s => s.id !== id));
        setDeletingId(null);
    }

    const isValid = draft && draft.questions.every(q =>
        q.text.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());

    if (draft) return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-zinc-800">{draft.id ? "Edit Questions" : "New Questions"}</h3>
                <button onClick={() => setDraft(null)} className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors">← Back to questions</button>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <p className="flex-1 text-[13px] font-medium text-zinc-700">{draft.title}</p>
                    <div className="w-24">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-1">Pass %</label>
                        <input type="number" min={0} max={100} value={draft.passingScore}
                            onChange={e => setDraft({ ...draft, passingScore: parseInt(e.target.value) || 70 })}
                            className="w-full h-9 px-3 text-[13px] rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                </div>
            </div>
            <div className="space-y-2.5">
                {draft.questions.map((q, i) => (
                    <InlineQuestionCard key={q._id} q={q} index={i}
                        onChange={u => updateQ(i, u)}
                        onDelete={() => setDraft({ ...draft, questions: draft.questions.filter((_, j) => j !== i) })}
                        isOnly={draft.questions.length === 1} />
                ))}
                <button onClick={() => setDraft({ ...draft, questions: [...draft.questions, emptyQ()] })}
                    className="w-full rounded-xl border border-dashed border-zinc-300 py-2.5 text-[13px] font-medium text-zinc-400 hover:border-[#3A63C2] hover:text-[#3A63C2] hover:bg-[#eef2fb] transition-all flex items-center justify-center gap-1.5">
                    <Plus className="size-4" /> Add Question
                </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setDraft(null)} className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                <button onClick={saveQn} disabled={!isValid || saving}
                    className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: BRAND }}>
                    <Save className="size-3.5" />{saving ? "Saving…" : (draft.id ? "Save Changes" : "Create Questions")}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-zinc-800">Questions <span className="text-zinc-400 font-normal text-[12px]">({saved.length})</span></h3>
                <button onClick={() => setDraft(emptyQn(courseTitle, saved.length))}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: BRAND }}>
                    <Plus className="size-3.5" /> New Questions
                </button>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="size-5 text-zinc-300 animate-spin" /></div>
            ) : saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50">
                    <ClipboardList className="size-8 text-zinc-200" />
                    <p className="text-[13px] text-zinc-400 font-medium">No questions yet</p>
                    <p className="text-[12px] text-zinc-300">Create your first question set for this course</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {saved.map(qn => (
                        <div key={qn.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 group">
                            <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eef2fb" }}>
                                <ClipboardList className="size-4" style={{ color: BRAND }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-800 truncate">{qn.title}</p>
                                <p className="text-[11px] text-zinc-400">{qn.questions.length} questions · Pass at {qn.passingScore}%</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setDraft({
                                    id: qn.id, title: qn.title, description: qn.description, passingScore: qn.passingScore,
                                    questions: qn.questions.map((q: any) => ({ _id: String(q.id), text: q.text, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, explanation: q.explanation }))
                                })} className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-[#3A63C2] hover:text-[#3A63C2] transition-all">Edit</button>
                                <button onClick={() => deleteQn(qn.id)} disabled={deletingId === qn.id}
                                    className="size-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-colors disabled:opacity-50">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Full-screen Course Editor ────────────────────────────────────────────────

function CourseEditor({ course: initial, onBack, onDelete }: {
    course: DBCourse;
    onBack: (updated: DBCourse) => void;
    onDelete: (id: number) => void;
}) {
    const [title, setTitle] = useState(initial.title);
    const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
    const [category, setCategory] = useState(initial.category);
    const [thumbnail, setThumbnail] = useState(initial.thumbnail ?? "📚");
    const [roles, setRoles] = useState<string[]>(
        initial.assignedRoles ? initial.assignedRoles.split(",").map(r => r.trim()).filter(Boolean) : []
    );
    const [customRoleInput, setCustomRoleInput] = useState("");
    const [status, setStatus] = useState<"draft" | "published">((initial.status as any) ?? "draft");
    const [saving, setSaving] = useState(false);
    const [savedFlag, setSavedFlag] = useState(false);
    const emojis = ["📚", "🗂️", "🧾", "💬", "🦷", "🪥", "📊", "🛡️", "🔬", "💡", "🎯", "📋"];
    const selectedCat = CATEGORIES.find(c => c.id === category);

    function toggleRole(v: string) { setRoles(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]); setSavedFlag(false); }
    function addCustomRole() {
        const v = customRoleInput.trim().toLowerCase().replace(/\s+/g, "_");
        if (!v || roles.includes(v)) { setCustomRoleInput(""); return; }
        setRoles(prev => [...prev, v]); setCustomRoleInput(""); setSavedFlag(false);
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch(`/api/manage/courses/${initial.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, subtitle, category, status, thumbnail, color: selectedCat?.color ?? BRAND, assignedRoles: roles }),
            });
            if (res.ok) { setSavedFlag(true); setTimeout(() => setSavedFlag(false), 2000); }
        } finally { setSaving(false); }
    }


    async function handleDelete() {
        if (!confirm("Delete this course? This cannot be undone.")) return;
        await fetch(`/api/manage/courses/${initial.id}`, { method: "DELETE" });
        onDelete(initial.id);
    }

    const hasChanges =
        title !== initial.title ||
        subtitle !== (initial.subtitle ?? "") ||
        category !== initial.category ||
        thumbnail !== (initial.thumbnail ?? "📚") ||
        roles.join(",") !== (initial.assignedRoles ?? "") ||
        status !== initial.status;

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-zinc-100 shrink-0">
                <button
                    onClick={() => onBack({ ...initial, title, subtitle, category, status, thumbnail, color: selectedCat?.color ?? BRAND, assignedRoles: roles.join(",") })}
                    className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-800 transition-colors">
                    <ArrowLeft className="size-4" /> Courses
                </button>
                <span className="text-zinc-200">/</span>
                <span className="text-[13px] font-semibold text-zinc-800 truncate max-w-[220px]">{title || "Untitled"}</span>
                <div className="flex-1" />
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as any); setSavedFlag(false); }}
                    className={cn(
                        "h-9 px-4 pr-8 text-[13px] font-semibold rounded-xl border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2",
                        status === "published"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    )}
                    style={{
                        "--tw-ring-color": BRAND,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.7rem center",
                        backgroundSize: "0.8em"
                    } as React.CSSProperties}
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
                <button onClick={save} disabled={saving || (!hasChanges && !savedFlag)}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: BRAND }}>
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : savedFlag ? <CheckCircle2 className="size-3.5" /> : <Save className="size-3.5" />}
                    {saving ? "Saving…" : savedFlag ? "Saved!" : "Save Changes"}
                </button>
            </div>

            {/* Two-column body */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left: Settings */}
                <div className="w-80 shrink-0 border-r border-zinc-100 overflow-y-auto px-5 py-5 space-y-5 bg-white">
                    <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {emojis.map(e => (
                                <button key={e} onClick={() => { setThumbnail(e); setSavedFlag(false); }}
                                    className={cn("size-9 rounded-xl text-xl flex items-center justify-center transition-all",
                                        thumbnail === e ? "ring-2 scale-110" : "bg-zinc-50 hover:bg-zinc-100")}
                                    style={thumbnail === e ? { background: `${selectedCat?.color ?? BRAND}15`, outlineColor: selectedCat?.color ?? BRAND } : undefined}
                                >{e}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-1.5">Course Title</label>
                        <input value={title} onChange={e => { setTitle(e.target.value); setSavedFlag(false); }} placeholder="Course title"
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-1.5">Description</label>
                        <textarea value={subtitle} onChange={e => { setSubtitle(e.target.value); setSavedFlag(false); }}
                            placeholder="Brief course description…" rows={3}
                            className="w-full px-3 py-2 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-1.5">Learning Category</label>
                        <select value={category} onChange={e => { setCategory(e.target.value); setSavedFlag(false); }}
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block mb-2">Visible to Roles</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {PREDEFINED_ROLES.map(r => {
                                const active = roles.includes(r.value);
                                return (
                                    <button key={r.value} onClick={() => toggleRole(r.value)}
                                        className={cn("text-[11px] font-medium rounded-lg px-2.5 py-1 border transition-all",
                                            active ? "border-transparent text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300")}
                                        style={active ? { background: BRAND } : undefined}>{r.label}</button>
                                );
                            })}
                            {roles.filter(r => !PREDEFINED_ROLES.map(p => p.value).includes(r)).map(r => (
                                <button key={r} onClick={() => toggleRole(r)}
                                    className="text-[11px] font-medium rounded-lg px-2.5 py-1 border-transparent text-white flex items-center gap-1"
                                    style={{ background: "#7C3AED" }}>
                                    {r.replace(/_/g, " ")} <X className="size-2.5" />
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <input value={customRoleInput} onChange={e => setCustomRoleInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addCustomRole()}
                                placeholder="Custom role…"
                                className="flex-1 h-8 px-3 text-[12px] rounded-lg border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                            <button onClick={addCustomRole}
                                className="h-8 px-2.5 font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                                style={{ background: BRAND }}><Plus className="size-3.5" /></button>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-zinc-100">
                        <button onClick={handleDelete}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 border border-zinc-100 hover:border-red-200 transition-all">
                            <Trash2 className="size-3.5" /> Delete Course
                        </button>
                    </div>
                </div>

                {/* Right: Quiz editor */}
                <div className="flex-1 overflow-y-auto px-6 py-5 bg-[#F8F9FC]">
                    <InlineQuizEditor courseId={initial.id} courseTitle={title} />
                </div>
            </div>
        </div>
    );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab() {
    const [courses, setCourses] = useState<DBCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<DBCourse | null>(null);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try { const res = await fetch("/api/manage/courses"); setCourses(await res.json()); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    if (selectedCourse) {
        return (
            <CourseEditor
                course={selectedCourse}
                onBack={updated => { setCourses(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)); setSelectedCourse(null); }}
                onDelete={id => { setCourses(prev => prev.filter(c => c.id !== id)); setSelectedCourse(null); }}
            />
        );
    }

    const filtered = (Array.isArray(courses) ? courses : []).filter(c => (c.title || "").toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {showCreate && (
                <CreateCourseModal
                    onClose={() => setShowCreate(false)}
                    onCreated={c => { setCourses(prev => [c, ...prev]); setShowCreate(false); setSelectedCourse(c); }}
                />
            )}
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
                        <div key={c.id}
                            className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/80 transition-colors cursor-pointer group border-b border-zinc-100 last:border-0"
                            onClick={() => setSelectedCourse(c)}>
                            <div className="size-9 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${c.color}15` }}>
                                {c.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-800 truncate group-hover:text-[#3A63C2] transition-colors">{c.title}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{c.subtitle || "No description"}</p>
                            </div>
                            <div className="hidden md:flex items-center gap-1 flex-wrap max-w-[160px]">
                                {(c.assignedRoles ?? "").split(",").filter(Boolean).map(r => (
                                    <span key={r} className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-[#eef2fb] text-[#3A63C2]">
                                        {r.replace(/_/g, " ")}
                                    </span>
                                ))}
                            </div>
                            <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-400">
                                {c.modules.length > 0 && <span className="flex items-center gap-1"><BookOpen className="size-3" />{c.modules.length} modules</span>}
                                {c.modules.reduce((a, m) => a + m.lessons.length, 0) > 0 && (
                                    <span className="flex items-center gap-1"><FileText className="size-3" />{c.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons</span>
                                )}
                            </div>
                            <StatusBadge status={c.status} />
                            <ArrowLeft className="size-4 text-zinc-200 group-hover:text-[#3A63C2] rotate-180 transition-colors shrink-0" />
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
    const [role, setRole] = useState(PREDEFINED_ROLES[0].value);
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
                        <select value={role} onChange={e => setRole(e.target.value)}
                            className="w-full h-9 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                            {PREDEFINED_ROLES.map(r => <option key={r.value} value={r.label}>{r.label}</option>)}
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

function TeamTab() {
    const [subTab, setSubTab] = useState<"members" | "roles">("members");
    const [users, setUsers] = useState<DBUser[]>([]);
    const [courses, setCourses] = useState<DBCourse[]>([]);
    const [dbRoles, setDbRoles] = useState<DBRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [search, setSearch] = useState("");

    // Roles Tab State
    const [roleSearch, setRoleSearch] = useState("");
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleColor, setNewRoleColor] = useState("#3A63C2");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    // Editing state for selected user
    const [editedRoles, setEditedRoles] = useState<string[]>([]);
    const [editedCourses, setEditedCourses] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [savedFlag, setSavedFlag] = useState(false);

    const ROLE_COLORS = ["#3A63C2", "#059669", "#DC2626", "#0891B2", "#EA580C", "#7C3AED", "#DB2777", "#CA8A04"];

    useEffect(() => {
        Promise.all([
            fetch("/api/manage/users").then(r => r.json()),
            fetch("/api/manage/courses").then(r => r.json()),
            fetch("/api/manage/roles").then(r => r.json()).catch(() => [])
        ]).then(([u, c, r]) => {
            setUsers(u);
            setCourses(c);
            setDbRoles(Array.isArray(r) ? r : []);
            setLoading(false);
        });
    }, []);

    const allRoles = [
        ...PREDEFINED_ROLES,
        ...dbRoles.map(r => ({ label: r.name, value: r.value, color: r.color }))
    ];

    function getRoleColor(value: string) {
        const dbRole = dbRoles.find(r => r.value === value);
        if (dbRole?.color) return dbRole.color;
        const idx = PREDEFINED_ROLES.findIndex(r => r.value === value);
        return idx >= 0 ? ROLE_COLORS[idx % ROLE_COLORS.length] : BRAND;
    }

    function membersForRole(roleValue: string) {
        return (Array.isArray(users) ? users : []).filter(u =>
            (u.role ?? "").split(",").map(r => r.trim()).includes(roleValue)
        );
    }

    function coursesForRole(roleValue: string) {
        return courses.filter(c => {
            const roles = (c.assignedRoles || "").split(",").map(r => r.trim()).filter(Boolean);
            return roles.includes(roleValue);
        });
    }

    // Load initial states when user selected
    useEffect(() => {
        if (selectedUser) {
            setEditedRoles((selectedUser.role ?? "").split(",").filter(Boolean));
            setEditedCourses(
                (selectedUser.assignedCourses ?? []).map((ac: any) => ac.courseId ?? ac.course?.id).filter(Boolean)
            );
            setSavedFlag(false);
        }
    }, [selectedUser]);

    const filteredUsers = (Array.isArray(users) ? users : []).filter(u =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase())
    );

    const filteredRoles = allRoles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()));

    function toggleRole(r: string) {
        setEditedRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
        setSavedFlag(false);
    }

    function toggleCourse(courseId: number) {
        setEditedCourses(prev => prev.includes(courseId) ? prev.filter(x => x !== courseId) : [...prev, courseId]);
        setSavedFlag(false);
    }

    const hasChanges = selectedUser && (
        editedRoles.join(",") !== (selectedUser.role ?? "") ||
        JSON.stringify(editedCourses.sort()) !== JSON.stringify(
            (selectedUser.assignedCourses ?? []).map((ac: any) => ac.courseId ?? ac.course?.id).filter(Boolean).sort()
        )
    );

    async function saveProfile() {
        if (!selectedUser) return;
        setSaving(true);
        try {
            const roleStr = editedRoles.join(",") || "front_desk";
            const res = await fetch(`/api/manage/users/${selectedUser.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: roleStr, assignedCourses: editedCourses })
            });
            if (res.ok) {
                // Refetch users to get updated assignment data with progress
                const refreshed = await fetch("/api/manage/users").then(r => r.json());
                setUsers(refreshed);
                const updated = refreshed.find((u: DBUser) => u.id === selectedUser.id);
                if (updated) setSelectedUser(updated);
                setSavedFlag(true); setTimeout(() => setSavedFlag(false), 2000);
            }
        } finally { setSaving(false); }
    }

    async function createNewRole() {
        if (!newRoleName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/manage/roles", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newRoleName, color: newRoleColor })
            });
            if (res.ok) {
                const role = await res.json();
                setDbRoles(prev => [role, ...prev]);
                setNewRoleName("");
                setNewRoleColor("#3A63C2");
            } else {
                alert("Failed to create role. Maybe it already exists.");
            }
        } finally {
            setSaving(false);
        }
    }

    async function deleteRole(roleId: number, roleVal: string) {
        if (!confirm("Remove this role?")) return;
        await fetch(`/api/manage/roles/${roleId}`, { method: "DELETE" });
        setDbRoles(prev => prev.filter(r => r.id !== roleId));
        if (selectedRole === roleVal) setSelectedRole(null);
    }

    // Published courses only for assignment
    const publishedCourses = courses.filter(c => c.status === "published");

    return (
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-6 gap-5">
            {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSave={u => setUsers(prev => [u, ...prev])} />}

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">Team / Roles</h1>
                    <p className="text-[12px] text-zinc-400 mt-0.5">Manage staff, roles, and course assignments</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100/60 p-1 rounded-xl">
                        <button onClick={() => setSubTab("members")} className={cn("px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all", subTab === "members" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>Team Members</button>
                        <button onClick={() => setSubTab("roles")} className={cn("px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all", subTab === "roles" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>Practice Roles</button>
                    </div>
                    {subTab === "members" && (
                        <button onClick={() => setShowInvite(true)}
                            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                            style={{ background: BRAND }}>
                            <UserPlus className="size-3.5" /> Invite
                        </button>
                    )}
                </div>
            </div>

            {/* Stats row */}
            {!loading && (
                <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-3.5">
                        <p className="text-[20px] font-bold text-zinc-900">{users.length}</p>
                        <p className="text-[11px] text-zinc-400 font-medium">Total Staff</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-3.5">
                        <p className="text-[20px] font-bold text-emerald-600">{users.filter(u => u.status === "active").length}</p>
                        <p className="text-[11px] text-zinc-400 font-medium">Active</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-3.5">
                        <p className="text-[20px] font-bold" style={{ color: BRAND }}>{users.filter(u => u.status === "invited").length}</p>
                        <p className="text-[11px] text-zinc-400 font-medium">Invited</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-3.5">
                        <p className="text-[20px] font-bold text-zinc-900">{allRoles.length}</p>
                        <p className="text-[11px] text-zinc-400 font-medium">Roles</p>
                    </div>
                </div>
            )}

            {loading ? <Spinner /> : subTab === "roles" ? (
                /* ─── Roles Sub-Tab ─────────────────────────────────────────────── */
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* Role list */}
                    <div className="w-[320px] shrink-0 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col">
                        <div className="px-3 py-3 border-b border-zinc-100 shrink-0">
                            <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-2 py-1.5 border border-zinc-200 focus-within:ring-2 focus-within:border-transparent transition-all" style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                                <Search className="size-3.5 text-zinc-400 shrink-0 ml-0.5" />
                                <input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search roles..." className="flex-1 text-[12px] bg-transparent placeholder:text-zinc-400 focus:outline-none h-6" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredRoles.map(r => {
                                const memberCount = membersForRole(r.value).length;
                                const courseCount = coursesForRole(r.value).length;
                                const color = getRoleColor(r.value);
                                const isCustom = !!dbRoles.find(db => db.value === r.value);
                                return (
                                    <button key={r.value}
                                        onClick={() => setSelectedRole(selectedRole === r.value ? null : r.value)}
                                        className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all",
                                            selectedRole === r.value ? "bg-[#eef2fb] border border-blue-100" : "hover:bg-zinc-50 border border-transparent")}>
                                        <div className="size-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: color }}>
                                            {r.label.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-[13px] font-semibold truncate", selectedRole === r.value ? "text-[#3A63C2]" : "text-zinc-800")}>{r.label}</p>
                                            <p className="text-[10px] text-zinc-400">{memberCount} member{memberCount !== 1 ? "s" : ""} · {courseCount} course{courseCount !== 1 ? "s" : ""}</p>
                                        </div>
                                        {isCustom && (
                                            <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 rounded-full px-1.5 py-0.5">Custom</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Role detail / create panel */}
                    <div className="flex-1 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col min-w-0">
                        {selectedRole ? (() => {
                            const role = allRoles.find(r => r.value === selectedRole);
                            if (!role) return null;
                            const members = membersForRole(selectedRole);
                            const roleCourses = coursesForRole(selectedRole);
                            const color = getRoleColor(selectedRole);
                            const isCustom = !!dbRoles.find(db => db.value === selectedRole);

                            return (
                                <div className="flex-1 flex flex-col min-h-0">
                                    {/* Role header */}
                                    <div className="px-6 py-5 border-b border-zinc-100 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold" style={{ background: color }}>
                                                    {role.label.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-[16px] font-bold text-zinc-900">{role.label}</h2>
                                                    <p className="text-[12px] text-zinc-400">{isCustom ? "Custom role" : "Default role"} · {members.length} member{members.length !== 1 ? "s" : ""}</p>
                                                </div>
                                            </div>
                                            {isCustom && (
                                                <button onClick={() => deleteRole(dbRoles.find(db => db.value === selectedRole)!.id, selectedRole)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="size-3.5" /> Delete Role
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                        {/* Members in this role */}
                                        <section>
                                            <h3 className="text-[13px] font-bold text-zinc-900 mb-3 flex items-center gap-1.5">
                                                <Users className="size-4 text-zinc-400" /> Members ({members.length})
                                            </h3>
                                            {members.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-6 text-center">
                                                    <p className="text-[12px] text-zinc-400">No members assigned to this role yet</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {members.map(m => (
                                                        <div key={m.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100">
                                                            <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: color }}>
                                                                {m.avatarInitials}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[12px] font-semibold text-zinc-800 truncate">{m.name}</p>
                                                                <p className="text-[10px] text-zinc-400 truncate">{m.email}</p>
                                                            </div>
                                                            <StatusBadge status={m.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {/* Courses assigned to this role */}
                                        <section>
                                            <h3 className="text-[13px] font-bold text-zinc-900 mb-3 flex items-center gap-1.5">
                                                <BookOpen className="size-4 text-zinc-400" /> Courses ({roleCourses.length})
                                            </h3>
                                            {roleCourses.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-6 text-center">
                                                    <p className="text-[12px] text-zinc-400">No courses assigned to this role</p>
                                                    <p className="text-[11px] text-zinc-300 mt-1">Assign courses in the Courses tab</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {roleCourses.map(c => (
                                                        <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100">
                                                            <div className="size-8 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${c.color}15` }}>
                                                                {c.thumbnail}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-semibold text-zinc-800 truncate">{c.title}</p>
                                                                <p className="text-[10px] text-zinc-400">{c.modules?.length ?? 0} modules · {(c.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0)} lessons</p>
                                                            </div>
                                                            <StatusBadge status={c.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                </div>
                            );
                        })() : (
                            /* Create new role form */
                            <div className="flex-1 flex flex-col items-center justify-center px-6">
                                <div className="w-full max-w-sm space-y-6">
                                    <div className="text-center">
                                        <div className="size-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${newRoleColor}15` }}>
                                            <Shield className="size-6" style={{ color: newRoleColor }} />
                                        </div>
                                        <h3 className="text-[16px] font-bold text-zinc-900">Create New Role</h3>
                                        <p className="text-[12px] text-zinc-400 mt-1">Roles organize staff and control course access</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Role Name</label>
                                            <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === "Enter" && createNewRole()} placeholder="e.g. Lead Assistant"
                                                className="w-full h-10 px-3 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties} />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Color</label>
                                            <div className="flex gap-2">
                                                {ROLE_COLORS.map(c => (
                                                    <button key={c} onClick={() => setNewRoleColor(c)}
                                                        className={cn("size-8 rounded-full transition-all", newRoleColor === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105")}
                                                        style={{ background: c, "--tw-ring-color": c } as React.CSSProperties} />
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={createNewRole} disabled={saving || !newRoleName.trim()}
                                            className="w-full flex justify-center items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                            style={{ background: BRAND }}>
                                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create Role
                                        </button>
                                    </div>

                                    {/* Hint: select a role */}
                                    <div className="pt-4 border-t border-zinc-100 text-center">
                                        <p className="text-[11px] text-zinc-400">Select a role on the left to view its members and courses</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ─── Members Sub-Tab ───────────────────────────────────────────── */
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* User list */}
                    <div className="w-[300px] shrink-0 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col">
                        <div className="px-3 py-3 border-b border-zinc-100 shrink-0">
                            <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-2 py-1.5 border border-zinc-200 focus-within:ring-2 focus-within:border-transparent transition-all" style={{ "--tw-ring-color": BRAND } as React.CSSProperties}>
                                <Search className="size-3.5 text-zinc-400 shrink-0 ml-0.5" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="flex-1 text-[12px] bg-transparent placeholder:text-zinc-400 focus:outline-none h-6" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            {filteredUsers.length === 0 ? (
                                <div className="py-8 text-center px-4">
                                    <p className="text-[12px] text-zinc-400">No staff found</p>
                                </div>
                            ) : (
                                filteredUsers.map(u => {
                                    const userRoles = (u.role ?? "").split(",").filter(Boolean);
                                    const primaryColor = getRoleColor(userRoles[0] ?? "front_desk");
                                    return (
                                        <button key={u.id} onClick={() => setSelectedUser(u)}
                                            className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-zinc-50 last:border-0",
                                                selectedUser?.id === u.id ? "bg-[#eef2fb]" : "hover:bg-zinc-50")}>
                                            <div className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: primaryColor }}>
                                                {u.avatarInitials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-[12px] font-semibold truncate", selectedUser?.id === u.id ? "text-[#3A63C2]" : "text-zinc-800")}>{u.name}</p>
                                                <p className="text-[10px] text-zinc-400 truncate">{roleLabel(u.role)}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5">
                                                {(u.assignedCourses?.length ?? 0) > 0 && (
                                                    <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 bg-blue-50 text-[#3A63C2]">
                                                        {u.assignedCourses.length}
                                                    </span>
                                                )}
                                                <StatusBadge status={u.status} />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* User detail panel */}
                    <div className="flex-1 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col min-w-0">
                        {!selectedUser ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="size-14 rounded-2xl bg-zinc-50 flex items-center justify-center">
                                    <Users className="size-7 text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-zinc-800">Select a team member</p>
                                    <p className="text-[12px] text-zinc-400 mt-1">Manage roles and assign training courses</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* User header */}
                                <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30 shrink-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full flex items-center justify-center text-[15px] font-bold text-white shadow-sm shrink-0" style={{ background: getRoleColor(editedRoles[0] ?? "front_desk") }}>
                                                {selectedUser.avatarInitials}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-[16px] font-bold text-zinc-900 truncate">{selectedUser.name}</h2>
                                                <p className="text-[12px] text-zinc-500 truncate">{selectedUser.email}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <StatusBadge status={selectedUser.status} />
                                                    <span className="text-[10px] text-zinc-300">·</span>
                                                    <span className="text-[10px] text-zinc-400">Joined {selectedUser.createdAt?.split("T")[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={saveProfile} disabled={saving || (!hasChanges && !savedFlag)}
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all shadow-sm shrink-0",
                                                savedFlag ? "bg-emerald-500" : "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                            )}
                                            style={!savedFlag ? { background: BRAND } : undefined}>
                                            {saving ? <Loader2 className="size-3.5 animate-spin" /> : savedFlag ? <CheckCircle2 className="size-3.5" /> : <Save className="size-3.5" />}
                                            {saving ? "Saving..." : savedFlag ? "Saved!" : hasChanges ? "Save Changes" : "Save"}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                    {/* Roles section */}
                                    <section>
                                        <h3 className="text-[13px] font-bold text-zinc-900 mb-3 flex items-center gap-1.5">
                                            <Shield className="size-4 text-zinc-400" /> Roles
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {allRoles.map(r => {
                                                const active = editedRoles.includes(r.value);
                                                const color = getRoleColor(r.value);
                                                return (
                                                    <button key={r.value} onClick={() => toggleRole(r.value)}
                                                        className={cn("flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-3 py-2 transition-all border",
                                                            active ? "text-white shadow-sm" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50")}
                                                        style={active ? { background: color, borderColor: color } : undefined}>
                                                        {active && <Check className="size-3" />}
                                                        {r.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Role-based courses (auto-assigned, read-only) */}
                                    {(() => {
                                        const roleCourses = publishedCourses.filter(c => {
                                            const courseRoles = (c.assignedRoles || "").split(",").map(r => r.trim()).filter(Boolean);
                                            return editedRoles.some(er => courseRoles.includes(er));
                                        });
                                        if (roleCourses.length === 0) return null;
                                        return (
                                            <section>
                                                <h3 className="text-[13px] font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
                                                    <BookOpen className="size-4 text-zinc-400" /> Courses from Role
                                                </h3>
                                                <p className="text-[11px] text-zinc-400 mb-3">Automatically available based on their role assignment.</p>
                                                <div className="space-y-2">
                                                    {roleCourses.map(c => {
                                                        const totalLessons = (c.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
                                                        const existingAssignment = (selectedUser.assignedCourses ?? []).find(
                                                            (ac: any) => (ac.courseId ?? ac.course?.id) === c.id
                                                        ) as any;
                                                        const progress = existingAssignment?.progress ?? 0;
                                                        return (
                                                            <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-100 bg-zinc-50/30">
                                                                <div className="size-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${c.color}15` }}>
                                                                    {c.thumbnail}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-semibold text-zinc-800 truncate">{c.title}</p>
                                                                    <p className="text-[11px] text-zinc-400">
                                                                        {c.modules?.length ?? 0} modules · {totalLessons} lessons
                                                                        <> · <span className="text-zinc-300">via {roleLabel(c.assignedRoles)}</span></>
                                                                    </p>
                                                                </div>
                                                                {progress > 0 && (
                                                                    <div className="shrink-0 flex items-center gap-2">
                                                                        <div className="w-16 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                                                                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? "#059669" : BRAND }} />
                                                                        </div>
                                                                        <span className="text-[10px] font-semibold" style={{ color: progress === 100 ? "#059669" : BRAND }}>{progress}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        );
                                    })()}

                                    {/* Additional course assignment (courses outside their role) */}
                                    <section>
                                        <h3 className="text-[13px] font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
                                            <GraduationCap className="size-4 text-zinc-400" /> Additional Courses
                                        </h3>
                                        <p className="text-[11px] text-zinc-400 mb-3">Assign extra courses beyond what their role includes.</p>

                                        {(() => {
                                            // Filter out courses already covered by the user's roles
                                            const extraCourses = publishedCourses.filter(c => {
                                                const courseRoles = (c.assignedRoles || "").split(",").map(r => r.trim()).filter(Boolean);
                                                const coveredByRole = editedRoles.some(er => courseRoles.includes(er));
                                                return !coveredByRole;
                                            });

                                            if (extraCourses.length === 0) return (
                                                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-6 text-center">
                                                    <p className="text-[12px] text-zinc-400">All published courses are already covered by this member's roles</p>
                                                </div>
                                            );

                                            return (
                                                <div className="space-y-2">
                                                    {extraCourses.map(c => {
                                                        const assigned = editedCourses.includes(c.id);
                                                        const totalLessons = (c.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
                                                        const existingAssignment = (selectedUser.assignedCourses ?? []).find(
                                                            (ac: any) => (ac.courseId ?? ac.course?.id) === c.id
                                                        ) as any;
                                                        const progress = existingAssignment?.progress ?? 0;

                                                        return (
                                                            <button key={c.id} onClick={() => toggleCourse(c.id)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border",
                                                                    assigned ? "border-blue-200 bg-blue-50/50" : "border-zinc-100 bg-zinc-50/30 hover:bg-zinc-50"
                                                                )}>
                                                                <div className={cn(
                                                                    "size-5 rounded-md flex items-center justify-center shrink-0 transition-all border",
                                                                    assigned ? "border-[#3A63C2] bg-[#3A63C2]" : "border-zinc-300 bg-white"
                                                                )}>
                                                                    {assigned && <Check className="size-3 text-white" />}
                                                                </div>
                                                                <div className="size-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${c.color}15` }}>
                                                                    {c.thumbnail}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-[13px] font-semibold truncate", assigned ? "text-zinc-900" : "text-zinc-600")}>
                                                                        {c.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-400">
                                                                        {c.modules?.length ?? 0} modules · {totalLessons} lessons
                                                                        {(c.assignedRoles ?? "").split(",").filter(Boolean).length > 0 && (
                                                                            <> · <span className="text-zinc-300">{roleLabel(c.assignedRoles)}</span></>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                {assigned && progress > 0 && (
                                                                    <div className="shrink-0 flex items-center gap-2">
                                                                        <div className="w-16 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                                                                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? "#059669" : BRAND }} />
                                                                        </div>
                                                                        <span className="text-[10px] font-semibold" style={{ color: progress === 100 ? "#059669" : BRAND }}>{progress}%</span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </section>
                                </div>
                            </div>
                        )}
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

type Tab = "courses" | "team" | "train";

export default function ManagePage() {
    const [tab, setTab] = useState<Tab>("courses");
    const { currentUser, isManager } = useRBAC();

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "courses", label: "Courses", icon: <BookOpen className="size-4" /> },
        { id: "team", label: "Team / Roles", icon: <Users className="size-4" /> },
        { id: "train", label: "Train AI", icon: <Brain className="size-4" /> },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
            {/* Sidebar — shared component, role-aware */}
            <AppSidebar>
                <nav className="px-3 pt-3 pb-2 space-y-0.5">
                    <div className="pb-1 px-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Manage</p>
                    </div>
                    {tabs.map(t => (
                        <NavItem key={t.id} icon={t.icon} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
                    ))}
                </nav>
            </AppSidebar>

            {/* Main */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center gap-3 border-b border-zinc-100 bg-white px-6 h-14">
                    <LayoutDashboard className="size-4" style={{ color: BRAND }} />
                    <span className="text-[14px] font-semibold text-zinc-700">Manage</span>
                </header>

                {tab === "courses" && <CoursesTab />}
                {tab === "team" && <TeamTab />}
                {tab === "train" && <TrainTab />}
            </main>
        </div>
    );
}
