import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/manage/roles
export async function GET() {
    try {
        const practiceRoles = await db
            .select()
            .from(roles)
            .where(eq(roles.practiceId, PRACTICE_ID))
            .orderBy(desc(roles.createdAt));

        return NextResponse.json(practiceRoles);
    } catch (e: any) {
        console.error("GET /api/manage/roles error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}

// POST /api/manage/roles
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, color } = body;

        const value = name.trim().toLowerCase().replace(/\s+/g, "_");

        const [created] = await db.insert(roles).values({
            practiceId: PRACTICE_ID,
            name: name.trim(),
            value,
            color: color || "#3A63C2",
        }).returning();

        return NextResponse.json(created, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/manage/roles error:", e?.message ?? e);
        // Handle unique constraint failure specifically
        if (e.code === "23505") { // PostgreSQL unique violation code
            return NextResponse.json({ error: "Role already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
