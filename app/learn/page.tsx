"use client";

import { useState, useMemo } from "react";
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
    Settings,
    ChevronLeft,
    Zap,
    Trophy,
    Target,
    PlayCircle,
} from "lucide-react";
import {
    COURSES,
    CATEGORIES,
    STATS,
    Course,
    Module,
    Lesson,
} from "@/lib/learn-data";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

// ─── helpers ──────────────────────────────────────────────────────────────────

function progressColor(p: number) {
    if (p === 100) return "#059669";
    if (p >= 50) return BRAND;
    if (p > 0) return "#F59E0B";
    return "#E5E7EB";
}

function levelBadgeStyle(level: Course["level"]) {
    const map: Record<Course["level"], { bg: string; text: string }> = {
        Beginner: { bg: "#DCFCE7", text: "#15803D" },
        Intermediate: { bg: "#FEF3C7", text: "#B45309" },
        Advanced: { bg: "#FEE2E2", text: "#DC2626" },
    };
    return map[level];
}

function typeIcon(type: Lesson["type"]) {
    if (type === "video") return <Play className="size-3" />;
    if (type === "quiz") return <HelpCircle className="size-3" />;
    return <FileText className="size-3" />;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm px-6 py-5 text-center min-w-[110px]">
            <span className="text-2xl font-bold tracking-tight" style={{ color: BRAND }}>{value}</span>
            <span className="text-xs text-zinc-500 mt-0.5 font-medium">{label}</span>
        </div>
    );
}

function CourseCard({
    course,
    onOpen,
    active,
}: {
    course: Course;
    onOpen: (c: Course) => void;
    active: boolean;
}) {
    const lvl = levelBadgeStyle(course.level);
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
                {/* level + category */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: lvl.bg, color: lvl.text }}>
                        {course.level}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{course.category.replace("-", " ").toUpperCase()}</span>
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
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="size-3" /> {course.lessons} lessons</span>
                    <span className="flex items-center gap-1 ml-auto"><Star className="size-3 fill-amber-400 text-amber-400" /> {course.rating}</span>
                </div>

                {/* progress bar */}
                {pct > 0 && (
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
                )}

                {pct === 0 && (
                    <button
                        className="mt-auto w-full rounded-xl py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                        style={{ background: course.color }}
                        onClick={e => { e.stopPropagation(); onOpen(course); }}
                    >
                        <Play className="size-3.5" /> Start Learning
                    </button>
                )}
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

