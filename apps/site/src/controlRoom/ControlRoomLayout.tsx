import { GridProvider } from '@fhudson/grid';
import {
	Link,
	SiteHeader,
	SkipLink,
	ThemeSwitch,
	TitleBlock,
} from '@fhudson/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { drawingFor, navItems } from './drawings';
import { StatusStrip } from './StatusStrip';

const today = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: '2-digit',
	year: '2-digit',
})
	.format(new Date())
	.replaceAll('/', '.');

/** The control-room shell: header, live status strip, the page, and a title block. */
function ControlRoomLayout() {
	const { pathname } = useLocation();
	const drawing = drawingFor(pathname);

	return (
		<GridProvider>
			<div className="flex min-h-screen flex-col">
				<SkipLink />
				<SiteHeader
					title="Finlay Hudson"
					items={navItems}
					currentHref={pathname}
					actions={<ThemeSwitch defaultChoice="dark" />}
				/>
				<StatusStrip />
				<main id="main" className="drawing-grid flex-1">
					<div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
						<Outlet />
					</div>
				</main>
				<footer className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-8">
					<TitleBlock
						fields={[
							{
								label: 'Drawing',
								value: `${drawing.number} · ${drawing.title}`,
							},
							{ label: 'Rev', value: __COMMIT__ },
							{ label: 'Date', value: today },
							{
								label: 'Grid data',
								value: (
									<>
										<Link href="https://bmrs.elexon.co.uk">
											Elexon
										</Link>
										,{' '}
										<Link href="https://carbonintensity.org.uk">
											NESO
										</Link>
									</>
								),
							},
						]}
					/>
				</footer>
			</div>
		</GridProvider>
	);
}

export default ControlRoomLayout;
