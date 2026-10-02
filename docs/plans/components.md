# Single Line components

Status: Tier 1 built · 1 October 2026

The component spec for `@fhudson/ui`. It covers Tier 1 (what the site needs to leave
Chalkboard) and Tier 2 (the standard set most design systems have, built when first needed).
Tier 3 is listed at the end and not specified.

Decisions this builds on: interactive behaviour comes from **React Aria Components**, names
follow **common design-system usage** (checked against component.gallery and Open UI), and the
written format for each component follows **GOV.UK Design System** pages.

## Changes made during the Tier 1 build

The entries below describe the components as built. Where the build differed from the first
draft of this spec:

-   **Checkbox** is built on React Aria's `CheckboxField` and `CheckboxButton`. React Aria 1.21
    deprecated its single `Checkbox` component. The props are unchanged.
-   **Table** adds `TableContainer` (scrolling wrapper with a sticky header), a styled
    `ColumnResizer`, and a `TableLoadMoreItem` that shows a Spinner. `ResizableTableContainer`,
    `Virtualizer` and `TableLayout` are re-exported from React Aria, along with the `Key`,
    `Selection` and `SortDescriptor` types, so apps never import React Aria directly.
-   **PanelHeader** takes an `href` that makes the whole panel a link.
-   **SiteHeader**'s phone menu is a React Aria `Button` with `aria-expanded`, not a Disclosure:
    the list must always be visible on wider screens, which Disclosure doesn't allow.
-   **Type sizes** live in `tokens.css` as `--sl-text-*`, so CSS such as Prose can use them.
    `lead` (22px) and `h4` (17px) were added to the scale.
-   **Shared isolation** with chalkboard-ui was needed during the migration and has been
    removed, along with chalkboard-ui itself.

## Conventions

These apply to every component. A component that breaks one says why in its entry.

1. **Two kinds of component.**
    - _Static_ components (Heading, Panel, List) render plain HTML. Their props extend the
      element's own (`ComponentPropsWithoutRef<'h2'>`) and use HTML's names (`disabled`, `onClick`).
    - _Interactive_ components (Button, Table, Tabs, Dialog) wrap React Aria. They pass React Aria's
      props through unchanged and use its names (`onPress`, `isDisabled`, `isSelected`). We only
      add styling props.
2. **Refs and classes.** Every component forwards its ref to the main element and accepts
   `className`, merged last with `cn()` (clsx + tailwind-merge) so callers can override. For
   React Aria components, `className` can also be a function of render state; we compose it with
   React Aria's `composeRenderProps`.
3. **Variants are named unions,** for example `variant: 'primary' | 'ghost'`. No stacks of booleans.
   Defaults are the most common case.
4. **Compose parts, don't configure one big component.** Parts are separate named exports
   (`Panel`, `PanelHeader`, `PanelBody`), not `Panel.Header`, so unused parts tree-shake.
5. **States mean something.** Components that show the state of a thing take `state`, with one
   shared type used everywhere:
    ```ts
    type State = 'in-service' | 'isolated' | 'fault' | 'unknown';
    ```
    `in-service` is verdigris, `isolated` amber, `fault` red, `unknown` muted. Colour is never the
    only signal: each state also has a label and a lamp shape.
6. **Styling hooks.** Interactive components expose state as data attributes (React Aria does
   this already: `data-pressed`, `data-selected`, `data-focus-visible`), styled with Tailwind's
   `data-*:` variants. Static components add `data-state` where relevant.
7. **Accessibility is part of done.** Visible focus (1.5px verdigris outline, 2px offset),
   keyboard operation, and a label for every control. Every text pairing is in the contrast tests.

### Shared types

```ts
type State = 'in-service' | 'isolated' | 'fault' | 'unknown';
type Size = 'sm' | 'md'; // only where a component genuinely needs two sizes
```

### File layout

```
packages/ui/src/components/<Name>/
├── <Name>.tsx        component and its parts
├── <Name>.test.tsx   behaviour tests (interactive components)
└── index.ts
```

Each component is exported from `src/index.ts` and shown on `/system` with its states.

### Definition of done

-   [ ] Follows the conventions above
-   [ ] Renders correctly in light and dark, and at 390px wide
-   [ ] Works with keyboard only; focus is visible
-   [ ] Any new text colour pair is added to the contrast tests
-   [ ] Shown on `/system` with every variant and state
-   [ ] Has its entry in this document, updated if the build changed anything

