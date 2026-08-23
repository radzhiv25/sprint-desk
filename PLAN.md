# PLAN.md — SprintDesk Execution Plan

Source: `Frontend_Assignment_SprintDesk.pdf`. Rules of engagement: `AGENT.md`. This file is the schedule — what gets built, in what order, by whom, and how the 3 parallel Cursor agent sessions avoid stepping on each other.

## 0. Strategy in one paragraph

Six functional tasks (Auth, Kanban, Analytics, Design System, Notifications, Perf/A11y/Testing) don't split cleanly 1:1 across 3 agents because Kanban and Analytics both *depend* on the design system and the API layer existing first. So: **one short sequential Phase 0** builds the shared contracts and scaffold (fast, ~half a day of agent time), **then 3 agents work fully in parallel** on independent feature branches against those frozen contracts, **then a sequential Phase 2** integrates, hardens, and handles the cross-cutting Task 06 requirements.

```
Phase 0 (sequential)  →  Phase 1 (3 agents in parallel)  →  Phase 2 (sequential integration)
   scaffold + contracts        A: Auth + API + Design Sys        merge, wire, test, polish
                                B: Kanban Board
                                C: Analytics + Notifications
```

---

## Phase 0 — Scaffold & Contracts (1 agent, do this first)

**Goal:** everything downstream agents need to work independently without guessing.

