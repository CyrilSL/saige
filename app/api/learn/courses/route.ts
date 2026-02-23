import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/learn/courses?role=front_desk
// Returns published courses assigned to a given role.
// If no role param, returns all published courses for this practice.
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role") ?? "";

        const allCourses = await db.query.courses.findMany({
            where: and(
                eq(courses.practiceId, PRACTICE_ID),
                eq(courses.status, "published")
            ),
            with: {
                modules: {
                    with: {
                        lessons: { orderBy: (l, { asc }) => [asc(l.position)] },
                    },
                    orderBy: (m, { asc }) => [asc(m.position)],
                },
            },
        });

        // Filter by role: show course if no roles assigned (visible to all)
        // or if the user's role appears in assignedRoles
        const filtered = role
            ? allCourses.filter(c => {
                const roles = (c.assignedRoles ?? "").split(",").map(r => r.trim()).filter(Boolean);
                return roles.length === 0 || roles.includes(role);
            })
            : allCourses;

        return NextResponse.json(filtered);
    } catch (e: any) {
        console.error("GET /api/learn/courses error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
