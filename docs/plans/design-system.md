# Plan: fhudson monorepo and the Single Line design system

Status: approved · 1 October 2026 · Phases 1 and 2 done

## Goal

Turn this repo into one home for fhudson.com and the projects around it, and replace
Chalkboard UI with a new design system, **Single Line**, that lives inside the repo.

Single Line was chosen from four directions (Control Room, Field Manual, Nameplate, Single
Line). It is modelled on single-line diagrams and engineering drawing sheets, and shares its
ink, verdigris and paper colours with the Boundary Node brand, so the site and the newsletter
read as one identity. It borrows two things from the other directions:

-   **From Control Room:** lamp-style status indicators and labelled panel headers, for data views.
-   **From Nameplate:** the hazard band and engraved plates, used in one or two places at most.

## Part 1 · Monorepo

### Layout

```
finlayhu/
├── apps/
│   └── site/                 fhudson.com (moved from the repo root)
├── packages/
│   └── ui/                   @fhudson/ui, the Single Line design system (Part 2)
├── docs/
│   └── plans/                plans like this one
├── .github/workflows/
│   └── deploy-site.yml       builds apps/site, syncs to S3
├── package.json              workspaces, repo-wide scripts
├── tsconfig.base.json        shared compiler options
├── eslint.config.js          one flat config for every workspace
├── .prettierrc.json          one format for every workspace
└── bun.lock                  one lockfile
```

### Decisions

| Decision          | Choice                                              | Why                                                                                        |
| ----------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Package manager   | Bun workspaces                                      | Already used here and in chalkboard-ui. No new tooling.                                    |
| Task runner       | `bun run --filter`                                  | Enough for two or three workspaces. Add Turborepo only if builds get slow.                 |
| Internal packages | Consumed as TypeScript source, not built            | Vite compiles them with the app. No build step, no npm publish, changes show up instantly. |
| Shared config     | Root `tsconfig.base.json`, root ESLint and Prettier | One set of rules. Each workspace's tsconfig extends the base.                              |
| Typed linting     | `projectService` in typescript-eslint               | Finds each workspace's tsconfig automatically, instead of listing them by hand.            |
| Git history       | `git mv`                                            | File history follows the move.                                                             |
| Deploys           | One workflow per app, filtered by path              | A change to `apps/site` deploys the site. A change to another app doesn't.                 |

### Repo-wide scripts

| Script           | Does                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| `bun run dev`    | Starts the site                                                      |
| `bun run build`  | Builds every app                                                     |
| `bun run lint`   | Lints the whole repo (the Claude Code hook and lint-staged use this) |
| `bun run format` | Formats the whole repo                                               |

### Other repos that could move in later

Not part of this change; each is a separate decision.

| Repo             | Fit        | Notes                                                                                                   |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| chalkboard-ui    | Retire     | Replaced by `packages/ui`. Archive once the site no longer imports it.                                  |
| qin.fhudson.com  | `apps/qin` | Astro site with its own deploy. Qin's automation commits to it, so its scripts would need the new path. |
| finlayhu-backend | `infra/`   | CDK app. Moving it puts infra next to the code it serves.                                               |
| finlayhu-llm     | `apps/llm` | Could adopt Single Line too.                                                                            |

`git subtree add` brings a repo in with its history.

## Part 2 · Single Line design system

### Package

`packages/ui`, published inside the repo as `@fhudson/ui`. It is private, consumed as
source, and never published to npm unless a project outside the repo needs it.

```
packages/ui/
├── src/
│   ├── tokens/          colour, type, spacing and stroke tokens
│   ├── styles/          theme.css (CSS variables + Tailwind @theme), fonts.css, base.css
│   ├── components/      React components
│   ├── marks/           node mark, single-line symbols
│   └── index.ts
└── README.md
```

### Principles

1. **Drawn, not decorated.** Hairlines, a 24px drawing grid and square corners. Structure comes
   from rules and labels, not shadows or rounded cards.
2. **Ink and verdigris.** Two colours do almost all the work. Verdigris marks what's live or
   interactive. Amber and red appear only as states.
3. **Data has a home.** Numbers sit in labelled panels, set in mono with tabular figures, and
   states are shown as lamps.
4. **High voltage is rare.** The hazard band and plates appear in at most two places on the site.
5. **Page metadata belongs in a title block.** Dates, revisions and authorship go in a
   drawing-style title block, not a byline.

### Tokens

Colour, both themes. Light is paper; dark is the night print.

| Token       | Light       | Dark           | Use                                                                        |
| ----------- | ----------- | -------------- | -------------------------------------------------------------------------- |
| `paper`     | #F1F3F2     | #0D1615        | Page background                                                            |
| `sheet`     | #FBFCFB     | #121D1C        | Panels, inputs                                                             |
| `ink`       | #14201E     | #E3ECEA        | Text, strong rules                                                         |
| `ink-muted` | #556361     | #8DA5A1        | Secondary text, labels                                                     |
| `hairline`  | #C3CCC9     | #26403C        | Dividers, panel borders                                                    |
| `verdigris` | #0C6157     | #4FBFAE        | Accent, links, live signals, "in service"                                  |
| `amber`     | #95590A     | #E7AE55        | Warning, "isolated". Darkened from #A8650B, which was only 4.16:1 on paper |
| `fault`     | #B3322A     | #F07A70        | Errors, "fault"                                                            |
| `grid`      | ink at 5.5% | hairline at 7% | Drawing grid                                                               |

