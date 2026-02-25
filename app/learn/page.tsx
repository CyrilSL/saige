"use client";

import { useState, useMemo, useEffect } from "react";
import {
    BookOpen,
    Play,
    CheckCircle2,
    Lock,
    ChevronDown,
    ChevronRight,
    Star,
    Clock,
    Users,
    Award,
    TrendingUp,
    Search,
    Filter,
    Sparkles,
    GraduationCap,
    FileText,
    HelpCircle,
    BarChart2,
    Bell,
    ChevronLeft,
    Zap,
    Trophy,
    Target,
    PlayCircle,
    ClipboardList,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    type: "video" | "reading" | "quiz";
    completed: boolean;
    locked: boolean;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    description: string;
}

export interface Course {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    duration: string;
    lessons: number;
    enrolled: number;
    rating: number;
    progress: number;
    thumbnail: string;
    instructor: string;
    instructorTitle: string;
    tags: string[];
    featured?: boolean;
    new?: boolean;
    modules: Module[];
    color: string;
}
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { useRBAC } from "@/lib/rbac";
import { QuizModal } from "@/components/quiz-modal";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

// ─── helpers ──────────────────────────────────────────────────────────────────

function progressColor(p: number) {
    if (p === 100) return "#059669";
    if (p >= 50) return BRAND;
    if (p > 0) return "#F59E0B";
    return "#E5E7EB";
}



