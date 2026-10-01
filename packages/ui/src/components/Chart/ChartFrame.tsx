import {
	useId,
	useState,
	type KeyboardEvent,
	type ReactNode,
	type Ref,
} from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { SeriesKey, type MarkerShape } from './Marker';

export interface LegendItem {
	label: string;
	color: string;
	kind?: 'line' | MarkerShape;
}

export interface ChartTableData {
	columns: string[];
	rows: { key: string; cells: ReactNode[] }[];
}

/**
 * Everything around a plot: the legend (for two or more series), a live region for
 * keyboard reading, and the data table, hidden until asked for but always available to
 * screen readers. Every value in a chart is reachable here without hovering.
 */
export function ChartFrame({
	label,
	legend,
	table,
	liveText,
	className,
	children,
}: {
	label: string;
	legend?: LegendItem[];
	table: ChartTableData;
	liveText?: string;
	className?: string;
	children: ReactNode;
}) {
	const [showTable, setShowTable] = useState(false);
	const tableId = useId();

	return (
		<figure className={cn('flex min-w-0 flex-col gap-3', className)}>
			{legend && legend.length > 1 && (
				<ul
					className="flex flex-wrap gap-x-5 gap-y-1.5"
					aria-label="Legend"
				>
					{legend.map((item) => (
						<li
							key={item.label}
							className="flex items-center gap-2 text-small text-ink"
						>
							<SeriesKey
								color={item.color}
								kind={item.kind ?? 'line'}
							/>
							{item.label}
						</li>
					))}
				</ul>
			)}
			{children}
			<div className="sr-only" aria-live="polite">
				{liveText}
			</div>
			<figcaption className="sr-only">{label}</figcaption>
			<div>
				<Button
					variant="quiet"
					size="sm"
					aria-expanded={showTable}
					aria-controls={tableId}
					onPress={() => {
						setShowTable((v) => !v);
					}}
					className="-ml-3"
				>
					{showTable ? 'Hide table' : 'Show table'}
				</Button>
			</div>
			<div
				id={tableId}
				className={showTable ? 'overflow-x-auto' : 'sr-only'}
			>
				<table className="w-full border-collapse text-left text-small">
					<caption className="sr-only">{label}</caption>
					<thead>
						<tr className="border-b-[1.5px] border-ink">
							{table.columns.map((column, i) => (
								<th
									key={column}
									scope="col"
									className={cn(
										'px-3 py-2 font-data text-label font-normal uppercase tracking-widest text-ink-muted',
										i > 0 && 'text-right'
									)}
								>
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{table.rows.map((row) => (
							<tr
								key={row.key}
								className="border-b border-hairline"
							>
								{row.cells.map((cell, i) =>
									i === 0 ? (
										<th
											key={i}
											scope="row"
											className="px-3 py-1.5 font-normal"
										>
											{cell}
										</th>
									) : (
										<td
											key={i}
											className="px-3 py-1.5 text-right font-data tabular-nums"
										>
											{cell}
										</td>
									)
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</figure>
	);
}

/** The focusable plot area. Arrow keys read values; its name says so. */
export function PlotArea({
	label,
	focusProps,
	children,
	onPointerLeave,
	plotRef,
}: {
	label: string;
	focusProps: {
		tabIndex: number;
		onKeyDown: (e: KeyboardEvent) => void;
		onBlur: () => void;
	};
	children: ReactNode;
	onPointerLeave?: () => void;
	plotRef?: Ref<HTMLDivElement>;
}) {
	return (
		<div
			ref={plotRef}
			role="group"
			aria-label={`${label}. Use the arrow keys to read values.`}
			className="relative min-w-0 outline-none focus-visible:outline-[1.5px] focus-visible:outline-offset-4 focus-visible:outline-verdigris"
			onPointerLeave={onPointerLeave}
			{...focusProps}
		>
			{children}
		</div>
	);
}
