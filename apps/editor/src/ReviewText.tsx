import { useRef } from 'react';
import { cn } from '@fhudson/ui';
import { segments } from './review';
import type { Flag, Span } from './rules';

/**
 * The selection as offsets into the text. A click gives an empty span at the clicked point;
 * a selection of only whitespace gives null.
 */
function selectedSpan(container: HTMLElement): Span | null {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return null;
	const range = selection.getRangeAt(0);
	if (!container.contains(range.commonAncestorContainer)) return null;
	const before = document.createRange();
	before.selectNodeContents(container);
	before.setEnd(range.startContainer, range.startOffset);
	const start = before.toString().length;
	if (selection.isCollapsed) return { start, end: start };
	// Ignore whitespace caught at either end
	const text = range.toString();
	const trimmed = text.trim();
	if (!trimmed) return null;
	const lead = text.length - text.trimStart().length;
	return { start: start + lead, end: start + lead + trimmed.length };
}

/**
 * The post's body, read-only, with your marks and, once revealed, the rule's flags. While
 * marking, select text to mark it and click a mark to remove it.
 */
export function ReviewText({
	body,
	marks,
	flags,
	stage,
	onMark,
	onUnmark,
}: {
	body: string;
	marks: Span[];
	flags: Flag[];
	stage: 'marking' | 'compare';
	onMark: (span: Span) => void;
	onUnmark: (at: number) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const revealed = stage === 'compare';

	return (
		<div
			ref={ref}
			onMouseUp={() => {
				if (revealed || !ref.current) return;
				const span = selectedSpan(ref.current);
				if (!span) return;
				if (span.start === span.end) onUnmark(span.start);
				else onMark(span);
				window.getSelection()?.removeAllRanges();
			}}
			className={cn(
				'whitespace-pre-wrap font-body text-body leading-relaxed text-ink',
				!revealed && 'cursor-text selection:bg-amber/40'
			)}
		>
			{segments(body.length, marks, revealed ? flags : []).map(
				(piece) => {
					const text = body.slice(piece.start, piece.end);
					const flagged = piece.flags.length > 0;
					if (!piece.marked && !flagged)
						return <span key={piece.start}>{text}</span>;
					return (
						<mark
							key={piece.start}
							title={
								piece.flags.map((f) => f.note).join('\n') ||
								undefined
							}
							className={cn(
								'text-ink',
								// Marking: your marks in amber. Revealed: green where you and the rule agree,
								// red where only the rule flagged, grey dotted where only you marked
								!revealed && 'bg-amber/30',
								revealed &&
									piece.marked &&
									flagged &&
									'bg-verdigris/30',
								revealed &&
									!piece.marked &&
									'bg-fault/15 underline decoration-fault decoration-wavy underline-offset-4',
								revealed &&
									piece.marked &&
									!flagged &&
									'bg-ink-muted/20 underline decoration-ink-muted decoration-dotted underline-offset-4'
							)}
						>
							{text}
						</mark>
					);
				}
			)}
		</div>
	);
}
