# Plan: Figures, the visuals behind Boundary Node

Status: approved · 4 October 2026 · Phases 1–4 built; Phase 3 awaits a Substack upload check; Phase 5 (3D) next

## Goal

A way to make animated, interactive and 3D visuals (d3, three.js) for Boundary Node and
fhudson.com that:

1. **Look like one body of work**: Single Line, extended from static UI into motion and 3D.
2. **Cost nothing to ship mid-post**: one command to start a figure, one to export it, and it is
   already on the site. No implementation decisions while writing.
3. **Work in both places**: interactive on fhudson.com, and as image or video on Substack.

## What's there today

| Where                    | What                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui` tokens     | Ink, verdigris, paper in both themes; six validated series colours, sequential and diverging ramps; Michroma, Hanken Grotesk, JetBrains Mono; 1 / 1.5 / 3px strokes; 24px drawing grid           |
| `packages/ui` components | Hand-built SVG charts (line, area, bar, scatter, heatmap, sparkline, meter), `NodeMark`, `Busbar`, `Breaker`, `Transformer`. No d3 or three.js yet                                               |
| `packages/grid`          | Live GB frequency, demand, carbon intensity and generation mix                                                                                                                                   |
| boundary-node `tools/`   | `model_diagram.py` (UML from JSON specs, light and dark SVG) and `dw_table.py` (Datawrapper tables). PNGs exported by hand through a headless Chrome MCP that can only write inside another repo |
| boundary-node brand      | Same ink / verdigris / paper. The Python diagrams use slightly different values (white paper, dark ink `#E6EBE9`, dark ground `#14201E`) from the tokens (`#F1F3F2`, `#E3ECEA`, `#0D1615`)       |
| Hosting                  | fhudson.com is a React SPA on S3 + CloudFront; 403/404 fall back to `index.html`; deploy is `s3-sync` on push to `main`                                                                          |
| Substack                 | Dark theme. **No custom HTML or iframes.** Embeds only from an allowlist (YouTube, Vimeo, Datawrapper, …). Images, GIFs and uploaded video are fine. Email can't run JavaScript at all           |

The Substack constraint shapes everything: an interactive figure can never live in a Substack
post. So every figure needs a **rendered form** (PNG, GIF or MP4) for Substack, and its
**interactive form** on fhudson.com, linked from the caption.

## Part 1 · Visual identity: Single Line in motion

The principles in [design-system.md](design-system.md) still hold. These add rules for figures.

### Drawn, not rendered

-   Everything is line work on paper. Hairline edges, flat fills, no gradients, no shadows, no
    lighting. 3D scenes are drawings of objects, not renders of them.
-   **3D uses an orthographic camera**, isometric by default, like an engineering projection.
    No perspective, no depth of field, no fog. Edges drawn as lines (`EdgesGeometry` /
    `LineSegments`); faces in `paper`/`sheet` so hidden lines are occluded.
-   Single-line symbols (busbar, breaker, transformer, node) are the vocabulary. A substation in
    3D is the same symbol extruded, not a photo-real model.

### Colour

-   Ink for structure, verdigris for what's live, flowing or being explained. One verdigris thing
    per frame where possible: it's the "look here".
-   Data uses the series, sequential and diverging tokens as they are, in slot order. Amber and
    fault stay states only.
