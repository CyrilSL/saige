"use client";

import { useState, useEffect } from "react";
import {
    X, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, ChevronLeft,
    BookOpen, AlertCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

interface Question {
    id: number;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    position: number;
}

interface Questionnaire {
    id: number;
    title: string;
    description: string;
    passingScore: number;
    questions: Question[];
}

interface ResultQuestion {
    id: number;
    text: string;
    correctOption: string;
    explanation: string;
    yourAnswer: string | null;
    isCorrect: boolean;
}

interface QuizResult {
    score: number;
    passed: boolean;
    passingScore: number;
    correct: number;
    total: number;
    questions: ResultQuestion[];
}

interface QuizModalProps {
    courseId: number;
    courseTitle: string;
    userId: number;
    onClose: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function optionText(q: Question, opt: string) {
    if (opt === "A") return q.optionA;
    if (opt === "B") return q.optionB;
    if (opt === "C") return q.optionC;
    return q.optionD;
}

export function QuizModal({ courseId, courseTitle, userId, onClose }: QuizModalProps) {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeQn, setActiveQn] = useState<Questionnaire | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        fetch(`/api/learn/questionnaires?courseId=${courseId}`)
            .then(r => r.json())
            .then(data => {
                setQuestionnaires(data);
                if (data.length === 1) setActiveQn(data[0]);
            })
            .finally(() => setLoading(false));
    }, [courseId]);

    function selectAnswer(opt: string) {
        if (!activeQn || result) return;
        setAnswers(prev => ({ ...prev, [activeQn.questions[currentQ].id]: opt }));
    }

    async function submit() {
        if (!activeQn) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/learn/questionnaires", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionnaireId: activeQn.id, userId, answers }),
            });
            const data = await res.json();
            setResult(data);
        } finally {
            setSubmitting(false);
        }
    }

    function restart() {
        setAnswers({});
        setCurrentQ(0);
        setResult(null);
        setShowReview(false);
    }

    const answeredCount = activeQn ? activeQn.questions.filter(q => answers[q.id]).length : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                    <div>
                        <p className="text-[11px] text-zinc-400 font-medium">{courseTitle}</p>
                        <h2 className="text-[15px] font-bold text-zinc-900">
                            {activeQn ? activeQn.title : "Course Quizzes"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="size-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
                        <X className="size-4 text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="size-8 rounded-full border-2 border-zinc-200 border-t-[#3A63C2] animate-spin" />
                        </div>
                    ) : questionnaires.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                            <BookOpen className="size-10 text-zinc-200" />
                            <p className="text-zinc-500 font-medium">No quizzes yet</p>
                            <p className="text-[12px] text-zinc-400">Your manager hasn't added any quiz for this course yet.</p>
                        </div>
                    ) : !activeQn ? (
                        // Pick questionnaire
                        <div className="p-6 space-y-3">
                            <p className="text-[13px] text-zinc-500 mb-4">Select a quiz to take:</p>
                            {questionnaires.map(qn => (
                                <button key={qn.id} onClick={() => { setActiveQn(qn); setAnswers({}); setCurrentQ(0); setResult(null); }}
                                    className="w-full flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-[#3A63C2] hover:bg-[#eef2fb] transition-all p-4 text-left group">
                                    <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND_LIGHT }}>
                                        <BookOpen className="size-5" style={{ color: BRAND }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold text-zinc-800 group-hover:text-[#3A63C2]">{qn.title}</p>
                                        <p className="text-[12px] text-zinc-400">{qn.questions.length} questions · Pass at {qn.passingScore}%</p>
                                    </div>
                                    <ChevronRight className="size-4 text-zinc-300 group-hover:text-[#3A63C2]" />
                                </button>
                            ))}
                        </div>
                    ) : result ? (
                        // Result screen
                        <div className="p-6">
                            <div className={cn(
                                "rounded-2xl p-6 text-center mb-6",
                                result.passed ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                            )}>
                                {result.passed ? (
                                    <Trophy className="size-12 mx-auto mb-3 text-emerald-500" />
                                ) : (
                                    <XCircle className="size-12 mx-auto mb-3 text-red-400" />
                                )}
                                <p className="text-3xl font-bold mb-1" style={{ color: result.passed ? "#059669" : "#DC2626" }}>
                                    {result.score}%
                                </p>
                                <p className="text-[14px] font-semibold text-zinc-700 mb-1">
                                    {result.passed ? "🎉 You passed!" : "Not quite there yet"}
                                </p>
                                <p className="text-[12px] text-zinc-500">
                                    {result.correct} of {result.total} correct · Passing score: {result.passingScore}%
                                </p>
                            </div>

                            {/* Review toggle */}
                            <button onClick={() => setShowReview(v => !v)}
                                className="w-full text-[13px] font-medium rounded-xl border border-zinc-200 py-2.5 hover:bg-zinc-50 transition-colors mb-4">
                                {showReview ? "Hide" : "Review"} answers
                            </button>

                            {showReview && (
                                <div className="space-y-4">
                                    {result.questions.map((q, i) => (
                                        <div key={q.id} className={cn(
                                            "rounded-xl border p-4",
                                            q.isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                                        )}>
                                            <div className="flex gap-2 mb-3">
                                                {q.isCorrect
                                                    ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    : <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />}
                                                <p className="text-[13px] font-medium text-zinc-800">{i + 1}. {q.text}</p>
                                            </div>
                                            <div className="space-y-1.5 pl-6">
                                                {OPTION_LABELS.map(opt => {
                                                    const isCorrect = opt === q.correctOption;
                                                    const isYours = opt === q.yourAnswer;
                                                    return (
                                                        <div key={opt} className={cn(
                                                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px]",
                                                            isCorrect ? "bg-emerald-100 text-emerald-800 font-semibold" :
                                                                isYours && !isCorrect ? "bg-red-100 text-red-700" : "text-zinc-500"
                                                        )}>
                                                            <span className="shrink-0 font-bold w-4">{opt}.</span>
                                                            <span>{optionText(activeQn.questions.find(x => x.id === q.id)!, opt)}</span>
                                                            {isCorrect && <CheckCircle2 className="size-3 ml-auto shrink-0" />}
                                                            {isYours && !isCorrect && <XCircle className="size-3 ml-auto shrink-0" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {q.explanation && (
                                                <p className="mt-2 pl-6 text-[11px] text-zinc-500 italic">💡 {q.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Quiz screen
                        <div className="p-6">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQ + 1) / activeQn.questions.length) * 100}%`, background: BRAND }} />
                                </div>
                                <span className="text-[11px] text-zinc-400 shrink-0 font-medium">
                                    {currentQ + 1}/{activeQn.questions.length}
                                </span>
                            </div>

                            {/* Question */}
                            {(() => {
                                const q = activeQn.questions[currentQ];
                                const selected = answers[q.id];
                                return (
                                    <div>
                                        <p className="text-[15px] font-semibold text-zinc-900 mb-5 leading-snug">
                                            {currentQ + 1}. {q.text}
                                        </p>
                                        <div className="space-y-2.5">
                                            {OPTION_LABELS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => selectAnswer(opt)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all text-[13px]",
                                                        selected === opt
                                                            ? "border-[#3A63C2] bg-[#eef2fb] font-semibold text-[#3A63C2]"
                                                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white text-zinc-700"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "size-6 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                                                        selected === opt ? "border-[#3A63C2] bg-[#3A63C2] text-white" : "border-zinc-300 text-zinc-400"
                                                    )}>{opt}</span>
                                                    {optionText(q, opt)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeQn && !result && !loading && (
                    <div className="px-6 py-4 border-t border-zinc-100 shrink-0 flex items-center gap-3">
                        {questionnaires.length > 1 && (
                            <button onClick={() => setActiveQn(null)} className="text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors">
                                ← All quizzes
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={() => setCurrentQ(v => Math.max(0, v - 1))}
                            disabled={currentQ === 0}
                            className="size-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        {currentQ < activeQn.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQ(v => v + 1)}
                                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: BRAND }}
                            >
                                Next <ChevronRight className="size-3.5" />
                            </button>
                        ) : (
                            <button
                                onClick={submit}
                                disabled={submitting || answeredCount < activeQn.questions.length}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-opacity",
                                    answeredCount < activeQn.questions.length ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                )}
                                style={{ background: "#059669" }}
                            >
                                {submitting ? "Submitting…" : `Submit (${answeredCount}/${activeQn.questions.length})`}
                            </button>
                        )}
                    </div>
                )}
                {result && (
                    <div className="px-6 py-4 border-t border-zinc-100 shrink-0 flex items-center gap-3">
                        <button onClick={restart} className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
                            <RotateCcw className="size-3.5" /> Retry
                        </button>
                        <div className="flex-1" />
                        <button onClick={onClose}
                            className="rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: BRAND }}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
