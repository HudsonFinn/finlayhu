import {
	createContext,
	forwardRef,
	useContext,
	type ComponentPropsWithoutRef,
} from 'react';
import {
	Cell as RACCell,
	Collection,
	Column as RACColumn,
	ColumnResizer as RACColumnResizer,
	Row as RACRow,
	Table as RACTable,
	TableBody as RACTableBody,
	TableHeader as RACTableHeader,
	TableLoadMoreItem as RACTableLoadMoreItem,
	composeRenderProps,
	useTableOptions,
	type CellProps as RACCellProps,
	type ColumnProps as RACColumnProps,
	type ColumnResizerProps,
	type RowProps as RACRowProps,
	type TableBodyProps as RACTableBodyProps,
	type TableHeaderProps as RACTableHeaderProps,
	type TableLoadMoreItemProps,
	type TableProps as RACTableProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';
import { Checkbox } from '../Checkbox';
import { Spinner } from '../Spinner';

// Re-exported so apps can use React Aria's table features without importing it directly
export {
	ResizableTableContainer,
	TableLayout,
	Virtualizer,
} from 'react-aria-components';

type Density = 'compact' | 'comfortable';
const DensityContext = createContext<Density>('comfortable');

export interface TableProps extends RACTableProps {
	/** 'compact' for dense data. */
	density?: Density;
}

/**
 * Tabular data, built on React Aria's Table: keyboard navigation between cells, sorting,
 * selection and row actions. Every table needs an aria-label or aria-labelledby.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
	{ density = 'comfortable', className, ...props },
	ref
) {
	return (
		<DensityContext.Provider value={density}>
			<RACTable
				ref={ref}
				className={composeRenderProps(className, (className) =>
					cn(
						'w-full border-collapse text-left text-ui text-ink',
						className
					)
				)}
				{...props}
			/>
		</DensityContext.Provider>
	);
});

/** Scrolls a wide table sideways, and a tall one inside a fixed height with a sticky header. */
export const TableContainer = forwardRef<
	HTMLDivElement,
	ComponentPropsWithoutRef<'div'>
>(function TableContainer({ className, ...props }, ref) {
	return (
		<div
			ref={ref}
			className={cn(
				'relative w-full overflow-auto border-y border-hairline',
				className
			)}
			{...props}
		/>
	);
});

export function TableHeader<T extends object>({
	columns,
	children,
	className,
	...props
}: RACTableHeaderProps<T>) {
	const { selectionBehavior, selectionMode } = useTableOptions();
	return (
		<RACTableHeader
			className={composeRenderProps(className, (className) =>
				cn(
					'sticky top-0 z-10 bg-paper shadow-[inset_0_-1.5px_0_var(--sl-ink)]',
					className
				)
			)}
			{...props}
		>
			{selectionBehavior === 'toggle' && (
				<RACColumn width={44} minWidth={44} className="px-3 py-2.5">
					{selectionMode === 'multiple' && (
						<Checkbox slot="selection" />
					)}
				</RACColumn>
			)}
			<Collection items={columns}>{children}</Collection>
		</RACTableHeader>
	);
}

export interface ColumnProps extends RACColumnProps {
	/** 'end' for numbers. */
	align?: 'start' | 'end';
}

export function Column({
	align = 'start',
	className,
	children,
	...props
}: ColumnProps) {
	return (
		<RACColumn
			className={composeRenderProps(className, (className) =>
				cn(
					'group relative px-3 py-2.5 font-data text-label font-normal uppercase tracking-widest whitespace-nowrap text-ink-muted outline-none',
					'data-focus-visible:outline-[1.5px] data-focus-visible:-outline-offset-2 data-focus-visible:outline-verdigris',
					'data-allows-sorting:cursor-pointer data-hovered:text-ink',
					align === 'end' && 'text-right',
					className
				)
			)}
			{...props}
		>
			{composeRenderProps(
				children,
				(children, { allowsSorting, sortDirection }) => (
					<span
						className={cn(
							'inline-flex items-center gap-1.5',
							align === 'end' && 'flex-row-reverse'
						)}
					>
						{children}
						{allowsSorting && (
							<span
								aria-hidden="true"
								className={cn(
									'text-[9px]',
									sortDirection
										? 'text-verdigris'
										: 'text-hairline group-data-hovered:text-ink-muted'
								)}
							>
								{sortDirection === 'descending' ? '▼' : '▲'}
							</span>
						)}
					</span>
				)
			)}
		</RACColumn>
	);
}

/** Drag handle for resizing a column. Use inside ResizableTableContainer. */
export function ColumnResizer({ className, ...props }: ColumnResizerProps) {
	return (
		<RACColumnResizer
			className={composeRenderProps(className, (className) =>
				cn(
					'absolute top-1 right-0 bottom-1 w-1.5 cursor-col-resize border-r-[1.5px] border-hairline outline-none',
					'data-hovered:border-ink data-resizing:border-verdigris data-focus-visible:border-verdigris',
					className
				)
			)}
			{...props}
		/>
	);
}

export function TableBody<T extends object>({
	className,
	...props
}: RACTableBodyProps<T>) {
	return (
		<RACTableBody
			className={composeRenderProps(className, (className) =>
				cn('data-empty:[&>tr>td]:p-4', className)
			)}
			{...props}
		/>
	);
}

export function Row<T extends object>({
	id,
	columns,
	children,
	className,
	...props
}: RACRowProps<T>) {
	const { selectionBehavior } = useTableOptions();
	return (
		<RACRow
			id={id}
			className={composeRenderProps(className, (className) =>
				cn(
					'border-b border-hairline outline-none transition-colors',
					'data-focus-visible:outline-[1.5px] data-focus-visible:-outline-offset-2 data-focus-visible:outline-verdigris',
					'data-href:cursor-pointer data-hovered:bg-sheet',
					// A verdigris rule on the leading edge of a selected row. Drawn with a pseudo-element:
					// Chrome doesn't paint box-shadow on cells in a border-collapse table.
					'data-selected:bg-sheet [&>td:first-child]:relative [&>td:first-child]:before:absolute [&>td:first-child]:before:inset-y-0 [&>td:first-child]:before:left-0 [&>td:first-child]:before:w-[3px] data-selected:[&>td:first-child]:before:bg-verdigris',
					className
				)
			)}
			{...props}
		>
			{selectionBehavior === 'toggle' && (
				<Cell>
					<Checkbox slot="selection" />
				</Cell>
			)}
			<Collection items={columns}>{children}</Collection>
		</RACRow>
	);
}

export interface CellProps extends RACCellProps {
	align?: 'start' | 'end';
	/** Mono, tabular figures, end-aligned. */
	numeric?: boolean;
}

export function Cell({
	align,
	numeric = false,
	className,
	...props
}: CellProps) {
	const density = useContext(DensityContext);
	return (
		<RACCell
			className={composeRenderProps(className, (className) =>
				cn(
					'px-3 align-top outline-none',
					density === 'compact' ? 'py-1.5 text-small' : 'py-2.5',
					'data-focus-visible:outline-[1.5px] data-focus-visible:-outline-offset-2 data-focus-visible:outline-verdigris',
					(numeric || align === 'end') && 'text-right',
					numeric && 'font-data tabular-nums',
					className
				)
			)}
			{...props}
		/>
	);
}

/** Loads the next page when scrolled into view, showing a Spinner while it loads. */
export function TableLoadMoreItem({
	className,
	...props
}: TableLoadMoreItemProps) {
	return (
		<RACTableLoadMoreItem
			className={cn('py-3 text-center', className)}
			{...props}
		>
			<Spinner label="Loading more rows" />
		</RACTableLoadMoreItem>
	);
}
