import { createContext, useContext } from 'react';
import type {
	useCarbonIntensity,
	useDemand,
	useFrequency,
	useGenerationMix,
} from './hooks';

export interface GridFeeds {
	frequency: ReturnType<typeof useFrequency>;
	demand: ReturnType<typeof useDemand>;
	carbon: ReturnType<typeof useCarbonIntensity>;
	mix: ReturnType<typeof useGenerationMix>;
}

export const GridContext = createContext<GridFeeds | null>(null);

/** The live grid feeds. Must be used inside GridProvider. */
export function useGrid(): GridFeeds {
	const feeds = useContext(GridContext);
	if (!feeds) throw new Error('useGrid must be used inside GridProvider');
	return feeds;
}
