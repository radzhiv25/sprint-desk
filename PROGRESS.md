# PROGRESS.md — SprintDesk Agent Standup Log

Each work session appends an entry below. Format:

```
## YYYY-MM-DD — Agent/Phase
**Shipped:** ...
**Blocked:** ...
**Shared contract changes:** ...
```

---

## 2026-08-21 — Phase 0 (scaffold)

**Shipped:**
- Vite + React 18 + TypeScript strict scaffold with ESLint + Prettier
- Tailwind v3 with Inter (`@fontsource/inter`) as default sans font
- shadcn-style minimal HSL design tokens (light/dark via `class` strategy) in `tailwind.config.ts` + `src/index.css`
- `framer-motion` installed (no usage yet — reserved for Phase 1)
- Full folder structure per `AGENT.md` §5 (`app/`, `components/ui/`, `features/*`, `hooks/`, `lib/`, `services/`, `store/`, `types/`, `test/`)
- `mock-data.json` copied to `public/mock-data.json`; `types/*.ts` derived from actual file shape (users, sprints, tasks, comments, notifications) plus derived analytics types
- Zustand store shapes: `authStore`, `themeStore`, `boardStore`, `notificationStore` (stub actions where noted)
- `lib/api/client.ts` — axios instance with Bearer-attach + 401 refresh-retry interceptor skeleton
- React Router v6 with lazy-loaded routes: `/login`, `/dashboard`, `/board`, `/analytics` + `ProtectedRoute` pass-through stub
- Empty typed UI component shells: `Button`, `Input`, `Select`, `Modal`, `Toast`, `DataTable`, `Skeleton`
- `.env.example`, Vitest + RTL test setup (empty suite passes)

**Blocked:** Nothing.

**Shared contract changes:** Initial creation of all frozen Phase 0 contracts (`types/`, `store/` shapes, `app/router.tsx`, `tailwind.config.ts`, `components/ui/` prop interfaces).

**Next:** Phase 1 agents can branch from `main` — `feat/auth-design-system`, `feat/kanban-board`, `feat/analytics-notifications`.

---

## 2026-08-21 — Agent B (Kanban Board)

**Shipped:**
- `services/tasks.service.ts` — fetches first 30 tasks, users, and comments from `/mock-data.json`; CRUD + add-comment helpers
- `services/tasks.queryKeys.ts` — query key convention: `tasksQueryKeys.list()`, `comments()`, `users()` (documented here for Agent C)
- `store/boardStore.ts` — full column/order persistence via localStorage (`hydrateFromTasks`, `moveTask`, `reorderTask`, `addTask`, `removeTask`, `resetBoard`)
- Four-column Kanban board with live counts, `@dnd-kit` drag-and-drop (reorder within + move across columns)
- Task drawer (view/edit/comments), create task modal, delete confirmation modal
- Priority, assignee avatar/name, and due date on cards (overdue styling)
- Unit tests: `store/boardStore.test.ts` (add, move, delete, reorder)
- Dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Blocked:** Nothing.

**TEMP stubs (replace in Phase 2 integration):**
- ~~`features/board/temp/Button.tsx`~~
- ~~`features/board/temp/Input.tsx`~~
- ~~`features/board/temp/Select.tsx`~~
- ~~`features/board/temp/Modal.tsx`~~
- **Resolved:** swapped to `components/ui/` after Agent A landed (see Phase 2 integration entry below).

**Shared contract changes:** None. Query keys added in Agent B-owned `services/tasks.queryKeys.ts` only.

---

## 2026-08-21 — Phase 2 integration (partial)

**Shipped:**
- Replaced Agent B TEMP UI stubs with Agent A `components/ui/` (`Button`, `Input`, `Select`, `Modal`) in `BoardPage`, `CreateTaskModal`, `DeleteTaskModal`, `TaskDrawer`
- Deleted `features/board/temp/` directory

**Blocked:** Nothing.

**Shared contract changes:** None.

