# @fhudson/ui · Single Line

The fhudson design system, modelled on single-line diagrams and engineering drawing sheets.
See [the plan](../../docs/plans/design-system.md) for the principles and roadmap, and visit
`/system` on the site for every token rendered live.

## Use it in an app

```css
/* src/index.css */
@import 'tailwindcss';
@import '@fhudson/ui/styles.css';
@source '<relative path to>/packages/ui/src';
```

Wrap Single Line pages in `.sl-page` (it sets the paper background, ink text, body font and
focus ring). After the Chalkboard migration this moves to `<html>`.

```tsx
import { useTheme } from '@fhudson/ui';

const { choice, setChoice } = useTheme(); // 'system' | 'light' | 'dark', remembered
```

## Tokens

Values live in `src/styles/tokens.css` and nowhere else. Tailwind utilities come from
`src/styles/theme.css`:

| Kind    | Utilities                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour  | `paper`, `sheet`, `ink`, `ink-muted`, `hairline`, `verdigris`, `on-verdigris`, `amber`, `fault` with any colour utility (`bg-paper`, `text-ink`, `border-hairline`) |
| Type    | `font-display`, `font-body`, `font-data`; sizes `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-ui`, `text-small`, `text-label`                                 |
| Texture | `drawing-grid`                                                                                                                                                      |

Dark mode follows the system setting. `data-theme="light"` or `"dark"` on `<html>` overrides it.

## Tests

`bun test` checks every text colour pair against WCAG AA in both themes, reading the values
straight from `tokens.css`. Add a pair to `contrastPairs` in `src/tokens/index.ts` whenever a
new foreground/background combination appears.

## Temporary: Chalkboard isolation

`src/styles/isolation.css` stops chalkboard-ui's unlayered reset from overriding Single Line
inside `.sl-page`, and stops Single Line's `font-display` from restyling Chalkboard
components. Delete it when chalkboard-ui is removed (Phase 4).
