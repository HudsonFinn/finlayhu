import React from 'react';
import './Button.css';

interface ButtonProps {
	onClick: () => void;
	children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
	return (
		<button className="steampunk-button" onClick={onClick}>
			{children}
		</button>
	);
};

export default Button;