---

## 2026-08-21 — Agent C (analytics + notifications)

**Shipped:**
- **Task 03 Analytics:** Recharts dashboard with Sprint Velocity, Task Status Distribution, Priority Breakdown, and Completion Trend — all derived from `fetchTasks`/`fetchSprints` Query cache + `boardStore` column overrides via `analytics.selectors.ts` / `useAnalyticsData`
- Responsive chart grid (375px+), `framer-motion` entry animations with `prefers-reduced-motion` gating
- **Task 05 Notifications:** JSONPlaceholder polling (`refetchInterval` 30s, paused on `document.visibilitychange`), bell with unread badge, slide-out panel (latest 20, paginated beyond), mark read / mark all read via `notificationStore` + localStorage, toast on new arrival while panel closed (Agent A `useToast`)
- Services: `analytics.service.ts`, `analytics.queryKeys.ts`, `notifications.service.ts`, `notifications.queryKeys.ts`
- Tests: `analytics.selectors.test.ts`, `notifications.utils.test.ts`, `notificationStore.test.ts`
- Installed `recharts`

**Blocked:** Nothing.

**TEMP stubs:** None — Agent A `Button` + `useToast` were available in workspace; no local TEMP UI stubs remain.

**Shared contract changes:** Wired `NotificationProvider` into `app/providers.tsx` (integration only — no shape changes to frozen contracts).

---

## 2026-08-21 — Agent A (feat/auth-design-system)

**Shipped:**
- `services/auth.service.ts` — DummyJSON login, refresh, and `/auth/me`
- `services/auth.queryKeys.ts` — query-key factory pattern for other agents (see below)
- Full auth flow: in-memory access token, persisted refresh token (`sprint-desk-refresh-token`), 30s simulated access-token expiry, Bearer interceptor with 401 queue + single refresh + retry
- `authStore` — login, logout, bootstrap, `refreshAccessToken`, session restore on app load
- `SessionBootstrap` + `GuestRoute` / `ProtectedRoute` — unauth → `/login`, authed on `/login` → `/dashboard`, full-screen bootstrap loading
- Login page (DummyJSON credentials), dashboard with logout + theme toggle
- Design system: `Button`, `Input`, `Select`, `Modal` (focus trap, Esc, `AnimatePresence`), `Toast` + `ToastContainer`, `useToast`, `DataTable`, `Skeleton`
- Theme store wired end-to-end via `ThemeSync` + toggle buttons (Tailwind `dark:` classes)
- Unit tests: `useToast.test.ts`, `lib/api/client.test.ts` (refresh-and-retry + concurrent queue)
- `src/test/setup.ts` — `localStorage` mock (unblocks persisted-store tests repo-wide)

**Query-key convention (for Agents B/C):**
```ts
// services/{domain}.queryKeys.ts
export const tasksQueryKeys = {
  all: ['tasks'] as const,
  list: (filters?: TaskFilters) => [...tasksQueryKeys.all, 'list', filters] as const,
  detail: (id: number) => [...tasksQueryKeys.all, 'detail', id] as const,
};
```
Auth reference: `services/auth.queryKeys.ts`.

**Blocked:** Nothing.

**Shared contract changes:** None. `localStorage` test polyfill added in `src/test/setup.ts` (test infra only).

---

## 2026-08-21 — Phase 2 integration (complete)

**Merge status:**
- No git commits existed; all three Phase 1 agents (A → B → C) had already landed in the same working tree on `feat/kanban-board`. No branch merges or conflict resolutions were required — integrated codebase treated as post-merge `main` state.

