/*
 * bun run fig new <post> <title…>   start a figure: next drawing number, a still to edit
 * bun run fig dev                   open the workbench
 * bun run fig list                  every figure, by drawing number
 */
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const figuresDir = join(root, 'src', 'figures');
const registryPath = join(root, 'src', 'registry.ts');
const WORKBENCH = 'http://localhost:5180';

const kebab = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.split('-')
		.slice(0, 5)
		.join('-');

const today = () => {
	const d = new Date();
	const two = (n: number) => String(n).padStart(2, '0');
	return `${two(d.getDate())}.${two(d.getMonth() + 1)}.${two(d.getFullYear() % 100)}`;
};

function nextNumber(post: string) {
	const used = readdirSync(figuresDir)
		.map((folder) => new RegExp(`^bn-${post}-f(\\d+)-`).exec(folder)?.[1])
		.filter((n): n is string => n !== undefined)
		.map(Number);
	return Math.max(0, ...used) + 1;
}

const metaTemplate = (
	number: string,
	title: string
) => `import type { FigureMeta } from '../../kit/types';

export const meta: FigureMeta = {
	number: '${number}',
	title: ${JSON.stringify(title)},
	alt: 'TODO: what the figure shows, in a sentence or two. Screen readers and Substack use it.',
	source: 'TODO',
	date: '${today()}',
	// duration: 8000, // for a build that loops; leave out for stills and continuous motion
};
`;

const figureTemplate = `import { Frame } from '../../kit/Frame';
import { Label, Node, Sheet } from '../../kit/Sheet';
import { meta } from './meta';

/*
 * A still. To animate: const clock = useClock(meta.duration), pass clock to Frame, and compute
 * every mark from clock.time with progress / drawOn / flowOffset from kit/time.
 * For 3D, use IsoCanvas from kit/three (see bn-00-f3-substation).
 */
export default function Figure() {
	return (
		<Frame meta={meta}>
			<Sheet width={720} height={240} label={meta.alt}>
				<path d="M120 120H350" stroke="var(--sl-ink)" strokeWidth={3} />
				<path d="M370 120H600" stroke="var(--sl-ink)" strokeWidth={3} />
				<Node x={360} y={120} />
				<Label x={120} y={104}>
					NETWORK A
				</Label>
				<Label x={600} y={104} anchor="end">
					NETWORK B
				</Label>
				<Label x={360} y={150} anchor="middle" tone="ink">
					BOUNDARY NODE
				</Label>
			</Sheet>
		</Frame>
	);
}
`;

function addToRegistry(folder: string, variable: string) {
	const source = readFileSync(registryPath, 'utf8');
	const importMarker = '// fig new: imports above';
	const entryMarker = '\t// fig new: entries above';
	if (!source.includes(importMarker) || !source.includes(entryMarker))
		throw new Error('registry.ts has lost its "fig new" markers');
	writeFileSync(
		registryPath,
		source
			.replace(
				importMarker,
				`import { meta as ${variable} } from './figures/${folder}/meta';\n${importMarker}`
			)
			.replace(
				entryMarker,
				`\tentry(${variable}, () => import('./figures/${folder}/Figure')),\n${entryMarker}`
			)
	);
}

function create(postArg: string | undefined, titleWords: string[]) {
	const title = titleWords.join(' ').trim();
	if (!postArg || !/^\d{1,2}$/.test(postArg) || !title) {
		console.error('usage: bun run fig new <post number> <title…>');
		process.exit(1);
	}
	const post = postArg.padStart(2, '0');
	const n = nextNumber(post);
	const number = `BN-${post}-F${String(n)}`;
	const folder = `bn-${post}-f${String(n)}-${kebab(title)}`;
	const dir = join(figuresDir, folder);
	if (existsSync(dir)) throw new Error(`${folder} already exists`);

	mkdirSync(dir);
	writeFileSync(join(dir, 'meta.ts'), metaTemplate(number, title));
	writeFileSync(join(dir, 'Figure.tsx'), figureTemplate);
	addToRegistry(folder, `bn${post}f${String(n)}`);

	console.log(`${number}  ${title}`);
	console.log(`  edit      packages/figures/src/figures/${folder}/`);
	console.log(
		`  preview   ${WORKBENCH}/?f=${number.toLowerCase()}  (bun run fig dev)`
	);
	console.log(
		'  then fill in alt and source in meta.ts; the tests fail until you do'
	);
}

const [command, ...args] = process.argv.slice(2);

if (command === 'new') create(args[0], args.slice(1));
else if (command === 'list') {
	const { figures } = await import('../src/registry');
	for (const f of figures) console.log(`${f.number.padEnd(10)} ${f.title}`);
} else if (command === 'dev') {
	const child = Bun.spawn(
		['bun', 'run', '--filter', '@fhudson/workbench', 'dev'],
		{
			stdio: ['inherit', 'inherit', 'inherit'],
		}
	);
	process.exit(await child.exited);
} else {
	console.error('usage: bun run fig <new <post> <title…> | dev | list>');
	process.exit(1);
}
