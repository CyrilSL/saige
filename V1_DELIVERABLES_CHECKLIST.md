# Saige V1 Deliverables Checklist

**Last Updated:** Feb 27, 2026
**Overall Progress:** ~35%

---

## Deliverable 1: Role-Based Learning Paths — 60%

> Front Desk and Manager roles at minimum. Courses filtered and served by role.

- [x] Database schema for courses with `assignedRoles` field
- [x] Database schema for modules and lessons within courses
- [x] API endpoint to fetch courses filtered by user role (`GET /api/learn/courses`)
- [x] Learn page renders courses assigned to the logged-in user's role
- [x] Seed data includes Front Desk and Billing courses with role assignments
- [x] Course creation UI in manage page (title, category, emoji, color, status)
- [x] Module and lesson creation within courses (manage page)
- [ ] **Manager can assign roles to courses via UI** — UI exists but role-assignment dropdown is not wired for all custom roles
- [ ] **Lesson content delivery** — Clicking a lesson does nothing. No content viewer (video player, reading pane, or embedded content). The `content` DB column is empty for all lessons.
- [ ] **Lesson completion action** — No endpoint or UI button to mark a lesson as complete. `userLessonProgress` table exists but is never written to.
- [ ] **Locked lesson gating** — `isLocked` field exists in schema but not enforced (no sequential unlock logic)

---

## Deliverable 2: Assign Training Modules to Users & Track Completion — 30%

> Managers assign courses to individual users. Users complete lessons. Progress is tracked.

### Assignment

- [x] `userCourseAssignments` table in database
- [x] Backend API to assign courses to a user (`PATCH /api/manage/users/[id]` accepts `assignedCourses`)
- [x] Seed script creates sample assignments (Priya, James, Derek)
- [ ] **Manager UI to assign/unassign courses to users** — The manage page shows assigned courses per user but has no controls to add or remove assignments

### Completion Tracking

- [x] `userLessonProgress` table in database (userId, lessonId, completed, completedAt)
- [x] Progress calculation logic in `/api/learn/courses` (counts completed lessons / total lessons)
- [x] Learn page shows progress bars per course
- [x] Course viewer shows per-lesson completion checkmarks
- [ ] **`POST /api/learn/lessons/complete` endpoint** — Does not exist. No way to write completion data.
- [ ] **"Mark Complete" button on lessons** — LessonRow component is display-only, not interactive
- [ ] **Auto-complete lesson on quiz pass** — Quiz submission (`POST /api/learn/questionnaires`) saves score but does not update lesson progress
- [ ] **Completion timestamps** — `completedAt` field exists but is never populated

### Quiz / Assessment Tracking

- [x] Questionnaire schema with questions (MCQ, 4 options, correct answer, explanation)
- [x] Quiz creation UI for managers (questionnaire builder)
- [x] Quiz-taking UI for staff (quiz modal with progress, scoring, review)
- [x] Quiz submission endpoint with server-side scoring
- [x] Pass/fail determination with configurable passing score
- [ ] **Quiz results visible to managers** — Responses are stored but no manager UI to view them
- [ ] **Quiz retry policy** — No limit or logic around retakes

---

## Deliverable 3: Manager Visibility into Training Progress — 40%

> Managers can see who completed what, identify gaps, and track overall training health.

- [x] `GET /api/manage/users` returns staff with assigned courses and completion percentages
- [x] Manage page team tab shows per-user list with course progress percentages
- [ ] **Aggregate analytics dashboard** — No overall completion rates, no charts, no trends
- [ ] **Lesson-level breakdown per user** — Manager sees "Course X — 25%" but can't drill into which specific lessons are done
- [ ] **Most missed quiz questions** — Data is stored in `questionnaireResponses` but no analytics view
- [ ] **Training gap identification** — No view highlighting users with 0% progress or overdue assignments
- [ ] **Export or report** — No way to export progress data
- [ ] **Filter/sort by role, course, or completion** — No filtering on the manager progress view

---

## Deliverable 4: Knowledge Ingestion from Practice Materials — 5%

> Upload SOPs, policies, scripts. Process into embeddings. Make content retrievable for Q&A grounding.

### Upload & Storage

- [x] `knowledgeDocs` table in database (title, type, status, scope, tags, rawContent)
- [x] `POST /api/manage/docs` endpoint saves pasted text content
- [x] Manage page has a Knowledge Base tab with paste-text UI
- [ ] **File upload (PDF, DOCX, TXT)** — No file upload handler. No multipart form parsing. No file storage (S3/local).
- [ ] **PDF parsing** — No pdf-parse or similar library in dependencies
- [ ] **DOCX parsing** — No mammoth or similar library in dependencies
- [ ] **Document status lifecycle** — Docs are set to "processing" on create and never updated

### Processing & Indexing

- [ ] **Text chunking** — No logic to split documents into chunks for embedding
- [ ] **Embedding generation** — Voyage API key exists in `.env.local` but is never imported or used anywhere in code
- [ ] **Vector storage** — No pgvector extension, no Pinecone, no vector DB of any kind
- [ ] **Indexing pipeline** — No background job or processing pipeline to go from raw text to searchable embeddings
- [ ] **Document re-indexing on update** — No update/re-process capability

