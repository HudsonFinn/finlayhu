/*
 * 3D for figures: an orthographic iso camera over a scene built with createDraw (geometry.ts).
 * Imported as @fhudson/figures/three, so three.js only loads with the figures that use it.
 */
import { useLayoutEffect, useRef } from 'react';
import {
	Group,
	OrthographicCamera,
	Scene,
	WebGLRenderer,
	type Object3D,
} from 'three';
import { createDraw, type Draw } from './geometry';
import { useTokenColours } from './useTokenColours';

/**
 * An iso drawing in a Frame. `scene` is read when the canvas mounts and again when the theme
 * changes; `angle` turns the drawing about its vertical axis and redraws straight away, inside
 * React's commit, so the exporter's frame is always the one it asked for.
 */
export function IsoCanvas({
	alt,
	span,
	aspect = 3 / 2,
	angle = 0,
	lift = 0,
	scene,
}: {
	alt: string;
	/** World units visible across the width. */
	span: number;
	aspect?: number;
	/** Turn about the vertical axis, in radians. */
	angle?: number;
	/** Moves the drawing down (positive) to centre it in the frame. */
	lift?: number;
	scene: (draw: Draw) => Object3D[];
}) {
	const container = useRef<HTMLDivElement>(null);
	const sceneRef = useRef(scene);
	sceneRef.current = scene;
	const colours = useTokenColours();
	const view = useRef<{
		renderer: WebGLRenderer;
		camera: OrthographicCamera;
		root: Group;
		draw: () => void;
	} | null>(null);

	// The renderer, camera and sizing: once per mount. A layout effect, declared first, so it
	// exists before the drawing below is built
	useLayoutEffect(() => {
		const element = container.current;
		if (!element) return;
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			// Keeps the last frame readable, for export screenshots
			preserveDrawingBuffer: true,
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.domElement.style.display = 'block';
		element.append(renderer.domElement);

		const camera = new OrthographicCamera();
		camera.position.set(10, 10, 10);
		camera.lookAt(0, 0, 0);
		camera.near = 0.1;
		camera.far = 100;
		const world = new Scene();
		const root = new Group();
		world.add(root);
		const draw = () => {
			renderer.render(world, camera);
		};
		view.current = { renderer, camera, root, draw };

		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			renderer.setSize(width, height);
			camera.left = -width / 2;
			camera.right = width / 2;
			camera.top = height / 2;
			camera.bottom = -height / 2;
			camera.zoom = width / span;
			camera.updateProjectionMatrix();
			draw();
		});
		observer.observe(element);

		return () => {
			observer.disconnect();
			renderer.dispose();
			renderer.domElement.remove();
			view.current = null;
		};
	}, [span]);

	// The drawing itself: rebuilt when the theme changes
	useLayoutEffect(() => {
		const current = view.current;
		if (!current) return;
		const tools = createDraw(colours);
		current.root.add(...sceneRef.current(tools));
		current.draw();
		return () => {
			current.root.clear();
			tools.dispose();
		};
	}, [colours, span]);

	// The turn, and the lift: every frame
	useLayoutEffect(() => {
		const current = view.current;
		if (!current) return;
		current.root.rotation.y = angle;
		current.root.position.y = -lift;
		current.draw();
	}, [angle, lift, colours, span]);

	return (
		<div
			ref={container}
			role="img"
			aria-label={alt}
			style={{ aspectRatio: aspect }}
		/>
	);
}
