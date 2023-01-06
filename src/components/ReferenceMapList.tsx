import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	papers: SemanticPaper[];
	references: SemanticPaper[][];
	citations: SemanticPaper[][];
	view: MarkdownView | null;
}) => {
	const [isLoaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		setLoaded(false);
		if (props.papers.length > 0) {
			setLoaded(true);
		}
	}, [props.papers.length, props.view?.file.name]);

	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					Active pane is not a markdown file
				</div>
			</div>
		);
	} else if (!isLoaded) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					...
				</div>
			</div>
		);
	}

	const paperList = props.papers.map((paper, index) => {
		return (
			<RootPaperCard
				// file name in the key is to force a re-render when the file changes ..
				//.. or rerender if paper id is present in multiple files
				settings={props.settings}
				key={paper.paperId + index + props.view?.file.name}
				rootPaper={paper}
				references={props.references[index]}
				citations={props.citations[index]}
			/>
		);
	});

	return <div className="orm-reference-map">{paperList}</div>;
};
