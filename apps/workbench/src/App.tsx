import {
	lazy,
	Suspense,
	useEffect,
	useRef,
	useState,
	type ComponentType,
	type LazyExoticComponent,
} from 'react';
import { ClockContext, figureBySlug, figures } from '@fhudson/figures';
import { NodeMark } from '@fhudson/ui';

/*
 * State lives in the URL, so any view can be bookmarked or opened by the exporter:
 *   ?f=bn-00-f1&theme=dark&width=728       the workbench
 *   ?f=bn-00-f1&theme=dark&frame           the figure alone, live: the workbench's stage iframe
 *   ?f=bn-00-f1&theme=dark&export&t=1200   the figure alone at one exact time, for export
 * The bare views fill the window, so the iframe (or the exporter's viewport) sets the width and
 * media queries see a real phone.
 */

const WIDTHS = [
	{ label: 'Substack', px: 728 },
	{ label: 'Narrow', px: 520 },
	{ label: 'Phone', px: 343 },
];
const THEMES = ['dark', 'light'] as const;
type Theme = (typeof THEMES)[number];

const components = new Map<string, LazyExoticComponent<ComponentType>>(
	figures.map((f) => [f.slug, lazy(f.load)])
);

function readParams() {
	const params = new URLSearchParams(window.location.search);
	const theme: Theme = params.get('theme') === 'light' ? 'light' : 'dark';
	const width = Number(params.get('width')) || WIDTHS[0].px;
	const t = params.get('t');
	return {
		slug: params.get('f') ?? figures.at(0)?.slug ?? '',
		theme,
		width,
		mode: params.has('export')
			? ('export' as const)
			: params.has('frame')
				? ('frame' as const)
				: ('bench' as const),
		time: t === null ? undefined : Number(t),
	};
}

