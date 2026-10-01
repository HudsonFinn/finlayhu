# Plan: fhudson.com redesign, a grid control room

Status: approved · 2 October 2026

## Goal

Redesign fhudson.com from scratch on Single Line, leaning into a **grid control room**: the
dark desk, labelled panels, lamps, mimic diagrams and live readings of the Control Room direction
from the design review, drawn with Single Line's components. The whole redesign happens on the
`monorepo` branch and merges to `main` once, at the end.

## The idea

A control room shows the state of a system at a glance, and lets an operator drill into any part
of it. The site does the same for two systems:

-   **The grid.** Live GB readings on the homepage, because the site belongs to someone who writes
    about the grid's data. This is real data, not decoration.
-   **The operator.** Finn's writing, projects and personal telemetry (health, activity), set out as
    panels and circuits on the same board.

Every page is a "panel" with an ID, every link to a section is a "circuit" on a busbar, states are
lamps, and page metadata sits in a title block. Dark ("night shift") is the default; light ("day
shift") is a full alternative.

## Live grid data

Both sources are free, public and allow browser requests from any site (`Access-Control-Allow-Origin: *`),
checked on 1 October 2026:

| Reading                              | Source                               | Updates      | Use                                                   |
| ------------------------------------ | ------------------------------------ | ------------ | ----------------------------------------------------- |
| System frequency (Hz)                | Elexon BMRS `system/frequency`       | every 15 s   | Status strip ticker; homepage trace for the last hour |
| Demand (MW)                          | Elexon BMRS `demand/outturn/summary` | every 5 min  | Homepage Stat with trend                              |
| Carbon intensity (gCO₂/kWh) and band | Carbon Intensity API `intensity`     | every 30 min | Status strip lamp; homepage Stat                      |
| Generation mix (%)                   | Carbon Intensity API `generation`    | every 30 min | Homepage stacked bar                                  |

How it's built:

-   A small data layer in `apps/site/src/grid/`: one hook per reading (`useFrequency`, `useDemand`,
    `useCarbonIntensity`, `useGenerationMix`), each polling at its source's cadence, pausing when the
    tab is hidden, and keeping the last good value on error.
-   Each reading carries a state: **in service** when fresh, **isolated** when stale (older than
    three update intervals), **fault** when the source fails. Shown with `Status`, so a dead feed is
    visible, never silently wrong.
-   Attribution in the footer: Elexon (open data licence) and the Carbon Intensity API (CC BY 4.0).
-   Fetched directly from the browser for now. If load or rate limits ever matter, move behind a
    cached endpoint in `finlayhu-backend`.

## Site layout (every page)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ◯─ FINLAY HUDSON     Board  Log  Projects  New tab  About    ☾ Theme │  SiteHeader
├──────────────────────────────────────────────────────────────────────┤
│ ● 49.98 Hz   ● 27.4 GW   ● 158 g/kWh MODERATE        21:04:17 UTC    │  Status strip
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   page content: panels on a drawing grid                             │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ DRAWING FH-HOME-001 │ REV 3f6a54c │ DATE 02.10.26 │ DATA: Elexon, NESO│  TitleBlock footer
└──────────────────────────────────────────────────────────────────────┘
```

-   **Status strip:** the three live readings with lamps, plus a clock. Present on every page, so
    the whole site feels like one desk. Collapses to frequency and clock on phones.
-   **Theme switch** in the header (system, night, day), using `useTheme`.
-   **Footer title block:** a drawing number per page, the build's git commit as the revision, the
    date, and data attribution.
-   `SkipLink` first in every page.

## Pages

| Route          | Now                                | Becomes                       | Contents                                                                                                                                                                                                                                                                                                     |
| -------------- | ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`            | Typewriter greeting and four cards | **Board**                     | Short ident ("Founding engineer at Squid Energy, building AI for the grid"); the live grid panel (frequency trace for the last hour, demand, carbon, generation mix); a mimic diagram of the site: a busbar with a breaker per section (Log, Projects, Boundary Node, About), each a link; latest post panel |
| `/vault`       | Recent cards and a table           | **Log**                       | Sortable posts table with tag filter and row links; recent posts as panels                                                                                                                                                                                                                                   |
| `/vault/:slug` | Title, date, Markdown              | **Log entry**                 | `Prose` with `CodeBlock` for code; `TitleBlock` with title, date, tags, reading time                                                                                                                                                                                                                         |
| `/projects`    | Two cards                          | **Register**                  | Table of projects with `Status` lamps (in service, isolated) and links: Qin, Boundary Node, this design system, and whatever comes next                                                                                                                                                                      |
| `/new-tab`     | Greeting, quote, Oura, principles  | **Operator desk**             | Greeting and clock; quote of the day; health panel (Stats with trends, readiness chart); activity panel (Strava, the API already exists); principles; a compact grid panel                                                                                                                                   |
| `/about`       | Bio and links                      | **Operator**                  | Bio; links (fixing the broken `mailto:`, currently `matilo:`); a title block of details                                                                                                                                                                                                                      |
| `/system`      | Design system reference            | Unchanged, unlisted           |                                                                                                                                                                                                                                                                                                              |
| errors, 404    | Plain pages                        | **Trip** and **Open circuit** | A tripped breaker for errors, an open circuit for missing pages, with a way back to the Board                                                                                                                                                                                                                |

URLs stay as they are, so links keep working. Only the visible names change.

## Build order

| Phase                 | Work                                                                                                                  | Done when                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 0 · Mock              | A clickable mock of the Board and one inner page, as an artifact, to settle the look before code                      | You've approved the look                                                     |
| 1 · Shell             | New root layout: header, status strip (static at first), theme switch, footer title block, skip link. Dark by default | Every route renders inside the new shell                                     |
| 2 · Grid data         | The `grid/` hooks, with tests against recorded responses; live status strip                                           | Strip shows live readings and goes amber or red when a feed is stale or down |
| 3 · Board             | Homepage: ident, live grid panel, site mimic diagram, latest post                                                     | Board complete in both themes and at phone width                             |
| 4 · Pages             | Log and log entry, Register, Operator desk, Operator, error pages                                                     | Every page rebuilt; no Chalkboard imports left                               |
| 5 · Remove Chalkboard | Delete `chalkboard-ui`, `isolation.css`; move `.sl-page` base styles to `html`                                        | Site builds with no Chalkboard; CSS shrinks                                  |
| 6 · Ship              | Accessibility and performance pass, review on the dev server, merge to `main`, deploy                                 | Live on fhudson.com                                                          |

New components this needs, added to `@fhudson/ui` as they come up: a `StatusStrip` (or a compact
`Reading`), a `Mimic` layout for the busbar-and-breaker navigation, and `Select` (Tier 2) for the
tag filter.

## Decisions

Settled on 2 October 2026:

1. **Direction A.** "Control room" is the concept, not the Control Room artifact. Single Line stays
   as built; the feel comes from layout, live data, lamps, panel IDs and dark by default.
2. **Live data** is fetched directly from visitors' browsers.
3. **Names** use the metaphor: Board, Log, Register, Operator desk, Operator.
4. **Chalkboard UI** stays on the Register, marked retired.
5. **Strava** activity is included on the Operator desk.
