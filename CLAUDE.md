# Claude Code Instructions

## Repo layout

This is a Bun workspaces monorepo. See README.md for scripts.

-   `apps/site` — fhudson.com
-   `packages/` — shared packages (the Single Line design system will be `packages/ui`)
-   `docs/plans/design-system.md` — the plan for the monorepo and design system

Run scripts from the root (`bun run lint`, `bun run build`), or one workspace with
`bun run --filter @fhudson/site <script>`. Shared config lives at the root: `tsconfig.base.json`,
`eslint.config.js`, `.prettierrc.json`.

## Content rules

-   Never name Finn's employer anywhere on the site, in copy, metadata or examples.

## UI components

Build with Single Line (`@fhudson/ui`); see `packages/ui/README.md` and the live reference at
`/system`. Live GB grid data comes from `@fhudson/grid`. Don't reach for React Aria directly in
apps: if a component is missing, add it to `@fhudson/ui`. The component spec is
`docs/plans/components.md`.