function Segmented<T extends string | number>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="font-data text-label uppercase tracking-widest text-ink-muted">
				{label}
			</span>
			<div
				role="group"
				aria-label={label}
				className="inline-flex border border-ink"
			>
				{options.map((option) => (
					<button
						key={option.label}
						type="button"
						aria-pressed={value === option.value}
						onClick={() => {
							onChange(option.value);
						}}
						className={`cursor-pointer px-3 py-2 font-data text-label uppercase tracking-wider ${
							value === option.value
								? 'bg-ink text-paper'
								: 'text-ink hover:bg-sheet'
						}`}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}

/** The figure alone, filling the window. */
function Bare({ slug }: { slug: string }) {
	const Figure = components.get(slug);
	if (!Figure)
		return (
			<p className="font-data text-small text-fault">No figure {slug}</p>
		);
	return (
		<Suspense fallback={null}>
			<Figure />
		</Suspense>
	);
}

/** The bare view in an iframe at the chosen width, grown to fit the figure. */
function Stage({
	slug,
	theme,
	width,
}: {
	slug: string;
	theme: Theme;
	width: number;
}) {
	const ref = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(480);

	useEffect(() => {
		const frame = ref.current;
		if (!frame) return;
		let observer: ResizeObserver | undefined;
		const watch = () => {
			const root = frame.contentDocument?.getElementById('root');
			if (!root) return;
			observer?.disconnect();
			observer = new ResizeObserver(() => {
				setHeight(root.offsetHeight);
			});
			observer.observe(root);
		};
		frame.addEventListener('load', watch);
		return () => {
			frame.removeEventListener('load', watch);
			observer?.disconnect();
		};
	}, []);

	return (
		<iframe
			ref={ref}
			title="Figure"
			src={`?f=${slug}&theme=${theme}&frame`}
			width={width}
			height={height}
			className="block shrink-0 border-0"
		/>
	);
}

export default function App() {
	const [state, setState] = useState(readParams);
	const figure = figureBySlug(state.slug);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', state.theme);
	}, [state.theme]);

	useEffect(() => {
		if (state.mode !== 'bench') return;
		const params = new URLSearchParams({
			f: state.slug,
			theme: state.theme,
			width: String(state.width),
		});
		window.history.replaceState(null, '', `?${params.toString()}`);
	}, [state]);

	if (state.mode === 'export')
		return (
			<ClockContext.Provider value={{ fixedTime: state.time ?? 0 }}>
				<Bare slug={state.slug} />
			</ClockContext.Provider>
		);
	if (state.mode === 'frame') return <Bare slug={state.slug} />;

	const posts = [...new Set(figures.map((f) => f.number.slice(3, 5)))];

	return (
		<div className="grid min-h-screen md:grid-cols-[18rem_minmax(0,1fr)]">
			<nav
				aria-label="Figures"
				className="flex flex-col gap-6 border-hairline p-6 md:border-r"
			>
				<div className="flex items-center gap-3">
					<NodeMark />
					<span className="font-data text-label uppercase tracking-widest text-ink-muted">
						Figures workbench
					</span>
				</div>
				{posts.map((post) => (
					<div key={post} className="flex flex-col gap-1">
						<p className="font-data text-label uppercase tracking-widest text-ink-muted">
							{post === '00' ? 'Identity sheet' : `Post ${post}`}
						</p>
						{figures
							.filter((f) => f.number.slice(3, 5) === post)
							.map((f) => (
								<button
									key={f.slug}
									type="button"
									aria-current={
										f.slug === state.slug
											? 'page'
											: undefined
									}
									onClick={() => {
										setState((s) => ({
											...s,
											slug: f.slug,
										}));
									}}
									className={`flex cursor-pointer flex-col items-start gap-0.5 border-l-[3px] px-3 py-2 text-left ${
										f.slug === state.slug
											? 'border-verdigris bg-sheet'
											: 'border-transparent hover:bg-sheet'
									}`}
								>
									<span className="font-data text-small text-ink">
										{f.number}
									</span>
									<span className="text-small text-ink-muted">
										{f.title}
									</span>
								</button>
							))}
					</div>
				))}
			</nav>

			<main className="flex min-w-0 flex-col gap-6 p-6">
				<div className="flex flex-wrap items-center gap-6">
					<Segmented
						label="Theme"
						options={THEMES.map((t) => ({ label: t, value: t }))}
						value={state.theme}
						onChange={(theme) => {
							setState((s) => ({ ...s, theme }));
						}}
					/>
					<Segmented
						label="Width"
						options={WIDTHS.map((w) => ({
							label: `${w.label} ${String(w.px)}`,
							value: w.px,
						}))}
						value={state.width}
						onChange={(width) => {
							setState((s) => ({ ...s, width }));
						}}
					/>
				</div>

				<div className="overflow-x-auto">
					<Stage
						slug={state.slug}
						theme={state.theme}
						width={state.width}
					/>
				</div>

				{figure ? (
					<dl className="grid max-w-[728px] gap-x-6 gap-y-2 border-t border-hairline pt-4 text-small sm:grid-cols-[8rem_minmax(0,1fr)]">
						<dt className="font-data text-label uppercase tracking-widest text-ink-muted">
							Alt text
						</dt>
						<dd className="text-ink">{figure.alt}</dd>
						<dt className="font-data text-label uppercase tracking-widest text-ink-muted">
							Loop
						</dt>
						<dd className="font-data text-ink">
							{figure.duration
								? `${(figure.duration / 1000).toFixed(1)} s`
								: 'none (still or continuous)'}
						</dd>
						<dt className="font-data text-label uppercase tracking-widest text-ink-muted">
							Export view
						</dt>
						<dd className="font-data text-ink">
							<a
								className="underline decoration-verdigris underline-offset-4"
								href={`?f=${figure.slug}&theme=${state.theme}&export&t=0`}
							>
								?f={figure.slug}&amp;export&amp;t=0
							</a>
						</dd>
					</dl>
				) : null}
			</main>
		</div>
	);
}
