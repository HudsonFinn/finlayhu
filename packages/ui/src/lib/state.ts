/** The state of a thing: an API, a feed, a breaker. Shared by every component that shows one. */
export type State = 'in-service' | 'isolated' | 'fault' | 'unknown';

export const stateLabels: Record<State, string> = {
	'in-service': 'In service',
	isolated: 'Isolated',
	fault: 'Fault',
	unknown: 'Unknown',
};

/** Text colour utility for each state. */
export const stateText: Record<State, string> = {
	'in-service': 'text-verdigris',
	isolated: 'text-amber',
	fault: 'text-fault',
	unknown: 'text-ink-muted',
};

/** Background colour utility for each state, for lamps and fills. */
export const stateFill: Record<State, string> = {
	'in-service': 'bg-verdigris',
	isolated: 'bg-amber',
	fault: 'bg-fault',
	unknown: 'bg-ink-muted',
};