function typeIcon(type: Lesson["type"]) {
    if (type === "video") return <Play className="size-3" />;
    if (type === "quiz") return <HelpCircle className="size-3" />;
    return <FileText className="size-3" />;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function CourseCard({
    course,
    onOpen,
    active,
}: {
    course: Course;
    onOpen: (c: Course) => void;
    active: boolean;
}) {
    const pct = course.progress;
    return (
        <div
            className={cn(
                "relative flex flex-col rounded-2xl border bg-white cursor-pointer group transition-all duration-200 overflow-hidden",
                active
                    ? "border-[#3A63C2] shadow-lg shadow-blue-100"
                    : "border-zinc-100 hover:shadow-md hover:border-zinc-200"
            )}
            onClick={() => onOpen(course)}
        >
            {/* Thumbnail strip */}
            <div
                className="flex items-center justify-center h-36 text-5xl relative overflow-hidden"
                style={{ background: `${course.color}18` }}
            >
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 70% 30%, ${course.color} 0%, transparent 70%)`,
                    }}
                />
                <span className="z-10 drop-shadow-sm select-none">{course.thumbnail}</span>

                {/* badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    {course.featured && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 shadow-sm" style={{ background: course.color, color: "#fff" }}>
                            <Zap className="size-2.5" /> Featured
                        </span>
                    )}
                    {course.new && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 shadow-sm" style={{ background: "#059669", color: "#fff" }}>
                            New
                        </span>
                    )}
                </div>

                {/* play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: `${course.color}22` }}>
                    <div className="size-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: course.color }}>
                        <PlayCircle className="size-6 text-white" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 p-4 gap-3">
                {/* category */}
                <div className="flex items-center gap-2 mb-1">
                    {(() => {
                        const cat = CATEGORIES.find(c => c.id === course.category);
                        if (!cat) return null;
                        return (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-500 bg-zinc-50 font-medium text-[10px]">
                                <span>{cat.icon}</span> {cat.label}
                            </span>
                        );
                    })()}
                </div>

                <div>
                    <h3 className="font-semibold text-[15px] leading-snug text-zinc-900 mb-0.5 group-hover:text-[#3A63C2] transition-colors">{course.title}</h3>
                    <p className="text-[12px] text-zinc-400 line-clamp-2 leading-relaxed">{course.subtitle}</p>
                </div>

                {/* instructor */}
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
                        style={{ background: course.color }}>
                        {course.instructor.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="text-[11px] text-zinc-500 truncate">{course.instructor}</span>
                </div>

                {/* meta row */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    {course.lessons > 0 && <span className="flex items-center gap-1"><Clock className="size-3" /> {course.duration}</span>}
                    {course.lessons > 0 && <span className="flex items-center gap-1"><BookOpen className="size-3" /> {course.lessons} lessons</span>}
                    {course.rating > 0 && <span className="flex items-center gap-1 ml-auto"><Star className="size-3 fill-amber-400 text-amber-400" /> {course.rating}</span>}
                </div>

                {/* progress bar */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-zinc-400">Progress</span>
                        <span className="text-[11px] font-semibold" style={{ color: progressColor(pct) }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: progressColor(pct) }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function ModuleRow({ module, defaultOpen }: { module: Module; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(!!defaultOpen);
    const completedCount = module.lessons.filter(l => l.completed).length;
    const total = module.lessons.length;

    return (
        <div className="rounded-xl border border-zinc-100 overflow-hidden">
            <button
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-zinc-50 transition-colors text-left"
                onClick={() => setOpen(v => !v)}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 truncate">{module.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{completedCount}/{total} lessons · {module.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    <div className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: BRAND_LIGHT, color: BRAND }}>
                        {completedCount}/{total}
                    </div>
                    {open ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                    {module.lessons.map(lesson => (
                        <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                </div>
            )}
        </div>
    );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                lesson.locked
                    ? "opacity-50 cursor-not-allowed bg-zinc-50"
                    : "cursor-pointer hover:bg-blue-50/60 group"
            )}
        >
            {/* state icon */}
            <div className="shrink-0">
                {lesson.completed ? (
                    <CheckCircle2 className="size-5 text-emerald-500" />
                ) : lesson.locked ? (
                    <Lock className="size-4 text-zinc-300" />
                ) : (
                    <div className="size-5 rounded-full border-2 border-zinc-200 group-hover:border-[#3A63C2] flex items-center justify-center transition-colors">
                        <div className="size-2 rounded-full bg-transparent group-hover:bg-[#3A63C2] transition-colors" />
                    </div>
                )}
            </div>

            {/* type pill */}
            <div
                className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                    background: lesson.type === "quiz" ? "#FEF3C7" : lesson.type === "video" ? BRAND_LIGHT : "#F0FDF4",
                    color: lesson.type === "quiz" ? "#B45309" : lesson.type === "video" ? BRAND : "#15803D",
                }}
            >
                {typeIcon(lesson.type)}
                {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
            </div>

            <span className={cn("flex-1 text-[13px] truncate", lesson.completed ? "text-zinc-400 line-through" : "text-zinc-700 group-hover:text-zinc-900")}>
                {lesson.title}
            </span>

            <span className="shrink-0 text-[11px] text-zinc-400 flex items-center gap-1">
                <Clock className="size-3" />
                {lesson.duration}
            </span>
        </div>
    );
}

function CourseViewer({ course, onBack, userId }: { course: Course; onBack: () => void; userId: number }) {
    const done = course.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
    const total = course.modules.flatMap(m => m.lessons).length;
    const [showQuiz, setShowQuiz] = useState(false);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {showQuiz && (
                <QuizModal
                    courseId={parseInt(course.id)}
                    courseTitle={course.title}
                    userId={userId}
                    onClose={() => setShowQuiz(false)}
                />
            )}
            {/* back */}
            <button
                className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors"
                onClick={onBack}
            >
                <ChevronLeft className="size-4" /> Back to courses
            </button>

            {/* Hero */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: `${course.color}12`, border: `1.5px solid ${course.color}30` }}
            >
                <div className="absolute top-0 right-0 text-[140px] opacity-[0.07] select-none -translate-y-4 translate-x-4">
                    {course.thumbnail}
                </div>
                <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                        {course.featured && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5 text-white" style={{ background: course.color }}>
                                <Zap className="size-3" /> Featured
                            </span>
                        )}
                        {course.new && (
                            <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 text-white" style={{ background: "#059669" }}>New</span>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 leading-tight">{course.title}</h2>
                        <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">{course.subtitle}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[12px] text-zinc-500">
                        {course.lessons > 0 && <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {course.duration}</span>}
                        {course.lessons > 0 && <span className="flex items-center gap-1.5"><BookOpen className="size-3.5" /> {course.lessons} lessons</span>}
                        {course.enrolled > 0 && <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {course.enrolled.toLocaleString()} enrolled</span>}
                        {course.rating > 0 && <span className="flex items-center gap-1.5"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {course.rating} rating</span>}
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2.5 mt-1">
                        <div
                            className="size-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow"
                            style={{ background: course.color }}
                        >
                            {course.instructor.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-zinc-800">{course.instructor}</p>
                            <p className="text-[11px] text-zinc-400">{course.instructorTitle}</p>
                        </div>
                    </div>

                    {/* tags + Take Quiz CTA */}
                    <div className="flex flex-wrap items-center gap-2">
                        {course.tags.map(tag => (
                            <span key={tag} className="text-[11px] rounded-full px-3 py-0.5 bg-white/80 border border-zinc-200 text-zinc-600 font-medium">
                                {tag}
                            </span>
                        ))}
                        <button
                            onClick={() => setShowQuiz(true)}
                            className="ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: BRAND }}
                        >
                            <ClipboardList className="size-3.5" /> Take Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress summary */}
            {total > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Completed", value: total > 0 ? `${done}/${total}` : "—", icon: <CheckCircle2 className="size-5 text-emerald-500" /> },
                        { label: "Progress", value: `${course.progress}%`, icon: <TrendingUp className="size-5" style={{ color: BRAND }} /> },
                        { label: "Modules", value: course.modules.length > 0 ? course.modules.length.toString() : "—", icon: <BookOpen className="size-5 text-amber-500" /> },
                    ].map(item => (
                        <div key={item.label} className="rounded-xl border border-zinc-100 bg-white p-4 flex items-center gap-3">
                            {item.icon}
                            <div>
                                <p className="text-lg font-bold text-zinc-900">{item.value}</p>
                                <p className="text-[11px] text-zinc-400">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Course content */}
            <div>
                <h3 className="text-[15px] font-bold text-zinc-800 mb-3">Course Content</h3>
                {course.modules.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center py-14 text-center gap-3">
                        <BookOpen className="size-8 text-zinc-300" />
                        <p className="text-sm text-zinc-400 font-medium">Modules coming soon</p>
                        <p className="text-[12px] text-zinc-300">Check back shortly — content is being prepared</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {course.modules.map((mod, idx) => (
                            <ModuleRow key={mod.id} module={mod} defaultOpen={idx === 0} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
    const { currentUser } = useRBAC();
    const [dbCourses, setDbCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const activeCourseId = activeCourse?.id ?? null;

    useEffect(() => {
        if (!currentUser) return;
        setLoadingCourses(true);
        fetch(`/api/learn/courses?role=${currentUser.role}&userId=${currentUser.id}`)
            .then(r => r.json())
            .then((data: any[]) => {
                const mapped: Course[] = data.map(c => {
                    const totalLessons = (c.modules ?? []).reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0);
                    const completedLessons = (c.modules ?? []).reduce((a: number, m: any) => a + (m.lessons ?? []).filter((l: any) => l.completed).length, 0);
                    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                    return {
                        id: String(c.id),
                        title: c.title,
                        subtitle: c.subtitle ?? "",
                        category: c.category ?? "front-office",
                        thumbnail: c.thumbnail ?? "📚",
                        color: c.color ?? "#3A63C2",
                        tags: (c.assignedRoles ?? "").split(",").map((r: string) => r.replace(/_/g, " ")).filter(Boolean),
                        progress,
                        lessons: totalLessons,
                        enrolled: 0,
                        rating: 0,
                        duration: `${totalLessons} lessons`,
                        instructor: "Riverside Dental",
                        instructorTitle: "Practice Team",
                        featured: false,
                        new: false,
                        modules: (c.modules ?? []).map((m: any) => ({
                            id: String(m.id),
                            title: m.title,
                            description: m.description ?? "",
                            lessons: (m.lessons ?? []).map((l: any) => ({
                                id: String(l.id),
                                title: l.title,
                                type: (l.type ?? "video") as Lesson["type"],
                                duration: l.duration ?? "5 min",
                                completed: !!l.completed,
                                locked: false,
                            })),
                        })),
                    };
                });
                setDbCourses(mapped);
            })
            .finally(() => setLoadingCourses(false));
    }, [currentUser]);

    const filtered = useMemo(() => {
        return dbCourses.filter(c => {
            const matchSearch = searchQuery === "" ||
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
            return matchSearch;
        });
    }, [dbCourses, searchQuery]);

    const inProgress = dbCourses.filter(c => c.progress > 0 && c.progress < 100);
    const completed = dbCourses.filter(c => c.progress === 100);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
            <AppSidebar />

            <main className="flex flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center gap-4 border-b border-zinc-100 bg-white px-6 h-14">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                        <input
                            placeholder="Search courses, topics, skills..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setActiveCourse(null); }}
                            className="w-full h-9 pl-9 pr-4 text-[13px] rounded-xl border border-zinc-200 bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="relative size-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                            <Bell className="size-4" />
                            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
                        </button>
                    </div>
                </header>

                {activeCourse ? (
                    <CourseViewer course={activeCourse} onBack={() => setActiveCourse(null)} userId={currentUser?.id ?? 0} />
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {/* Hero banner */}
                        <div
                            className="rounded-2xl p-6 flex items-center justify-between relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #2d4fa0 100%)` }}
                        >
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
                            <div className="relative z-10 space-y-2 max-w-lg">
                                <p className="text-white/70 text-[12px] font-medium uppercase tracking-widest">Dental Learning Hub</p>
                                <h1 className="text-white text-2xl font-bold leading-snug">Elevate Your Practice Skills</h1>
                                <p className="text-white/75 text-[13px] leading-relaxed">Courses assigned to your role. Learn at your own pace.</p>
                                <div className="flex gap-3 pt-2">
                                    {dbCourses[0] && (
                                        <button
                                            className="bg-white text-[13px] font-semibold rounded-xl px-4 py-2 transition-opacity hover:opacity-90 flex items-center gap-1.5"
                                            style={{ color: BRAND }}
                                            onClick={() => setActiveCourse(dbCourses[0])}
                                        >
                                            <Play className="size-3.5" /> Start Learning
                                        </button>
                                    )}

                                </div>
                            </div>
                            <div className="relative z-10 hidden lg:flex flex-col items-center gap-1">
                                <span className="text-white text-3xl font-bold">{dbCourses.length}</span>
                                <span className="text-white/70 text-[11px]">Courses for you</span>
                            </div>
                        </div>

                        {/* Continue learning */}
                        {inProgress.length > 0 && (
                            <section>
                                <h2 className="text-[15px] font-bold text-zinc-900 mb-4">Continue Learning</h2>
                                <div className="flex gap-4 overflow-x-auto pb-1">
                                    {inProgress.map(c => (
                                        <div key={c.id}
                                            className="flex gap-4 items-center rounded-2xl border border-zinc-100 bg-white p-4 cursor-pointer hover:shadow-md transition-all min-w-[340px]"
                                            onClick={() => setActiveCourse(c)}>
                                            <div className="size-14 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${c.color}12` }}>{c.thumbnail}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-zinc-800 truncate">{c.title}</p>
                                                <div className="mt-2">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] text-zinc-400">Progress</span>
                                                        <span className="text-[10px] font-semibold" style={{ color: progressColor(c.progress) }}>{c.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: progressColor(c.progress) }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-4 text-zinc-300 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Course grid */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[15px] font-bold text-zinc-900">
                                    All Courses
                                    <span className="ml-2 text-[12px] font-normal text-zinc-400">({filtered.length})</span>
                                </h2>
                            </div>

                            {loadingCourses ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="size-8 rounded-full border-2 border-zinc-200 border-t-[#3A63C2] animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                                    <BookOpen className="size-10 text-zinc-200" />
                                    <p className="text-zinc-500 font-medium">No courses assigned to your role yet</p>
                                    <p className="text-[12px] text-zinc-400">Ask your manager to assign courses to your role.</p>
                                    <button onClick={() => { setSearchQuery(""); }}
                                        className="text-[13px] font-medium hover:underline" style={{ color: BRAND }}>
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filtered.map(course => (
                                        <CourseCard key={course.id} course={course} onOpen={setActiveCourse} active={activeCourseId === course.id} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Completed */}
                        {completed.length > 0 && (
                            <section className="pb-2">
                                <h2 className="text-[15px] font-bold text-zinc-900 mb-4">
                                    Completed <Award className="inline size-4 text-emerald-500 ml-1" />
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {completed.map(course => (
                                        <CourseCard key={course.id} course={course} onOpen={setActiveCourse} active={activeCourseId === course.id} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
