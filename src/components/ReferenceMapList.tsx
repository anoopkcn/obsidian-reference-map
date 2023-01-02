import { SemanticPaper } from "src/types";
import React from "react";
import { RootReference } from "./RootReference";
import { MarkdownView } from "obsidian";

export const ReferenceMapList = (props: {
	papers: SemanticPaper[];
	view: MarkdownView | null;
}) => {
	const rootPapers: SemanticPaper[] = props.papers;
	if (!(rootPapers.length > 0)) {
		return (
			<div className="orm-no-content">
				No VALID reference ID's are found in the active document
			</div>
		);
	}

	const paperList = rootPapers.map((paper, index) => {
		return (
			<RootReference
				// file name in the key is to force a re-render when the file changes or rerender if paper id is present in multiple files
				key={paper.paperId + index + props.view?.file.name}
				rootPaper={paper}
			/>
		);
	});

	return <div>{paperList}</div>;
};
