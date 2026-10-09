import { forwardRef, type ReactNode } from 'react';
import {
	Label,
	Slider as RACSlider,
	SliderOutput,
	SliderThumb,
	SliderTrack,
	composeRenderProps,
	type SliderProps as RACSliderProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';

export interface SliderProps extends Omit<RACSliderProps<number>, 'children'> {
	/** Every slider has a visible label. */
	label: ReactNode;
	/** Shown after the value, e.g. "MW". */
	unit?: string;
	/** Where the fill starts. Defaults to the minimum; set 0 for a range that runs negative. */
	origin?: number;
}

/** Picks one number from a range by dragging a thumb along a track. */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
	{ label, unit, origin, className, ...props },
	ref
) {
	return (
		<RACSlider
			ref={ref}
			className={composeRenderProps(className, (className) =>
				cn(
					'flex min-w-0 flex-col gap-2 data-disabled:opacity-45',
					className
				)
			)}
			{...props}
		>
			<div className="flex items-baseline justify-between gap-4">
				<Label className="font-data text-label uppercase tracking-widest text-ink-muted">
					{label}
				</Label>
				<SliderOutput className="font-data text-small tabular-nums text-ink">
					{({ state }) => (
						<>
							{state.getThumbValueLabel(0)}
							{unit && (
								<span className="text-ink-muted"> {unit}</span>
							)}
						</>
					)}
				</SliderOutput>
			</div>
			<SliderTrack className="group relative h-6 w-full cursor-pointer data-disabled:cursor-not-allowed">
				{({ state }) => {
					const from = state.getValuePercent(
						origin ?? state.getThumbMinValue(0)
					);
					const to = state.getThumbPercent(0);
					return (
						<>
							{/* The rule, then the fill from the origin to the thumb */}
							<div className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-hairline" />
							<div
								className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-verdigris"
								style={{
									left: `${String(Math.min(from, to) * 100)}%`,
									width: `${String(Math.abs(to - from) * 100)}%`,
								}}
							/>
							{origin !== undefined && (
								<span
									aria-hidden="true"
									className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-muted"
									style={{ left: `${String(from * 100)}%` }}
								/>
							)}
							<SliderThumb
								className={cn(
									'top-1/2 size-4 border-[1.5px] border-ink bg-sheet outline-hidden transition-colors',
									'data-hovered:border-verdigris data-dragging:bg-verdigris data-dragging:border-verdigris',
									'data-focus-visible:outline-solid data-focus-visible:outline-[1.5px] data-focus-visible:outline-offset-2 data-focus-visible:outline-verdigris'
								)}
							/>
						</>
					);
				}}
			</SliderTrack>
		</RACSlider>
	);
});
