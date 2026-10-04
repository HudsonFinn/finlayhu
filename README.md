# fhudson

Monorepo for fhudson.com and the projects around it.

| Path               | What                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `apps/site`        | fhudson.com (React, Vite, Tailwind)                                       |
| `packages/ui`      | `@fhudson/ui`, the Single Line design system. Reference page at `/system` |
| `packages/figures` | `@fhudson/figures`, Boundary Node figures and the kit they're drawn with  |
| `apps/workbench`   | Local only: preview figures by theme and width, and the export target     |
| `docs/plans`       | Plans, including the [design system plan](docs/plans/design-system.md)    |

## Setup

```sh
bun install
bun run dev      # start the site
```

## Scripts

Run from the repo root.

| Script           | Does                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`    | Starts the site                                                                                                                                      |
| `bun run fig`    | `fig new <post> <title>` starts a figure, `fig dev` opens the workbench, `fig export <slug…\|all>` renders PNG, MP4 and GIF for Substack, `fig list` |
| `bun run build`  | Builds every app                                                                                                                                     |
| `bun run test`   | Runs every package's tests (including the design system's contrast checks)                                                                           |
| `bun run lint`   | Lints the whole repo                                                                                                                                 |
| `bun run format` | Formats the whole repo                                                                                                                               |

To run a script in one workspace: `bun run --filter @fhudson/site <script>`.

## Deploys

Each app has its own workflow in `.github/workflows`, triggered by pushes to `main` that touch
that app (or shared packages and config). `deploy-site.yml` builds `apps/site` and syncs it to S3.
