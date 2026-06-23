# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then build for production
npm run lint      # Run ESLint
npm run preview   # Serve production build locally
```

No test framework is configured.

## Architecture

**Stack**: React 19 + TypeScript + Vite. Deployed as an Azure Static Web App via GitHub Actions.

**Routing**: App.tsx manages navigation via a `currentPage` state string — there is no React Router in use despite `react-router-dom` being installed. Navigation is done by setting this state value.

**Authentication & roles**: `src/context/AuthContext.tsx` uses **Supabase Auth** (`signInWithPassword`). On a session it loads the user's row from the `profiles` table to get their role + linked `empleado_id`. Three roles exist: `rrhh`, `empleado`, `contador`. App.tsx renders different pages depending on the role.

**Data**: Backed by **Supabase** (Postgres). The client lives in `src/lib/supabase.ts` (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from `.env`). All reads/writes go through `src/lib/api.ts`, which maps snake_case DB rows to the camelCase app types in `src/types/index.ts`; pages fetch via the `useQuery` hook in `src/lib/useQuery.ts`. Row Level Security enforces per-role access. The SQL schema/seed and setup guide are in `supabase/` and `SUPABASE_SETUP.md`. `src/data/mockData.ts` is no longer used (kept only as a data reference / seed source).

**Page structure by role**:
- `src/pages/rrhh/` — Dashboard, Fichadas, Empleados, EmpleadoDetalle (shown when an empleado row is selected), Novedades, CierreMensual
- `src/pages/empleado/` — MiPanel (personal calendar + request form)
- `src/pages/contador/` — ExportarCSV (payroll export)

**Components**: `src/components/layout/` (Topbar, etc.) and `src/components/ui/` (Badge, Button, MetricCard) — all custom, no external UI library.

## TypeScript

Strict mode is on: `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are enforced. The build will fail if these are violated.
