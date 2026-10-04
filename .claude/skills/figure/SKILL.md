---
name: figure
description: Make a Boundary Node figure (an animated, interactive or 3D diagram or chart for a post) with @fhudson/figures, check it, and export it to Substack-ready files recorded in the boundary-node post folder. Use when Finn asks for a figure, visual, diagram, animation, chart or 3D drawing for a Boundary Node post or for fhudson.com, or to re-export or change one. Not for Datawrapper tables (boundary-node tools/dw_table.py) or the UML diagrams (tools/model_diagram.py).
---

# Make a Boundary Node figure

Figures live in this repo (`packages/figures`), are drawn with its kit on Single Line, show live at
`fhudson.com/f/<slug>`, and export to PNG / MP4 / GIF for Substack. The why and the rules are in
`docs/plans/figures.md` (Part 1 is the visual identity). Finn is writing while you do this: make
the decisions yourself, from the rules below, and only ask about content.

## 1 · Pin down the content

-   Which post (two digits; `00` is the identity sheet) and what the figure must show. One idea per
    figure. If the data isn't given, ask where it comes from.
-   **Data only from published documents.** Never from the BSI GB CIM Advisory Group room. Never
    name Finn's employer, in a figure, its alt text or its source line.
-   Choose the form: a still unless motion explains something (a build that adds one mark at a
    time, a flow, a change over time, a 3D object worth turning). For charts, the `dataviz` skill's
    form heuristic applies; colours come from the tokens below, never new ones.

## 2 · Start it

```sh
bun run fig new <post> <title…>        # e.g. bun run fig new 3 Who's on which CIM version
```

This makes `packages/figures/src/figures/bn-<post>-f<n>-<title>/` with `meta.ts` and a still
`Figure.tsx`, and registers it. Fill in `meta.ts` now: `alt` (what it shows, a sentence or two:
it's also Substack's alt text), `source` (as printed in the title block), and `duration` (a
build's loop, ms) or `loop` (a continuous animation's seamless length, ms). Both are multiples of 400.

## 3 · Draw it with the kit

Read an existing figure first; they are the reference:
`bn-00-f1-plotter` (build), `bn-00-f2-flow` (continuous, compact layout), `bn-00-f3-substation`
(3D), `bn-00-f4-two-networks-one-node` (still).

-   **Frame** (`kit/Frame`): every figure's root. `<Frame meta={meta} clock={clock}>`. Pass a
    function as children, `({ compact }) => …`, to switch layout below 560px.
-   **Sheet / Label / Node** (`kit/Sheet`): SVG drawn on a 720-wide viewBox (1:1 in Substack's
    column). `Label` is mono, 11px on screen at any scale; `tone="ink"` for values. `Node` is the
    hollow verdigris ring.
-   **Time** (`kit/time`, `kit/useClock`): `const clock = useClock(meta.duration)`; compute every
    mark from `clock.time`. `progress(t, start, length)`, `drawOn(p)` (spread onto the path or
    shape itself: `pathLength` doesn't inherit from a `<g>`), `settle(p)`, `flowOffset` with
    `loopSpeed` so loops are seamless. `BEAT` 400 ms, `STEP` 800, `HOLD` 1600.
-   **3D** (`kit/three` `IsoCanvas`, `kit/geometry`): plain three.js, never react-three-fiber.
    `scene={({ c, solid, lines, ground, breaker, transformer }) => [...]}` with `box`, `prism`,
    `segments` for geometry made once at module level; `angle={… + clock.time * TURN}`.
-   Colours: `var(--sl-ink)`, `--sl-ink-muted`, `--sl-hairline`, `--sl-paper`, `--sl-verdigris`;
    data series `--sl-series-1…6` in slot order, `--sl-seq-*`, `--sl-div-*`. Amber and fault are
    states only.

### The identity, as rules

-   Drawn, not rendered: line work on paper. No gradients, shadows, glow, rounded cards or
    perspective. Strokes 1.5 (lines) and 3 (busbars).
-   One verdigris thing per frame where possible: it's "look here". Everything else ink.
-   Lines draw on in the order you'd draw them by hand; nodes arrive as rings; labels settle in
    after their mark. Linear for drawing, ease-out to settle, no bounce. Beats of 400 ms.
-   Flow is verdigris dashes moving at constant speed along a line; faster means more.
-   3D: orthographic iso, paper faces, ink edges, fixed or one slow constant turn.
-   No titles or captions inside the figure: captions live in the post. Labels in mono caps.

## 4 · Check it

1. `bun run --filter @fhudson/figures test` (fails until alt and source are filled in).
2. Look at it. `bun run fig export <slug> --theme dark`, then Read the PNG in
   `packages/figures/exports/<slug>/`. For animations, pull frames from the MP4 too:
   `ffmpeg -v error -ss <s> -i <mp4> -frames:v 1 /tmp/frame.png`. Check: nothing overlaps,
   labels are readable, the build order makes sense, the last frame is the finished drawing.
3. Check the phone layout in the workbench (`bun run fig dev`, Phone 343) or with Playwright
   against `http://localhost:5180/?f=<slug>&frame` at a 343px viewport.
4. `bun run lint`.

## 5 · Export into the post

```sh
bun run fig export <slug> --post <boundary-node>/<NN-post-folder>
```

Writes both themes into `<post>/figures/<slug>/` and records the figure in `<post>/figures.json`
(number, alt, interactive URL, and `upload`: exactly which files go into Substack, per the format
guide). The boundary-node checkout on this machine is `../boundary-node` from this repo.

Then tell Finn, briefly: what to upload (from `upload`), the alt text, and the caption ending
`Interactive version: fhudson.com/f/<slug>`. The interactive page is only live once this repo is
pushed to `main` (which deploys the site); say so, and don't push unless asked.

## 6 · Commit

Commit in both repos when Finn is happy: the figure here (`/commit`), and `figures/` plus
`figures.json` in boundary-node.
