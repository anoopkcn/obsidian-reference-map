import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";
import { ViewManager } from "src/viewManager";

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	papers: SemanticPaper[];
	view: MarkdownView | null;
	viewManager: ViewManager;
}) => {
	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					No Active Markdown File
				</div>
			</div>
		);
	} else if (props.papers.length <= 0) {
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
				viewManager={props.viewManager}
			/>
		);
	});

	return <div className="orm-reference-map">{paperList}</div>;
};
