import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState, NodeMark, TextArea } from '@fhudson/ui';
import {
	createPost,
	finishReview,
	listPosts,
	listReviews,
	readPost,
	savePost,
	saveReview,
	type PostSummary,
	type ReviewRecord,
} from './api';
import { Habits } from './Habits';
import { PostList } from './PostList';
import { Principles } from './Principles';
import {
	addMark,
	compare,
	removeMarkAt,
	splitFrontmatter,
	wordCount,
} from './review';
import { ReviewPanel } from './ReviewPanel';
import { ReviewText } from './ReviewText';
import { ruleById, type Flag } from './rules';
import {
	loadSession,
	nextPass,
	resume,
	startSession,
	storeSession,
	type PassResult,
	type Session,
} from './session';

/** Saves this long after the last keystroke. */
const SAVE_DELAY = 700;

const flagId = (flag: Flag) => `flag-${String(flag.start)}`;

export default function App() {
	const [posts, setPosts] = useState<PostSummary[]>([]);
	const [reviews, setReviews] = useState<ReviewRecord[]>([]);
	const [file, setFile] = useState<string | null>(() =>
		new URLSearchParams(window.location.search).get('post')
	);
	const [text, setText] = useState<string | null>(null);
	/** What's on disk, as far as we know. */
	const [saved, setSaved] = useState<string | null>(null);
	const [error, setError] = useState<string>();
	const [session, setSession] = useState<Session | null>(null);
	const editor = useRef<HTMLDivElement>(null);

	const { offset, body } = splitFrontmatter(text ?? '');
	const rule = session ? ruleById(session.queue[session.index]) : undefined;
	const stage = session?.stage;

	const fail = (e: unknown) => {
		setError(e instanceof Error ? e.message : String(e));
	};

	/** Changes the review, and keeps it so it resumes after a reload or a switch of post. */
	const update = (next: Session | null) => {
		setSession(next);
		if (file) storeSession(file, next);
	};

	const refreshPosts = useCallback(() => listPosts().then(setPosts), []);

	useEffect(() => {
		refreshPosts().catch(fail);
		listReviews().then(setReviews).catch(fail);
	}, [refreshPosts]);

	// Open a post: load it, put it in the address bar, and pick up its review where it was left
	useEffect(() => {
		setText(null);
		setSaved(null);
		setSession(null);
		if (!file) return;
		window.history.replaceState(
			null,
			'',
			`?post=${encodeURIComponent(file)}`
		);
		readPost(file)
			.then((loaded) => {
				setText(loaded);
				setSaved(loaded);
				const kept = loadSession(file);
				setSession(kept && resume(kept, splitFrontmatter(loaded).body));
			})
			.catch(fail);
	}, [file]);

	// Autosave
	useEffect(() => {
		if (!file || text === null || text === saved) return;
		const timer = setTimeout(() => {
			savePost(file, text)
				.then(() => {
					setSaved(text);
				})
				.catch(fail);
		}, SAVE_DELAY);
		return () => {
			clearTimeout(timer);
		};
	}, [file, text, saved]);

	// Coming back to the window, pick up edits made elsewhere (by Claude, say), unless ours are
	// unsaved or you're mid-marking, where the text has to hold still
	useEffect(() => {
		const onFocus = () => {
			if (!file || text !== saved) return;
			if (stage === 'marking' || stage === 'compare') return;
			readPost(file)
				.then((loaded) => {
					if (loaded !== saved) {
						setText(loaded);
						setSaved(loaded);
					}
				})
				.catch(fail);
		};
		window.addEventListener('focus', onFocus);
		return () => {
			window.removeEventListener('focus', onFocus);
		};
	}, [file, text, saved, stage]);

	/** The current rule's flags on the text as it is now. They clear as you fix them. */
	const flags = useMemo(() => rule?.check?.(body) ?? [], [rule, body]);

	const comparison =
		session && stage === 'compare' && rule?.check
			? compare(session.marks, flags)
			: null;

	const reveal = () => {
		if (!session || !file || !rule) return;
		if (!rule.check) {
			update({ ...session, stage: 'compare' });
			return;
		}
		const { both, ruleOnly, youOnly } = compare(session.marks, flags);
		const result: PassResult = {
			rule: rule.id,
			at: new Date().toISOString(),
			both: both.length,
			ruleOnly: ruleOnly.length,
			youOnly: youOnly.length,
		};
		update({
			...session,
			stage: 'compare',
			// Marking again replaces the earlier result for this pass
			results: [
				...session.results.filter((r) => r.rule !== rule.id),
				result,
			],
		});
		const record: ReviewRecord = { file, ...result };
		saveReview(record)
			.then(() => {
				setReviews((list) => [...list, record]);
			})
			.catch(fail);
	};

	const next = () => {
		if (!session || !file) return;
		const result = session.results.find((r) => r.rule === rule?.id);
		let results = session.results;
		if (result && rule?.check) {
			const left = flags.length;
			results = results.map((r) => (r === result ? { ...r, left } : r));
			finishReview(file, result.at, left)
				.then(() => {
					setReviews((list) =>
						list.map((r) =>
							r.file === file && r.at === result.at
								? { ...r, left }
								: r
						)
					);
				})
				.catch(fail);
		}
		update(nextPass({ ...session, results }));
	};

	const jump = (flag: Flag) => {
		document
			.querySelector(`[data-highlight="${flagId(flag)}"]`)
			?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		const box = editor.current?.querySelector('textarea');
		if (!box) return;
		box.focus({ preventScroll: true });
		box.setSelectionRange(offset + flag.start, offset + flag.end);
	};

	const status = text === null ? '' : text === saved ? 'Saved' : 'Saving…';
	const reading = session && (stage === 'marking' || stage === 'compare');
	const fixing = stage === 'fixing' && rule?.check;

	return (
		<div className="grid h-dvh grid-rows-[auto_auto_minmax(0,1fr)] bg-paper text-ink">
			<header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-hairline px-4 py-3">
				<span className="flex items-center gap-2 font-display text-label uppercase tracking-widest">
					<NodeMark className="h-4 w-auto" /> Editor
				</span>
				{error && (
					<span
						role="alert"
						className="font-data text-small text-fault"
					>
						{error}
					</span>
				)}
				{text !== null && (
					<span className="ml-auto flex gap-4 font-data text-label uppercase tracking-widest text-ink-muted">
						<span>{wordCount(text)} words</span>
						<span aria-live="polite">{status}</span>
					</span>
				)}
			</header>

			<Principles />

			<div className="grid min-h-0 grid-cols-[16rem_minmax(0,1fr)_24rem]">
				<PostList
					posts={posts}
					current={file}
					onOpen={setFile}
					onCreate={async (title) => {
						const created = await createPost(title);
						await refreshPosts();
						setFile(created);
					}}
				/>

				<main className="min-h-0 overflow-y-auto">
					{text === null ? (
						<div className="p-8">
							<EmptyState
								title={file ? 'Opening…' : 'Pick a post'}
								description="Choose a post on the left, or start a new draft. Drafts live in the site’s posts folder but stay off the site until they’re added to data/posts.ts."
							/>
						</div>
					) : reading ? (
						<article className="mx-auto max-w-2xl p-8">
							<ReviewText
								body={body}
								marks={session.marks}
								flags={flags}
								stage={stage}
								onMark={(span) => {
									update({
										...session,
										marks: addMark(session.marks, span),
									});
								}}
								onUnmark={(at) => {
									update({
										...session,
										marks: removeMarkAt(session.marks, at),
									});
								}}
							/>
						</article>
					) : (
						<div ref={editor} className="mx-auto max-w-3xl p-6">
							<TextArea
								label={
									fixing
										? `Draft · fixing ${rule.title.toLowerCase()}`
										: 'Draft'
								}
								value={text}
								onChange={setText}
								textAreaClassName="min-h-[75vh] font-data text-small leading-relaxed"
								highlights={
									fixing
										? flags.map((f) => ({
												start: offset + f.start,
												end: offset + f.end,
												id: flagId(f),
												className:
													'bg-fault/20 underline decoration-fault decoration-wavy underline-offset-4',
											}))
										: []
								}
							/>
						</div>
					)}
				</main>

				<aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-hairline p-4">
					{file && text !== null && (
						<ReviewPanel
							session={session}
							body={
								stage === 'fixing'
									? body
									: (session?.markedBody ?? body)
							}
							comparison={comparison}
							remaining={flags}
							file={file}
							onRun={(queue) => {
								update(startSession(queue));
							}}
							onMark={() => {
								if (session)
									update({
										...session,
										stage: 'marking',
										marks: [],
										markedBody: body,
									});
							}}
							onReveal={reveal}
							onFix={() => {
								if (session)
									update({ ...session, stage: 'fixing' });
							}}
							onRemark={() => {
								if (session)
									update({
										...session,
										stage: 'marking',
										marks: [],
										markedBody: body,
									});
							}}
							onNext={next}
							onStop={() => {
								update(null);
							}}
							onJump={jump}
						/>
					)}
					<Habits reviews={reviews} />
				</aside>
			</div>
		</div>
	);
}
