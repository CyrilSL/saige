// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "Manager" | "Front Desk" | "Insurance & Billing" | "Assistant" | "Hygiene";
export type UserStatus = "active" | "invited" | "inactive";
export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "video" | "reading" | "quiz";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ManagedLesson {
    id: string;
    title: string;
    type: LessonType;
    duration: string;
    content?: string;
}

export interface ManagedModule {
    id: string;
    title: string;
    description: string;
    lessons: ManagedLesson[];
}

export interface ManagedCourse {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    level: CourseLevel;
    status: CourseStatus;
    assignedRoles: UserRole[];
    modules: ManagedModule[];
    createdAt: string;
    updatedAt: string;
    thumbnail: string;
    color: string;
}

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joinedAt: string;
    assignedCourses: string[]; // course IDs
    progress: Record<string, number>; // courseId -> 0-100
    avatar: string;
}

export interface KnowledgeDoc {
    id: string;
    title: string;
    type: "pdf" | "docx" | "txt" | "paste";
    size: string;
    status: "processing" | "indexed" | "failed";
    uploadedAt: string;
    tags: string[];
    scope: "local" | "global";
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const MANAGED_COURSES: ManagedCourse[] = [
    {
        id: "c1",
        title: "Front Office Mastery",
        subtitle: "Complete guide to running an efficient dental front office",
        category: "front-office",
        level: "Beginner",
        status: "published",
        assignedRoles: ["Front Desk"],
        color: "#3A63C2",
        thumbnail: "🗂️",
        createdAt: "2026-01-10",
        updatedAt: "2026-02-01",
        modules: [
            {
                id: "m1",
                title: "Introduction to Front Office",
                description: "Core concepts and daily routines",
                lessons: [
                    { id: "l1", title: "Welcome & Course Overview", type: "video", duration: "5 min" },
                    { id: "l2", title: "Daily Opening Procedures", type: "video", duration: "8 min" },
                    { id: "l3", title: "Module Quiz", type: "quiz", duration: "10 min" },
                ],
            },
        ],
    },
    {
        id: "c2",
        title: "Dental Billing & Insurance",
        subtitle: "Master claims, coding, and revenue cycle management",
        category: "billing",
        level: "Intermediate",
        status: "published",
        assignedRoles: ["Insurance & Billing", "Front Desk"],
        color: "#059669",
        thumbnail: "🧾",
        createdAt: "2026-01-15",
        updatedAt: "2026-02-10",
        modules: [],
    },
    {
        id: "c3",
        title: "Patient Experience Excellence",
        subtitle: "Create memorable patient journeys from first call to follow-up",
        category: "front-office",
        level: "Beginner",
        status: "draft",
        assignedRoles: [],
        color: "#7C3AED",
        thumbnail: "💬",
        createdAt: "2026-02-05",
        updatedAt: "2026-02-20",
        modules: [],
    },
];

export const MANAGED_USERS: ManagedUser[] = [
    {
        id: "u1",
        name: "Priya Nair",
        email: "priya@riverside.dental",
        role: "Front Desk",
        status: "active",
        joinedAt: "2026-01-12",
        assignedCourses: ["c1", "c2"],
        progress: { c1: 65, c2: 20 },
        avatar: "PN",
    },
    {
        id: "u2",
        name: "James Ortega",
        email: "james@riverside.dental",
        role: "Insurance & Billing",
        status: "active",
        joinedAt: "2026-01-20",
        assignedCourses: ["c2"],
        progress: { c2: 80 },
        avatar: "JO",
    },
    {
        id: "u3",
        name: "Sara Mehl",
        email: "sara@riverside.dental",
        role: "Hygiene",
        status: "invited",
        joinedAt: "2026-02-18",
        assignedCourses: [],
        progress: {},
        avatar: "SM",
    },
    {
        id: "u4",
        name: "Derek Chan",
        email: "derek@riverside.dental",
        role: "Assistant",
        status: "active",
        joinedAt: "2026-01-28",
        assignedCourses: ["c1"],
        progress: { c1: 100 },
        avatar: "DC",
    },
];

export const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
    {
        id: "d1",
        title: "Office Scheduling Policy v3.pdf",
        type: "pdf",
        size: "245 KB",
        status: "indexed",
        uploadedAt: "2026-02-01",
        tags: ["Scheduling", "Policy"],
        scope: "local",
    },
    {
        id: "d2",
        title: "Insurance Verification SOP.docx",
        type: "docx",
        size: "118 KB",
        status: "indexed",
        uploadedAt: "2026-02-10",
        tags: ["Insurance", "SOP"],
        scope: "local",
    },
    {
        id: "d3",
        title: "New Patient Scripts (Pasted)",
        type: "paste",
        size: "4 KB",
        status: "processing",
        uploadedAt: "2026-02-22",
        tags: ["Scripts", "Front Desk"],
        scope: "local",
    },
];

export const CATEGORIES = [
    { id: "front-office", label: "Front Office", color: "#3A63C2" },
    { id: "billing", label: "Insurance & Billing", color: "#059669" },
    { id: "clinical", label: "Clinical Skills", color: "#DC2626" },
    { id: "hygiene", label: "Dental Hygiene", color: "#0891B2" },
    { id: "management", label: "Practice Management", color: "#EA580C" },
];

export const ROLES: UserRole[] = [
    "Front Desk",
    "Insurance & Billing",
    "Assistant",
    "Hygiene",
];
