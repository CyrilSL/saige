export interface Lesson {
    id: string;
    title: string;
    duration: string; // e.g. "12 min"
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
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    lessons: number;
    enrolled: number;
    rating: number;
    progress: number; // 0-100
    thumbnail: string; // emoji or icon key
    instructor: string;
    instructorTitle: string;
    tags: string[];
    featured?: boolean;
    new?: boolean;
    modules: Module[];
    color: string; // accent color for the card
}

export interface Category {
    id: string;
    label: string;
    icon: string;
    count: number;
}

export const CATEGORIES: Category[] = [
    { id: "all", label: "All Courses", icon: "🎓", count: 24 },
    { id: "front-office", label: "Front Office", icon: "🗂️", count: 8 },
    { id: "clinical", label: "Clinical Skills", icon: "🦷", count: 6 },
    { id: "billing", label: "Insurance & Billing", icon: "🧾", count: 4 },
    { id: "hygiene", label: "Dental Hygiene", icon: "🪥", count: 3 },
    { id: "management", label: "Practice Management", icon: "📊", count: 3 },
];

export const COURSES: Course[] = [
    {
        id: "1",
        title: "Front Office Mastery",
        subtitle: "Complete guide to running an efficient dental front office",
        category: "front-office",
        level: "Beginner",
        duration: "4h 30m",
        lessons: 18,
        enrolled: 1240,
        rating: 4.9,
        progress: 65,
        thumbnail: "🗂️",
        instructor: "Dr. Sarah Chen",
        instructorTitle: "Practice Management Expert",
        tags: ["Scheduling", "Patient Relations", "Communication"],
        featured: true,
        color: "#3A63C2",
        modules: [
            {
                id: "m1",
                title: "Introduction to Front Office Operations",
                description: "Core concepts and daily routines for front office staff",
                lessons: [
                    { id: "l1", title: "Welcome & Course Overview", duration: "5 min", type: "video", completed: true, locked: false },
                    { id: "l2", title: "The Role of Front Office in Dental Practice", duration: "12 min", type: "video", completed: true, locked: false },
                    { id: "l3", title: "Daily Opening Procedures", duration: "8 min", type: "video", completed: true, locked: false },
                    { id: "l4", title: "Module Quiz", duration: "10 min", type: "quiz", completed: false, locked: false },
                ],
            },
            {
                id: "m2",
                title: "Patient Scheduling & Communication",
                description: "Mastering appointment systems and patient communication",
                lessons: [
                    { id: "l5", title: "Scheduling Best Practices", duration: "15 min", type: "video", completed: true, locked: false },
                    { id: "l6", title: "Handling Cancellations & No-Shows", duration: "11 min", type: "video", completed: false, locked: false },
                    { id: "l7", title: "Phone Etiquette for Dental Offices", duration: "13 min", type: "reading", completed: false, locked: false },
                    { id: "l8", title: "Patient Communication Quiz", duration: "8 min", type: "quiz", completed: false, locked: true },
                ],
            },
            {
                id: "m3",
                title: "Insurance Verification Fundamentals",
                description: "Step-by-step insurance verification workflow",
                lessons: [
                    { id: "l9", title: "Understanding Dental Insurance Plans", duration: "18 min", type: "video", completed: false, locked: true },
                    { id: "l10", title: "Verification Workflow", duration: "14 min", type: "video", completed: false, locked: true },
                    { id: "l11", title: "Common Insurance Pitfalls", duration: "10 min", type: "reading", completed: false, locked: true },
                ],
            },
        ],
    },
    {
        id: "2",
        title: "Dental Billing & Insurance",
        subtitle: "Master claims, coding, and revenue cycle management",
        category: "billing",
        level: "Intermediate",
        duration: "6h 15m",
        lessons: 24,
        enrolled: 890,
        rating: 4.8,
        progress: 20,
        thumbnail: "🧾",
        instructor: "Marcus Williams",
        instructorTitle: "Billing & Coding Specialist",
        tags: ["CDT Codes", "Claims", "EOB"],
        new: true,
        color: "#059669",
        modules: [
            {
                id: "m1",
                title: "CDT Coding Essentials",
                description: "Understanding and applying dental procedure codes",
                lessons: [
                    { id: "l1", title: "Introduction to CDT Codes", duration: "14 min", type: "video", completed: true, locked: false },
                    { id: "l2", title: "Diagnostic & Preventive Codes", duration: "20 min", type: "video", completed: false, locked: false },
                    { id: "l3", title: "Restorative Procedure Codes", duration: "18 min", type: "video", completed: false, locked: true },
                ],
            },
            {
                id: "m2",
                title: "Claims Management",
                description: "Submitting clean claims and managing rejections",
                lessons: [
                    { id: "l4", title: "Building a Clean Claim", duration: "16 min", type: "video", completed: false, locked: true },
                    { id: "l5", title: "Handling Denials & Appeals", duration: "22 min", type: "video", completed: false, locked: true },
                ],
            },
        ],
    },
    {
        id: "3",
        title: "Patient Experience Excellence",
        subtitle: "Create memorable patient journeys from first call to follow-up",
        category: "front-office",
        level: "Beginner",
        duration: "3h 10m",
        lessons: 14,
        enrolled: 2100,
        rating: 4.95,
        progress: 100,
        thumbnail: "💬",
        instructor: "Dr. Aisha Patel",
        instructorTitle: "Patient Experience Consultant",
        tags: ["Communication", "Empathy", "Retention"],
        color: "#7C3AED",
        modules: [
            {
                id: "m1",
                title: "First Impressions",
                description: "Setting the tone from the first patient touchpoint",
                lessons: [
                    { id: "l1", title: "The First Phone Call", duration: "12 min", type: "video", completed: true, locked: false },
                    { id: "l2", title: "Greeting Patients in Person", duration: "9 min", type: "video", completed: true, locked: false },
                    { id: "l3", title: "Quiz: First Impressions", duration: "5 min", type: "quiz", completed: true, locked: false },
                ],
            },
        ],
    },
    {
        id: "4",
        title: "Dental Hygiene Protocols",
        subtitle: "Evidence-based hygiene techniques and patient education",
        category: "hygiene",
        level: "Intermediate",
        duration: "5h 45m",
        lessons: 22,
        enrolled: 670,
        rating: 4.7,
        progress: 0,
        thumbnail: "🪥",
        instructor: "Jennifer Torres, RDH",
        instructorTitle: "Registered Dental Hygienist",
        tags: ["Periodontal", "Prophylaxis", "OHI"],
        color: "#0891B2",
        modules: [],
    },
    {
        id: "5",
        title: "Practice Management & Leadership",
        subtitle: "Lead your team and optimize practice performance metrics",
        category: "management",
        level: "Advanced",
        duration: "8h 00m",
        lessons: 30,
        enrolled: 420,
        rating: 4.85,
        progress: 0,
        thumbnail: "📊",
        instructor: "Dr. Robert Kim",
        instructorTitle: "Dental Business Coach",
        tags: ["Leadership", "KPIs", "Team Building"],
        featured: true,
        color: "#DC2626",
        modules: [],
    },
    {
        id: "6",
        title: "Infection Control & OSHA",
        subtitle: "Stay compliant with infection control standards and OSHA requirements",
        category: "clinical",
        level: "Beginner",
        duration: "2h 30m",
        lessons: 10,
        enrolled: 3400,
        rating: 4.9,
        progress: 0,
        thumbnail: "🛡️",
        instructor: "Dr. Lisa Monroe",
        instructorTitle: "Infection Control Officer",
        tags: ["OSHA", "PPE", "Sterilization"],
        color: "#EA580C",
        modules: [],
    },
];

export const INSTRUCTORS = [
    { name: "Dr. Sarah Chen", title: "Practice Management Expert", courses: 5, students: 4200, avatar: "SC" },
    { name: "Marcus Williams", title: "Billing & Coding Specialist", courses: 3, students: 1800, avatar: "MW" },
    { name: "Dr. Aisha Patel", title: "Patient Experience Consultant", courses: 4, students: 6100, avatar: "AP" },
    { name: "Jennifer Torres, RDH", title: "Registered Dental Hygienist", courses: 2, students: 1200, avatar: "JT" },
];

export const STATS = [
    { label: "Courses", value: "24+" },
    { label: "Active Learners", value: "8,400+" },
    { label: "Expert Instructors", value: "12" },
    { label: "Completion Rate", value: "94%" },
];
