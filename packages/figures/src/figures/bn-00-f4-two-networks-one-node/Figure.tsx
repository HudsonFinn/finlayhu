import { Frame } from '../../kit/Frame';
import { Label, Node, Sheet } from '../../kit/Sheet';
import { meta } from './meta';

/*
 * A still. To animate: const clock = useClock(meta.duration), pass clock to Frame, and compute
 * every mark from clock.time with progress / drawOn / flowOffset from kit/time.
 * For 3D, use IsoCanvas from kit/three (see bn-00-f3-substation).
 */
export default function Figure() {
	return (
		<Frame meta={meta}>
			<Sheet width={720} height={240} label={meta.alt}>
				<path d="M120 120H350" stroke="var(--sl-ink)" strokeWidth={3} />
				<path d="M370 120H600" stroke="var(--sl-ink)" strokeWidth={3} />
				<Node x={360} y={120} />
				<Label x={120} y={104}>
					NETWORK A
				</Label>
				<Label x={600} y={104} anchor="end">
					NETWORK B
				</Label>
				<Label x={360} y={150} anchor="middle" tone="ink">
					BOUNDARY NODE
				</Label>
			</Sheet>
		</Frame>
	);
}