---

## Tier 1 · needed for the migration

### Type

#### Heading

Titles for pages and sections.

-   **Use** for any heading. Pick `level` for document structure and `size` for appearance only
    when they need to differ.
-   **Don't** use for emphasis inside text. Use `<strong>`.
-   **Built on** `h1`–`h6`.

```ts
interface HeadingProps extends ComponentPropsWithoutRef<'h2'> {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	size?: 'h1' | 'h2' | 'h3' | 'h4'; // defaults from level, h4 for levels 4–6
}
```

-   Sizes h1 and h2 are set in Michroma, uppercase. h3 and h4 use Hanken Grotesk, semibold.
-   h1 steps down to 30px below 640px: Michroma at 40px fits only about 9 characters per word on
    a phone. Headings use `text-wrap: balance`.

```tsx
<Heading level={1}>Vault</Heading>
<Heading level={2} size="h3">Recent</Heading>
```

#### Text

Body copy and its variants.

-   **Built on** `p`, or `span` with `as`.

```ts
interface TextProps extends ComponentPropsWithoutRef<'p'> {
	as?: 'p' | 'span' | 'div';
	variant?: 'body' | 'lead' | 'ui' | 'small' | 'label'; // default 'body'
	tone?: 'default' | 'muted';
}
```

-   `lead` is the intro paragraph style: 22px, regular weight, muted. `label` is mono, uppercase,
    letter-spaced. Every variant maps to a step on the type scale.
-   Replaces Chalkboard's `P`, `Lead` and `Small`.

#### Prose

Styles a block of rendered Markdown: headings, paragraphs, lists, links, code, quotes, tables
and images, with spacing between them.

-   **Use** around blog posts and any long text you don't control element by element.
-   **Built on** a `div`. It styles child elements, so the Markdown renderer needs no component
    mapping.

```ts
interface ProseProps extends ComponentPropsWithoutRef<'div'> {}
```

-   Measure capped at 68ch. Body at 17px with 1.65 line height.
-   Replaces BlogPost's element-by-element mapping to Chalkboard components.

#### Code

Inline code.

```ts
interface CodeProps extends ComponentPropsWithoutRef<'code'> {}
```

#### CodeBlock

A block of code or preformatted text.

-   **Built on** `pre > code`. Scrolls horizontally inside its own box.

```ts
interface CodeBlockProps extends ComponentPropsWithoutRef<'pre'> {
	language?: string; // shown as a label; no syntax highlighting in Tier 1
}
```

#### Blockquote

A quotation, with optional attribution.

```ts
interface BlockquoteProps extends ComponentPropsWithoutRef<'blockquote'> {
	cite?: string; // source URL (the HTML attribute)
	attribution?: ReactNode; // shown below, e.g. "Albert Camus"
}
```

-   Used by the quote of the day.

### Actions

#### Button

Starts an action.

-   **Use** for actions on the page: submit, open, toggle.
-   **Don't** use to go to another page. Use Link (a Link can look like a button).
-   **Built on** React Aria `Button`.

```ts
interface ButtonProps extends RACButtonProps {
	variant?: 'primary' | 'ghost' | 'quiet'; // default 'primary'
	size?: Size; // default 'md'
}
```

-   `primary` is a verdigris fill, `ghost` an ink outline, `quiet` text only. Labels are set in
    Michroma, uppercase.
-   States: hover, pressed, focus-visible, disabled.

```tsx
<Button onPress={subscribe}>Subscribe</Button>
```

#### Link

Goes somewhere.

-   **Built on** React Aria `Link`. A `RouterProvider` in the site wires it to React Router, so
    internal links navigate without a reload.

```ts
interface LinkProps extends RACLinkProps {
	variant?: 'inline' | 'standalone' | 'button'; // default 'inline'
	buttonVariant?: ButtonProps['variant']; // when variant is 'button'
}
```

-   `inline` is verdigris and underlined, for links inside text. `standalone` is mono, uppercase
    and not underlined until hover, for "Read" or "All posts". External links get `rel="noopener"`
    and a small arrow.

### Navigation

#### SiteHeader

The site's top bar: name and main navigation.

