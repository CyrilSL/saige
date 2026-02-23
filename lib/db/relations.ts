import { relations } from "drizzle-orm";
import {
    practices,
    users,
    courses,
    modules,
    lessons,
    userCourseAssignments,
    userLessonProgress,
    knowledgeDocs,
    questionnaires,
    questions,
    questionnaireResponses,
} from "./schema";

export const practicesRelations = relations(practices, ({ many }) => ({
    users: many(users),
    courses: many(courses),
    knowledgeDocs: many(knowledgeDocs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    practice: one(practices, { fields: [users.practiceId], references: [practices.id] }),
    assignedCourses: many(userCourseAssignments),
    lessonProgress: many(userLessonProgress),
    uploadedDocs: many(knowledgeDocs),
    questionnaireResponses: many(questionnaireResponses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
    practice: one(practices, { fields: [courses.practiceId], references: [practices.id] }),
    modules: many(modules),
    assignments: many(userCourseAssignments),
    questionnaires: many(questionnaires),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
    course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
    progress: many(userLessonProgress),
}));

export const userCourseAssignmentsRelations = relations(userCourseAssignments, ({ one }) => ({
    user: one(users, { fields: [userCourseAssignments.userId], references: [users.id] }),
    course: one(courses, { fields: [userCourseAssignments.courseId], references: [courses.id] }),
    assignedBy: one(users, {
        fields: [userCourseAssignments.assignedByUserId],
        references: [users.id],
        relationName: "assigner",
    }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
    user: one(users, { fields: [userLessonProgress.userId], references: [users.id] }),
    lesson: one(lessons, { fields: [userLessonProgress.lessonId], references: [lessons.id] }),
}));

export const knowledgeDocsRelations = relations(knowledgeDocs, ({ one }) => ({
    practice: one(practices, { fields: [knowledgeDocs.practiceId], references: [practices.id] }),
    uploadedBy: one(users, { fields: [knowledgeDocs.uploadedByUserId], references: [users.id] }),
}));

export const questionnairesRelations = relations(questionnaires, ({ one, many }) => ({
    course: one(courses, { fields: [questionnaires.courseId], references: [courses.id] }),
    questions: many(questions),
    responses: many(questionnaireResponses),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
    questionnaire: one(questionnaires, { fields: [questions.questionnaireId], references: [questionnaires.id] }),
}));

export const questionnaireResponsesRelations = relations(questionnaireResponses, ({ one }) => ({
    questionnaire: one(questionnaires, { fields: [questionnaireResponses.questionnaireId], references: [questionnaires.id] }),
    user: one(users, { fields: [questionnaireResponses.userId], references: [users.id] }),
}));
