/*
 * UML class diagrams from a JSON spec: the layout of boundary-node's tools/model_diagram.py,
 * ported so the same specs draw on the site and build up as figures. Pure: it returns marks
 * (shapes and texts) grouped by the model element they draw, and a figure decides how they
 * appear. Spec captions and profiles aren't ported; no figure uses them.
 *
 * Boxes: name on top, one attribute per line. Hollow triangle = generalisation ("is a kind
 * of"). Roots are laid out left to right; a childless root after a tree sits beside its top.
 */

export interface UmlClass {
	name: string;
	attrs: string[];
	parent?: string | null;
}

export interface UmlAssociation {
	from: string;
	to: string;
	label: string;
	fromMult?: string;
	toMult?: string;
}

export interface UmlSpec {
	classes: UmlClass[];
	associations?: UmlAssociation[];
	boxWidth?: number;
	gap?: number;
}

/** One model element's marks share a group: `box:Garment`, `attr:Garment.size`, … */
export interface UmlShape {
	group: string;
	kind: 'rect' | 'path' | 'polygon';
	/** rect: x y width height; path: d; polygon: points */
	geometry: Record<string, string | number>;
}

export interface UmlText {
	group: string;
	x: number;
	y: number;
	text: string;
	size: number;
	anchor: 'start' | 'middle' | 'end';
	/** Class names in the body face; everything else in mono. */
	face: 'body' | 'data';
	tone: 'ink' | 'muted';
}

export interface UmlLayout {
	width: number;
	height: number;
	shapes: UmlShape[];
	texts: UmlText[];
	/** Every group, in the order a hand would draw them: boxes, then kinds, then lines. */
	groups: string[];
}

const TH = 34;
const LINE = 19;
const PAD = 12;
const LEVEL = 120;
const ROOTGAP = 140;
/** Average mono advance at 12.5px, as model_diagram.py estimates label widths. */
const CHAR = 7.6;

export const assocKey = (a: UmlAssociation) =>
	`assoc:${a.from}-${a.label}-${a.to}`;

