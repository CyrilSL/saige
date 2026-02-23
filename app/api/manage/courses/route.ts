import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/manage/courses
export async function GET() {
    try {
        const allCourses = await db.query.courses.findMany({
            where: eq(courses.practiceId, PRACTICE_ID),
            with: {
                modules: {
                    with: {
                        lessons: { orderBy: (l, { asc }) => [asc(l.position)] },
                    },
                    orderBy: (m, { asc }) => [asc(m.position)],
                },
            },
            orderBy: [desc(courses.createdAt)],
        });
        return NextResponse.json(allCourses);
    } catch (e: any) {
        console.error("GET /api/manage/courses error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

// POST /api/manage/courses
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, subtitle, category, level, status, thumbnail, color, assignedRoles } = body;

        const [created] = await db.insert(courses).values({
            practiceId: PRACTICE_ID,
            title,
            subtitle: subtitle ?? "",
            category: category ?? "front-office",
            level: level ?? "Beginner",
            status: status ?? "draft",
            thumbnail: thumbnail ?? "📚",
            color: color ?? "#3A63C2",
            assignedRoles: Array.isArray(assignedRoles)
                ? assignedRoles.join(",")
                : (assignedRoles ?? ""),
        }).returning();

        return NextResponse.json({ ...created, modules: [] }, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/manage/courses error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
