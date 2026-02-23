import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
    console.log("🌱 Seeding database...");

    // ── Practice ──────────────────────────────────────────────────────────────
    const [practice] = await db
        .insert(schema.practices)
        .values({ name: "Riverside Dental", slug: "riverside-dental" })
        .onConflictDoNothing()
        .returning();

    if (!practice) {
        console.log("Practice already exists, fetching...");
        const existing = await db.query.practices.findFirst({
            where: (p, { eq }) => eq(p.slug, "riverside-dental"),
        });
        if (!existing) throw new Error("Could not find or create practice");
        return runSeed(existing.id);
    }

    return runSeed(practice.id);
}

async function runSeed(practiceId: number) {
    console.log(`  Practice ID: ${practiceId}`);

    // ── Manager user ──────────────────────────────────────────────────────────
    const [manager] = await db
        .insert(schema.users)
        .values({
            practiceId,
            name: "Furqaan Khan",
            email: "furqaan@riverside.dental",
            role: "manager",
            status: "active",
            avatarInitials: "FK",
        })
        .onConflictDoNothing()
        .returning();

    const managerId = manager?.id ?? (
        await db.query.users.findFirst({
            where: (u, { eq, and }) =>
                and(eq(u.email, "furqaan@riverside.dental"), eq(u.practiceId, practiceId)),
        })
    )!.id;

    // ── Staff users ───────────────────────────────────────────────────────────
    const staffData = [
        { name: "Priya Nair", email: "priya@riverside.dental", role: "front_desk" as const, status: "active" as const, avatarInitials: "PN" },
        { name: "James Ortega", email: "james@riverside.dental", role: "insurance_billing" as const, status: "active" as const, avatarInitials: "JO" },
        { name: "Sara Mehl", email: "sara@riverside.dental", role: "hygiene" as const, status: "invited" as const, avatarInitials: "SM" },
        { name: "Derek Chan", email: "derek@riverside.dental", role: "assistant" as const, status: "active" as const, avatarInitials: "DC" },
    ];

    const insertedUsers = await db
        .insert(schema.users)
        .values(staffData.map(u => ({ ...u, practiceId })))
        .onConflictDoNothing()
        .returning();

    // Re-fetch all staff to get IDs (handles already-seeded case)
    const allStaff = await db.query.users.findMany({
        where: (u, { eq, and, ne }) =>
            and(eq(u.practiceId, practiceId), ne(u.role, "manager")),
    });

    const byEmail = Object.fromEntries(allStaff.map(u => [u.email, u]));

    // ── Courses ───────────────────────────────────────────────────────────────
    const courseData = [
        {
            title: "Front Office Mastery",
            subtitle: "Complete guide to running an efficient dental front office",
            category: "front-office",
            level: "Beginner" as const,
            status: "published" as const,
            thumbnail: "🗂️",
            color: "#3A63C2",
            assignedRoles: "front_desk",
        },
        {
            title: "Dental Billing & Insurance",
            subtitle: "Master claims, coding, and revenue cycle management",
            category: "billing",
            level: "Intermediate" as const,
            status: "published" as const,
            thumbnail: "🧾",
            color: "#059669",
            assignedRoles: "insurance_billing,front_desk",
        },
        {
            title: "Patient Experience Excellence",
            subtitle: "Create memorable patient journeys from first call to follow-up",
            category: "front-office",
            level: "Beginner" as const,
            status: "draft" as const,
            thumbnail: "💬",
            color: "#7C3AED",
            assignedRoles: "",
        },
    ];

    const insertedCourses = await db
        .insert(schema.courses)
        .values(courseData.map(c => ({ ...c, practiceId })))
        .onConflictDoNothing()
        .returning();

    // Re-fetch to get IDs for already-seeded
    const allCourses = await db.query.courses.findMany({
        where: (c, { eq }) => eq(c.practiceId, practiceId),
    });

    const courseByTitle = Object.fromEntries(allCourses.map(c => [c.title, c]));
    const c1 = courseByTitle["Front Office Mastery"];
    const c2 = courseByTitle["Dental Billing & Insurance"];

    // ── Modules for Course 1 ──────────────────────────────────────────────────
    if (c1) {
        const [mod1] = await db
            .insert(schema.modules)
            .values({ courseId: c1.id, title: "Introduction to Front Office Operations", description: "Core concepts and daily routines", position: 0 })
            .onConflictDoNothing()
            .returning();

        if (mod1) {
            await db.insert(schema.lessons).values([
                { moduleId: mod1.id, title: "Welcome & Course Overview", type: "video", duration: "5 min", position: 0, isLocked: false },
                { moduleId: mod1.id, title: "The Role of Front Office in Dental Practice", type: "video", duration: "12 min", position: 1, isLocked: false },
                { moduleId: mod1.id, title: "Daily Opening Procedures", type: "video", duration: "8 min", position: 2, isLocked: false },
                { moduleId: mod1.id, title: "Module Quiz", type: "quiz", duration: "10 min", position: 3, isLocked: false },
            ]).onConflictDoNothing();
        }

        const [mod2] = await db
            .insert(schema.modules)
            .values({ courseId: c1.id, title: "Patient Scheduling & Communication", description: "Mastering appointment systems and patient communication", position: 1 })
            .onConflictDoNothing()
            .returning();

        if (mod2) {
            await db.insert(schema.lessons).values([
                { moduleId: mod2.id, title: "Scheduling Best Practices", type: "video", duration: "15 min", position: 0, isLocked: false },
                { moduleId: mod2.id, title: "Handling Cancellations & No-Shows", type: "video", duration: "11 min", position: 1, isLocked: false },
                { moduleId: mod2.id, title: "Phone Etiquette for Dental Offices", type: "reading", duration: "13 min", position: 2, isLocked: false },
                { moduleId: mod2.id, title: "Patient Communication Quiz", type: "quiz", duration: "8 min", position: 3, isLocked: true },
            ]).onConflictDoNothing();
        }
    }

    // ── Modules for Course 2 ──────────────────────────────────────────────────
    if (c2) {
        const [mod3] = await db
            .insert(schema.modules)
            .values({ courseId: c2.id, title: "CDT Coding Essentials", description: "Understanding and applying dental procedure codes", position: 0 })
            .onConflictDoNothing()
            .returning();

        if (mod3) {
            await db.insert(schema.lessons).values([
                { moduleId: mod3.id, title: "Introduction to CDT Codes", type: "video", duration: "14 min", position: 0, isLocked: false },
                { moduleId: mod3.id, title: "Diagnostic & Preventive Codes", type: "video", duration: "20 min", position: 1, isLocked: false },
                { moduleId: mod3.id, title: "Restorative Procedure Codes", type: "video", duration: "18 min", position: 2, isLocked: true },
            ]).onConflictDoNothing();
        }
    }

    // ── User-Course Assignments ───────────────────────────────────────────────
    const priya = byEmail["priya@riverside.dental"];
    const james = byEmail["james@riverside.dental"];
    const derek = byEmail["derek@riverside.dental"];

    const assignments: Array<{ userId: number; courseId: number }> = [];
    if (priya && c1) assignments.push({ userId: priya.id, courseId: c1.id });
    if (priya && c2) assignments.push({ userId: priya.id, courseId: c2.id });
    if (james && c2) assignments.push({ userId: james.id, courseId: c2.id });
    if (derek && c1) assignments.push({ userId: derek.id, courseId: c1.id });

    if (assignments.length) {
        await db.insert(schema.userCourseAssignments)
            .values(assignments.map(a => ({ ...a, assignedByUserId: managerId })))
            .onConflictDoNothing();
    }

    // ── Knowledge Docs ────────────────────────────────────────────────────────
    await db.insert(schema.knowledgeDocs).values([
        {
            practiceId,
            title: "Office Scheduling Policy v3",
            type: "pdf" as const,
            sizeLabel: "245 KB",
            status: "indexed" as const,
            scope: "local" as const,
            tags: "Scheduling,Policy",
            uploadedByUserId: managerId,
        },
        {
            practiceId,
            title: "Insurance Verification SOP",
            type: "docx" as const,
            sizeLabel: "118 KB",
            status: "indexed" as const,
            scope: "local" as const,
            tags: "Insurance,SOP",
            uploadedByUserId: managerId,
        },
        {
            practiceId,
            title: "New Patient Scripts",
            type: "paste" as const,
            sizeLabel: "4 KB",
            status: "processing" as const,
            scope: "local" as const,
            tags: "Scripts,Front Desk",
            rawContent: "When a new patient calls, greet them warmly: 'Thank you for calling Riverside Dental, how can I help you today?'",
            uploadedByUserId: managerId,
        },
    ]).onConflictDoNothing();

    console.log("✅ Seed complete!");
    console.log(`   Practice:  Riverside Dental (id=${practiceId})`);
    console.log(`   Manager:   Furqaan Khan <furqaan@riverside.dental>`);
    console.log(`   Staff:     ${staffData.length} users`);
    console.log(`   Courses:   ${courseData.length}`);
    console.log(`   Docs:      3`);
}

seed().catch(console.error);
