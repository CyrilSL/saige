import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

// GET /api/manage/courses
export async function GET() {
    try {
        const allCourses = await db.query.courses.findMany({
            where: eq(courses.practiceId, 1), // practiceId=1 = Riverside Dental (seeded)
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
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

// POST /api/manage/courses
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, subtitle, category, level, status, thumbnail, color, assignedRoles } = body;

        const [created] = await db.insert(courses).values({
            practiceId: 1,
            title,
            subtitle: subtitle ?? "",
            category: category ?? "front-office",
            level: level ?? "Beginner",
            status: status ?? "draft",
            thumbnail: thumbnail ?? "📚",
            color: color ?? "#3A63C2",
            assignedRoles: Array.isArray(assignedRoles) ? assignedRoles.join(",") : (assignedRoles ?? ""),
        }).returning();

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
