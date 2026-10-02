import { Heading, Text } from '@fhudson/ui';
import type { ReactNode } from 'react';

/** The top of every page: panel ID, title, and an optional lead paragraph. */
export function PageHeader({
	panel,
	title,
	children,
	actions,
}: {
	/** e.g. "PNL 01 · Board" */
	panel: string;
	title: string;
	children?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="flex flex-col gap-4">
			<Text variant="label">{panel}</Text>
			<Heading level={1}>{title}</Heading>
			{children && (
				<Text variant="lead" className="max-w-[56ch]">
					{children}
				</Text>
			)}
			{actions && <div className="flex flex-wrap gap-3">{actions}</div>}
		</header>
	);
}
