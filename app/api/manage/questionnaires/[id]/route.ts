import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionnaires, questions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// PATCH /api/manage/questionnaires/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, passingScore, questions: qs } = body;

        await db.update(questionnaires).set({
            title,
            description,
            passingScore,
            updatedAt: new Date(),
        }).where(eq(questionnaires.id, parseInt(id)));

        // Replace questions: delete old, insert new
        if (qs !== undefined) {
            await db.delete(questions).where(eq(questions.questionnaireId, parseInt(id)));
            if (qs.length > 0) {
                await db.insert(questions).values(
                    qs.map((q: any, i: number) => ({
                        questionnaireId: parseInt(id),
                        text: q.text,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctOption: q.correctOption,
                        explanation: q.explanation ?? "",
                        position: i,
                    }))
                );
            }
        }

        const result = await db.query.questionnaires.findFirst({
            where: eq(questionnaires.id, parseInt(id)),
            with: { questions: { orderBy: (q, { asc }) => [asc(q.position)] } },
        });
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/manage/questionnaires/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(questionnaires).where(eq(questionnaires.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