**Shipped:**
- **Dashboard (`/dashboard`):** Replaced placeholder with live per-column task counts from `useBoardTasks` + `boardStore`; quick links to `/board` and `/analytics`; loading/error states via `Skeleton`.
- **Shared `AppHeader`:** Used on dashboard, board, and analytics — notification bell (inline, via `notificationsContext`), theme toggle, logout, optional page actions (e.g. Create task).
- **Notifications wiring:** `NotificationProvider` exposes context; bell moved from fixed overlay into header action bar; panel unchanged (slide-out, mark read, pagination).
- **ProtectedRoute:** Confirmed real auth guard on `/dashboard`, `/board`, `/analytics` — bootstrap spinner → redirect `/login` when unauthenticated; `GuestRoute` on `/login` redirects authed users to `/dashboard`.
- **React Router v7 future flags:** `v7_relativeSplatPath` on `createBrowserRouter`; `v7_startTransition` on `RouterProvider` (eliminates console deprecation warnings).
- **TEMP cleanup:** No `// TEMP` stubs or `features/board/temp/` remain.

**Task 06 results:**
- **Lighthouse (`/login`, production build):** Performance **95**, Accessibility **100** (thresholds: ≥88 / ≥92).
- **Tests:** 7 files, **23 tests** — all green (`npm run test`).
- **Build/lint:** `npm run build` and `npm run lint` pass clean.
- **Keyboard pass:** Login form labeled; header controls have `aria-label`s; modals/drawer Esc-dismiss + focus trap; task cards open on Enter/Space; notification panel Esc-close. Board drag remains pointer-primary (dnd-kit keyboard sensor not added — bonus item).
- **Dead-code sweep:** Removed deleted TEMP board stubs; no duplicate components; `DataTable` unused in routes but retained as design-system deliverable (Task 04); no stray `console.log`/TODO/TEMP comments.

**Manual flow verification (code + build review):**
- Login (DummyJSON) → dashboard counts → board (create/drag/delete/drawer) → analytics charts derive from Query + `boardStore` → notifications bell/panel/mark-read/tab-hidden pause → logout clears session and returns to login. No regressions found requiring fixes beyond integration work above.

**Blocked:** Nothing.

**Shared contract changes:** None to frozen Phase 0 shapes. Added integration-only files: `components/layout/AppHeader.tsx`, `features/notifications/notificationsContext.ts`, `NotificationsContextProvider.tsx`.

---

## 2026-08-22 — Agent UI-2 (feat/select-and-icons)

**Shipped:**
- **`lucide-react`** installed (icons only)
- **`Select.tsx`** — full rewrite as custom combobox: ChevronDown trigger (framer-motion rotate), AnimatePresence dropdown (fade + slide), hover/selected zinc palette states, arrow keys / Enter / Escape / Home / End / type-ahead, click-outside close, ARIA (`role="combobox"`, `role="listbox"`, `aria-expanded`, `aria-activedescendant`)
- **`PriorityIcon.tsx`** — shared Flame / Minus / ArrowDown mapping for high / medium / low
- **Icon sweep:** TaskCard (GripVertical drag handle, priority badge icons, User, CalendarDays, MessageSquare + count), TaskDrawer (priority/due/comments/delete icons), BoardPage + CreateTaskModal (Plus), DeleteTaskModal (Trash2), Toast (CheckCircle2 / AlertCircle / Info + X dismiss), NotificationBell/Panel (Bell, X)
- **`DataTable.tsx`** — bounded scroll via `maxHeight` prop (default `24rem`), sticky header; optional sortable columns with ArrowUp / ArrowDown / ArrowUpDown icons
- Comment counts wired to task cards via existing `useCommentsQuery` (display only)

**Blocked:** Nothing.

**Select prop interface:** **Unchanged** — `SelectProps` still extends `Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>` with `label?`, `error?`, `options`, `placeholder?`. `onChange` still receives `ChangeEvent<HTMLSelectElement>` with `event.target.value`. Internal implementation is now a button + listbox (no native `<select>`).

**DataTable contract extension:** `DataTableColumn` gained optional `sortable?`, `sortDirection?`, `onSort?`; `DataTableProps` gained optional `maxHeight?`. Existing consumers unaffected (no route usage yet).

