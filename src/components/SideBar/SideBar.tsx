import { useState } from 'react';
import Button from '../Button/Button';
import OuraData from '../OuraData/OuraData';

const SideBar = () => {
	const [isOpen, setOpen] = useState(false);

	return (
		<div className="m-5">
			<div className="flex flex-row justify-between">
				{isOpen && <h2 className="text-xl mt-1">Data</h2>}
				<Button
					onClick={() => {
						setOpen(!isOpen);
					}}
				>
					ℹ️
				</Button>
			</div>
			<OuraData isExpanded={isOpen} />
		</div>
	);
};

export default SideBar;
