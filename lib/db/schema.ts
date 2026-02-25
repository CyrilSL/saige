import {
    pgTable,
    text,
    timestamp,
    serial,
    integer,
    boolean,
    pgEnum,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────



export const userStatusEnum = pgEnum("user_status", [
    "active",
    "invited",
    "inactive",
]);

export const courseStatusEnum = pgEnum("course_status", [
    "draft",
    "published",
    "archived",
]);

export const courseLevelEnum = pgEnum("course_level", [
    "Beginner",
    "Intermediate",
    "Advanced",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
    "video",
    "reading",
    "quiz",
]);

export const docTypeEnum = pgEnum("doc_type", [
    "pdf",
    "docx",
    "txt",
    "paste",
]);

export const docStatusEnum = pgEnum("doc_status", [
    "processing",
    "indexed",
    "failed",
]);

export const contentScopeEnum = pgEnum("content_scope", [
    "local",
    "global",
]);

// ─── Practices ────────────────────────────────────────────────────────────────

export const practices = pgTable("practices", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Roles ───────────────────────────────────────────────────────────────────

export const roles = pgTable("roles", {
    id: serial("id").primaryKey(),
    practiceId: integer("practice_id").references(() => practices.id).notNull(),
    name: text("name").notNull(),
    value: text("value").notNull(),
    color: text("color").default("#3A63C2"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    uniqueIndex("roles_value_practice_idx").on(t.value, t.practiceId),
    index("roles_practice_idx").on(t.practiceId),
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    practiceId: integer("practice_id").references(() => practices.id).notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("front_desk"),
    status: userStatusEnum("status").notNull().default("invited"),
    avatarInitials: text("avatar_initials"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    uniqueIndex("users_email_practice_idx").on(t.email, t.practiceId),
    index("users_practice_idx").on(t.practiceId),
]);

// ─── Courses ─────────────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    practiceId: integer("practice_id").references(() => practices.id).notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    category: text("category").notNull().default("front-office"),
    level: courseLevelEnum("level").notNull().default("Beginner"),
    status: courseStatusEnum("status").notNull().default("draft"),
    thumbnail: text("thumbnail").default("📚"),
    color: text("color").default("#3A63C2"),
    // comma-separated roles e.g. "front_desk,hygiene"
    assignedRoles: text("assigned_roles").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    index("courses_practice_idx").on(t.practiceId),
]);

// ─── Modules ─────────────────────────────────────────────────────────────────

export const modules = pgTable("modules", {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    index("modules_course_idx").on(t.courseId),
]);

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id").references(() => modules.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    type: lessonTypeEnum("type").notNull().default("reading"),
    duration: text("duration").default("10 min"),
    content: text("content"),
    position: integer("position").notNull().default(0),
    isLocked: boolean("is_locked").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    index("lessons_module_idx").on(t.moduleId),
]);

// ─── User → Course Assignments ────────────────────────────────────────────────

export const userCourseAssignments = pgTable("user_course_assignments", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    assignedByUserId: integer("assigned_by_user_id").references(() => users.id),
}, (t) => [
    uniqueIndex("user_course_uniq").on(t.userId, t.courseId),
]);

// ─── User → Lesson Progress ───────────────────────────────────────────────────

export const userLessonProgress = pgTable("user_lesson_progress", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
}, (t) => [
    uniqueIndex("user_lesson_uniq").on(t.userId, t.lessonId),
]);

// ─── Questionnaires ───────────────────────────────────────────────────────────

export const questionnaires = pgTable("questionnaires", {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    description: text("description").default(""),
    passingScore: integer("passing_score").default(70), // percentage
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    index("questionnaires_course_idx").on(t.courseId),
]);

// ─── Questions ────────────────────────────────────────────────────────────────

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    questionnaireId: integer("questionnaire_id").references(() => questionnaires.id, { onDelete: "cascade" }).notNull(),
    text: text("text").notNull(),
    optionA: text("option_a").notNull(),
    optionB: text("option_b").notNull(),
    optionC: text("option_c").notNull(),
    optionD: text("option_d").notNull(),
    correctOption: text("correct_option").notNull(), // "A", "B", "C", or "D"
    explanation: text("explanation").default(""),
    position: integer("position").notNull().default(0),
}, (t) => [
    index("questions_questionnaire_idx").on(t.questionnaireId),
]);

// ─── Questionnaire Responses ──────────────────────────────────────────────────

export const questionnaireResponses = pgTable("questionnaire_responses", {
    id: serial("id").primaryKey(),
    questionnaireId: integer("questionnaire_id").references(() => questionnaires.id, { onDelete: "cascade" }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    answers: text("answers").notNull(), // JSON: { [questionId]: "A"|"B"|"C"|"D" }
    score: integer("score").notNull(), // percentage 0-100
    passed: boolean("passed").default(false),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (t) => [
    index("responses_questionnaire_idx").on(t.questionnaireId),
    index("responses_user_idx").on(t.userId),
]);

// ─── Knowledge Documents ──────────────────────────────────────────────────────

export const knowledgeDocs = pgTable("knowledge_docs", {
    id: serial("id").primaryKey(),
    practiceId: integer("practice_id").references(() => practices.id).notNull(),
    title: text("title").notNull(),
    type: docTypeEnum("type").notNull().default("txt"),
    sizeLabel: text("size_label"),
    status: docStatusEnum("status").notNull().default("processing"),
    scope: contentScopeEnum("scope").notNull().default("local"),
    tags: text("tags").default(""), // comma-separated
    rawContent: text("raw_content"),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id),
}, (t) => [
    index("docs_practice_idx").on(t.practiceId),
]);
