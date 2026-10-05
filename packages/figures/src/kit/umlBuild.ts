/*
 * How a UML diagram builds: which groups are new since the previous diagram, and when each
 * starts. Shared by a figure's meta (for its duration) and its drawing.
 */
import { BEAT, HOLD, STEP } from './time';
import { layoutUml, type UmlSpec } from './uml';

export interface BuildStep {
	group: string;
	start: number;
	/** How long its line work takes to draw. Texts settle in as it finishes. */
	length: number;
}

const kindOf = (group: string) => group.slice(0, group.indexOf(':'));

/** New groups in drawing order, each starting a little after the last, like a pen. */
export function umlBuild(spec: UmlSpec, previous?: UmlSpec) {
	const before = previous ? new Set(layoutUml(previous).groups) : new Set();
	const fresh = layoutUml(spec).groups.filter((g) => !before.has(g));
	let at = BEAT;
	const steps: BuildStep[] = fresh.map((group) => {
		const kind = kindOf(group);
		const step = {
			group,
			start: at,
			length: kind === 'attr' ? BEAT : STEP,
		};
		at += kind === 'attr' ? BEAT / 2 : BEAT;
		return step;
	});
	const end = Math.max(0, ...steps.map((s) => s.start + s.length + BEAT));
	return {
		steps,
		/** Whole beats: the build, then the hold. */
		duration: Math.ceil(end / BEAT) * BEAT + HOLD,
	};
}