function CourseViewer({ course, onBack }: { course: Course; onBack: () => void }) {
    const done = course.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
    const total = course.modules.flatMap(m => m.lessons).length;
    const lvl = levelBadgeStyle(course.level);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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
                        <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ background: lvl.bg, color: lvl.text }}>
                            {course.level}
                        </span>
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
                        <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {course.duration}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="size-3.5" /> {course.lessons} lessons</span>
                        <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {course.enrolled.toLocaleString()} enrolled</span>
                        <span className="flex items-center gap-1.5"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {course.rating} rating</span>
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

                    {/* tags */}
                    <div className="flex flex-wrap gap-2">
                        {course.tags.map(tag => (
                            <span key={tag} className="text-[11px] rounded-full px-3 py-0.5 bg-white/80 border border-zinc-200 text-zinc-600 font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress summary */}
            {total > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Completed", value: `${done}/${total}`, icon: <CheckCircle2 className="size-5 text-emerald-500" /> },
                        { label: "Progress", value: `${course.progress}%`, icon: <TrendingUp className="size-5" style={{ color: BRAND }} /> },
                        { label: "Modules", value: course.modules.length.toString(), icon: <BookOpen className="size-5 text-amber-500" /> },
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
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [filterLevel, setFilterLevel] = useState<string>("all");
    const activeCourseId = activeCourse?.id ?? null;

    const filtered = useMemo(() => {
        return COURSES.filter(c => {
            const matchCat = activeCategory === "all" || c.category === activeCategory;
            const matchSearch = searchQuery === "" ||
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchLevel = filterLevel === "all" || c.level === filterLevel;
            return matchCat && matchSearch && matchLevel;
        });
    }, [activeCategory, searchQuery, filterLevel]);

    const inProgress = COURSES.filter(c => c.progress > 0 && c.progress < 100);
    const completed = COURSES.filter(c => c.progress === 100);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
            {/* ── Left sidebar ── */}
            <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white shrink-0">
                {/* Saige brand */}
                <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-100">
                    <div className="flex size-8 items-center justify-center rounded-lg shadow-sm" style={{ background: BRAND }}>
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-zinc-900">Saige</span>
                    <span className="ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: BRAND_LIGHT, color: BRAND }}>Learn</span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {/* Dashboard */}
                    <NavItem icon={<BarChart2 className="size-4" />} label="Dashboard" href="/learn" active />
                    <NavItem icon={<BookOpen className="size-4" />} label="My Courses" href="/learn" badge={inProgress.length} />
                    <NavItem icon={<Trophy className="size-4" />} label="Achievements" href="/learn" />
                    <NavItem icon={<Target className="size-4" />} label="Learning Path" href="/learn" />
                    <NavItem icon={<GraduationCap className="size-4" />} label="Certificates" href="/learn" badge={completed.length} badgeColor="#059669" />

                    <div className="pt-4 pb-2 px-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Categories</p>
                    </div>

                    {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setActiveCourse(null); }}
                            className={cn(
                                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors text-left",
                                activeCategory === cat.id
                                    ? "font-semibold text-[#3A63C2] bg-[#eef2fb]"
                                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                            )}
                        >
                            <span className="text-base leading-none">{cat.icon}</span>
                            <span className="flex-1 truncate">{cat.label}</span>
                            <span className="text-[10px] text-zinc-400">{cat.count}</span>
                        </button>
                    ))}
                </nav>

                {/* User footer */}
                <div className="border-t border-zinc-100 p-3 flex items-center gap-2.5">
                    <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0"
                        style={{ background: BRAND }}>
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-zinc-800 truncate">Your Account</p>
                        <p className="text-[10px] text-zinc-400">Dental Professional</p>
                    </div>
                    <Settings className="size-4 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors shrink-0" />
                </div>
            </aside>

            {/* ── Main area ── */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
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
                        {/* Level filter */}
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-zinc-400" />
                            <select
                                value={filterLevel}
                                onChange={e => { setFilterLevel(e.target.value); setActiveCourse(null); }}
                                className="h-9 pl-7 pr-3 text-[12px] rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all"
                                style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                            >
                                <option value="all">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <button className="relative size-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                            <Bell className="size-4" />
                            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
                        </button>
                    </div>
                </header>

                {/* Content area */}
                {activeCourse ? (
                    <CourseViewer course={activeCourse} onBack={() => setActiveCourse(null)} />
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                        {/* Hero banner */}
                        <div
                            className="rounded-2xl p-6 flex items-center justify-between relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #2d4fa0 100%)` }}
                        >
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }}
                            />
                            <div className="relative z-10 space-y-2 max-w-lg">
                                <p className="text-white/70 text-[12px] font-medium uppercase tracking-widest">Dental Learning Hub</p>
                                <h1 className="text-white text-2xl font-bold leading-snug">
                                    Elevate Your Dental Practice Skills
                                </h1>
                                <p className="text-white/75 text-[13px] leading-relaxed">
                                    Expert-led courses on front office operations, billing, clinical excellence, and practice management. Learn at your own pace.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        className="bg-white text-[13px] font-semibold rounded-xl px-4 py-2 transition-opacity hover:opacity-90 flex items-center gap-1.5"
                                        style={{ color: BRAND }}
                                        onClick={() => setActiveCourse(COURSES[0])}
                                    >
                                        <Play className="size-3.5" /> Continue Learning
                                    </button>
                                    <button
                                        className="border border-white/40 text-white text-[13px] font-medium rounded-xl px-4 py-2 hover:bg-white/10 transition-colors"
                                        onClick={() => setActiveCategory("all")}
                                    >
                                        Browse All
                                    </button>
                                </div>
                            </div>
                            <div className="relative z-10 hidden lg:flex gap-3">
                                {STATS.map(s => (
                                    <div key={s.label} className="flex flex-col items-center justify-center bg-white/15 rounded-xl px-5 py-4 min-w-[90px] backdrop-blur-sm">
                                        <span className="text-white text-xl font-bold">{s.value}</span>
                                        <span className="text-white/70 text-[10px] font-medium mt-0.5">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Continue learning */}
                        {inProgress.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[15px] font-bold text-zinc-900">Continue Learning</h2>
                                    <button className="text-[12px] font-medium hover:underline" style={{ color: BRAND }}>See all</button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-1">
                                    {inProgress.map(c => (
                                        <div
                                            key={c.id}
                                            className="flex gap-4 items-center rounded-2xl border border-zinc-100 bg-white p-4 cursor-pointer hover:shadow-md hover:border-zinc-200 transition-all duration-200 min-w-[340px]"
                                            onClick={() => setActiveCourse(c)}
                                        >
                                            <div className="size-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                                                style={{ background: `${c.color}12` }}>
                                                {c.thumbnail}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-zinc-800 truncate">{c.title}</p>
                                                <p className="text-[11px] text-zinc-400 mt-0.5">{c.instructor}</p>
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

                        {/* Category tabs */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[15px] font-bold text-zinc-900">
                                    {activeCategory === "all" ? "All Courses" : CATEGORIES.find(c => c.id === activeCategory)?.label}
                                    <span className="ml-2 text-[12px] font-normal text-zinc-400">({filtered.length})</span>
                                </h2>
                            </div>

                            {/* Horizontal tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setActiveCourse(null); }}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 border",
                                            activeCategory === cat.id
                                                ? "text-white border-transparent shadow-sm"
                                                : "text-zinc-500 border-zinc-200 bg-white hover:border-zinc-300 hover:text-zinc-800"
                                        )}
                                        style={activeCategory === cat.id ? { background: BRAND } : undefined}
                                    >
                                        <span>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Course grid */}
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                                    <BookOpen className="size-10 text-zinc-200" />
                                    <p className="text-zinc-400 font-medium">No courses match your search</p>
                                    <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setFilterLevel("all"); }} className="text-[13px] font-medium hover:underline" style={{ color: BRAND }}>
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filtered.map(course => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            onOpen={setActiveCourse}
                                            active={activeCourseId === course.id}
                                        />
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
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            onOpen={setActiveCourse}
                                            active={activeCourseId === course.id}
                                        />
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

// ─── tiny nav item ────────────────────────────────────────────────────────────

function NavItem({
    icon,
    label,
    href,
    active,
    badge,
    badgeColor,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
    badge?: number;
    badgeColor?: string;
}) {
    return (
        <a
            href={href}
            className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active
                    ? "font-semibold text-[#3A63C2] bg-[#eef2fb]"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 font-medium"
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span
                    className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-white min-w-[18px] text-center"
                    style={{ background: badgeColor ?? BRAND }}
                >
                    {badge}
                </span>
            )}
        </a>
    );
}
