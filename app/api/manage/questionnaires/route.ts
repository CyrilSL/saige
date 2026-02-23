import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionnaires, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/manage/questionnaires?courseId=X
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = parseInt(searchParams.get("courseId") ?? "0");
        if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

        const rows = await db.query.questionnaires.findMany({
            where: eq(questionnaires.courseId, courseId),
            with: { questions: { orderBy: (q, { asc }) => [asc(q.position)] } },
            orderBy: (q, { desc }) => [desc(q.createdAt)],
        });
        return NextResponse.json(rows);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/manage/questionnaires
// Body: { courseId, title, description, passingScore, questions: [...] }
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { courseId, title, description, passingScore, questions: qs } = body;

        // Create questionnaire
        const [qn] = await db.insert(questionnaires).values({
            courseId,
            title,
            description: description ?? "",
            passingScore: passingScore ?? 70,
        }).returning();

        // Insert questions
        if (qs && qs.length > 0) {
            await db.insert(questions).values(
                qs.map((q: any, i: number) => ({
                    questionnaireId: qn.id,
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

        // Return with questions
        const result = await db.query.questionnaires.findFirst({
            where: eq(questionnaires.id, qn.id),
            with: { questions: { orderBy: (q, { asc }) => [asc(q.position)] } },
        });
        return NextResponse.json(result, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
