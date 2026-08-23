# SprintDesk

A sprint management dashboard for software teams — Kanban board with drag-and-drop, sprint analytics, real-time-style notifications, and a from-scratch design system, built as a production-oriented React app.

> Built for the SprintDesk frontend engineering assignment. See `PLAN.md` for the build plan and `AGENT.md` for the engineering conventions this repo follows.

## Live demo

- **App:** `<deployment-url>`
- **Screen recording:** `<video-link>`
- **Repo:** `<this-repo-url>`

## Tech stack

| Area | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict mode) |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Motion | Framer Motion |
| Typeface | Inter |
| Testing | Vitest + React Testing Library |
| Data sources | `mock-data.json` (primary, bundled in this repo), DummyJSON (auth), JSONPlaceholder (notification polling) |

## Getting started

```bash
git clone <this-repo-url>
cd sprintdesk
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

### Available scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build locally
npm run lint       # eslint
npm run test       # vitest
```

### Environment variables

| Variable | Description | Required |
|---|---|---|
| `VITE_DUMMYJSON_BASE_URL` | Base URL for auth API | Yes (defaults to `https://dummyjson.com`) |
| `VITE_JSONPLACEHOLDER_BASE_URL` | Base URL for notification polling | Yes (defaults to `https://jsonplaceholder.typicode.com`) |

See `.env.example` for the full list.

### Test login

DummyJSON test credentials, e.g. `emilys` / `emilyspass` (see [dummyjson.com/users](https://dummyjson.com/users) for the full list).

## Folder structure

```
src/
  app/                # router, providers, App shell
  components/ui/      # design system (Button, Input, Select, Modal, Toast, DataTable, Skeleton)
  features/
    auth/              # login, protected routes, session bootstrap
    board/              # Kanban board, cards, drawer, dnd
    analytics/          # charts, analytics page
    notifications/       # bell, panel, polling
  hooks/               # cross-feature hooks (useToast, etc.)
  lib/api/             # axios instance, auth interceptor, refresh queue
  services/            # API/service layer per domain
  store/               # Zustand stores
  types/               # shared domain types
```

## Architecture

```
UI Components → Hooks → TanStack Query hooks → Service layer → API client → mock-data.json / DummyJSON / JSONPlaceholder
```

- **Server state** (tasks, notifications seed, analytics source data) lives entirely in TanStack Query — cached, invalidated, refetched there, never duplicated into Zustand.
- **Client state** (auth session, theme, board column ordering, notification read-state) lives in Zustand, persisted to localStorage where the assignment requires it (refresh token, board order, notifications).
- **Local state** (form fields, local UI toggles) stays in component `useState`.
- No component talks to `mock-data.json`, DummyJSON, or JSONPlaceholder directly — everything routes through `services/`, so swapping mock data for a real backend later only touches that layer.

Full rationale for these choices lives in `ARCHITECTURE.md`.

## Features implemented

- **Auth** — DummyJSON login, in-memory access token, persisted refresh token, Bearer-attach interceptor, silent refresh + request retry on 401, protected routes, session restore on refresh, logout.
- **Kanban board** — 4 columns, drag-and-drop reorder within/across columns (`@dnd-kit`), persisted board state, task drawer with edit + comments, create/delete with confirmation, live column counts.
- **Analytics** — sprint velocity, task status distribution, priority breakdown, completion trend, all derived from live board data, responsive to 375px.
- **Design system** — Button, Input, Select, Modal, Toast, DataTable, Skeleton — built from scratch on Tailwind (Inter typeface, shadcn-inspired minimal aesthetic), no external UI library. Framer Motion powers modal/toast/drawer transitions and card drag polish.
- **Notifications** — polling-based simulated real-time feed, unread count, mark read/all-read, pagination beyond 20, pause/resume on tab visibility, toast on new arrivals.
- **Theming** — light/dark mode toggle, persisted.

## Known limitations

> Fill this in honestly as features are descoped or left partial. Example format below — replace with actual status before submission.

- [ ] Bonus: PNG export for analytics — not implemented (time). Would use `html-to-image` or a canvas snapshot of the chart container.
- [ ] Bonus: custom date-range filter on analytics — not implemented.
- [ ] Bonus: keyboard-accessible drag-and-drop — partially implemented via dnd-kit's `KeyboardSensor`; not fully tested across all column transitions.
- [ ] Storybook — not set up; component states documented via prop tables in `components/ui/` instead.

## Testing

```bash
npm run test
```

Covers (per assignment requirement): `useToast`, board store actions (add/move/delete), auth interceptor refresh-and-retry flow.

## Performance & accessibility

- Route-level code splitting via `React.lazy` + `Suspense`.
- Memoization (`memo`/`useMemo`/`useCallback`) applied to board columns/cards and chart data derivation to avoid unnecessary re-renders.
- Lighthouse targets: Performance ≥ 88, Accessibility ≥ 92 (see `ARCHITECTURE.md` for the latest measured scores and what they were run against).
- Keyboard navigation and labeled form controls throughout; images carry meaningful `alt` text.

## Security note

No credentials, API keys, or secrets are committed. See `.env.example` for required configuration.