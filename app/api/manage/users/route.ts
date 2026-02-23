import { db } from "@/lib/db";
import { users, userCourseAssignments, courses } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/manage/users
export async function GET() {
    try {
        // Fetch staff (non-managers) 
        const staffUsers = await db
            .select()
            .from(users)
            .where(and(eq(users.practiceId, 1), ne(users.role, "manager")))
            .orderBy(desc(users.createdAt));

        // Fetch assignments with course info for all staff
        const assignments = await db
            .select({
                userId: userCourseAssignments.userId,
                courseId: userCourseAssignments.courseId,
                courseTitle: courses.title,
                courseColor: courses.color,
                courseThumbnail: courses.thumbnail,
            })
            .from(userCourseAssignments)
            .innerJoin(courses, eq(userCourseAssignments.courseId, courses.id));

        // Group assignments by userId
        const assignmentMap: Record<number, typeof assignments> = {};
        for (const a of assignments) {
            if (!assignmentMap[a.userId]) assignmentMap[a.userId] = [];
            assignmentMap[a.userId].push(a);
        }

        const result = staffUsers.map(u => ({
            ...u,
            assignedCourses: assignmentMap[u.id] ?? [],
        }));

        return NextResponse.json(result);
    } catch (e: any) {
        console.error("GET /api/manage/users error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST /api/manage/users  (invite new staff)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, role } = body;

        const roleMap: Record<string, string> = {
            "Front Desk": "front_desk",
            "Insurance & Billing": "insurance_billing",
            "Assistant": "assistant",
            "Hygiene": "hygiene",
        };

        const [created] = await db.insert(users).values({
            practiceId: 1,
            name: name?.trim() || email.split("@")[0],
            email: email.trim(),
            role: (roleMap[role] ?? "front_desk") as any,
            status: "invited",
            avatarInitials: (name?.trim() || email).slice(0, 2).toUpperCase(),
        }).returning();

        return NextResponse.json({ ...created, assignedCourses: [] }, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/manage/users error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
    }
}
