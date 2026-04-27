# FlowCraft Studio

![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![React%20Flow](https://img.shields.io/badge/React%20Flow-12-111827)
![React%20Query](https://img.shields.io/badge/React%20Query-5-FF4154?logo=reactquery&logoColor=white)
![Tests%20Passing](https://img.shields.io/badge/Tests-Passing-22C55E)
![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.59-2EAD33?logo=playwright&logoColor=white)
![localStorage](https://img.shields.io/badge/Persistence-localStorage-F59E0B)

FlowCraft Studio is a production-grade local diagram editor built with React, TypeScript, Vite, Tailwind CSS, React Flow, and TanStack Query. It is intentionally designed as a real application codebase rather than a demo: page-based architecture, service boundaries, query abstraction, test coverage, and a migration-friendly persistence layer.
<img width="1702" height="1310" alt="Screenshot 2026-04-27 at 1 31 58 PM" src="https://github.com/user-attachments/assets/86756194-9511-4ef3-88fe-efd292f8b251" />

## Project Overview

- Fully local application with no backend and no external APIs.
- Versioned localStorage persistence with recovery from corrupted data.
- Dashboard for listing, creating, renaming, duplicating, deleting, and opening diagrams.
- Diagram editor powered by React Flow with a config-driven block library, structured nodes, text blocks, icon blocks, connection management, viewport controls, undo/redo, manual save, and debounced auto-save.
- Advanced edge styling with labels, line styles, widths, colors, and marker positions.
- Clean PNG and PDF export via `html-to-image` and `jsPDF` (lazy-loaded) using a
  diagram-only export scene; the editor grid/dots are never part of the export
  (optional solid or transparent background only).
- Shared Account Settings modal with storage usage summary and future-ready theme preferences.

## Architecture

The app follows a strict page-based structure:

```text
src/
  app/
  pages/
  components/
  services/
  hooks/
  configs/
  utils/
  types/
  styles/
  __tests__/
  e2e/
```

- `pages/` composes full screens and owns orchestration.
- `components/` contains reusable presentational UI and layout pieces.
- `services/` owns data persistence and export operations.
- `hooks/` wraps all storage access behind React Query.
- `configs/` stores constants and runtime configuration.
- `utils/` contains pure helpers.
- `types/` centralizes shared contracts.

## Design System

FlowCraft Studio uses a semantic Tailwind theme tuned for a professional SaaS and developer-tool feel:

- Light-first visual system with soft gray surfaces and high readability.
- Blue as the primary action color and violet as the accent layer.
- Semantic tokens instead of hardcoded component colors.
- Subtle borders, restrained shadows, and white canvas surfaces for diagram work.

Theme files:

- `tailwind.config.ts`
- `src/styles/index.css`

The theme is configured with `darkMode: "class"` so a full dark mode can be added later without rewriting component APIs.

## Tooling Standards

FlowCraft Studio uses Bun as the package manager and modern ESLint Flat Config through `eslint.config.js`.

Why Flat Config:

- It is the official modern ESLint standard.
- It works cleanly with Vite, React, TypeScript, and Bun.
- It is easier to maintain than layered legacy config formats.

Why Airbnb was not used:

- Airbnb’s config is relatively dated for this stack.
- It adds unnecessary dependency friction.
- Flat Config plus focused plugins gives stricter control with less setup overhead.

Lint coverage includes:

- TypeScript-aware linting with project-based analysis
- React Hooks validation
- React Refresh safe export rules
- Accessibility checks via `jsx-a11y`
- Import grouping and ordering
- Prettier compatibility without formatting-rule conflicts

## Tailwind Theme Tokens

Key semantic tokens include:

- `background`, `background-subtle`, `background-elevated`
- `surface`, `surface-muted`, `surface-hover`, `surface-selected`
- `border`, `border-strong`
- `text`, `text-muted`, `text-subtle`, `text-inverse`
- `primary`, `accent`, `success`, `warning`, `danger`
- `canvas`, `canvas-grid`, `canvas-node`, `canvas-nodeBorder`, `canvas-edge`, `canvas-selection`

Radius tokens:

- `sm: 6px`
- `md: 10px`
- `lg: 14px`
- `xl: 18px`
- `2xl: 24px`

Shadow tokens:

- `soft`
- `card`
- `floating`
- `focus`

## Block Library

The editor sidebar is a config-driven block library with collapsible categories
(in this order): **Blocks**, **Annotations**, and **Shapes** (flow primitives and
shape primitives on the canvas). Data also defines a **Templates** section in
`blockLibrary.config.ts` for future or alternate entry points; see
`src/configs/templateLibrary.config.ts` and diagram template helpers for related
wiring.

Configuration lives in:

- `src/configs/blockLibrary.config.ts`
- `src/configs/nodeTypes.config.ts`
- `src/configs/iconLibrary.config.ts`
- `src/configs/templateLibrary.config.ts`

This keeps the editor scalable as more block families are added. The UI renders entirely from config rather than hardcoded lists.

Current highlights:

- Lightweight `Text Block` nodes for annotations, titles, and freeform context
- Structured flow nodes such as `Start`, `Decision`, `Database`, and `Subprocess`
- Shape blocks for freeform diagramming
- Note and icon blocks for looser whiteboard-style composition
- Template starters for common diagram patterns

## Icon System

FlowCraft Studio uses `@tabler/icons-react` for node and library icons.

- Icons are mapped through the config layer
- Nodes can carry optional icon metadata through `data.icon`
- Structured nodes, icon blocks, and library cards all share the same icon registry
- The system is future-ready for per-node icon customization

## Why React Query Over localStorage

React Query is used as the application data boundary even though persistence is local:

- Components stay agnostic to the storage mechanism.
- The codebase can migrate from localStorage to REST, GraphQL, IndexedDB, or sync services later with minimal UI churn.
- Query invalidation, mutation flow, and cache ownership are standardized early.
- The application gets production-grade data handling patterns today instead of retrofitting them later.

## Data Model

```ts
type Diagram = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  versions?: DiagramVersionSnapshot[];
  createdAt: string;
  updatedAt: string;
};
```

Node data supports structured and freeform diagramming:

```ts
type DiagramNode = {
  id: string;
  type: DiagramNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    type: DiagramNodeType;
    kind?: 'flow' | 'shape' | 'text' | 'note' | 'icon' | 'group';
    icon?: string;
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      fontSize?: number;
    };
  };
  groupId?: string;
};
```

Edges support richer presentation state:

```ts
type DiagramEdge = {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'straight' | 'smoothstep' | 'step' | 'bezier';
  data?: {
    label?: string;
    color?:
      | 'canvas-edge'
      | 'primary'
      | 'accent'
      | 'success'
      | 'warning'
      | 'danger';
    width?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    markerKind?: 'none' | 'arrow' | 'circle' | 'diamond';
    markerPosition?: 'none' | 'start' | 'end' | 'both';
  };
};
```

All diagrams are stored in a versioned envelope:

```ts
{
  version: "v1",
  diagrams: Diagram[]
}
```

This makes future migrations explicit and keeps corruption handling centralized in the storage service.

Account settings use a separate versioned storage envelope:

```ts
type ThemeMode = 'light' | 'dark' | 'system';

type AccountSettings = {
  themeMode: ThemeMode;
};
```

The default is `light`, while `dark` and `system` are already represented in storage and UI for future rollout.

## Account Settings Modal

The shared Account Settings modal is available from the app header on both the dashboard and the editor.

Current capabilities:

- Shows app name and version
- Displays total local storage usage
- Displays number of saved diagrams
- Exposes a theme preference selector
- Allows clearing all locally stored FlowCraft Studio data with confirmation

Theme options (**Light**, **Dark**, **System**) are all selectable. `Dark` and
`System` apply `html.dark` and follow `prefers-color-scheme` when in system
mode, matching the live canvas and app chrome.

## Export Functionality

Exports are handled in `src/services/export`:

- PNG export uses `html-to-image`
- PDF export uses `jsPDF`
- Background can be included or omitted
- Viewport and full-diagram export paths are supported
- File names are generated from the diagram title plus export scope
- Full-diagram export computes node bounds and padding before rendering
- Export is treated as a separate rendering path, not a screenshot of the editor shell

The UI exposes export actions through the editor toolbar dropdown.

Clean export guarantees:

- No minimap
- No controls
- No attribution watermark
- No resize handles
- No selection chrome
- No toolbar or sidebar
- No extra canvas padding beyond diagram bounds
- No snap/grid dot pattern (`.react-flow__background` is removed from the clone;
  the **Include background** option only toggles a flat fill vs transparent PNG)

This is implemented by building a cloned diagram-only scene from the React Flow
canvas layer and stripping editor-only elements before serialization.

## Storage Usage Summary

The storage summary in Account Settings is calculated through the settings service layer, not directly inside components. It currently reports:

- Total bytes used by FlowCraft Studio local data
- A human-readable kilobyte summary
- The number of saved diagrams

This keeps the UI portable if storage later moves to IndexedDB or a backend sync layer.

## Testing Coverage

The current automated coverage includes:

- Diagram storage service behavior
- Account settings storage behavior
- Diagram helpers for history (undo stack), grouping, duplication, search, and export bounds
- Export scene cleanup logic
- Account Settings UI components
- Playwright flows for dashboard actions, editor interactions, export menu access, and settings

## Running Locally

```bash
bun install
bun run dev
```

Then open the Vite URL shown in the terminal.

## Testing

Unit tests:

```bash
bun run test:unit
```

E2E tests (Playwright; install browsers once per machine: `bunx playwright install` or `npx playwright install`):

```bash
bun run test:e2e
```

Run everything:

```bash
bun run test:all
```

## Git Hooks

Git hooks are managed with Husky and `lint-staged`.

Pre-commit:

- Runs `bunx lint-staged`
- Only checks staged files
- Auto-fixes ESLint and Prettier issues where possible

Pre-push:

- Runs `bun run verify:full`
- Includes lint, format check, typecheck, unit tests, production build, and Playwright e2e tests (ensure `playwright install` has been run locally or the push will fail on e2e)

Manual quality commands:

```bash
bun run lint
bun run verify
bun run verify:full
```

Emergency escape hatch:

```bash
git push --no-verify
```

This should only be used for urgent situations when you intentionally need to bypass hooks. Normal development flow should keep hooks enabled so the repository stays buildable and testable.

## Future Roadmap

- Backend sync
- Real-time collaboration
- Deeper template UX (e.g. sidebar or dashboard from config)
- Import/export JSON
- Multi-user editing
- Full dark mode support
