import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// PATCH /api/manage/courses/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, subtitle, category, status, thumbnail, color, assignedRoles } = body;

        const [updated] = await db
            .update(courses)
            .set({
                title,
                subtitle: subtitle ?? "",
                category: category ?? "front-office",
                status: status ?? "draft",
                thumbnail: thumbnail ?? "📚",
                color: color ?? "#3A63C2",
                assignedRoles: Array.isArray(assignedRoles)
                    ? assignedRoles.join(",")
                    : (assignedRoles ?? ""),
                updatedAt: new Date(),
            })
            .where(and(eq(courses.id, parseInt(id)), eq(courses.practiceId, PRACTICE_ID)))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({ ...updated, modules: [] });
    } catch (e: any) {
        console.error("PATCH /api/manage/courses/[id] error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
    }
}

// DELETE /api/manage/courses/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db
            .delete(courses)
            .where(and(eq(courses.id, parseInt(id)), eq(courses.practiceId, PRACTICE_ID)));
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE /api/manage/courses/[id] error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
    }
}
