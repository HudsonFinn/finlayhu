// node convert-text-art.mjs {target file} {destination file}
// TODO: Can be renamed to convert-text-art.js https://stackoverflow.com/questions/57492546/what-is-the-difference-between-js-and-mjs-files
import { ok as assert } from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const [inputPath, outputPath] = process.argv.slice(2);

assert(inputPath, 'File input path not found');
assert(outputPath, 'File output path not found');

const encodingOpts = { encoding: 'utf-8' };

const text = await readFile(inputPath, encodingOpts);

const trimmed = text
	// Remove empty lines from beginning
	.replace(/^(\r?\n)+/, '')
	// Remove whitespace from end
	.trimEnd()
	// Remove whitespace from ends of lines
	.split('\n')
	.map((line) => line.trimEnd())
	.join('\n');

const json = JSON.stringify(trimmed);

const moduleSource = `export default ${json};\n`;

await writeFile(outputPath, moduleSource, encodingOpts);

console.log(`Text art module written to: ${outputPath}`);