- [ ] Vite + React 18 + TS strict scaffold. ESLint + Prettier configured.
- [ ] Tailwind v3 installed, `Inter` set as the default sans font (`@fontsource/inter` or swap-in link), design tokens set up (`tailwind.config.ts` — neutral gray/zinc scale + one restrained accent, spacing, radius) matching the shadcn-style minimal direction in `AGENT.md` §3.
- [ ] `framer-motion` installed — no usage yet, just available for Phase 1 agents.
- [ ] Folder structure created exactly as in `AGENT.md` §5 (empty `.gitkeep`/index files where needed).
- [ ] `mock-data.json` (already in the repo — drop it into `public/` or `src/mocks/` if it isn't there yet), inspected, and **`types/*.ts` written from its real shape** (User, Task, TaskStatus, Priority, Comment, Notification, SprintAnalyticsPoint, etc.) — this is the contract everything else depends on, so read the actual file before typing it, don't guess.
- [ ] `lib/api/client.ts` — base axios instance (or fetch wrapper) with request/response interceptor stubs (real Bearer-attach + refresh logic built in Phase 1A, but the shape/signature is fixed here).
- [ ] Zustand store **shapes** created (empty actions are fine, types are not): `authStore`, `themeStore`, `boardStore`, `notificationStore`.
- [ ] React Router v6 skeleton: `/login`, `/dashboard`, `/board`, `/analytics`, with placeholder pages and a `ProtectedRoute` component stub (real logic in Phase 1A). Route-level `React.lazy` + `Suspense` wired from the start, not retrofitted later.
- [ ] `components/ui/` — empty typed component shells (`Button.tsx`, `Input.tsx`, etc.) with just prop interfaces, so Agents B/C can import real types even before Agent A finishes implementations.
- [ ] `PROGRESS.md` created with the standup format.
- [ ] Commit + merge to `main`. Cut 3 branches from here: `feat/auth-design-system`, `feat/kanban-board`, `feat/analytics-notifications`.

**Definition of done:** `npm run dev` boots, all 4 routes render placeholders, `npm run build`/`lint`/`test` all pass on an empty test suite, types compile.

---

## Phase 1 — Parallel build (3 agents)

### Agent A — Auth, API layer, Design System
**Branch:** `feat/auth-design-system` · **Owns:** `features/auth/`, `services/`, `lib/api/`, `components/ui/`, `store/authStore.ts`, `store/themeStore.ts`

- [ ] **Task 01 (Auth) — full flow:**
  - Login page (username/password) → `POST https://dummyjson.com/auth/login`.
  - Access token in memory (Zustand, not persisted). Refresh token in the assignment's specified local-storage simulation.
  - Axios interceptor: attach Bearer token; on 401, queue concurrent requests, trigger silent refresh, retry originals once refreshed.
  - Simulate expiration (short-lived access token timer) to actually exercise the refresh path.
  - `ProtectedRoute`: unauth → redirect `/login`; authed hitting `/login` → redirect `/dashboard`.
  - Session bootstrap on app load: full-screen loading state while validating refresh token; restore session if valid.
  - Logout: clear state, redirect `/login`.
  - Bonus (only if core is solid): Remember Me (30-day simulated persistence), password strength indicator.
- [ ] **Service/API layer:** `services/auth.service.ts`, plus the shared query-key conventions other agents will follow (document the pattern in `PROGRESS.md` so B/C match it).
- [ ] **Task 04 (Design System):** `Button`, `Input`, `Select`, `Modal`, `Toast` (+ `useToast` hook — required unit test target), `DataTable`, `Skeleton`. Each: variants/states documented via props, keyboard-accessible, responsive, styled per the Inter + shadcn-minimal direction in `AGENT.md` §3. `Modal` and `Toast` use `framer-motion`'s `AnimatePresence` for enter/exit. Bonus: Storybook, axe-core pass — only after core set is done.
- [ ] Theme store + light/dark toggle wired end-to-end (affects Tailwind `dark:` classes globally).
- [ ] Unit tests: `useToast`, auth interceptor refresh-and-retry (required by Task 06).

### Agent B — Kanban Sprint Board
**Branch:** `feat/kanban-board` · **Owns:** `features/board/`, `store/boardStore.ts`, `services/tasks.service.ts`

- [ ] Fetch first 30 tasks from `mock-data.json` via TanStack Query (through the service layer contract Agent A defined — coordinate via `PROGRESS.md` if A isn't done yet; stub the service call against the frozen `Task` type in the meantime).
- [ ] 4 columns (Backlog / In Progress / Review / Done), counts update dynamically.
- [ ] `@dnd-kit/core` (+ sortable) drag-and-drop: reorder within a column, move across columns.
- [ ] Board ordering lives in `boardStore` (Zustand) and is persisted (localStorage) across refresh — server-fetched task *content* stays in Query cache; the store only owns column/order/local edits, not the source of truth for task data (keep this boundary clean per `AGENT.md` §3).
- [ ] Task drawer: view details, edit fields, add comments.
- [ ] Create task (title, priority, assignee, due date), delete with confirmation modal (use Agent A's `Modal`/stub it until available).
- [ ] Priority/assignee/due-date visibly rendered on cards.
- [ ] Bonus (time permitting): undo last drag action, filter by priority/assignee, keyboard-accessible drag-and-drop (dnd-kit's `KeyboardSensor`).
- [ ] Unit tests: boardStore actions — add, move, delete (required by Task 06).

### Agent C — Analytics & Notifications
**Branch:** `feat/analytics-notifications` · **Owns:** `features/analytics/`, `features/notifications/`, `store/notificationStore.ts`, `services/notifications.service.ts`

- [ ] **Task 03 (Analytics):** Recharts-based Analytics page:
  - Sprint Velocity (completed tasks/sprint), Task Status distribution, Priority Breakdown, Completion Trend.
  - Data derived from real board/API data (via a selector/hook reading from Query cache + boardStore — not hardcoded, not duplicated state).
  - Responsive down to 375px, basic entry animations.
  - Bonus: custom date-range filter, PNG export.
- [ ] **Task 05 (Notifications):**
  - Poll `https://jsonplaceholder.typicode.com/posts?_limit=5` via TanStack Query `refetchInterval`; new post IDs → new notifications.
  - Bell icon with unread count; panel shows latest 20 with read/unread, paginated beyond 20.
  - Mark-as-read / mark-all-read; persisted via Zustand + localStorage.
  - **Pause polling when tab hidden** (`document.visibilitychange`), resume when visible.
  - Toast (Agent A's `Toast`, or stub) on new notification arriving while panel closed.
- [ ] Coordinate with Agent B: analytics needs board data shape — confirm against the Phase 0 `Task`/`TaskStatus` types rather than inventing a parallel shape.

**Cross-agent note:** all three branches read from the same `types/` contract fixed in Phase 0. If any agent needs a contract change, it's proposed in `PROGRESS.md`, not pushed silently — a type change from one branch can silently break another agent's in-progress work.

---

## Phase 2 — Integration & Hardening (sequential, 1 agent finishing the job)

- [ ] Merge branches into `main` in order: **A → B → C** (A first since B/C's stubs get replaced by A's real components/services).
- [ ] Replace every `// TEMP` stub with the real implementation; delete the stub code (dead-code rule).
- [ ] Wire `ProtectedRoute` around `/dashboard`, `/board`, `/analytics` for real.
- [ ] Full regression pass: auth → board → analytics → notifications flow end-to-end manually.
- [ ] **Task 06:**
  - Lighthouse: Performance ≥ 88, Accessibility ≥ 92 — profile and fix (image alt text, code splitting already in from Phase 0, memoize expensive board/chart renders with `memo`/`useMemo`/`useCallback`).
  - Full keyboard pass across the whole app, not just per-feature.
  - `npm run test` green for all required suites (`useToast`, boardStore, auth interceptor) plus any others written along the way.
- [ ] Dead-code sweep: unused exports, imports, deps (`depcheck` or manual), commented-out code, duplicate components.
- [ ] Final responsive pass at 375px across all 4 routes.

---

## Ownership map (quick reference)

| Path | Owner |
|---|---|
| `features/auth/`, `store/authStore.ts`, `store/themeStore.ts` | Agent A |
| `services/`, `lib/api/` | Agent A (contract), all agents append their own domain service file |
| `components/ui/` | Agent A |
| `features/board/`, `store/boardStore.ts` | Agent B |
| `features/analytics/`, `features/notifications/`, `store/notificationStore.ts` | Agent C |
| `types/`, `app/router.tsx`, `tailwind.config.ts` | Frozen in Phase 0 — changes require a note in `PROGRESS.md` |

## Submission checklist (assignment §8)

- [ ] Public GitHub repo, clean history, `README.md` complete.
- [ ] `ARCHITECTURE.md` (or README section): components, data flow diagram, tech choices with rationale.
- [ ] API documentation for the service layer (endpoints hit, request/response shapes) — OpenAPI/Swagger optional, a clear markdown table is acceptable.
- [ ] Live deployment (Vercel/Netlify) link.
- [ ] Screen recording covering: auth flow + token refresh, board drag-and-drop + CRUD, analytics charts updating with board data, notifications polling/pause-resume, theme toggle.
- [ ] `.env.example` present; no secrets committed.
- [ ] Known limitations section filled in honestly for anything descoped under time pressure.