-   **Built on** `header > nav`, with React Aria `Link` for items.

```ts
interface SiteHeaderProps extends ComponentPropsWithoutRef<'header'> {
	title: ReactNode; // links home
	items: { label: string; href: string }[];
	currentHref: string; // sets aria-current="page"
}
```

-   Links are mono, uppercase. The current page has a verdigris underline.
-   Below 640px the items collapse behind a menu button (built on Disclosure).
-   Replaces Chalkboard's `Navbar`, including its icon sidebar.

### Feedback

#### Status

Shows the state of a thing: an API, a feed, a sync.

-   **Use** for live or operational state.
-   **Don't** use for categories. Use Tag.
-   **Built on** `span`, with `role="status"` only when the value updates live.

```ts
interface StatusProps extends ComponentPropsWithoutRef<'span'> {
	state: State;
	children?: ReactNode; // label; defaults to "In service", "Isolated", "Fault" or "Unknown"
	live?: boolean; // announce changes to screen readers
}
```

-   A lamp dot plus a label, in a pill. `fault` blinks slowly unless reduced motion is on.

### Data

#### Table

Tabular data, from a short list of posts to a few thousand rows of grid data in a Boundary
Node project.

-   **Use** for data people compare across rows and columns. Turn on sorting, selection or
    resizing per table as the data needs them.
-   **Don't** use for layout, or for a list that only ever has one column. Use List.
-   **Built on** React Aria `Table`, `TableHeader`, `Column`, `TableBody`, `Row` and `Cell`. React
    Aria gives keyboard navigation between cells, sorting, row selection and actions, and screen
    reader announcements. The table is exposed as a grid, so arrow keys move between cells.

Parts use React Aria's names, so its documentation applies directly:

```ts
interface TableProps extends RACTableProps {
	'aria-label': string; // or aria-labelledby: every table needs a name
	density?: 'compact' | 'comfortable'; // default 'comfortable'; 'compact' for dense data
}
interface ColumnProps extends RACColumnProps {
	align?: 'start' | 'end'; // 'end' for numbers
}
interface CellProps extends RACCellProps {
	align?: 'start' | 'end';
	numeric?: boolean; // mono, tabular figures, end-aligned
}
// TableHeader, TableBody and Row pass React Aria's props through unchanged
```

Features, all from React Aria and switched on per table:

| Feature         | How                                                                       | Notes                                                    |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Sorting         | `allowsSorting` on a Column; `sortDescriptor` and `onSortChange` on Table | Sorted column shows an arrow; `aria-sort` is set for you |
| Row selection   | `selectionMode="single" \| "multiple"` on Table                           | Adds a checkbox column using our Checkbox                |
| Row actions     | `onRowAction` on Table, or `href` on a Row                                | Whole row opens a detail page                            |
| Column resizing | Wrap in `ResizableTableContainer`; `ColumnResizer` in a Column            | Columns take `defaultWidth` and `minWidth`               |
| Large data      | Wrap in `Virtualizer` with `TableLayout`                                  | Renders only visible rows; needs a fixed height          |
| Loading more    | `TableLoadMoreItem` at the end of `TableBody`                             | Shows a Spinner row and loads the next page on scroll    |
| Empty state     | `renderEmptyState` on TableBody                                           | Renders EmptyState                                       |

-   One column must have `isRowHeader`, usually the name or title.
-   Style: hairline rows, mono uppercase column labels, numbers in tabular figures. The header
    sticks inside a scrolling container. A selected row gets a verdigris rule on its leading edge;
    the focused cell gets the focus outline.
-   Wrapped in a horizontally scrolling container on narrow screens.
-   Replaces Chalkboard's config-driven `Table` (`columns` + `dataSource`).

```tsx
<Table aria-label="Posts" sortDescriptor={sort} onSortChange={setSort}>
	<TableHeader>
		<Column id="title" isRowHeader allowsSorting>
			Title
		</Column>
		<Column id="date" allowsSorting>
			Date
		</Column>
		<Column id="tags">Tags</Column>
	</TableHeader>
	<TableBody
		items={sorted}
		renderEmptyState={() => <EmptyState title="No posts yet" />}
	>
		{(post) => (
			<Row id={post.slug} href={`/vault/${post.slug}`}>
				<Cell>{post.title}</Cell>
				<Cell>{formatDate(post.created)}</Cell>
				<Cell>
					{post.tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</Cell>
			</Row>
		)}
	</TableBody>
</Table>
```

