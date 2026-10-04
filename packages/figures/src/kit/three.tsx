/*
 * 3D for figures: drawn, not rendered. An orthographic iso camera, paper faces that hide what's
 * behind them, and ink edges. Imported as @fhudson/figures/three, so three.js only loads with
 * the figures that use it.
 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { EdgesGeometry, type BufferGeometry } from 'three';
import type { Point } from './geometry';
import { useTokenColours, type TokenColours } from './useTokenColours';

/** A solid: paper faces, coloured edges (ink unless it's the one verdigris thing). */
export function Solid({
	geometry,
	position,
	edge,
	face,
}: {
	geometry: BufferGeometry;
	position: Point;
	edge: string;
	face: string;
}) {
	const edges = useMemo(() => new EdgesGeometry(geometry, 20), [geometry]);
	useEffect(
		() => () => {
			edges.dispose();
		},
		[edges]
	);
	return (
		<group position={position}>
			<mesh geometry={geometry}>
				{/* Pushed back slightly, so edges on the faces always win the depth test */}
				<meshBasicMaterial
					color={face}
					polygonOffset
					polygonOffsetFactor={1}
					polygonOffsetUnits={1}
				/>
			</mesh>
			<lineSegments geometry={edges}>
				<lineBasicMaterial color={edge} />
			</lineSegments>
		</group>
	);
}

/** Lines only, e.g. conductors or a ground grid. */
export function Lines({
	geometry,
	color,
}: {
	geometry: BufferGeometry;
	color: string;
}) {
	return (
		<lineSegments geometry={geometry}>
			<lineBasicMaterial color={color} />
		</lineSegments>
	);
}

/** Keeps `span` world units across the canvas, whatever its width. */
function FitZoom({ span }: { span: number }) {
	const { camera, size, invalidate } = useThree();
	useEffect(() => {
		camera.zoom = size.width / span;
		camera.updateProjectionMatrix();
		invalidate();
	}, [camera, size.width, span, invalidate]);
	return null;
}

/**
 * An iso drawing in a Frame. Renders on demand: only when props change, which for an
 * animated figure is once per clock tick, and for an export is once per frame.
 */
export function IsoCanvas({
	alt,
	span,
	aspect = 3 / 2,
	children,
}: {
	alt: string;
	/** World units visible across the width. */
	span: number;
	aspect?: number;
	children: (colours: TokenColours) => ReactNode;
}) {
	const colours = useTokenColours();
	return (
		<div role="img" aria-label={alt} style={{ aspectRatio: aspect }}>
			<Canvas
				orthographic
				flat
				frameloop="demand"
				dpr={[1, 2]}
				gl={{ preserveDrawingBuffer: true }}
				camera={{
					position: [10, 10, 10],
					zoom: 30,
					near: 0.1,
					far: 100,
				}}
			>
				<FitZoom span={span} />
				{children(colours)}
			</Canvas>
		</div>
	);
}
