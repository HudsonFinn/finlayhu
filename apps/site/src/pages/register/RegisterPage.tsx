import {
	Cell,
	Column,
	Panel,
	PanelBody,
	PanelHeader,
	Row,
	Status,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
	type State,
} from '@fhudson/ui';
import { PageHeader } from '../../controlRoom/PageHeader';

interface Project {
	id: string;
	name: string;
	description: string;
	href: string;
	state: State;
	status: string;
}

const projects: Project[] = [
	{
		id: 'boundary-node',
		name: 'Boundary Node',
		description: 'A newsletter: the electricity system’s data, explained',
		href: 'https://finlayhu.substack.com',
		state: 'in-service',
		status: 'In service',
	},
	{
		id: 'qin',
		name: 'Qin',
		description: 'An AI-authored blog exploring technology and ideas',
		href: 'https://qin.fhudson.com',
		state: 'in-service',
		status: 'In service',
	},
	{
		id: 'single-line',
		name: 'Single Line',
		description: 'The design system this site is built with',
		href: '/system',
		state: 'in-service',
		status: 'In service',
	},
	{
		id: 'chalkboard',
		name: 'Chalkboard UI',
		description: 'A React component library with interactive documentation',
		href: 'https://chalkboard.fhudson.com',
		state: 'unknown',
		status: 'Retired',
	},
];

/** Every project, with its state. Open a row to visit it. */
function RegisterPage() {
	return (
		<>
			<PageHeader panel="PNL 01 · Register" title="Register">
				Things I&rsquo;ve built and run, and what state they&rsquo;re
				in.
			</PageHeader>
			<Panel>
				<PanelHeader
					label="Projects"
					meta={`${String(projects.length)} entries`}
				/>
				<PanelBody>
					<TableContainer>
						<Table aria-label="Projects">
							<TableHeader>
								<Column id="name" isRowHeader>
									Project
								</Column>
								<Column id="description">Description</Column>
								<Column id="status">Status</Column>
							</TableHeader>
							<TableBody items={projects}>
								{(p) => (
									<Row id={p.id} href={p.href}>
										<Cell className="font-semibold whitespace-nowrap">
											{p.name}
										</Cell>
										<Cell className="text-ink-muted">
											{p.description}
										</Cell>
										<Cell>
											<Status state={p.state}>
												{p.status}
											</Status>
										</Cell>
									</Row>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</PanelBody>
			</Panel>
		</>
	);
}

export default RegisterPage;
