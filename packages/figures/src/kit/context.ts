import { createContext, useContext } from 'react';

/** Set by the exporter (and the workbench's export view) to render one exact frame. */
export const ClockContext = createContext<{ fixedTime?: number }>({});

/** The figure's rendered width in CSS px, measured by Frame. 0 until measured. */
export const FigureWidthContext = createContext(0);

/** Below this width a figure should use its compact layout, if it has one. */
export const COMPACT_BELOW = 560;

export function useFigureSize() {
	const width = useContext(FigureWidthContext);
	return { width, compact: width > 0 && width < COMPACT_BELOW };
}

/**
 * How wide a figure may grow, in CSS px. Substack's column (728) by default, so the site
 * matches the exports; a post on the site can let figures fill its text column (Infinity).
 */
export const FigureMaxWidthContext = createContext(728);

/** CSS px per viewBox unit for the Sheet being drawn. Labels divide by it to stay true size. */
export const SheetScaleContext = createContext(1);
