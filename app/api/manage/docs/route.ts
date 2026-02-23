import { db } from "@/lib/db";
import { knowledgeDocs, users } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/manage/docs
export async function GET() {
    try {
        const docs = await db
            .select()
            .from(knowledgeDocs)
            .where(eq(knowledgeDocs.practiceId, PRACTICE_ID))
            .orderBy(desc(knowledgeDocs.uploadedAt));

        return NextResponse.json(docs);
    } catch (e: any) {
        console.error("GET /api/manage/docs error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
    }
}

// POST /api/manage/docs — save pasted text
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, rawContent, tags } = body;

        const sizeBytes = new TextEncoder().encode(rawContent ?? "").length;
        const sizeLabel =
            sizeBytes < 1024 ? `${sizeBytes} B` : `${Math.round(sizeBytes / 1024)} KB`;

        // Get the manager user for this practice to set uploadedByUserId
        const manager = await db.query.users.findFirst({
            where: (u, { eq, and }) =>
                and(eq(u.practiceId, PRACTICE_ID), eq(u.role, "manager")),
        });

        const [created] = await db.insert(knowledgeDocs).values({
            practiceId: PRACTICE_ID,
            title: title?.trim() || "Pasted Content",
            type: "paste",
            sizeLabel,
            status: "processing",
            scope: "local",
            tags: Array.isArray(tags) ? tags.join(",") : (tags ?? ""),
            rawContent: rawContent ?? "",
            uploadedByUserId: manager?.id,
        }).returning();

        return NextResponse.json(created, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/manage/docs error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to save doc" }, { status: 500 });
    }
}
