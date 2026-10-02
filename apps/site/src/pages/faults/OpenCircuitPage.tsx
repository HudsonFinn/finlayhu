import { Breaker, Busbar, Link } from '@fhudson/ui';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../controlRoom/PageHeader';

/** 404: the circuit for this address is open. */
function OpenCircuitPage() {
	const { pathname } = useLocation();
	return (
		<>
			<PageHeader
				panel="Fault · 404"
				title="Open circuit"
				actions={
					<Link variant="button" href="/">
						Back to the Board
					</Link>
				}
			>
				Nothing is connected at{' '}
				<code className="font-data text-ui">{pathname}</code>. The page
				may have moved, or the address has a typo.
			</PageHeader>
			<div aria-hidden="true" className="flex w-40 flex-col items-center">
				<Busbar state="unknown" />
				<Breaker closed={false} state="isolated" className="h-16 w-8" />
			</div>
		</>
	);
}

export default OpenCircuitPage;