#### List

Bulleted, numbered or bare lists.

```ts
interface ListProps extends ComponentPropsWithoutRef<'ul'> {
	variant?: 'bullet' | 'number' | 'bare'; // 'number' renders <ol>
}
interface ListItemProps extends ComponentPropsWithoutRef<'li'> {}
```

#### Tag

Labels a thing with a category or topic.

-   **Don't** use for state. Use Status.

```ts
interface TagProps extends ComponentPropsWithoutRef<'span'> {}
```

-   Mono, uppercase, hairline border, square corners. Static in Tier 1. A removable or selectable
    tag group would use React Aria `TagGroup` (Tier 3).

#### Stat

One number with its label: a reading from an instrument.

```ts
interface StatProps extends ComponentPropsWithoutRef<'div'> {
	label: ReactNode;
	value: number | string | null; // null renders "–"
	unit?: ReactNode; // "kV", "bpm"
	note?: ReactNode; // "Today", "No data yet"
	state?: State; // colours the value
}
```

-   Value set in Michroma with tabular figures, label in mono.
-   Replaces the tiles in OuraData.

#### LineChart

A line over time, with gaps where data is missing.

-   **Built on** SVG, ported from chalkboard-ui 0.0.9.

```ts
interface LineChartProps extends ComponentPropsWithoutRef<'svg'> {
	data: { label: string; value: number | null }[];
	label: string; // accessible name, e.g. "Readiness, last 8 days"
	yDomain?: [number, number]; // default from data
	height?: number; // default 180
	showArea?: boolean;
	formatValue?: (value: number) => string;
}
```

-   Hairline grid, verdigris line, last point filled. Gaps show a short muted tick on the axis.
-   A visually hidden table of the values sits next to the chart for screen readers.

### Layout

#### Panel

A labelled area that groups related content: a reading, a list, a form.

-   **Use** to set off one group from the page.
-   **Don't** nest panels, or wrap every section in one. Most sections need only a heading.
-   **Built on** `section` (or `div` with `as`). `PanelHeader` gives it an accessible name.

```ts
interface PanelProps extends ComponentPropsWithoutRef<'section'> {
	as?: 'section' | 'div' | 'article';
}
interface PanelHeaderProps extends ComponentPropsWithoutRef<'div'> {
	label: ReactNode; // mono, uppercase, with the node mark
	meta?: ReactNode; // right-aligned: "Today", "Zone B2"
}
interface PanelBodyProps extends ComponentPropsWithoutRef<'div'> {}
```

-   To make a whole panel a link, put a `Link` in the header and let it cover the panel. The
    panel never becomes a button.
-   Replaces Chalkboard's `Preview`, `PreviewHeader`, `PreviewDescription` and `PreviewContent`.

### Drawing

These have no equivalent in other systems. They are what make Single Line recognisable.

#### TitleBlock

Page or post metadata, set out like an engineering drawing's title block.

-   **Use** at the foot of posts and reference pages.
-   **Built on** `dl`.

```ts
interface TitleBlockProps extends ComponentPropsWithoutRef<'dl'> {
	fields: { label: string; value: ReactNode }[]; // e.g. Title, Drawn, Date, Rev
}
```

-   Ink rule above, hairline cells, mono text. Wraps to two columns on phones.

#### NodeMark

The Boundary Node mark: two lines meeting at a hollow node.

```ts
interface NodeMarkProps extends ComponentPropsWithoutRef<'svg'> {
	label?: string; // omit when decorative (sets aria-hidden)
}
```

#### Busbar, Breaker, Transformer

Single-line diagram symbols, for illustrations and status diagrams.

```ts
interface SymbolProps extends ComponentPropsWithoutRef<'svg'> {
	label?: string;
	state?: State; // colours the symbol
}
interface BreakerProps extends SymbolProps {
	closed: boolean; // filled square when closed, hollow when open
}
interface TransformerProps extends SymbolProps {
	ratio?: string; // "33/11 kV", drawn beside the windings
}
interface BusbarProps extends SymbolProps {
	orientation?: 'horizontal' | 'vertical';
}
```

---

## Charts

