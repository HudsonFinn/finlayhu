/*
 * Renders figures to files for Substack: a PNG still, and for animated figures an MP4 and
 * (for loops of 12 s or less) a GIF, in dark and light.
 *
 * It runs the workbench, opens each figure's export view in headless Chromium, steps the
 * figure's clock one frame at a time (window.__figure.setTime), screenshots the sheet, and
 * hands the frames to ffmpeg. Nothing is recorded in real time, so every export is exact.
 */
import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { chromium, type Page } from 'playwright';
import { stillTime } from '../src/kit/useClock';
import { interactiveUrl, type FigureEntry } from '../src/kit/types';
import { GIF_MAX_MS } from './postRegistry';

export type Theme = 'dark' | 'light';

/** Substack's column, at 2× for sharp images on retina screens. */
const WIDTH = 728;
const SCALE = 2;
const FPS = 30;
const GIF_FPS = 20;
const PORT = 5181;
const workbenchDir = join(
	import.meta.dir,
	'..',
	'..',
	'..',
	'apps',
	'workbench'
);

function run(command: string[]) {
	const result = Bun.spawnSync(command, { stderr: 'pipe' });
	if (result.exitCode !== 0)
		throw new Error(`${command[0]} failed:\n${result.stderr.toString()}`);
}

async function startWorkbench() {
	const server = Bun.spawn(
		[
			'bunx',
			'vite',
			'--port',
			String(PORT),
			'--strictPort',
			'--logLevel',
			'error',
		],
		{ cwd: workbenchDir, stdout: 'ignore', stderr: 'inherit' }
	);
	const base = `http://localhost:${String(PORT)}`;
	for (let i = 0; i < 100; i++) {
		try {
			if ((await fetch(base)).ok)
				return {
					base,
					stop: () => {
						server.kill();
					},
				};
		} catch {
			// Not up yet
		}
		await Bun.sleep(200);
	}
	server.kill();
	throw new Error(`The workbench didn't start on port ${String(PORT)}`);
}

async function setTime(page: Page, time: number) {
	await page.evaluate(async (t) => {
		if (!window.__figure) throw new Error('No export view on this page');
		await window.__figure.setTime(t);
	}, time);
}

/** A path from where the command was run, unless it's outside it. */
const shown = (path: string) => {
	const rel = relative(process.cwd(), path);
	return rel.startsWith('..') ? path : rel;
};

const size = (path: string) =>
	`${(statSync(path).size / 1024 / 1024).toFixed(1)} MB`;

async function exportTheme(
	page: Page,
	base: string,
	figure: FigureEntry,
	theme: Theme,
	dir: string
) {
	const still = stillTime(figure.duration);
	await page.goto(
		`${base}/?f=${figure.slug}&theme=${theme}&export&t=${String(still)}`
	);
	const sheet = page.locator('[data-figure-sheet]');
	await sheet.waitFor();
	await page.waitForFunction(() => window.__figure !== undefined);
	await page.evaluate(() => document.fonts.ready);
	// A 3D canvas needs a moment to create its context and draw the first frame
	if ((await page.locator('canvas').count()) > 0)
		await page.waitForTimeout(500);
	await setTime(page, still);

	const box = await sheet.boundingBox();
	if (!box) throw new Error(`${figure.number} has no sheet to capture`);
	const clip = { x: box.x, y: box.y, width: box.width, height: box.height };
	const name = `${figure.slug}-${theme}`;
	const files: string[] = [];

	const png = join(dir, `${name}.png`);
	await page.screenshot({ path: png, clip });
	files.push(png);

	const length = figure.duration ?? figure.loop;
	if (!length) return files;

	const frames = mkdtempSync(join(tmpdir(), `${name}-`));
	try {
		const count = Math.round((length / 1000) * FPS);
		for (let i = 0; i < count; i++) {
			await setTime(page, (i * 1000) / FPS);
			await page.screenshot({
				path: join(frames, `${String(i).padStart(5, '0')}.png`),
				clip,
			});
		}
		const input = [
			'-framerate',
			String(FPS),
			'-i',
			join(frames, '%05d.png'),
		];

		const mp4 = join(dir, `${name}.mp4`);
		run([
			'ffmpeg',
			'-y',
			'-loglevel',
			'error',
			...input,
			// H.264 needs even dimensions
			'-vf',
			'pad=ceil(iw/2)*2:ceil(ih/2)*2:color=black@0',
			'-c:v',
			'libx264',
			'-pix_fmt',
			'yuv420p',
			// Flat line art compresses well; 24 is visually lossless here at a third of the size
			'-crf',
			'24',
			'-preset',
			'slow',
			'-tune',
			'animation',
			'-movflags',
			'+faststart',
			mp4,
		]);
		files.push(mp4);

		if (length <= GIF_MAX_MS) {
			const gif = join(dir, `${name}.gif`);
			run([
				'ffmpeg',
				'-y',
				'-loglevel',
				'error',
				...input,
				// Half size (1×) and one palette for the whole loop keep GIFs small enough for email
				'-vf',
				`fps=${String(GIF_FPS)},scale=iw/${String(SCALE)}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
				'-loop',
				'0',
				gif,
			]);
			files.push(gif);
		}
	} finally {
		rmSync(frames, { recursive: true, force: true });
	}
	return files;
}

export async function exportFigures(
	figures: FigureEntry[],
	{ out, themes }: { out: string; themes: Theme[] }
) {
	const workbench = await startWorkbench();
	// SwiftShader gives headless Chromium WebGL for the 3D figures
	const browser = await chromium.launch({
		args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
	});
	const results: { figure: FigureEntry; files: string[] }[] = [];
	try {
		for (const figure of figures) {
			const started = Date.now();
			const dir = join(out, figure.slug);
			mkdirSync(dir, { recursive: true });
			writeFileSync(
				join(dir, 'caption.txt'),
				`Alt text:\n${figure.alt}\n\nCaption ends with:\nInteractive version: ${interactiveUrl(figure)}\n`
			);
			const files = (
				await Promise.all(
					themes.map(async (theme) => {
						const page = await browser.newPage({
							viewport: { width: WIDTH, height: 1600 },
							deviceScaleFactor: SCALE,
						});
						try {
							return await exportTheme(
								page,
								workbench.base,
								figure,
								theme,
								dir
							);
						} finally {
							await page.close();
						}
					})
				)
			).flat();
			const seconds = ((Date.now() - started) / 1000).toFixed(0);
			console.log(`${figure.number}  ${figure.title}  (${seconds} s)`);
			for (const file of files)
				console.log(`  ${size(file).padStart(7)}  ${shown(file)}`);
			console.log(`           ${shown(join(dir, 'caption.txt'))}`);
			results.push({ figure, files });
		}
	} finally {
		await browser.close();
		workbench.stop();
	}
	return results;
}