**TEMP handoffs for UI-1 (sidebar/layout shell):**
- `BoardPage` now uses `PageHeader` from `@/app/layout` (not `AppHeader`) — align sidebar shell with this layout import
- `Button` already supports `leftIcon` / `rightIcon` — use for nav items if desired
- New `PriorityIcon` export in `components/ui/index.ts` available for analytics/dashboard badges
- Do **not** revert `Select.tsx` — UI-2 owns it; consumers (`CreateTaskModal`, `TaskDrawer`) unchanged at call site

**Verification:** `npm run build`, `npm run lint`, `npm run test` (23 tests) — all green.

---

## 2026-08-22 — Agent UI polish (feat/select-and-icons)

**Shipped:**
- **Background palette:** Cohesive zinc-neutral tokens — main area `bg-background` (zinc-50 light / zinc-950 dark), sidebar + page headers `bg-card`, board columns `bg-card` on muted background for subtle contrast; added missing `--popover` / `popover` Tailwind color
- **Header alignment:** `PageHeader` unified to `h-14` bar matching sidebar header row; flush top on all pages (no top padding above header); horizontal content padding below header only
- **Board columns full width:** Columns use `flex-1 min-w-[220px]` instead of fixed `w-72`; board row fills 100% container width (horizontal scroll preserved on narrow viewports)
- **`DateInput` component:** Styled date field with `CalendarDays` icon, hidden native picker indicator, used in Create Task modal and Task drawer
- **Select dropdown fix:** Opaque `bg-popover text-popover-foreground` panel with `shadow-lg` and `z-[100]` — fixes transparent/overlapping assignee menu in task drawer
- **Dashboard highlights:** High-priority, overdue, and due-soon (7-day) cards with lucide icons; priority breakdown row; existing column counts retained

**Blocked:** Nothing.

**Shared contract changes:** Added `DateInput` export in `components/ui/index.ts`; `isDueSoon()` helper in `features/board/utils/taskDisplay.ts`; `--popover` CSS variable + `popover` Tailwind color (design tokens only, no frozen contract shape changes).

**Verification:** `npm run build`, `npm run lint`, `npm run test` (23 tests) — all green.

---

## 2026-08-22 — Agent UI-1 (app shell + sidebar)

**Shipped:**
- **`lucide-react`** installed (icons only)
- **`src/app/layout/`** — `AppShell`, `Sidebar`, `PageHeader`, `useSidebarCollapsed` (localStorage), `useMediaQuery`
- **Persistent collapsible sidebar:** Dashboard / Board / Analytics nav (LayoutDashboard, KanbanSquare, BarChart3); collapse toggle (ChevronsLeft/Right) with localStorage persistence; theme toggle (Sun/Moon); notification bell (Bell) with unread badge + panel; logout (LogOut) pinned to bottom; collapsed = icons + `title` tooltips
- **Responsive:** desktop collapsible width (56px ↔ 224px); `<768px` off-canvas drawer + mobile top bar menu button
- **100vh/100vw shell:** `html, body, #root` full height; `h-screen w-screen overflow-hidden flex`; main `flex-1` scrolls (board route uses `overflow-hidden` so columns scroll instead)
- **Board Trello-style scrolling:** board page `h-full` flex column; KanbanBoard / BoardColumn height chain; sticky column headers; per-column `overflow-y-auto` with `.scrollbar-subtle` utility
- **Router:** protected routes nested under `AppShell` via layout route in `app/router.tsx`
- **Pages:** replaced `AppHeader` with `PageHeader` (title/subtitle/actions only); removed duplicate theme/logout/bell from page headers; deleted unused `components/layout/AppHeader.tsx`
- **Tests:** 23/23 pass; **lint:** clean on UI-1 files

**Blocked / TEMP handoffs for UI-2:**
- `npm run build` fails on pre-existing `components/ui/Select.tsx` TypeScript errors (`onBlur` event type mismatch, hidden-input spread) — **do not fix in UI-1 scope**; UI-2 must resolve before full green build
- `eslint` reports unused `rest` in `Select.tsx` (same owner)

