import { db } from "@/lib/db";
import { courses, userLessonProgress, userCourseAssignments } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/learn/courses?role=front_desk&userId=1
// Returns published courses that are either:
//   1. Assigned to the user's role (via course.assignedRoles), OR
//   2. Directly assigned to the user (via userCourseAssignments)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role") ?? "";
        const userIdParam = searchParams.get("userId");
        const userId = userIdParam ? parseInt(userIdParam, 10) : null;

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

        // Get courses directly assigned to this user
        const directlyAssignedIds = new Set<number>();
        if (userId) {
            const assignments = await db.query.userCourseAssignments.findMany({
                where: eq(userCourseAssignments.userId, userId),
            });
            for (const a of assignments) {
                directlyAssignedIds.add(a.courseId);
            }
        }

        // Show course if:
        //   - it matches the user's role (or has no roles = visible to all), OR
        //   - it's directly assigned to this user
        const filtered = allCourses.filter(c => {
            // Direct assignment always wins
            if (directlyAssignedIds.has(c.id)) return true;

            // Role-based match
            if (role) {
                const roles = (c.assignedRoles ?? "").split(",").map(r => r.trim()).filter(Boolean);
                return roles.length === 0 || roles.includes(role);
            }

            return true;
        });

        if (!userId) {
            return NextResponse.json(filtered);
        }

        const userProgress = await db.query.userLessonProgress.findMany({
            where: eq(userLessonProgress.userId, userId),
        });

        const completedMap = new Set(userProgress.filter(p => p.completed).map(p => p.lessonId));

        const coursesWithProgress = filtered.map(course => {
            const modulesWithProgress = course.modules.map(module => ({
                ...module,
                lessons: module.lessons.map(lesson => ({
                    ...lesson,
                    completed: completedMap.has(lesson.id),
                })),
            }));

            return {
                ...course,
                modules: modulesWithProgress,
            };
        });

        return NextResponse.json(coursesWithProgress);
    } catch (e: any) {
        console.error("GET /api/learn/courses error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