Built ahead of need, following the dataviz method: pick the form from the data's job, colour
by role, validate the palette, hover by default, and keep every value readable without hover.

| Chart          | For                                                           | Notes                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LineChart`    | Trends over time                                              | One series (`data`) or up to six (`categories` + `series`). `curve="step"` for prices and settlement periods. Gaps for missing values, marked with a cross on the axis |
| `AreaChart`    | How a total splits into parts over time                       | Stacked, with a 2px surface gap between bands and a total in the tooltip                                                                                               |
| `BarChart`     | Comparing values                                              | Vertical or horizontal, grouped or stacked, values below zero. Square ends, at most 24px thick                                                                         |
| `Heatmap`      | A value over two dimensions, such as settlement period by day | Seven-step verdigris ramp, with a scale legend                                                                                                                         |
| `ScatterChart` | Two measures against each other                               | Up to three series, each with its own marker shape                                                                                                                     |
| `Sparkline`    | A small trend inside Stat or a table                          | Not interactive; its accessible name carries first, last, low and high                                                                                                 |
| `Meter`        | One value against a limit                                     | `role="meter"`; the fill carries the state                                                                                                                             |

Shared behaviour:

-   **Hover and keyboard.** Every plot is one focusable area. Pointer or arrow keys move a crosshair
    (lines, areas), a band (bars) or a cell (heatmap); the tooltip lists every series, value first.
    Keyboard reading is announced through a live region.
-   **Data table.** Every chart has a "Show table" toggle. The table is always available to screen
    readers, so no value is only reachable by hovering.
-   **Real pixel size.** Charts measure their container and draw at that width, so 10px labels stay
    10px on phones. Category labels that don't fit their band are shortened.
-   **No dual axes, ever.** Two measures with different scales get two charts.

Colour (tokens in `tokens.css`, validated with the dataviz six-checks validator):

-   **Series:** six slots in a fixed order, never cycled: verdigris, cobalt, magenta, olive, violet,
    sky. Worst adjacent CVD ΔE 13.1 and normal-vision ΔE 21.7 in both themes. Slots 1–3 also pass
    all-pairs, which is why scatter is capped at three series.
-   **Status colours stay reserved.** Amber and fault never colour a series.
-   **Sequential:** `--sl-seq-1` to `--sl-seq-7`, verdigris, flipped for dark mode.
-   **Diverging:** `--sl-div-1` to `--sl-div-7`, verdigris to magenta through a neutral midpoint.
-   Brand verdigris (`#0c6157`) fails the series chroma floor, so series slot 1 is a brighter
    verdigris (`#028f73`).

## Tier 2 · build when first needed

### Forms

All form controls share one field layout: label above, description below the label, error
below the control. React Aria handles labelling, descriptions and validation messages.

#### TextField

A single-line text input.

-   **Built on** React Aria `TextField`, `Label`, `Input`, `Text slot="description"` and `FieldError`.

```ts
interface TextFieldProps extends RACTextFieldProps {
	label: ReactNode; // required: every field has a visible label
	description?: ReactNode;
	errorMessage?: ReactNode | ((v: ValidationResult) => ReactNode);
	placeholder?: string;
}
```

-   Value props as React Aria: `value`, `defaultValue`, `onChange`. Validation through `isRequired`,
    `validate` and `isInvalid`.

#### TextArea

Multi-line text. Same field layout and props as TextField, built on React Aria `TextArea`.

```ts
interface TextAreaProps extends RACTextFieldProps {
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode | ((v: ValidationResult) => ReactNode);
	rows?: number;
}
```

#### Checkbox

One yes/no choice, or a group of independent choices.

-   **Built on** React Aria `Checkbox` and `CheckboxGroup`.

```ts
interface CheckboxProps extends RACCheckboxProps {
	children: ReactNode; // the label
}
interface CheckboxGroupProps extends RACCheckboxGroupProps {
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode;
}
```

-   Square box, ink border, verdigris fill with a check when selected. Also shows indeterminate.

#### RadioGroup, Radio

One choice from a few visible options.

-   **Use** for 2–6 options. More than that, use Select.
-   **Built on** React Aria `RadioGroup` and `Radio`.

