import { db } from "@/lib/db";
import { users, practices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { PRACTICE_ID } from "@/lib/config";

// GET /api/users/all
// Returns all users for the active practice (scoped by PRACTICE_ID).
export async function GET() {
    try {
        const rows = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                status: users.status,
                avatarInitials: users.avatarInitials,
                practiceId: users.practiceId,
                practiceName: practices.name,
            })
            .from(users)
            .innerJoin(practices, eq(users.practiceId, practices.id))
            .where(eq(users.practiceId, PRACTICE_ID))
            .orderBy(asc(users.role), asc(users.name));

        return NextResponse.json(rows);
    } catch (e: any) {
        console.error("GET /api/users/all error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