-   Figures read colours from the `--sl-*` CSS variables, so both themes come free. Substack
    exports come in **both themes**: dark for the publication, light for anywhere else (LinkedIn,
    slides, other people's pages). The site follows the viewer.

### Motion: the plotter

Animation behaves like a pen plotter drawing the sheet:

| Rule                    | Detail                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Lines draw on           | Strokes appear by `stroke-dashoffset`, in the order you'd draw them by hand. Nodes arrive as hollow rings |
| Flow is moving dashes   | Energy or data moving along a line is a verdigris dash pattern travelling at constant speed               |
| Easing                  | Linear for drawing and flow, a short ease-out for things settling. No bounce, no overshoot, no spring     |
| Timing                  | Beats in multiples of 400ms. A build step 800ms, a hold 1600ms. Loops 6–12s                               |
| Camera (3D)             | Fixed, or a slow constant-rate turn about the vertical axis. No swoops or zooms mid-shot                  |
| Builds, not transitions | Like post 1's d1 → d9: add one mark at a time, never morph between unrelated states                       |
| Reduced motion          | `prefers-reduced-motion` shows the final frame, with a step-through control                               |

### Type and furniture

-   Labels in JetBrains Mono, 11–13px, tabular figures. Michroma never appears inside a figure.
-   **No titles or captions baked in.** Captions live in Substack and the post (as today).
-   Every figure carries a small **title block strip**: drawing number, source, date, and the
    fhudson.com link. Drawing numbers follow the post: `BN-03-F2` is post 3, figure 2. This is
    the signature that ties figures together, and it carries the link back to the interactive
    version on every Substack image.

### Reconcile the Python diagrams

Point `model_diagram.py` at the token values (or port it, see Part 2), so the post 1 diagrams
and new figures use the exact same paper and ink.

## Part 2 · Architecture

### Where figures live

In this monorepo, because the tokens, fonts, symbols and site are here. The boundary-node repo
keeps the writing, the data sources and a registry of which figures each post uses.

```
finlayhu/
├── packages/
│   ├── ui/                  Single Line (unchanged)
│   └── figures/             @fhudson/figures
│       ├── src/kit/         the toolkit: Frame, clock, plotter motion, d3 helpers, 3D scene
│       └── src/figures/
│           └── bn-03-f2-cim-versions/
│               ├── Figure.tsx       the figure
│               ├── data.json        its data (or a fetch from @fhudson/grid)
│               └── meta.ts          number, title, alt text, source, duration, sizes
├── apps/
│   ├── site/                serves /f/:slug and figures inside posts
│   └── workbench/           local only: browse, tune and export figures
└── scripts/fig.ts           bun run fig new | dev | export
```

### The kit (`packages/figures/src/kit`)

| Piece          | Does                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Frame`        | Sizes the figure (responsive, with fixed export sizes), draws the title block strip, sets theme, handles reduced motion     |
| `useClock`     | One clock per figure. Real time in the browser; stepped frame by frame by the exporter, so video exports are deterministic  |
| `draw`, `flow` | The plotter motion rules above as helpers: draw-on paths, travelling dashes, staged builds                                  |
| d3             | `d3-scale`, `d3-shape`, `d3-geo`, `d3-force`, `d3-hierarchy` for maths only; React renders the SVG, like the current charts |
| `Scene3D`      | three.js via react-three-fiber: orthographic iso camera, line-edge material, token colours, render-on-demand for export     |
| `Symbols`      | Re-exports `Busbar`, `Breaker`, `Transformer`, `NodeMark`, plus 3D extrusions of them                                       |

Libraries are only imported by the figures that use them, and figure routes are lazy, so
three.js never reaches a page that doesn't need it.

### Three outputs from one source

| Output                  | How                                                                                                                                                               | Used by                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Interactive, standalone | `fhudson.com/f/<slug>` inside the site shell, so Substack readers land on the site; `/f/<slug>/embed` is the bare, iframe-able version, with `?theme=dark\|light` | Linked from Substack captions; other sites |
| Interactive, in a post  | A `figure` directive in post markdown (`::figure{slug="bn-03-f2"}`) that lazy-loads the component inline                                                          | fhudson.com posts                          |
| Rendered                | `bun run fig export <slug>`: Playwright opens the workbench, steps the clock, writes PNG @2×, GIF and MP4 (ffmpeg), dark and light                                | Substack upload                            |

No infrastructure change: `/f/:slug` and `/f/:slug/embed` are normal SPA routes, so it ships with the existing
deploy. (Static files under `/f/slug/` would have needed a CloudFront function for directory
indexes; serving them as routes avoids that.)

Export replaces the current headless-Chrome-MCP PNG workflow, and runs from any folder.

### Substack format guide

| Figure kind                 | Upload                               | Why                                                              |
| --------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Static                      | PNG @2×, dark and light              | As today                                                         |
| Short loop (≤ 12s)          | GIF, dark and light, kept small      | Plays in email and on the web                                    |
| Longer animation or 3D turn | MP4 (native video) + first-frame PNG | GIFs get huge; video doesn't play in email, so lead with a still |
| Tables                      | Datawrapper, as today                | It's on the allowlist and already works                          |

Every caption ends with "Interactive version: fhudson.com/f/<slug>". This also sends Substack
readers to the site.

### The workbench (`apps/workbench`)

A local Vite app, never deployed:

-   Lists every figure with its number and post.
-   Toggles theme and width presets: Substack column (728px), phone (375px), site post column.
-   Scrubs the clock, so an animation can be checked frame by frame.
-   The export target for Playwright.

### Claude, mid-post

A project skill, `.claude/skills/figure/`, holds the Part 1 rules and the commands, so asking
"make a figure for post 3 showing who's on which CIM version, animated by year" starts from the
identity and the kit every time. It:

1. Runs `bun run fig new` with the next drawing number for that post.
2. Builds the figure with the kit only (no new styling decisions).
3. Opens it in the workbench, checks both themes and all widths.
4. Exports, copies the files into the boundary-node post folder, and records them in that
   post's `figures.json` (like `charts.json`): number, slug, files, interactive URL, alt text.

The existing `dataviz` skill already validated the palette; the figure skill defers to it for
chart-form choices.

## Phases

| Phase                  | Work                                                                                                      | Done when                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 · Identity sheet     | A Figures section on `/system`: draw-on, flow, a 3D iso substation, the title block strip, in both themes | You've approved the look                                               |
| 2 · Kit + workbench    | `packages/figures` with `Frame`, `useClock`, `draw`/`flow`; `apps/workbench`; `bun run fig new`           | One static and one animated figure run in the workbench                |
| 3 · Export             | Playwright + ffmpeg export to PNG, GIF and MP4, dark and light                                            | An export uploads to a Substack draft and looks right                  |
| 4 · Site               | `/f/:slug` route and the markdown `figure` directive                                                      | A figure is live at fhudson.com/f/… and inline in a post               |
| 5 · 3D                 | `Scene3D`, line-edge material, extruded symbols, deterministic render for export                          | A turning 3D figure exports to MP4                                     |
| 6 · Skill              | `.claude/skills/figure`, boundary-node `figures.json`, `model_diagram.py` colours reconciled              | A figure goes from request to Substack-ready files in one conversation |
| 7 · First real figures | Post 3's figures (below)                                                                                  | Used in post 3                                                         |

Phases 1–3 are the useful core: after them, figures can be made and put on Substack.

## First figures (post 3, CIM around the world)

Proving the kit on real work rather than demos:

| Number   | Figure                                                                                                                                                                | Kind         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| BN-03-F1 | Who's on which CIM version, 1990–2026: a swimlane per region (ERCOT, CAISO, ENTSO-E, GB), the plotter drawing each lane by year; ERCOT's long CIM10 line is the story | Animated d3  |
| BN-03-F2 | Europe's common grid model: TSO models arriving at 08:00 and 16:00 CET and merging into one, as flowing dashes into a single node                                     | Animated SVG |
| BN-03-F3 | Voltage levels as stacked iso planes (400, 275, 132 kV, distribution), with the boundary nodes where one network's model meets the next                               | 3D           |

And a back-port: post 1's d1 → d9 as one plotter build, to check the motion grammar against
diagrams readers have already seen.

## Decisions

Settled on 4 October 2026:

1. **Figures live in this monorepo**, in `packages/figures`. The boundary-node repo keeps the
   writing, data sources and each post's `figures.json`.
2. **Exports in both themes.** Every rendered output is made dark and light; the dark one goes
   into Substack.
3. **3D uses react-three-fiber.**
4. **`model_diagram.py` is ported into the kit eventually.** Until then, only its colours are
   aligned with the tokens.
