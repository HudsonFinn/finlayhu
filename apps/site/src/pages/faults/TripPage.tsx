import { Breaker, Busbar, CodeBlock, Heading, Link, Text } from '@fhudson/ui';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/**
 * Shown when a page throws. It replaces the whole layout, so it draws its own minimal frame:
 * the shell itself may be what failed.
 */
function TripPage() {
	const error = useRouteError();
	const detail = isRouteErrorResponse(error)
		? `${String(error.status)} ${error.statusText}`
		: error instanceof Error
			? error.message
			: 'Unknown error';

	return (
		<div className="drawing-grid min-h-screen">
			<main
				id="main"
				className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-8"
			>
				<div
					aria-hidden="true"
					className="flex w-40 flex-col items-center"
				>
					<Busbar state="fault" />
					<Breaker
						closed={false}
						state="fault"
						className="h-16 w-8"
					/>
				</div>
				<Text variant="label">Fault · trip</Text>
				<Heading level={1}>Tripped</Heading>
				<Text variant="lead">
					Something on this page failed, so it tripped before it could
					do more damage. Reloading usually resets it.
				</Text>
				<CodeBlock language="Fault">{detail}</CodeBlock>
				<div className="flex flex-wrap gap-3">
					<Link variant="button" href="/">
						Back to the Board
					</Link>
				</div>
			</main>
		</div>
	);
}

export default TripPage;
