export interface Category {
    id: string;
    label: string;
    icon: string;
    color: string;
}

export const CATEGORIES: Category[] = [
    { id: "all", label: "All Courses", icon: "🎓", color: "#6B7280" },
    { id: "front-office", label: "Front Office", icon: "🗂️", color: "#3A63C2" },
    { id: "billing", label: "Insurance & Billing", icon: "🧾", color: "#059669" },
    { id: "clinical", label: "Clinical Skills", icon: "🦷", color: "#DC2626" },
    { id: "hygiene", label: "Dental Hygiene", icon: "🪥", color: "#0891B2" },
    { id: "management", label: "Practice Management", icon: "📊", color: "#EA580C" },
];

export const PREDEFINED_ROLES = [
    { label: "Front Desk", value: "front_desk" },
    { label: "Insurance & Billing", value: "insurance_billing" },
    { label: "Assistant", value: "assistant" },
    { label: "Hygiene", value: "hygiene" },
];