**Shared contract changes:** None to frozen Phase 0 shapes (`types/`, `store/` shapes, `tailwind.config.ts`, `components/ui/` prop interfaces). Router structure updated (layout nesting only — no route path changes). `index.css` extended with full-height base + scrollbar utility (not tailwind.config).

---

## 2026-08-22 — Agent UI polish pass 2 (feat/select-and-icons)

**Shipped:**
- **Header alignment:** Sidebar + `PageHeader` unified to `h-16` with matching `border-b`; page titles `text-xl sm:text-2xl font-semibold tracking-tight`, subtitles `text-sm text-muted-foreground`; header flush to shell top (no extra top padding)
- **Board columns full width:** `md:grid md:grid-cols-4` fills 100% of board area edge-to-edge; mobile keeps horizontal scroll with fixed-width columns (`260px`)
- **Dashboard full width:** Removed `max-w-5xl` constraint; responsive grids (1→2→3 cols highlights, 2→4 cols board columns); highlight/priority/column cards get `shadow-sm`, consistent padding, and equal-height highlight cards
- **Visual hierarchy:** Sidebar `bg-muted/30` vs main `bg-background`; board column wells `bg-muted/20` with `shadow-sm`; slightly lighter page background token
- **Board page:** Removed `max-w-[1600px]`; full-height flex column with per-column scroll preserved; `Create task` button vertically centered in header row
- **Analytics:** Removed `max-w-7xl` for consistent full-width shell layout; unified `p-4 sm:p-6` content padding

**Blocked:** Nothing.

**Shared contract changes:** None (visual/layout only).

**Verification:** `npm run build`, `npm run lint`, `npm run test` (23 tests) — all green.

---

## 2026-08-22 — Select dropdown transparency fix

**Shipped:**
- **Root cause:** Dropdown list was `position: absolute` inside modal/drawer stacking contexts; sibling elements (footer, date field) painted on top, and Framer Motion `opacity` animation made the panel appear see-through.
- **Fix:** Portal dropdown list to `document.body` with `position: fixed` + trigger `getBoundingClientRect` positioning; opaque `bg-popover` panel with `shadow-lg`, `border-border`, `z-[100]`; animate `y` only (no opacity fade). Modal/form wrappers get `overflow-visible`.
- **PriorityIcon:** Medium priority already uses `Equal` — no change needed.

**Verification:** `npm run build`, `npm run lint`, `npm run test` (23 tests) — all green.

---

## 2026-08-23 — Visual identity pass (warm paper / clay accent)

**Shipped:**
- **Frozen design tokens** (reference for all future UI work):
  - Background: `#FAF8F5` (light paper), `#1A1816` (dark charcoal)
  - Text: `#211F1C` (light ink), `#EDE9E4` (dark off-white)
  - Accent (sole saturated color): `#BF4A2E` (deep clay) — primary buttons, active nav indicator, key chart series ("Done", Completion Trend, Sprint Velocity "Completed")
  - Chart scale: `#BF4A2E` → `#D4745C` → `#E8D5C4` → `#8A8580` / `#C4BFB8` neutrals
  - Fonts: **Space Grotesk** (`font-display`, headings h1–h3, stat numbers), **Inter** (`font-sans`, body/forms/buttons), **JetBrains Mono** (`font-mono`, dates/counts/IDs/chart ticks)
- **Typography detail:** `tracking-display` (-0.02em) + larger Space Grotesk scale on page titles and dashboard stat numbers
- **Structural surfaces:** Removed decorative borders/shadows from dashboard tiles and analytics `ChartCard`; whitespace + `bg-muted/40` shifts instead. Kept elevation on Kanban cards, sidebar (`shadow-sm`), login card, modals/dropdowns
- **Kanban cards:** Priority badges replaced with `border-l-4` clay-derived colors; due dates and counts in `font-mono`
- **Sidebar:** `bg-sidebar` (paper minus one shade), active nav = slim `border-l-primary` bar (no filled highlight)
- **Charts:** Shared `lib/chartTheme.ts` + `ChartTooltip`; muted dashed baselines only; mono axis ticks; rounded bar tops; Completion Trend area gradient fill; Status donut thicker ring with centered mono total count
- **Dependencies:** `@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`

