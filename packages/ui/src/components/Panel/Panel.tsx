import {
	createContext,
	forwardRef,
	useContext,
	useId,
	useLayoutEffect,
	useState,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { Link } from 'react-aria-components';
import { cn } from '../../lib/cn';

interface PanelContextValue {
	labelId: string;
	setLabelled: (labelled: boolean) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export interface PanelProps extends ComponentPropsWithoutRef<'section'> {
	as?: 'section' | 'div' | 'article';
}

/** A labelled area that groups related content. Don't nest panels. */
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
	{ as: Tag = 'section', className, ...props },
	ref
) {
	const labelId = useId();
	const [labelled, setLabelled] = useState(false);
	return (
		<PanelContext.Provider value={{ labelId, setLabelled }}>
			<Tag
				ref={ref as never}
				aria-labelledby={
					labelled && Tag !== 'div' ? labelId : undefined
				}
				className={cn(
					'relative flex min-w-0 flex-col border border-hairline bg-sheet transition-colors',
					// A panel whose header links somewhere responds as one target
					'has-[[data-panel-link]:hover]:border-ink',
					className
				)}
				{...props}
			/>
		</PanelContext.Provider>
	);
});

export interface PanelHeaderProps
	extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
	/** Names the panel. Set in mono capitals after the node mark. */
	label: ReactNode;
	/** Right-aligned detail: a date, a zone, a count. */
	meta?: ReactNode;
	/** Makes the whole panel a link to this address. */
	href?: string;
}

/** The panel's label strip. It gives the panel its accessible name. */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(
	function PanelHeader({ label, meta, href, className, ...props }, ref) {
		const context = useContext(PanelContext);
		const setLabelled = context?.setLabelled;

		useLayoutEffect(() => {
			setLabelled?.(true);
			return () => setLabelled?.(false);
		}, [setLabelled]);

		const labelContent = (
			<>
				<span
					aria-hidden="true"
					className="inline-flex shrink-0 items-center"
				>
					<span className="h-[1.5px] w-3 bg-ink" />
					<span className="size-2 rounded-full border-[1.5px] border-verdigris bg-sheet" />
				</span>
				<span>{label}</span>
			</>
		);

		return (
			<div
				ref={ref}
				className={cn(
					'flex items-center justify-between gap-4 border-b border-hairline px-4 py-2.5 font-data text-label uppercase tracking-widest',
					className
				)}
				{...props}
			>
				{href ? (
					<Link
						href={href}
						id={context?.labelId}
						data-panel-link=""
						className="inline-flex items-center gap-2 text-ink outline-none after:absolute after:inset-0 data-focus-visible:after:outline-[1.5px] data-focus-visible:after:outline-offset-2 data-focus-visible:after:outline-verdigris data-hovered:text-verdigris"
					>
						{labelContent}
					</Link>
				) : (
					<span
						id={context?.labelId}
						className="inline-flex items-center gap-2 text-ink"
					>
						{labelContent}
					</span>
				)}
				{meta && (
					<span className="shrink-0 text-ink-muted tabular-nums">
						{meta}
					</span>
				)}
			</div>
		);
	}
);

export type PanelBodyProps = ComponentPropsWithoutRef<'div'>;

/** The panel's content area. */
export const PanelBody = forwardRef<HTMLDivElement, PanelBodyProps>(
	function PanelBody({ className, ...props }, ref) {
		return (
			<div
				ref={ref}
				className={cn('flex flex-col gap-3 p-4', className)}
				{...props}
			/>
		);
	}
);
