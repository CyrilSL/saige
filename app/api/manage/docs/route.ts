import { db } from "@/lib/db";
import { knowledgeDocs } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

// GET /api/manage/docs
export async function GET() {
    try {
        const docs = await db.query.knowledgeDocs.findMany({
            where: eq(knowledgeDocs.practiceId, 1),
            orderBy: [desc(knowledgeDocs.uploadedAt)],
        });
        return NextResponse.json(docs);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
    }
}

// POST /api/manage/docs  (paste text)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, rawContent, tags } = body;

        const sizeBytes = new TextEncoder().encode(rawContent ?? "").length;
        const sizeLabel =
            sizeBytes < 1024
                ? `${sizeBytes} B`
                : `${Math.round(sizeBytes / 1024)} KB`;

        const [created] = await db.insert(knowledgeDocs).values({
            practiceId: 1,
            title: title?.trim() || "Pasted Content",
            type: "paste",
            sizeLabel,
            status: "processing",
            scope: "local",
            tags: Array.isArray(tags) ? tags.join(",") : (tags ?? ""),
            rawContent: rawContent ?? "",
            uploadedByUserId: 1, // manager
        }).returning();

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to save doc" }, { status: 500 });
    }
}
