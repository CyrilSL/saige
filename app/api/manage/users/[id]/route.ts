import { db } from "@/lib/db";
import { users, userCourseAssignments } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// PATCH /api/manage/users/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);
        const body = await req.json();
        const { role, assignedCourses } = body;

        // 1. Update roles in users table
        if (role !== undefined) {
            await db
                .update(users)
                .set({ role })
                .where(and(eq(users.id, userId), eq(users.practiceId, PRACTICE_ID)));
        }

        // 2. Update assigned courses
        if (Array.isArray(assignedCourses)) {
            // Delete old assignments
            await db
                .delete(userCourseAssignments)
                .where(eq(userCourseAssignments.userId, userId));

            // Insert new assignments
            if (assignedCourses.length > 0) {
                await db.insert(userCourseAssignments).values(
                    assignedCourses.map(courseId => ({
                        userId,
                        courseId,
                    }))
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PATCH /api/manage/users/[id] error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
