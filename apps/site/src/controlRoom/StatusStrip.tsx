import { useEffect, useState } from 'react';
import { useGrid, type FeedState } from '@fhudson/grid';
import { cn, stateFill, stateLabels } from '@fhudson/ui';

function useUtcClock() {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date());
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, []);
	return now.toISOString().slice(11, 19);
}

function Reading({
	label,
	value,
	state,
	className,
}: {
	label: string;
	value: string;
	state: FeedState;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'flex items-center gap-2 whitespace-nowrap',
				className
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					'size-2 shrink-0 rounded-full',
					stateFill[state],
					state === 'fault' &&
						'animate-pulse motion-reduce:animate-none'
				)}
			/>
			<span className="text-ink-muted">{label}</span>
			<span className="tabular-nums text-ink">{value}</span>
			<span className="sr-only">
				, feed {stateLabels[state].toLowerCase()}
			</span>
		</span>
	);
}

/** Live GB grid readings and a UTC clock, across the top of every page. */
export function StatusStrip() {
	const { frequency, demand, carbon } = useGrid();
	const clock = useUtcClock();
	const f = frequency.data?.at(-1)?.value;
	const d = demand.data?.at(-1)?.value;
	const c = carbon.data?.at(-1);

	return (
		<div className="border-b border-hairline bg-sheet">
			<div
				role="region"
				aria-label="Live grid readings"
				className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 font-data text-label uppercase tracking-wider sm:px-8"
			>
				<Reading
					label="Freq"
					value={f === undefined ? '–' : `${f.toFixed(3)} Hz`}
					state={frequency.state}
				/>
				<Reading
					label="Demand"
					value={
						d === undefined ? '–' : `${(d / 1000).toFixed(1)} GW`
					}
					state={demand.state}
					className="max-sm:hidden"
				/>
				<Reading
					label="Carbon"
					value={
						c === undefined
							? '–'
							: `${String(c.value)} g/kWh ${c.index}`
					}
					state={carbon.state}
					className="max-sm:hidden"
				/>
				<span
					className="ml-auto tabular-nums text-ink-muted"
					aria-label={`Time ${clock} UTC`}
				>
					{clock} UTC
				</span>
			</div>
		</div>
	);
}
