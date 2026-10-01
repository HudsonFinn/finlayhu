import { Breaker, Busbar, Text, Transformer } from '@fhudson/ui';
import { Demo, Example } from './Demo';

const feeders = [
	{ name: 'F1', closed: true },
	{ name: 'F2', closed: false },
	{ name: 'F3', closed: true },
];

export function Symbols() {
	return (
		<Demo
			name="Symbols"
			summary="Busbar, Breaker and Transformer: single-line diagram symbols."
		>
			<Example label="Composed">
				<figure className="flex w-full max-w-sm flex-col items-stretch">
					<div className="flex items-center justify-center gap-3">
						<span className="w-24" />
						<Transformer
							label="Primary transformer"
							state="in-service"
						/>
						<span className="w-24 font-data text-label text-ink-muted">
							33/11 kV
						</span>
					</div>
					<Busbar label="11 kV busbar" state="in-service" />
					<div className="grid grid-cols-3 justify-items-center">
						{feeders.map((feeder) => (
							<div
								key={feeder.name}
								className="flex flex-col items-center gap-1"
							>
								<Breaker
									closed={feeder.closed}
									label={`Feeder ${feeder.name.slice(1)}`}
									state={
										feeder.closed
											? 'in-service'
											: 'isolated'
									}
								/>
								<span className="font-data text-label text-ink-muted">
									{feeder.name}
								</span>
							</div>
						))}
					</div>
					<figcaption className="sr-only">
						A 33/11 kV transformer feeding a busbar with three
						feeders. Feeder 2 is open.
					</figcaption>
				</figure>
			</Example>
			<Example label="On their own">
				<Breaker closed />
				<Breaker closed={false} />
				<Breaker closed state="fault" />
				<Transformer ratio="132/33 kV" />
				<div className="w-24">
					<Busbar />
				</div>
			</Example>
			<Text variant="small" tone="muted">
				Closed breakers are filled; open ones are hollow with a broken
				line below.
			</Text>
		</Demo>
	);
}
