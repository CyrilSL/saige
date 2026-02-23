"use client";

import { useState, useEffect } from "react";
import {
    X, Plus, Trash2, Save, ChevronDown, ChevronUp, GripVertical,
    CheckCircle2, AlertCircle, BookOpen, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

interface QuestionDraft {
    id: string; // temp client-side id
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    explanation: string;
}

interface QuestionnaireDraft {
    id?: number;
    title: string;
    description: string;
    passingScore: number;
    questions: QuestionDraft[];
}

interface SavedQuestionnaire {
    id: number;
    title: string;
    description: string;
    passingScore: number;
    questions: Array<{
        id: number;
        text: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctOption: string;
        explanation: string;
    }>;
}

interface QuestionnaireBuilderProps {
    courseId: number;
    courseTitle: string;
    onClose: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function emptyQuestion(): QuestionDraft {
    return {
        id: crypto.randomUUID(),
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        explanation: "",
    };
}

function emptyDraft(): QuestionnaireDraft {
    return {
        title: "",
        description: "",
        passingScore: 70,
        questions: [emptyQuestion()],
    };
}

function QuestionCard({
    q,
    index,
    onChange,
    onDelete,
    isOnly,
}: {
    q: QuestionDraft;
    index: number;
    onChange: (updated: QuestionDraft) => void;
    onDelete: () => void;
    isOnly: boolean;
}) {
    const [expanded, setExpanded] = useState(true);
    const isComplete = q.text.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim();

    return (
        <div className={cn("rounded-xl border bg-white overflow-hidden", isComplete ? "border-zinc-200" : "border-amber-200")}>
            {/* Question header */}
            <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                onClick={() => setExpanded(v => !v)}
            >
                <span className={cn("size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    isComplete ? "bg-[#eef2fb] text-[#3A63C2]" : "bg-amber-100 text-amber-600"
                )}>{index + 1}</span>
                <p className="flex-1 text-[13px] font-medium text-zinc-700 truncate">
                    {q.text.trim() || <span className="text-zinc-300 italic">Question text…</span>}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                    {!isOnly && (
                        <span onClick={e => { e.stopPropagation(); onDelete(); }}
                            className="size-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-colors">
                            <Trash2 className="size-3.5" />
                        </span>
                    )}
                    {expanded ? <ChevronUp className="size-4 text-zinc-300" /> : <ChevronDown className="size-4 text-zinc-300" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-100">
                    {/* Question text */}
                    <textarea
                        placeholder="Enter your question…"
                        value={q.text}
                        onChange={e => onChange({ ...q, text: e.target.value })}
                        className="w-full text-[13px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                        rows={2}
                    />

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OPTION_LABELS.map(opt => {
                            const key = `option${opt}` as keyof QuestionDraft;
                            const isCorrect = q.correctOption === opt;
                            return (
                                <div key={opt} className={cn(
                                    "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                                    isCorrect ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
                                )}>
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...q, correctOption: opt })}
                                        className={cn(
                                            "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                            isCorrect ? "border-emerald-500 bg-emerald-500" : "border-zinc-300 hover:border-emerald-400"
                                        )}
                                    >
                                        {isCorrect && <CheckCircle2 className="size-3 text-white" />}
                                    </button>
                                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">{opt}</span>
                                    <input
                                        placeholder={`Option ${opt}`}
                                        value={q[key] as string}
                                        onChange={e => onChange({ ...q, [key]: e.target.value })}
                                        className="flex-1 text-[12px] bg-transparent focus:outline-none placeholder:text-zinc-300 text-zinc-700 min-w-0"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    <input
                        placeholder="Explanation (optional) — shown after the quiz"
                        value={q.explanation}
                        onChange={e => onChange({ ...q, explanation: e.target.value })}
                        className="w-full text-[12px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent text-zinc-500"
                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                    />
                </div>
            )}
        </div>
    );
}

export function QuestionnaireBuilder({ courseId, courseTitle, onClose }: QuestionnaireBuilderProps) {
    const [saved, setSaved] = useState<SavedQuestionnaire[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [draft, setDraft] = useState<QuestionnaireDraft | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/manage/questionnaires?courseId=${courseId}`)
            .then(r => r.json())
            .then(data => setSaved(Array.isArray(data) ? data : []))
            .finally(() => setLoadingSaved(false));
    }, [courseId]);

    function updateQuestion(index: number, updated: QuestionDraft) {
        if (!draft) return;
        const qs = [...draft.questions];
        qs[index] = updated;
        setDraft({ ...draft, questions: qs });
    }

    function deleteQuestion(index: number) {
        if (!draft || draft.questions.length <= 1) return;
        const qs = draft.questions.filter((_, i) => i !== index);
        setDraft({ ...draft, questions: qs });
    }

    function addQuestion() {
        if (!draft) return;
        setDraft({ ...draft, questions: [...draft.questions, emptyQuestion()] });
    }

    async function saveDraft() {
        if (!draft) return;
        setSaving(true);
        try {
            const payload = {
                courseId,
                title: draft.title,
                description: draft.description,
                passingScore: draft.passingScore,
                questions: draft.questions,
            };

            let res;
            if (draft.id) {
                res = await fetch(`/api/manage/questionnaires/${draft.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch("/api/manage/questionnaires", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            const result = await res.json();
            if (draft.id) {
                setSaved(prev => prev.map(s => s.id === result.id ? result : s));
            } else {
                setSaved(prev => [result, ...prev]);
            }
            setDraft(null);
        } finally {
            setSaving(false);
        }
    }

    async function deleteQuestionnaire(id: number) {
        setDeletingId(id);
        try {
            await fetch(`/api/manage/questionnaires/${id}`, { method: "DELETE" });
            setSaved(prev => prev.filter(s => s.id !== id));
        } finally {
            setDeletingId(null);
        }
    }

    function editSaved(qn: SavedQuestionnaire) {
        setDraft({
            id: qn.id,
            title: qn.title,
            description: qn.description,
            passingScore: qn.passingScore,
            questions: qn.questions.map(q => ({
                id: String(q.id),
                text: q.text,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption as "A" | "B" | "C" | "D",
                explanation: q.explanation,
            })),
        });
    }

    const isValid = draft && draft.title.trim() && draft.questions.length > 0 &&
        draft.questions.every(q => q.text.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                    <div>
                        <p className="text-[11px] text-zinc-400 font-medium">{courseTitle}</p>
                        <h2 className="text-[15px] font-bold text-zinc-900">
                            {draft ? (draft.id ? "Edit Quiz" : "New Quiz") : "Quiz Manager"}
                        </h2>
                    </div>
                    <button onClick={draft ? () => setDraft(null) : onClose}
                        className="size-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
                        <X className="size-4 text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {draft ? (
                        <div className="p-5 space-y-4">
                            {/* Metadata */}
                            <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                <div>
                                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Quiz Title *</label>
                                    <input
                                        placeholder="e.g. Front Office Fundamentals Quiz"
                                        value={draft.title}
                                        onChange={e => setDraft({ ...draft, title: e.target.value })}
                                        className="w-full text-[13px] rounded-lg border border-zinc-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Description</label>
                                        <input
                                            placeholder="Optional short description"
                                            value={draft.description}
                                            onChange={e => setDraft({ ...draft, description: e.target.value })}
                                            className="w-full text-[13px] rounded-lg border border-zinc-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent"
                                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Pass % *</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={draft.passingScore}
                                            onChange={e => setDraft({ ...draft, passingScore: parseInt(e.target.value) || 70 })}
                                            className="w-full text-[13px] rounded-lg border border-zinc-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent"
                                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[13px] font-bold text-zinc-700">
                                        Questions <span className="text-zinc-400 font-normal">({draft.questions.length})</span>
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {draft.questions.map((q, i) => (
                                        <QuestionCard
                                            key={q.id}
                                            q={q}
                                            index={i}
                                            onChange={updated => updateQuestion(i, updated)}
                                            onDelete={() => deleteQuestion(i)}
                                            isOnly={draft.questions.length === 1}
                                        />
                                    ))}
                                </div>
                                <button onClick={addQuestion}
                                    className="mt-3 w-full rounded-xl border border-dashed border-zinc-300 py-2.5 text-[13px] font-medium text-zinc-400 hover:border-[#3A63C2] hover:text-[#3A63C2] hover:bg-[#eef2fb] transition-all flex items-center justify-center gap-1.5">
                                    <Plus className="size-4" /> Add Question
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5">
                            {loadingSaved ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="size-7 rounded-full border-2 border-zinc-200 border-t-[#3A63C2] animate-spin" />
                                </div>
                            ) : saved.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                    <ClipboardList className="size-10 text-zinc-200" />
                                    <p className="text-zinc-500 font-medium">No quizzes yet</p>
                                    <p className="text-[12px] text-zinc-400">Create your first quiz for this course.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {saved.map(qn => (
                                        <div key={qn.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
                                                <ClipboardList className="size-5" style={{ color: BRAND }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-semibold text-zinc-800 truncate">{qn.title}</p>
                                                <p className="text-[11px] text-zinc-400">{qn.questions.length} questions · Pass at {qn.passingScore}%</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button onClick={() => editSaved(qn)}
                                                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-[#3A63C2] hover:text-[#3A63C2] transition-all">
                                                    Edit
                                                </button>
                                                <button onClick={() => deleteQuestionnaire(qn.id)}
                                                    disabled={deletingId === qn.id}
                                                    className="size-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-colors disabled:opacity-50">
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-zinc-100 shrink-0 flex items-center gap-3">
                    {draft ? (
                        <>
                            <p className="text-[12px] text-zinc-400">
                                {draft.questions.length} question{draft.questions.length !== 1 ? "s" : ""}
                            </p>
                            <div className="flex-1" />
                            <button onClick={() => setDraft(null)} className="text-[13px] text-zinc-400 hover:text-zinc-700 px-3 py-1.5">
                                Cancel
                            </button>
                            <button
                                onClick={saveDraft}
                                disabled={!isValid || saving}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-opacity",
                                    (!isValid || saving) ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                )}
                                style={{ background: BRAND }}
                            >
                                <Save className="size-3.5" />
                                {saving ? "Saving…" : (draft.id ? "Save Changes" : "Create Quiz")}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex-1" />
                            <button onClick={() => setDraft(emptyDraft())}
                                className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: BRAND }}>
                                <Plus className="size-3.5" /> New Quiz
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
