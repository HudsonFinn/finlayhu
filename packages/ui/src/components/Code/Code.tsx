import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Highlight, Prism, type PrismTheme } from 'prism-react-renderer';
import { cn } from '../../lib/cn';

export type CodeProps = ComponentPropsWithoutRef<'code'>;

/** Inline code. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
	{ className, ...props },
	ref
) {
	return (
		<code
			ref={ref}
			className={cn(
				'border border-hairline bg-sheet px-1 py-px font-data text-[0.88em]',
				className
			)}
			{...props}
		/>
	);
});

/**
 * Syntax colours from Single Line tokens only, so code follows light and dark mode and every
 * colour is already covered by the contrast tests on sheet.
 */
const singleLineTheme: PrismTheme = {
	plain: { color: 'var(--sl-ink)', backgroundColor: 'transparent' },
	styles: [
		{
			types: ['comment', 'prolog', 'doctype', 'cdata'],
			style: { color: 'var(--sl-ink-muted)', fontStyle: 'italic' },
		},
		{
			types: [
				'keyword',
				'builtin',
				'tag',
				'selector',
				'atrule',
				'important',
			],
			style: { color: 'var(--sl-verdigris)' },
		},
		{
			types: ['string', 'char', 'attr-value', 'regex', 'url', 'inserted'],
			style: { color: 'var(--sl-amber)' },
		},
		{
			types: ['number', 'boolean', 'constant', 'symbol', 'deleted'],
			style: { color: 'var(--sl-fault)' },
		},
		{ types: ['function', 'class-name'], style: { fontWeight: '600' } },
		{
			types: ['punctuation', 'operator'],
			style: { color: 'var(--sl-ink-muted)' },
		},
	],
};

/** Common names and file extensions mapped to Prism's grammar names. */
const languageAliases: Record<string, string> = {
	ts: 'typescript',
	js: 'javascript',
	py: 'python',
	yml: 'yaml',
	md: 'markdown',
	html: 'markup',
	xml: 'markup',
	svg: 'markup',
	rs: 'rust',
};

function prismLanguage(language: string | undefined) {
	if (!language) return 'plain';
	const key = language.toLowerCase();
	const name = languageAliases[key] ?? key;
	return name in Prism.languages ? name : 'plain';
}

export interface CodeBlockProps
	extends Omit<ComponentPropsWithoutRef<'pre'>, 'children'> {
	/** The code, as a string. */
	children: string;
	/**
	 * Shown as a label, and used for highlighting when Prism knows it: TypeScript, TSX, JSX,
	 * JavaScript, JSON, CSS, YAML, SQL, Python, Rust, Go, Markdown, HTML/XML. Others render plain.
	 */
	language?: string;
}

/** A block of code, syntax highlighted. Scrolls sideways inside its own box. */
export const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
	function CodeBlock({ language, className, children, ...props }, ref) {
		return (
			<div className="min-w-0 border border-hairline bg-sheet">
				{language && (
					<div className="border-b border-hairline px-4 py-2 font-data text-label uppercase tracking-widest text-ink-muted">
						{language}
					</div>
				)}
				<Highlight
					code={children.replace(/\n$/, '')}
					language={prismLanguage(language)}
					theme={singleLineTheme}
				>
					{({ tokens, getLineProps, getTokenProps }) => (
						<pre
							ref={ref}
							className={cn(
								'overflow-x-auto px-4 py-3 font-data text-small leading-relaxed',
								className
							)}
							{...props}
						>
							<code>
								{tokens.map((line, i) => (
									<div key={i} {...getLineProps({ line })}>
										{line.map((token, key) => (
											<span
												key={key}
												{...getTokenProps({ token })}
											/>
										))}
									</div>
								))}
							</code>
						</pre>
					)}
				</Highlight>
			</div>
		);
	}
);