### Retrieval

- [ ] **Semantic search over documents** — No vector similarity search
- [ ] **Retrieval API endpoint** — No endpoint that takes a query and returns relevant document chunks
- [ ] **Source attribution** — No system to track which chunks informed a response
- [ ] **Local vs Global content distinction** — Schema has `scope` field but no logic uses it

---

## Deliverable 5: Context-Aware Q&A (Ask Saige) — 10%

> Staff ask questions, Saige answers grounded in uploaded content. Distinguishes practice-specific vs general guidance.

### Chat Interface (Frontend)

- [x] Ask Saige page with chat UI
- [x] Two modes: Assist (structured) and Chat (conversational)
- [x] Structured response format: "Say This", "Do This", "Escalate If", "Notes"
- [x] Conversation history sidebar with date grouping
- [x] Suggested prompts on welcome screen
- [x] Streaming text display (simulated)
- [x] Copy-to-clipboard on responses
- [x] Feedback buttons (thumbs up/down) — UI only, no backend

### AI Backend (Not Built)

- [ ] **LLM integration** — No OpenAI, Anthropic, or any LLM SDK in dependencies. Zero API calls to any AI service.
- [ ] **RAG pipeline** — No retrieval-augmented generation. No query → embed → search → prompt → respond flow.
- [ ] **Conversation context** — No conversation history sent to backend. Each "response" is pulled from a hardcoded array regardless of input.
- [ ] **Structured response generation** — The "Say This / Do This / Escalate If" format exists in mock data but no prompt engineering to produce it from an LLM.
- [ ] **Confidence scoring** — Hardcoded in mock data, not dynamically computed from retrieval relevance.
- [ ] **Source citations** — Mock data has source labels but no real citation from retrieved documents.
- [ ] **Practice-specific vs general guidance distinction** — No logic to differentiate local practice content from general dental knowledge.
- [ ] **Content gap logging** — No system to log when Saige can't find an answer.
- [ ] **Guardrails** — No content protection, no export refusal, no policy invention prevention.
- [ ] **`POST /api/ask` endpoint** — No backend API for Q&A processing. Everything is client-side mock.

---

## Cross-Cutting Concerns

### Authentication — 0%

- [ ] Login / signup flow
- [ ] Session management (JWT, cookies, or OAuth)
- [ ] Password hashing and storage
- [ ] Practice-scoped authentication
- [ ] Protected API routes (currently all endpoints are open)

> **Note:** Currently uses localStorage user-switching. No real auth. This is a blocker for any production deployment but may be acceptable for demo/v1 internal testing.

### Content Versioning (PRD §14) — 0%

- [ ] Draft / Published / Deprecated states for knowledge docs
- [ ] Effective Date, Owner, Last Updated metadata fields
- [ ] Only published content used in Q&A answers
- [ ] Deprecated content excluded from retrieval

### Proactive Onboarding Home Screen (PRD §12) — 20%

- [x] Welcome greeting (time-of-day based)
- [x] Two action cards (Ask Saige, Learn)
- [ ] "Do This Next" section
- [ ] "Today's Focus" section
- [ ] "Top Scenarios This Week" section
- [ ] "Quick Scripts" section

---

## Priority Build Order (Suggested)

| Priority | Item | Why |
|----------|------|-----|
| **P0** | Lesson completion endpoint + UI button | Without this, no user can complete training — the core loop is broken |
| **P0** | Manager UI to assign courses to users | Managers can't assign training without this |
| **P1** | Knowledge ingestion pipeline (upload, parse, chunk, embed, store) | Foundation for the entire AI/Q&A system |
| **P1** | LLM + RAG backend for Ask Saige | The headline feature — grounded Q&A |
| **P1** | Lesson content viewer (show actual content when lesson clicked) | Users need to read/watch something to learn |
| **P2** | Manager analytics dashboard (aggregate stats, drill-downs) | Required for manager visibility deliverable |
| **P2** | Practice-specific vs general guidance tagging | Required for content-aware Q&A |
| **P3** | Auth system | Needed for production but not for internal demo |
| **P3** | File upload (PDF/DOCX) | Text paste works for now; file upload extends it |
| **P3** | Content versioning | Nice-to-have for v1, critical for v2 |

---

## Quick Reference: What Works Today

A manager can:
- Create courses with modules and lessons
- Create quizzes for courses
- See a list of users with their course progress percentages
- Create custom roles
- Paste text documents into the knowledge base

A staff user can:
- See courses assigned to their role
- Open a course and see its module/lesson structure
- Take a quiz and see their score
- Use the Ask Saige chat (receives hardcoded responses, not grounded in any content)

**What does NOT work:**
- Staff cannot mark lessons as complete (no button, no endpoint)
- Managers cannot assign courses to specific users from the UI
- Ask Saige does not use AI — all responses are fake/hardcoded
- Uploaded documents are stored but never processed or used
- No real authentication — anyone can switch to any user