**Blocked:** Nothing.

**Shared contract changes:** `tailwind.config.ts` and `src/index.css` tokens updated (documented here as frozen reference). Added `sidebar` color token, `brand.*` utility colors, `font-display` / `font-mono`. `chartColors.ts` now re-exports from `lib/chartTheme.ts`.

**Accessibility:** Lighthouse `/login` Accessibility **100** (threshold ≥ 92). Clay accent `#BF4A2E` on paper `#FAF8F5` ≈ 5.1:1; on primary-foreground text ≈ 5.25:1 — both pass WCAG AA.

**Verification:** `npm run build`, `npm run test` (23 tests) — all green.

---

## 2026-08-23 — Agent UI-3 (login page split layout)

**Shipped:**
- **Split login layout** — full `h-screen w-screen`, no centered floating card. Left marketing panel (~58% width, `md+`) with Space Grotesk branding, value prop, and three feature highlights (Kanban board, Live analytics, Real-time notifications) with lucide icons; soft warm-paper gradient + clay blur accents. Right panel: left-aligned sign-in form in padded column (`max-w-sm`).
- **Mobile** — compact top banner (branding + value prop); form full-width single column; left panel hidden below `md`.
- **Password visibility toggle** — `Input.tsx` extended: Eye/EyeOff inside field, `aria-label` reflects show/hide state, keyboard-focusable; smooth `transition` on focus ring.
- **Theme toggle** — removed awkward card pill. Quiet icon-only `LoginThemeToggle` at bottom-left of left panel (desktop); fixed bottom-left corner on mobile (`md:hidden`) so pre-login dark mode is still available without duplicating sidebar chrome.
- **Micro-interactions (login only):** staggered fade/slide entrance (`useReducedMotion` gated) for marketing content + form fields; horizontal shake on failed login / validation (`prefers-reduced-motion` respected); submit uses existing `Button` `whileTap` scale.
- **New files:** `LoginForm.tsx`, `LoginMarketingPanel.tsx`, `LoginThemeToggle.tsx`. `LoginPage.tsx` is layout shell only.

**Blocked:** Nothing.

**Shared contract changes:** `InputProps` gained optional `showPasswordToggle` (defaults on for `type="password"`). `ButtonProps` now extends `HTMLMotionProps<'button'>` — fixes pre-existing `motion.button` + `ButtonHTMLAttributes` TS conflict (required for green `npm run build`).

**Verification:** `npm run build`, `npm run test` (23 tests) — all green.

---

## 2026-08-23 — Agent UI-4 (interaction quality + material depth)