```ts
interface RadioGroupProps extends RACRadioGroupProps {
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode;
	orientation?: 'vertical' | 'horizontal';
}
interface RadioProps extends RACRadioProps {
	children: ReactNode;
}
```

#### Switch

Turns a setting on or off, taking effect immediately.

-   **Don't** use in forms that are submitted. Use Checkbox.
-   **Built on** React Aria `Switch` (`isSelected`, `defaultSelected`, `onChange`).

```ts
interface SwitchProps extends RACSwitchProps {
	children: ReactNode; // the label
}
```

-   Drawn as a knife switch: a hinged bar that closes onto a contact when on.

#### Select

One choice from a longer list, in a dropdown.

-   **Built on** React Aria `Select`, `Label`, `Button`, `SelectValue`, `Popover`, `ListBox` and
    `ListBoxItem`.

```ts
interface SelectProps<T extends object> extends RACSelectProps<T> {
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode;
	items?: Iterable<T>;
	children: ReactNode | ((item: T) => ReactNode);
}
interface SelectItemProps extends RACListBoxItemProps {}
```

-   Selection props as React Aria's Select. Confirm the current names when this is built: React
    Aria has been moving its collection components towards `value` and `onChange`.

#### Form

Wraps fields so React Aria can show server and client validation together.

-   **Built on** React Aria `Form` (`validationErrors`, `validationBehavior`).

```ts
interface FormProps extends RACFormProps {}
```

### Navigation

#### Tabs

Switches between views of the same content without leaving the page.

-   **Don't** use for site navigation. Use Link.
-   **Built on** React Aria `Tabs`, `TabList`, `Tab` and `TabPanel` (`selectedKey`,
    `defaultSelectedKey`, `onSelectionChange`).

```ts
interface TabsProps extends RACTabsProps {}
interface TabListProps<T extends object> extends RACTabListProps<T> {}
interface TabProps extends RACTabProps {}
interface TabPanelProps extends RACTabPanelProps {}
```

-   Mono, uppercase labels. The selected tab has an ink underline joined to the panel's top rule.

#### Breadcrumbs

Where a page sits in the site.

-   **Built on** React Aria `Breadcrumbs` and `Breadcrumb`, with `Link`.

```ts
interface BreadcrumbsProps<T extends object> extends RACBreadcrumbsProps<T> {}
interface BreadcrumbProps extends RACBreadcrumbProps {}
```

-   Separated by a busbar segment, not a slash.

#### Pagination

Moves through pages of a list.

-   **Built on** `nav` with Links. React Aria has no pagination component.

```ts
interface PaginationProps extends ComponentPropsWithoutRef<'nav'> {
	page: number;
	pageCount: number;
	hrefForPage: (page: number) => string; // links, so pages are shareable
}
```

#### SkipLink

Lets keyboard users skip the header.

```ts
interface SkipLinkProps extends ComponentPropsWithoutRef<'a'> {
	href?: string; // default '#main'
}
```

-   Hidden until focused. Belongs in the site layout from the first migrated page.

### Feedback

#### Callout

A message that needs attention on the page: a note, a warning, an error.

-   **Don't** use for transient confirmation. That's Toast (Tier 3).
-   **Built on** `div` with `role="status"` (note) or `role="alert"` (warning, error).

```ts
interface CalloutProps extends ComponentPropsWithoutRef<'div'> {
	tone?: 'note' | 'warning' | 'error'; // default 'note'
	title?: ReactNode;
}
```

-   A 3px stripe in the tone's colour on the leading edge.
-   Replaces Chalkboard's `Message`.

#### Spinner

Shows that something is loading, when the wait is unknown.

-   **Built on** React Aria `ProgressBar` with `isIndeterminate`, so screen readers announce it.

```ts
interface SpinnerProps extends RACProgressBarProps {
	label?: string; // default "Loading"
}
```

-   A node pulsing along a short busbar. Static when reduced motion is on.

#### EmptyState

What to show when there is nothing to show.

```ts
interface EmptyStateProps extends ComponentPropsWithoutRef<'div'> {
	title: ReactNode; // "No health data this week"
	description?: ReactNode;
	action?: ReactNode; // a Button or Link
}
```

### Overlays

#### Dialog

A focused task or message on top of the page.

-   **Built on** React Aria `DialogTrigger`, `ModalOverlay`, `Modal`, `Dialog` and
    `Heading slot="title"`. Focus is trapped and returned; Escape closes.

