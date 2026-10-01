export interface ChartSeries {
	id: string;
	label: string;
	/** One value per category. null is a missing reading. */
	values: (number | null)[];
}

export interface ChartPoint {
	label: string;
	value: number | null;
}

/** Accepts the single-series shorthand (`data`) or many series sharing `categories`. */
export function normaliseSeries({
	data,
	categories,
	series,
	label,
}: {
	data?: ChartPoint[];
	categories?: string[];
	series?: ChartSeries[];
	label: string;
}): { categories: string[]; series: ChartSeries[] } {
	if (data) {
		return {
			categories: data.map((d) => d.label),
			series: [{ id: 'value', label, values: data.map((d) => d.value) }],
		};
	}
	return { categories: categories ?? [], series: series ?? [] };
}

export const defaultFormat = (v: number) =>
	Number.isInteger(v)
		? v.toLocaleString('en-GB')
		: v.toLocaleString('en-GB', { maximumFractionDigits: 2 });
