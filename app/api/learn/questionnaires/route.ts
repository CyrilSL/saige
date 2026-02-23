import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionnaires, questions, questionnaireResponses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/learn/questionnaires?courseId=X
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = parseInt(searchParams.get("courseId") ?? "0");
        if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

        const rows = await db.query.questionnaires.findMany({
            where: eq(questionnaires.courseId, courseId),
            with: {
                questions: {
                    orderBy: (q, { asc }) => [asc(q.position)],
                    // Don't expose correctOption to the client during the quiz
                    columns: {
                        id: true,
                        text: true,
                        optionA: true,
                        optionB: true,
                        optionC: true,
                        optionD: true,
                        position: true,
                        // correctOption intentionally omitted
                    },
                },
            },
        });
        return NextResponse.json(rows);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/learn/questionnaires — submit answers
// Body: { questionnaireId, userId, answers: { [questionId]: "A"|"B"|"C"|"D" } }
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { questionnaireId, userId, answers } = body;

        // Fetch questionnaire with correct answers
        const qn = await db.query.questionnaires.findFirst({
            where: eq(questionnaires.id, questionnaireId),
            with: { questions: true },
        });
        if (!qn) return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });

        // Score
        const total = qn.questions.length;
        const correct = qn.questions.filter(q => answers[q.id] === q.correctOption).length;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        const passed = score >= (qn.passingScore ?? 70);

        // Save response
        const [resp] = await db.insert(questionnaireResponses).values({
            questionnaireId,
            userId,
            answers: JSON.stringify(answers),
            score,
            passed,
        }).returning();

        // Return result with correct answers + explanations
        return NextResponse.json({
            score,
            passed,
            passingScore: qn.passingScore,
            correct,
            total,
            responseId: resp.id,
            questions: qn.questions.map(q => ({
                id: q.id,
                text: q.text,
                correctOption: q.correctOption,
                explanation: q.explanation,
                yourAnswer: answers[q.id] ?? null,
                isCorrect: answers[q.id] === q.correctOption,
            })),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