Every pair is checked for WCAG AA contrast before Phase 2 is done.

Type:

| Role    | Face           | Use                                                          |
| ------- | -------------- | ------------------------------------------------------------ |
| Display | Michroma       | Headings and buttons only, uppercase, short. It's very wide. |
| Body    | Hanken Grotesk | Running text, UI                                             |
| Data    | JetBrains Mono | Labels, numbers, code, title blocks                          |

Fonts are self-hosted with `@fontsource`, like Noto Sans Mono today, so the site makes no
calls to Google Fonts.

Scale (px): 11 · 13 · 15 · 17 · 22 · 30 · 40. Body 17 on posts, 15 in UI.
Spacing: 4px base (4, 8, 12, 16, 24, 32, 48, 64). Radius: 0 everywhere, except status lamps,
which are pills. Strokes: 1px hairline, 1.5px rule, 3px busbar.

### Theming

-   Tokens are CSS variables on `:root`, redefined for dark mode.
-   Dark mode follows the system setting, and `data-theme="light|dark"` on `<html>` overrides it
    (this also covers the old TODO to remember the preference in local storage).
-   `theme.css` maps the tokens into Tailwind v4 with `@theme`, so the site keeps using utilities
    (`bg-paper`, `text-ink`, `border-hairline`, `font-display`).

### Components

Phase 3 builds everything the site uses today. Each item is listed against the Chalkboard
component it replaces, so the migration is mechanical.

| Single Line                                    | Replaces (Chalkboard) | Notes                                                                                                                                          |
| ---------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Heading` (levels 1–6)                         | `H1`–`H6`             | Michroma for 1–2, Hanken bold for 3–6. Michroma at 40px fits about 9 characters per word on a phone, so level 1 steps down to 30px below 640px |
| `Text`, `Lead`, `Small`                        | `P`, `Lead`, `Small`  |                                                                                                                                                |
| `Prose`                                        | BlogPost's mapping    | Styles rendered markdown in one wrapper                                                                                                        |
| `Code`, `Pre`, `Blockquote`                    | same                  |                                                                                                                                                |
| `Button` (primary, ghost)                      | `Button`              |                                                                                                                                                |
| `Input`                                        | `Input`               | Label always visible                                                                                                                           |
| `Panel` (+ header label and meta)              | `Preview*`            | Borrowed from Control Room                                                                                                                     |
| `Navbar`                                       | `Navbar`              | Mono links, verdigris underline on the active page                                                                                             |
| `Status` (in service / isolated / fault)       | `Tag` (for states)    | Lamp dot plus label                                                                                                                            |
| `Tag`                                          | `Tag` (for topics)    |                                                                                                                                                |
| `Table`                                        | `Table`               | Tabular figures, hairline rows                                                                                                                 |
| `List`, `ListItem`                             | same                  |                                                                                                                                                |
| `LineChart`                                    | `LineChart`           | Keeps the null-gap support from chalkboard-ui 0.0.9                                                                                            |
| `StatTile`                                     | OuraData's tiles      |                                                                                                                                                |
| `TitleBlock`                                   | new                   | Post and page metadata                                                                                                                         |
| `NodeMark`, `Busbar`, `Transformer`, `Breaker` | `Icon` (partly)       | Single-line symbols as SVG components                                                                                                          |
| `HazardBand`, `Plate`                          | new                   | Borrowed from Nameplate; use sparingly                                                                                                         |

### Docs and review

-   A **Single Line page in the site** (`/system`, unlisted) renders every token and component
    in both themes. It replaces the separate Chalkboard docs app, and keeps docs and site from
    drifting apart.
-   Each component gets a short README entry: props, and when to use it.

## Phases

| Phase                 | Work                                                                                           | Done when                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 · Monorepo          | Move the site to `apps/site`. Root workspace, shared config, path-filtered deploy.             | The site builds, lints and deploys from the new layout. The live site is unchanged. |
| 2 · Foundations       | `packages/ui` with tokens, fonts, theme.css, dark mode, and the `/system` page showing tokens. | The tokens render in both themes and pass contrast checks.                          |
| 3 · Components        | The component table above, each shown on `/system`.                                            | Every Chalkboard component the site uses has a Single Line equivalent.              |
| 4 · Migration         | Port the site page by page: landing, new tab, projects, vault, posts, about, errors.           | The site has no `chalkboard-ui` imports, and the dependency is removed.             |
| 5 · Retire Chalkboard | Archive chalkboard-ui. Decide what happens to chalkboard.fhudson.com.                          | Nothing depends on chalkboard-ui.                                                   |

Phases 2–4 can ship in small slices. The site keeps Chalkboard until its last page is ported.

## Decisions

Settled on 1 October 2026:

1. **Package name:** `@fhudson/ui`.
2. **Styling:** keep Tailwind v4.
3. **chalkboard-ui and chalkboard.fhudson.com:** leave as they are for now. Phase 5 is on hold.
4. **Other repos:** leave as they are for now.
