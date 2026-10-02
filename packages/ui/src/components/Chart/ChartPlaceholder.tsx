import { Spinner } from '../Spinner';

/**
 * Stands in for a plot while its data loads, at the plot's final height, so the page doesn't
 * move when the data arrives.
 */
export function ChartPlaceholder({
	height,
	label,
}: {
	height: number;
	label: string;
}) {
	return (
		<div
			aria-busy="true"
			className="flex items-center justify-center gap-3 border border-hairline"
			style={{ height }}
		>
			<Spinner label={`Loading ${label}`} />
			<span
				className="font-data text-label uppercase tracking-widest text-ink-muted"
				aria-hidden="true"
			>
				Loading
			</span>
		</div>
	);
}
