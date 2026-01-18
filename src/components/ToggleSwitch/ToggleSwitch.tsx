import gearImageUrl from '/public/gear.png';
import sunImageUrl from '/public/sun.png';
import moonImageUrl from '/public/moon.png';

type ToggleSwitchProps = {
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function ToggleSwitch(props: ToggleSwitchProps) {
	const { checked, onChange } = props;
	return (
		<div className="toggle-switch">
			<input
				type="checkbox"
				id="switch-input"
				checked={checked}
				onChange={onChange}
			></input>
			<label htmlFor="switch-input" className="slider">
				<img className="gear-image" src={gearImageUrl} alt="gear" />
				<img className="sun-image" src={sunImageUrl} alt="sun" />
				<img className="moon-image" src={moonImageUrl} alt="moon" />
			</label>
		</div>
	);
}

export default ToggleSwitch;
