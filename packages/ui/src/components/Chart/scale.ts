/** Rounds a coordinate for SVG output, keeping paths short. */
export const px = (v: number) => String(Math.round(v * 100) / 100);

/** Maps a value from [d0, d1] onto [r0, r1]. */
export function linear(d0: number, d1: number, r0: number, r1: number) {
	const span = d1 - d0 || 1;
	return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** About `count` evenly spaced, human-friendly ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
	if (min === max) {
		const pad = Math.abs(min) || 1;
		min -= pad;
		max += pad;
	}
	const rough = (max - min) / count;
	const power = 10 ** Math.floor(Math.log10(rough));
	const step =
		[1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ??
		10 * power;
	const start = Math.floor(min / step) * step;
	const end = Math.ceil(max / step) * step;
	const ticks: number[] = [];
	for (let t = start; t <= end + step / 2; t += step)
		ticks.push(Math.round(t / step) * step);
	return ticks;
}

/** The finite numbers in a list. */
export const finite = (values: (number | null)[]) =>
	values.filter((v): v is number => v !== null && Number.isFinite(v));

/** Show at most `max` labels, always including the last. */
export const labelStride = (count: number, max: number) =>
	Math.max(1, Math.ceil(count / max));

/** Splits indices into runs of consecutive non-null values, so lines break at gaps. */
export function runs(values: (number | null)[]): number[][] {
	const out: number[][] = [];
	let run: number[] = [];
	values.forEach((v, i) => {
		if (v === null) {
			if (run.length) out.push(run);
			run = [];
		} else run.push(i);
	});
	if (run.length) out.push(run);
	return out;
}
