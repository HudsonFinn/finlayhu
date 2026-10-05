import { UmlFigure } from '../../kit/UmlFigure';
import { PREVIOUS, SPEC, meta } from './meta';

export default function Figure() {
	return <UmlFigure meta={meta} spec={SPEC} previous={PREVIOUS} />;
}
