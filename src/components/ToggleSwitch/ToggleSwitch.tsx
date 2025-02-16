import './ToggleSwitch.css';

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
				<img
					className="gear-image"
					src="/public/f44562c2-ba6f-4103-abfd-3413d15ce6e7-removebg-preview.png"
					alt="gear"
				/>
				<img className="sun-image" src="/public/sun.png" alt="sun" />
				<img className="moon-image" src="/public/moon.png" alt="moon" />
			</label>
		</div>
	);
}

export default ToggleSwitch;
