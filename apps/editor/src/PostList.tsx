import { useState } from 'react';
import { Button, TextField, cn } from '@fhudson/ui';
import type { PostSummary } from './api';

/** Every post in the site's posts folder, drafts first, and a box to start a new one. */
export function PostList({
	posts,
	current,
	onOpen,
	onCreate,
}: {
	posts: PostSummary[];
	current: string | null;
	onOpen: (file: string) => void;
	onCreate: (title: string) => Promise<void>;
}) {
	const [title, setTitle] = useState('');
	const [error, setError] = useState<string>();
	const drafts = posts.filter((p) => !p.onSite);
	const published = posts.filter((p) => p.onSite);

	const group = (label: string, list: PostSummary[]) =>
		list.length > 0 && (
			<div className="flex flex-col">
				<span className="px-3 pb-1 font-data text-label uppercase tracking-widest text-ink-muted">
					{label}
				</span>
				{list.map((post) => (
					<button
						key={post.file}
						type="button"
						aria-current={
							post.file === current ? 'true' : undefined
						}
						onClick={() => {
							onOpen(post.file);
						}}
						className={cn(
							'flex cursor-pointer flex-col items-start gap-0.5 border-l-[3px] px-3 py-2 text-left',
							post.file === current
								? 'border-verdigris bg-sheet'
								: 'border-transparent hover:bg-sheet'
						)}
					>
						<span className="text-small text-ink">
							{post.title}
						</span>
						<span className="font-data text-label text-ink-muted">
							{post.created || 'No date'}
						</span>
					</button>
				))}
			</div>
		);

	return (
		<nav
			aria-label="Posts"
			className="flex min-h-0 flex-col gap-5 overflow-y-auto border-r border-hairline py-4"
		>
			<form
				className="flex flex-col gap-2 px-3"
				onSubmit={(event) => {
					event.preventDefault();
					setError(undefined);
					onCreate(title.trim())
						.then(() => {
							setTitle('');
						})
						.catch((e: unknown) => {
							setError(
								e instanceof Error ? e.message : String(e)
							);
						});
				}}
			>
				<TextField
					label="New post"
					placeholder="Title"
					value={title}
					onChange={setTitle}
					isInvalid={error !== undefined}
					errorMessage={error}
				/>
				<Button
					type="submit"
					size="sm"
					variant="ghost"
					isDisabled={!title.trim()}
				>
					Start draft
				</Button>
			</form>
			{group('Drafts', drafts)}
			{group('On the site', published)}
		</nav>
	);
}
