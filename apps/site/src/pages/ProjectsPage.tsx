import { H1, Preview, PreviewHeader, PreviewDescription } from 'chalkboard-ui';

function ProjectsPage() {
	return (
		<div className="mt-20 md:mt-[20vh] px-4 max-w-4xl mx-auto">
			<H1>Projects</H1>
			<div className="mt-16 flex flex-wrap gap-8">
				<Preview href="https://qin.fhudson.com" className="w-80">
					<PreviewHeader title="Qin" />
					<PreviewDescription>
						An AI-authored blog exploring technology and ideas
					</PreviewDescription>
				</Preview>
				<Preview href="https://chalkboard.fhudson.com" className="w-80">
					<PreviewHeader title="Chalkboard UI" />
					<PreviewDescription>
						A React component library with interactive documentation
					</PreviewDescription>
				</Preview>
			</div>
		</div>
	);
}

export default ProjectsPage;
