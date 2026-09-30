# Uitzet Tracker

A Vue 3 + TypeScript PWA (Vite) for tracking household items for a "uitzet". No backend of its own: the browser talks straight to Supabase (Postgres + Storage) with the publishable key. The UI text is in Dutch.

## Commands

- `make start`: dev server in Docker with hot reload (`compose.dev.yml`, the `dev` target in the `Dockerfile`)
- `make stop`: removes the dev container
- `make prod`: production build served by nginx, runs in the background (meant for the Raspberry Pi home lab)
- Without Docker: `npm run dev`, `npm run build` (runs `vue-tsc` type checks first). There are no tests or linter.

## Environment

- `.env` (gitignored, copied from `.env.example`) holds `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (a publishable `sb_publishable_...` key also works) and an optional `PORT`.
- `PORT` is local to each machine. `vite.config.ts` reads it through `loadEnv`, and Compose uses it for the host port. The defaults are 5173 for dev and 8080 for prod.
- The `VITE_*` values are baked in at build time, so rebuild with `--build` after changing `.env`.

## Structure

- `src/supabase.ts`: Supabase client and `uploadImage` (the `item-images` bucket)
- `src/composables/useItems.ts`: types, constants (statuses, categories) and all data access
- `src/assets/_platform.scss`: the `phone` / `ipad` mixins are `@media screen` width queries (phone < 700px ≤ ipad), not OS checks. `src/composables/usePlatform.ts` mirrors the same breakpoint for the few places the template needs it; keep both in sync.
- `src/router/index.ts`: the routes open "sheets" (modals in `src/views/sheets/`) on top of the main list in `App.vue`. Uses history mode, so `nginx.conf` falls back to `index.html`.
- `supabase/schema.sql`, `supabase/rls.sql`: database setup. There is no auth, so RLS is fully open to the anon role.

## Gotchas

- Keep `supabase/schema.sql` in sync when you change the database schema.
- Item statuses are `gewenst` / `besteld` / `ontvangen`. They are enforced by a DB check constraint, and their colours are defined as `.status--{key}` in `theme.scss`.