export function layoutUml(spec: UmlSpec): UmlLayout {
	const BW = spec.boxWidth ?? 180;
	const GAP = spec.gap ?? 20;
	const classes = new Map(spec.classes.map((c) => [c.name, c]));
	const assocs = spec.associations ?? [];
	const kids = new Map<string, string[]>();
	const roots: string[] = [];
	for (const c of spec.classes) {
		if (c.parent)
			kids.set(c.parent, [...(kids.get(c.parent) ?? []), c.name]);
		else roots.push(c.name);
	}
	const attrsOf = (n: string) => classes.get(n)?.attrs ?? [];
	const ah = (n: string) => Math.max(40, PAD + LINE * attrsOf(n).length + 6);
	const bh = (n: string) => TH + ah(n);

	// x by leaf slots, trees left to right
	const x = new Map<string, number>();
	const depth = new Map<string, number>();
	let cursor = 20;
	const place = (k: string, d: number) => {
		depth.set(k, d);
		const ch = kids.get(k) ?? [];
		if (!ch.length) {
			x.set(k, cursor + BW / 2);
			cursor += BW + GAP;
		} else {
			for (const c of ch) place(c, d + 1);
			x.set(
				k,
				(x.get(ch[0]) ?? 0) / 2 + (x.get(ch[ch.length - 1]) ?? 0) / 2
			);
		}
	};
	roots.forEach((r, i) => {
		const previous = roots[i - 1] as string | undefined;
		if (i && !kids.get(r) && previous && kids.get(previous)) {
			depth.set(r, 0);
			x.set(r, (x.get(previous) ?? 0) + BW + ROOTGAP * 2);
			cursor = Math.max(cursor, (x.get(r) ?? 0) + BW / 2 + 20);
			return;
		}
		place(r, 0);
	});
	const X = (k: string) => x.get(k) ?? 0;
	const D = (k: string) => depth.get(k) ?? 0;

	// Widen the gap between same-level neighbours joined by a labelled line
	for (const a of assocs) {
		if (a.from === a.to || D(a.from) !== D(a.to)) continue;
		const [l, r] = X(a.from) < X(a.to) ? [a.from, a.to] : [a.to, a.from];
		const deficit =
			BW + Math.trunc(a.label.length * CHAR) + 60 - (X(r) - X(l));
		if (deficit > 0) {
			const pivot = X(l);
			for (const [k, v] of x) if (v > pivot) x.set(k, v + deficit);
			cursor += deficit;
		}
	}

	// Each level as tall as its tallest box
	const levels = new Map<number, number>();
	for (const [k, d] of depth)
		levels.set(d, Math.max(levels.get(d) ?? 0, bh(k)));
	const y = new Map<string, number>();
	let top = 40;
	for (const d of [...levels.keys()].sort((a, b) => a - b)) {
		for (const [k, kd] of depth) if (kd === d) y.set(k, top);
		top += (levels.get(d) ?? 0) + LEVEL;
	}
	const Y = (k: string) => y.get(k) ?? 0;
	const loops = assocs.filter((a) => a.from === a.to);
	const crowded = (k: string) =>
		[...x.keys()].some((j) => D(j) === D(k) && X(j) > X(k));
	const loopRoom = Math.max(
		0,
		...loops
			.filter((a) => !crowded(a.from))
			.map((a) => 36 + 8 + Math.trunc(a.label.length * CHAR) + 16)
	);
	const width = Math.trunc(cursor + loopRoom);
	const height = Math.trunc(top - LEVEL + 40 + (loops.length ? 50 : 0));

	const shapes: UmlShape[] = [];
	const texts: UmlText[] = [];
	const groups: string[] = [];
	const text = (
		group: string,
		tx: number,
		ty: number,
		s: string,
		{
			size = 12.5,
			anchor = 'middle',
			face = 'data',
			tone = 'ink',
		}: Partial<Pick<UmlText, 'size' | 'anchor' | 'face' | 'tone'>> = {}
	) => {
		if (s)
			texts.push({
				group,
				x: tx,
				y: ty,
				text: s,
				size,
				anchor,
				face,
				tone,
			});
	};
	const path = (group: string, d: string) => {
		shapes.push({ group, kind: 'path', geometry: { d } });
	};

	// Boxes
	for (const c of spec.classes) {
		const k = c.name;
		const cx = X(k);
		const y0 = Y(k);
		const bx = cx - BW / 2;
		const group = `box:${k}`;
		groups.push(group);
		shapes.push({
			group,
			kind: 'rect',
			geometry: { x: bx, y: y0, width: BW, height: bh(k) },
		});
		path(group, `M${String(bx)} ${String(y0 + TH)}H${String(bx + BW)}`);
		text(group, cx, y0 + 23, k, { size: 16, face: 'body' });
		c.attrs.forEach((a, i) => {
			const attr = `attr:${k}.${a}`;
			groups.push(attr);
			text(attr, bx + PAD, y0 + TH + PAD + 8 + i * LINE, a, {
				anchor: 'start',
			});
		});
	}

	// Generalisations: triangle at the parent, a bus, drops to each child
	for (const c of spec.classes) {
		const ch = kids.get(c.name) ?? [];
		if (!ch.length) continue;
		const cx = X(c.name);
		const b = Y(c.name) + bh(c.name);
		const bus = Y(ch[0]) - 40;
		const parentGroup = `gen:${c.name}`;
		groups.push(parentGroup);
		shapes.push({
			group: parentGroup,
			kind: 'polygon',
			geometry: {
				points: `${String(cx)},${String(b)} ${String(cx - 9)},${String(b + 15)} ${String(cx + 9)},${String(b + 15)}`,
			},
		});
		path(parentGroup, `M${String(cx)} ${String(b + 15)}V${String(bus)}`);
		for (const cc of ch) {
			const drop = `gen:${c.name}>${cc}`;
			groups.push(drop);
			// Each child's drop includes its stretch of the bus, so a new kind brings its own line
			path(
				drop,
				`M${String(cx)} ${String(bus)}H${String(X(cc))}V${String(Y(cc))}`
			);
		}
	}

	// Associations
	for (const a of assocs) {
		const group = assocKey(a);
		groups.push(group);
		const mult = { size: 10.5, tone: 'muted' as const };
		const { from: f, to: t } = a;
		if (f === t) {
			if (crowded(f)) {
				const by = Y(f) + bh(f);
				const x1 = X(f) - 24;
				const x2 = X(f) + 24;
				const oy = by + 30;
				path(
					group,
					`M${String(x1)} ${String(by)}V${String(oy)}H${String(x2)}V${String(by)}`
				);
				text(group, X(f), oy + 16, a.label);
				text(group, x1 - 4, by + 12, a.fromMult ?? '', {
					...mult,
					anchor: 'end',
				});
				text(group, x2 + 4, by + 12, a.toMult ?? '', {
					...mult,
					anchor: 'start',
				});
			} else {
				const rx = X(f) + BW / 2;
				const y1 = Y(f) + TH + 8;
				const y2 = y1 + 34;
				const ox = rx + 36;
				path(
					group,
					`M${String(rx)} ${String(y1)}H${String(ox)}V${String(y2)}H${String(rx)}`
				);
				text(group, ox + 8, (y1 + y2) / 2 + 4, a.label, {
					anchor: 'start',
				});
				text(group, rx + 4, y1 - 4, a.fromMult ?? '', {
					...mult,
					anchor: 'start',
				});
				text(group, rx + 4, y2 + 13, a.toMult ?? '', {
					...mult,
					anchor: 'start',
				});
			}
		} else if (D(f) === D(t)) {
			const [l, r] = X(f) < X(t) ? [f, t] : [t, f];
			const lx = X(l) + BW / 2;
			const rx = X(r) - BW / 2;
			const cy = Y(f) + TH / 2 + 20;
			path(group, `M${String(lx)} ${String(cy)}H${String(rx)}`);
			text(group, (lx + rx) / 2, cy - 8, a.label);
			const [lm, rm] =
				l === f ? [a.fromMult, a.toMult] : [a.toMult, a.fromMult];
			text(group, lx + 6, cy + 14, lm ?? '', {
				...mult,
				anchor: 'start',
			});
			text(group, rx - 6, cy + 14, rm ?? '', { ...mult, anchor: 'end' });
		} else {
			const [lo, hi] = D(f) > D(t) ? [f, t] : [t, f];
			const side = X(hi) > X(lo) ? 1 : -1;
			const sx = X(lo) + (side * BW) / 2;
			const sy = Y(lo) + TH / 2 + 20;
			const ex = X(hi);
			const ey = Y(hi) + bh(hi);
			const away = side > 0 ? 'start' : 'end';
			path(
				group,
				`M${String(sx)} ${String(sy)}H${String(ex)}V${String(ey)}`
			);
			text(group, ex + 8 * side, (sy + ey) / 2 + 4, a.label, {
				anchor: away,
			});
			const [lm, hm] =
				lo === f ? [a.fromMult, a.toMult] : [a.toMult, a.fromMult];
			text(group, sx + 6 * side, sy - 6, lm ?? '', {
				...mult,
				anchor: away,
			});
			text(group, ex + 6, ey + 14, hm ?? '', {
				...mult,
				anchor: 'start',
			});
		}
	}

	return { width, height, shapes, texts, groups };
}
