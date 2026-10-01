import {
	Blockquote,
	Button,
	Code,
	CodeBlock,
	Heading,
	Link,
	Prose,
	Text,
} from '@fhudson/ui';
import { useState } from 'react';
import { Demo, Example } from './Demo';

export function TypeAndActions() {
	const [presses, setPresses] = useState(0);

	return (
		<>
			<Demo
				name="Heading"
				summary="Titles for pages and sections. Level sets structure; size can differ."
			>
				<div className="flex flex-col gap-4">
					<Heading level={1}>Grid code</Heading>
					<Heading level={2}>Connections</Heading>
					<Heading level={3}>
						Long-term development statements
					</Heading>
					<Heading level={4}>Network models</Heading>
				</div>
			</Demo>

			<Demo name="Text" summary="Body copy and its variants.">
				<div className="flex max-w-[60ch] flex-col gap-3">
					<Text variant="lead">
						The electricity system’s data, explained by a software
						engineer.
					</Text>
					<Text>
						A long-term development statement lists every circuit a
						distribution network operator plans to run over the next
						five years.
					</Text>
					<Text variant="ui">Interface text sits at 15px.</Text>
					<Text variant="small" tone="muted">
						Secondary text, for notes and dates.
					</Text>
					<Text variant="label">Label · metadata</Text>
				</div>
			</Demo>

			<Demo name="Code" summary="Inline code and code blocks.">
				<Text>
					Each LTDS circuit has a <Code>circuitId</Code> that should
					be stable between releases.
				</Text>
				<CodeBlock language="TypeScript">{`const circuits = await loadLtds('NPg', '2026-Q3');
console.log(circuits.length); // 4812`}</CodeBlock>
			</Demo>

			<Demo
				name="Blockquote"
				summary="A quotation, with optional attribution."
			>
				<Blockquote attribution="Albert Camus">
					The struggle itself toward the heights is enough to fill a
					man’s heart. One must imagine Sisyphus happy.
				</Blockquote>
			</Demo>

			<Demo
				name="Prose"
				summary="Styles rendered Markdown without mapping each element."
			>
				<Prose>
					<h2>What is CIM?</h2>
					<p>
						The Common Information Model is a shared vocabulary for
						describing power networks. It lets one company’s{' '}
						<a href="#prose">network model</a> load into another
						company’s software.
					</p>
					<ul>
						<li>Equipment: lines, transformers, breakers</li>
						<li>Topology: how they connect</li>
						<li>
							Measurements: what’s flowing, in <code>MW</code> and{' '}
							<code>kV</code>
						</li>
					</ul>
					<blockquote>
						Nobody writes about the grid’s data layer.
					</blockquote>
				</Prose>
			</Demo>

			<Demo
				name="Button"
				summary="Starts an action. Built on React Aria."
			>
				<Example label="Variants">
					<Button
						onPress={() => {
							setPresses((n) => n + 1);
						}}
					>
						Subscribe
					</Button>
					<Button variant="ghost">View archive</Button>
					<Button variant="quiet">Cancel</Button>
				</Example>
				<Example label="Small and disabled">
					<Button size="sm">Refresh</Button>
					<Button size="sm" variant="ghost">
						Export
					</Button>
					<Button isDisabled>Disabled</Button>
				</Example>
				<Text variant="small" tone="muted" aria-live="polite">
					Subscribe pressed {presses}{' '}
					{presses === 1 ? 'time' : 'times'}.
				</Text>
			</Demo>

			<Demo
				name="Link"
				summary="Goes somewhere. Internal links use the router."
			>
				<Example label="Inline">
					<Text>
						Read the <Link href="/vault">Vault</Link>, or{' '}
						<Link href="https://finlayhu.substack.com">
							Boundary Node
						</Link>
						.
					</Text>
				</Example>
				<Example label="Standalone and button">
					<Link variant="standalone" href="/projects">
						All projects →
					</Link>
					<Link variant="button" href="/vault">
						Read the vault
					</Link>
					<Link
						variant="button"
						buttonVariant="ghost"
						href="/new-tab"
					>
						New tab
					</Link>
				</Example>
			</Demo>
		</>
	);
}
