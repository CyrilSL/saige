import { db } from "@/lib/db";
import { users, userCourseAssignments } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/manage/users
export async function GET() {
    try {
        const allUsers = await db.query.users.findMany({
            where: and(
                eq(users.practiceId, 1),
                ne(users.role, "manager")
            ),
            with: {
                assignedCourses: {
                    with: { course: true },
                },
            },
            orderBy: [desc(users.createdAt)],
        });

        return NextResponse.json(allUsers);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST /api/manage/users  (invite new staff)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, role } = body;

        // Map display role to enum value
        const roleMap: Record<string, string> = {
            "Front Desk": "front_desk",
            "Insurance & Billing": "insurance_billing",
            "Assistant": "assistant",
            "Hygiene": "hygiene",
        };

        const [created] = await db.insert(users).values({
            practiceId: 1,
            name: name ?? email.split("@")[0],
            email,
            role: (roleMap[role] ?? "front_desk") as any,
            status: "invited",
            avatarInitials: (name ?? email).slice(0, 2).toUpperCase(),
        }).returning();

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
    }
}
