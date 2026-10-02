import { type ReactNode } from 'react';
import { GridContext, type GridFeeds } from './GridContext';
import {
	useCarbonIntensity,
	useDemand,
	useFrequency,
	useGenerationMix,
} from './hooks';

/** Polls every grid feed once, for everything inside it. */
export function GridProvider({ children }: { children: ReactNode }) {
	const value: GridFeeds = {
		frequency: useFrequency(),
		demand: useDemand(),
		carbon: useCarbonIntensity(),
		mix: useGenerationMix(),
	};
	return (
		<GridContext.Provider value={value}>{children}</GridContext.Provider>
	);
}
