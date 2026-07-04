## Goal
Polish the four inner pages (Questions, Mock Interview, Notes, Progress) and the Read view so they match the new bento/red-blue-white-black system and feel more premium & readable.

## Scope (frontend only, no logic changes)

### 1. Shared building blocks (`src/styles.css` + small helpers)
- Add reusable utilities: `.panel` (bento tile w/ corner-mark), `.panel-accent-red`, `.panel-accent-blue`, `.section-title` (uppercase mono label), `.stat-num` (Sora display), `.chip` (pill badge).
- Extend `.prose-reader`: larger line-height, better `h1–h4` scale, styled `code`, `pre` (dark card), `blockquote` (red left bar), `ul/ol` spacing, `table` borders, `hr` divider, first-letter drop-cap optional class `.prose-reader--drop`.
- Add `.reader-shell` — max-w prose column, generous padding, subtle grid background.

### 2. Questions page (`src/routes/_authenticated/questions.tsx`)
Layout:
```text
┌─────────────────────────── header bento ───────────────────────────┐
│  Title + count      |   ▢ Total  ▢ Favorites  ▢ Hard   [+ Add]     │
├────────────────────────────────────────────────────────────────────┤
│  Sticky filter bar: [search] [category pills] [difficulty pills]   │
├────────────────────────────────────────────────────────────────────┤
│  Responsive grid of Question cards (1 / 2 / 3 col)                 │
│  Card: category chip · difficulty dot · question · answer preview  │
│         hover lift, corner-mark, Read/Fav/Edit/Del row on hover    │
└────────────────────────────────────────────────────────────────────┘
```
- Replace vertical list with `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.
- Category filter → horizontally-scrolling pill row (not a select).
- Add difficulty filter pills + "Favorites only" toggle.
- Cards get corner-mark, hover ring, click-to-read.

### 3. Read (Q/A) view — `ReaderDialog`
- Wider dialog on desktop (`max-w-4xl`), split header/body/footer with more air.
- Header: mono "QUESTION 03 / 12" counter, category + difficulty chips, big star.
- Body: `.reader-shell` + upgraded `.prose-reader`; answer preceded by a small red "ANSWER" section label + hairline rule.
- Add progress bar across top (idx / total).
- Footer: Prev / dots / Next with keyboard + swipe hint. Add "Mark reviewed" (visual only, toggles a local class — no schema change).
- Smoother slide transition (200ms, ease-out).

### 4. Notes page (`src/routes/_authenticated/notes.tsx`)
- Convert sidebar list into note **cards grid** (like Apple Notes bento): 1 / 2 / 3 col. Each card shows title, topic chip, updated date, 3-line preview. Click → opens editor in a dialog (not inline).
- Editor dialog has tabs: **Write** (markdown textarea) / **Preview** (rendered). Save / Delete / Read buttons in footer.
- Add "Read" full-screen reader using the same `.reader-shell` + upgraded prose, with a top progress bar and Prev/Next across notes (parity with Questions).
- Header bento with counts (Total / Topics / Updated today) + New note CTA.

### 5. Mock Interview page (`src/routes/_authenticated/mock-interview.tsx`)
- Two-column bento on desktop: left = chat/session panel (large tile), right = side rail with "Session settings" (role, difficulty), "Tips" tile, and "Recent sessions" tile.
- Message bubbles: user (blue accent, right), AI (neutral panel, left), typing indicator, timestamps.
- Sticky input bar with send + end-session buttons.
- Empty state: big red corner-mark tile with "Start a mock interview" CTA.
(Only presentation — keep existing server-fn wiring.)

### 6. Progress page (`src/routes/_authenticated/progress.tsx`)
- Bento dashboard:
  - Big tile: total questions reviewed (big Sora number) + 7-day sparkline.
  - Tile: category breakdown (horizontal bars).
  - Tile: difficulty split (donut or 3 stacked bars).
  - Tile: favorites count.
  - Tile: notes count / last updated.
- Uses existing data; presentation-only refactor.

### 7. Quick hydration fix
The current `/auth` hydration mismatch (Suspense vs div) — wrap the split-screen root the same way on server & client (no `typeof window` branch). Small, unrelated but noisy.

## Technical notes
- Pure frontend: no schema, no server-fn, no auth changes.
- All colors via existing tokens (`--primary` blue, `--destructive` red, `--card`, `--muted`). No hardcoded hex.
- Responsive rules per `responsive-layout-patterns` (grid + min-w-0 + shrink-0 on all header rows).
- Keep swipe/keyboard nav in Reader; extend to Notes reader.
- No new deps.

## Out of scope
- No changes to auth, DB schema, AI logic, or dashboard (already redone).
- No new features beyond visual reorg + reader polish.