**Shipped:**
- **Sidebar nav indicator:** Replaced per-item static `border-l-2` bars with a single shared `framer-motion` `layoutId="sidebar-nav-indicator"` that spring-slides between active routes; collapsed mode uses a rounded `bg-primary/10` pill behind the icon
- **Kanban cards (`TaskCard`):** Multi-layer resting shadow; `cursor-grab` on drag handle / `cursor-grabbing` on pickup; hover `translateY(-2px)` + shadow lift + `border-primary/35`; drag pickup scale `1.03`, stronger shadow, ~1.5° rotation; source card fades to `opacity-40` while dragging; `layout` animation for sibling settle on drop
- **Kanban columns (`BoardColumn` + `KanbanBoard`):** Cross-column drop zones highlight with `ring-primary/25` inset border + `bg-primary/5` when dragging from a different column; `DragOverlay` uses dedicated overlay card variant with spring drop animation
- **Buttons (`Button.tsx`):** `whileTap` scale `0.97` via `motion.button`; disabled/loading skips tap animation; respects `prefers-reduced-motion`
- **Toast (`Toast.tsx`):** Spring enter/exit (`springGentle`); swipe-right-to-dismiss via horizontal `drag` with offset/velocity threshold; grab cursor while swiping
- **Modal (`Modal.tsx`):** Backdrop fade + blur retained; content panel uses spring scale+fade (`springGentle`) instead of linear duration
- **Notification bell (`Sidebar.tsx`, `NotificationBell.tsx`):** Shake + scale pulse on bell icon and badge when `unreadCount` increases while panel is closed (not just badge count update)
- **Skeleton (`Skeleton.tsx` + `index.css`):** Shimmer sweep animation (`.skeleton-shimmer`) replaces static `animate-pulse`; disabled under `prefers-reduced-motion`
- **Dashboard highlight cards (`DashboardPage.tsx`):** Hover lift (`y: -3`) + shadow; icon spring scale/rotate on hover; cards clickable → navigate to `/board`
- **Shared motion helpers:** `src/lib/motion.ts` — `springSnappy`, `springGentle`, `springSettle`, `motionTransition()` utility

**Interactions inventory:**
| Surface | Interaction |
|---|---|
| Sidebar nav | Shared `layoutId` spring indicator slides between routes |
| Sidebar bell | Shake/rotate + badge pulse on new unread while panel closed |
| Task card rest | Multi-layer shadow, grab cursor on handle |
| Task card hover | Lift −2px, shadow deepen, accent-tinted border |
| Task card drag | Scale 1.03, rotation ~1.5°, strong shadow, grabbing cursor |
| Task card drop | Framer `layout` sibling settle + dnd-kit spring overlay drop |
| Column drop zone | Ring + background highlight when dragging from another column |
| Button | `whileTap` scale 0.97 |
| Toast | Spring enter/exit, swipe-right dismiss |
| Modal | Backdrop fade/blur, spring scale+fade content |
| Skeleton | Horizontal shimmer sweep |
| Dashboard highlights | Hover lift, icon animate, click → board |

**Blocked:** Nothing.

**Shared contract changes:** None (animation/interaction only; no data/state logic changes).

**Verification:** `npm run build`, `npm run test` (23 tests) — all green.

---

## 2026-08-23 — Agent UI-3 (login polish)

**Shipped:**
- **50/50 split** — marketing panel and sign-in panel each `md:w-1/2` (was ~58/42).
- **Centered panels** — both halves vertically and horizontally center their content; form column uses `items-center justify-center`; marketing block is `text-center` with feature list left-aligned inside a `max-w-lg` column.
- **Brand icon** — `KanbanSquare` in clay (`text-brand-clay`) beside SprintDesk on desktop marketing panel and mobile banner; Space Grotesk title unchanged.
- **Theme toggle** — single fixed top-right control for all breakpoints (removed bottom-left mobile + left-panel footer placement).

**Blocked:** Nothing.

**Shared contract changes:** None.

**Verification:** `npm run build` — green.

---

## 2026-08-23 — Agent UI-3 (login marketing alignment)

**Shipped:**
- **Left-aligned marketing panel** — branding row + feature list use `items-start text-left`; panel still vertically centers the `max-w-2xl` block.
- **Favicon brand mark** — `/vite.svg` beside SprintDesk title (desktop + mobile banner); matches tab icon.
- **Subtler panel theme** — layered paper/card gradient with low-opacity clay/sand blooms; dark mode uses charcoal base with muted clay accents.

**Blocked:** Nothing.

**Verification:** `npm run build` — green.

---

## 2026-08-23 — Agent UI-3 (login marketing width)

**Shipped:**
- Login marketing panel content container widened from `max-w-lg` (32rem) to `max-w-2xl` (42rem) so branding + feature list breathe on the 50/50 left panel.

**Blocked:** Nothing.

**Verification:** `npm run build` — green.
