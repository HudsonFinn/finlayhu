# Claude Code Instructions

## Repo layout

This is a Bun workspaces monorepo. See README.md for scripts.

-   `apps/site` — fhudson.com
-   `packages/` — shared packages (the Single Line design system will be `packages/ui`)
-   `docs/plans/design-system.md` — the plan for the monorepo and design system

Run scripts from the root (`bun run lint`, `bun run build`), or one workspace with
`bun run --filter @fhudson/site <script>`. Shared config lives at the root: `tsconfig.base.json`,
`eslint.config.js`, `.prettierrc.json`.

## UI Components

The site still uses `chalkboard-ui` until it is migrated to Single Line (see the plan). Until then, always prefer using components from `chalkboard-ui` library when available. The library includes:

-   Typography: `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `P`, `Lead`, `Small`, `Blockquote`, `Code`, `Pre`
-   Components: `Button`, `Input`, `Icon`, `Tag`, `Message`
-   Navigation: `Navbar`
-   Preview cards: `Preview`, `PreviewHeader`, `PreviewDescription`, `PreviewContent`
-   Dropdown: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`

Import from `chalkboard-ui`:

```tsx
import {
	H1,
	Button,
	Preview,
	PreviewHeader,
	PreviewDescription,
} from 'chalkboard-ui';
```
