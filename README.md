# fhudson

Monorepo for fhudson.com and the projects around it.

| Path         | What                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `apps/site`  | fhudson.com (React, Vite, Tailwind)                                       |
| `packages/`  | Shared packages. The Single Line design system will live in `packages/ui` |
| `docs/plans` | Plans, including the [design system plan](docs/plans/design-system.md)    |

## Setup

```sh
bun install
bun run dev      # start the site
```

## Scripts

Run from the repo root.

| Script           | Does                   |
| ---------------- | ---------------------- |
| `bun run dev`    | Starts the site        |
| `bun run build`  | Builds every app       |
| `bun run lint`   | Lints the whole repo   |
| `bun run format` | Formats the whole repo |

To run a script in one workspace: `bun run --filter @fhudson/site <script>`.

## Deploys

Each app has its own workflow in `.github/workflows`, triggered by pushes to `main` that touch
that app (or shared packages and config). `deploy-site.yml` builds `apps/site` and syncs it to S3.
