import { db } from "@/lib/db";
import { users, practices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";

// GET /api/users/all — returns all users across all practices with practice name
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
            .orderBy(asc(practices.name), asc(users.role), asc(users.name));

        return NextResponse.json(rows);
    } catch (e: any) {
        console.error("GET /api/users/all error:", e?.message ?? e);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
