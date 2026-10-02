import {
	ToggleButton,
	ToggleButtonGroup,
	type Key,
} from 'react-aria-components';
import { cn } from '../../lib/cn';
import { useTheme, type ThemeChoice } from '../../theme/useTheme';

const options: { id: ThemeChoice; label: string }[] = [
	{ id: 'dark', label: 'Night' },
	{ id: 'light', label: 'Day' },
	{ id: 'system', label: 'Auto' },
];

/** Night, day or follow the system. Remembered per viewer. */
export function ThemeSwitch({
	defaultChoice = 'system',
	className,
}: {
	/** Applies until the viewer picks one. */
	defaultChoice?: ThemeChoice;
	className?: string;
}) {
	const { choice, setChoice } = useTheme(defaultChoice);
	return (
		<ToggleButtonGroup
			aria-label="Theme"
			selectionMode="single"
			disallowEmptySelection
			selectedKeys={[choice]}
			onSelectionChange={(keys: Set<Key>) => {
				const [next] = [...keys];
				if (next === 'dark' || next === 'light' || next === 'system')
					setChoice(next);
			}}
			className={cn('inline-flex border border-ink', className)}
		>
			{options.map((option) => (
				<ToggleButton
					key={option.id}
					id={option.id}
					className="cursor-pointer px-2.5 py-1.5 font-data text-label uppercase tracking-wider text-ink-muted outline-hidden data-focus-visible:outline-solid data-focus-visible:outline-[1.5px] data-focus-visible:-outline-offset-2 data-focus-visible:outline-verdigris data-hovered:text-ink data-selected:bg-ink data-selected:text-paper"
				>
					{option.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
