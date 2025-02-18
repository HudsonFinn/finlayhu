import React, { memo, useCallback, useState } from 'react';
import './PhotoGallery.css';
import typewriter from '/public/typewriter.png';
import morseCode from '/public/morse-code.png';
import sundial from '/public/sundial.png';
import plane from '/public/plane.png';
import washingMachine from '/public/washing-machine.png';

interface PhotoProps {
	src: string;
	index: number;
	alt: string;
	isSelected: boolean;
	onClick: (index: number) => boolean;
}

const Photo: React.FC<PhotoProps> = ({
	index,
	src,
	alt,
	isSelected,
	onClick,
}: PhotoProps) => {
	return (
		<div
			className={`photo ${isSelected ? 'selected' : ''}`}
			onClick={() => onClick(index)}
		>
			<img src={src} alt={alt} />
		</div>
	);
};

const MemoizedPhoto = memo(Photo);

const photos = [
	{ src: typewriter, alt: 'Photo 1' },
	{ src: morseCode, alt: 'Photo 2' },
	{ src: sundial, alt: 'Photo 3' },
	{ src: plane, alt: 'Photo 4' },
	{ src: washingMachine, alt: 'Photo 5' },
];

const PhotoGallery: React.FC = () => {
	const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
		null
	);

	const handlePhotoClick = useCallback((index: number) => {
		setSelectedPhotoIndex(index);
		return true;
	}, []);

	return (
		<div className="photo-gallery">
			{photos.map((photo, index) => (
				<MemoizedPhoto
					key={index}
					index={index}
					src={photo.src}
					alt={photo.alt}
					isSelected={index === selectedPhotoIndex}
					onClick={handlePhotoClick}
				/>
			))}
		</div>
	);
};

export default PhotoGallery;