```ts
interface DialogProps extends RACDialogProps {
	title: ReactNode;
	size?: Size;
}
```

-   A sheet with an ink border on a dimmed paper backdrop, title in Michroma.

#### Tooltip

A short label for a control that has no visible text, like an icon button.

-   **Don't** put essential information or anything interactive in a tooltip.
-   **Built on** React Aria `TooltipTrigger`, `Tooltip` and `OverlayArrow`.

```ts
interface TooltipProps extends RACTooltipProps {
	children: ReactNode;
}
```

#### Menu

A list of actions behind a button.

-   **Built on** React Aria `MenuTrigger`, `Menu`, `MenuItem` and `Popover`.

```ts
interface MenuProps<T extends object> extends RACMenuProps<T> {}
interface MenuItemProps extends RACMenuItemProps {}
```

-   Replaces Chalkboard's `DropdownMenu` and its parts.

### Layout

#### Divider

Separates groups of content.

-   **Built on** React Aria `Separator`.

```ts
interface DividerProps extends RACSeparatorProps {
	weight?: 'hairline' | 'rule'; // default 'hairline'
}
```

#### Disclosure

Shows and hides a section.

-   **Built on** React Aria `Disclosure`, `DisclosurePanel` and `DisclosureGroup`
    (`isExpanded`, `defaultExpanded`, `onExpandedChange`).

```ts
interface DisclosureProps extends RACDisclosureProps {
	title: ReactNode;
}
interface DisclosureGroupProps extends RACDisclosureGroupProps {} // accordion behaviour
```

### Drawing

#### DrawingSheet

A full-width drawing area: the drawing grid, an ink border, and optional zone markers along
the edges, with a TitleBlock at the foot.

```ts
interface DrawingSheetProps extends ComponentPropsWithoutRef<'section'> {
	zones?: { columns: number; rows: number }; // A–F along the side, 1–8 along the top
	titleBlock?: TitleBlockProps['fields'];
}
```

---

## Tier 3 · not specified

Build only when a real need comes up: Combobox, Slider, DatePicker, Toast, Popover (on its
own), Drawer, TagGroup, Sparkline, HazardBand, Plate.

## Build order

1. **Setup.** Add `react-aria-components`, `clsx` and `tailwind-merge` to `@fhudson/ui`, plus
   the `cn()` helper, the `State` type and a component section on `/system`. Add behaviour
   tests with Testing Library under `bun test`.
2. **Type and actions:** Heading, Text, Code, CodeBlock, Blockquote, Prose, Link, Button.
3. **Structure:** Panel, SiteHeader, SkipLink, TitleBlock, NodeMark.
4. **Data:** Table, List, Tag, Status, Stat, LineChart. Table pulls EmptyState, Spinner and
   Checkbox forward from Tier 2, since its empty, loading and selection states use them.
5. **Symbols:** Busbar, Breaker, Transformer.
6. **Migrate** the site page by page (Phase 4 in the main plan).
7. **Tier 2** as pages need it.

## Chalkboard to Single Line

| Chalkboard                                                         | Single Line                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `H1`–`H6`                                                          | `Heading`                                             |
| `P`, `Lead`, `Small`                                               | `Text` (`variant`)                                    |
| `Code`, `Pre`, `Blockquote`                                        | `Code`, `CodeBlock`, `Blockquote`                     |
| BlogPost element mapping                                           | `Prose`                                               |
| `Button`                                                           | `Button`                                              |
| `Navbar`                                                           | `SiteHeader`                                          |
| `Preview`, `PreviewHeader`, `PreviewDescription`, `PreviewContent` | `Panel`, `PanelHeader`, `PanelBody`                   |
| `Tag`                                                              | `Tag` (topics) or `Status` (state)                    |
| `Table` (`columns`, `dataSource`)                                  | `Table` parts (React Aria)                            |
| `List`, `ListItem`                                                 | `List`, `ListItem`                                    |
| `LineChart`                                                        | `LineChart`                                           |
| `Message`                                                          | `Callout`                                             |
| `Input`                                                            | `TextField`                                           |
| `DropdownMenu` and parts                                           | `Menu`                                                |
| `Icon`                                                             | Symbols for drawing; a small icon set if needed later |
