import { db } from "@/lib/db";
import { users, userCourseAssignments, courses, userLessonProgress } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, ne, desc } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/manage/users — staff only (non-managers) for the active practice
export async function GET() {
    try {
        const staffUsers = await db
            .select()
            .from(users)
            .where(and(eq(users.practiceId, PRACTICE_ID), ne(users.role, "manager")))
            .orderBy(desc(users.createdAt));

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

        const allModules = await db.query.modules.findMany({
            with: { lessons: true }
        });

        const courseLessonsMap: Record<number, number> = {};
        const lessonToCourseMap: Record<number, number> = {};
        for (const m of allModules) {
            courseLessonsMap[m.courseId] = (courseLessonsMap[m.courseId] ?? 0) + m.lessons.length;
            for (const l of m.lessons) {
                lessonToCourseMap[l.id] = m.courseId;
            }
        }

        const userProgress = await db.query.userLessonProgress.findMany({
            where: eq(userLessonProgress.completed, true)
        });

        const userCourseProgressMap: Record<number, Record<number, number>> = {};
        for (const p of userProgress) {
            const courseId = lessonToCourseMap[p.lessonId];
            if (!courseId) continue;
            if (!userCourseProgressMap[p.userId]) userCourseProgressMap[p.userId] = {};
            userCourseProgressMap[p.userId][courseId] = (userCourseProgressMap[p.userId][courseId] ?? 0) + 1;
        }

        const assignmentMap: Record<number, any[]> = {};
        for (const a of assignments) {
            const total = courseLessonsMap[a.courseId] ?? 0;
            const completed = userCourseProgressMap[a.userId]?.[a.courseId] ?? 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            if (!assignmentMap[a.userId]) assignmentMap[a.userId] = [];
            assignmentMap[a.userId].push({
                ...a,
                progress,
            });
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

// POST /api/manage/users — invite new staff
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
            practiceId: PRACTICE_ID,
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
