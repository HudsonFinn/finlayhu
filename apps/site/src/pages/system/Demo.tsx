import type { ReactNode } from 'react';
import { Heading, Text } from '@fhudson/ui';

/** One component on /system: its name, what it's for, and live examples. */
export function Demo({
	name,
	summary,
	children,
}: {
	name: string;
	summary: string;
	children: ReactNode;
}) {
	const id = `component-${name.toLowerCase()}`;
	return (
		<article
			id={id}
			aria-labelledby={`${id}-title`}
			className="grid gap-4 border-b border-hairline py-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8"
		>
			<header className="flex flex-col gap-2">
				<Heading
					level={3}
					id={`${id}-title`}
					className="font-data text-ui font-medium"
				>
					{name}
				</Heading>
				<Text variant="small" tone="muted">
					{summary}
				</Text>
			</header>
			<div className="flex min-w-0 flex-col gap-6">{children}</div>
		</article>
	);
}

/** A labelled example inside a Demo. */
export function Example({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<Text variant="label">{label}</Text>
			<div className="flex min-w-0 flex-wrap items-center gap-3">
				{children}
			</div>
		</div>
	);
}
