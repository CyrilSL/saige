import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// DELETE /api/manage/roles/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roleId = parseInt(id);

        await db
            .delete(roles)
            .where(and(eq(roles.id, roleId), eq(roles.practiceId, PRACTICE_ID)));

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE /api/manage/roles error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
    }
}
