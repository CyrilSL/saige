import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import * as relations from "../lib/db/relations";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { ...schema, ...relations } });

async function seedAcme() {
    console.log("🌱 Seeding Acme Dental...");

    // ── Practice ──────────────────────────────────────────────────────────────
    const [practice] = await db
        .insert(schema.practices)
        .values({ name: "Acme Dental", slug: "acme-dental" })
        .onConflictDoNothing()
        .returning();

    let practiceId = practice?.id;
    if (!practiceId) {
        const existing = await db.query.practices.findFirst({
            where: (p, { eq }) => eq(p.slug, "acme-dental"),
        });
        if (!existing) throw new Error("Could not find or create Acme Dental practice");
        practiceId = existing.id;
        console.log("  Practice already exists, id =", practiceId);
    }

    console.log(`  Practice ID: ${practiceId}`);

    // ── Manager ───────────────────────────────────────────────────────────────
    const [manager] = await db
        .insert(schema.users)
        .values({
            practiceId,
            name: "Alex Rivera",
            email: "alex@acmedental.com",
            role: "manager",
            status: "active",
            avatarInitials: "AR",
        })
        .onConflictDoNothing()
        .returning();

    const managerId = manager?.id ?? (
        await db.query.users.findFirst({
            where: (u, { eq, and }) =>
                and(eq(u.email, "alex@acmedental.com"), eq(u.practiceId, practiceId!)),
        })
    )!.id;

    // ── Staff ─────────────────────────────────────────────────────────────────
    const staffData = [
        { name: "Maria Santos", email: "maria@acmedental.com", role: "front_desk" as const, status: "active" as const, avatarInitials: "MS" },
        { name: "Tom Nguyen", email: "tom@acmedental.com", role: "insurance_billing" as const, status: "active" as const, avatarInitials: "TN" },
        { name: "Chloe Park", email: "chloe@acmedental.com", role: "hygiene" as const, status: "active" as const, avatarInitials: "CP" },
        { name: "Raj Mehta", email: "raj@acmedental.com", role: "assistant" as const, status: "invited" as const, avatarInitials: "RM" },
    ];

    await db
        .insert(schema.users)
        .values(staffData.map(u => ({ ...u, practiceId: practiceId! })))
        .onConflictDoNothing();

    // ── Courses ───────────────────────────────────────────────────────────────
    const courseData = [
        {
            title: "Front Office Fundamentals",
            subtitle: "Core skills for every Acme Dental front desk team member",
            category: "front-office",
            level: "Beginner" as const,
            status: "published" as const,
            thumbnail: "🗂️",
            color: "#3A63C2",
            assignedRoles: "front_desk",
        },
        {
            title: "HIPAA & Compliance Essentials",
            subtitle: "Regulatory requirements and privacy obligations for dental staff",
            category: "clinical",
            level: "Beginner" as const,
            status: "published" as const,
            thumbnail: "🛡️",
            color: "#059669",
            assignedRoles: "front_desk,insurance_billing,assistant,hygiene",
        },
        {
            title: "Hygiene Chair Efficiency",
            subtitle: "Protocols to maximize chair time and patient throughput",
            category: "hygiene",
            level: "Intermediate" as const,
            status: "draft" as const,
            thumbnail: "🪥",
            color: "#0891B2",
            assignedRoles: "hygiene",
        },
    ];

    await db
        .insert(schema.courses)
        .values(courseData.map(c => ({ ...c, practiceId: practiceId! })))
        .onConflictDoNothing();

    // ── Knowledge docs ─────────────────────────────────────────────────────────
    await db.insert(schema.knowledgeDocs).values([
        {
            practiceId: practiceId!,
            title: "Acme Dental Patient Check-in Script",
            type: "paste" as const,
            sizeLabel: "3 KB",
            status: "indexed" as const,
            scope: "local" as const,
            tags: "Scripts,Front Desk",
            rawContent: "Welcome to Acme Dental! Can I get your name and date of birth to pull up your file?",
            uploadedByUserId: managerId,
        },
        {
            practiceId: practiceId!,
            title: "Acme Billing SOP",
            type: "pdf" as const,
            sizeLabel: "189 KB",
            status: "indexed" as const,
            scope: "local" as const,
            tags: "Billing,SOP",
            uploadedByUserId: managerId,
        },
    ]).onConflictDoNothing();

    console.log("✅ Acme Dental seeded!");
    console.log(`   Practice:  Acme Dental (id=${practiceId})`);
    console.log(`   Manager:   Alex Rivera <alex@acmedental.com>`);
    console.log(`   Staff:     ${staffData.length} users`);
    console.log(`   Courses:   ${courseData.length}`);
}

seedAcme().catch(console.error);
