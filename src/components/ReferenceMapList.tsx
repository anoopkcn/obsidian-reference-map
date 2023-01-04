import { SemanticPaper } from "src/types";
import React from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";

export const ReferenceMapList = (props: {
	papers: SemanticPaper[];
	references: SemanticPaper[][];
	citations: SemanticPaper[][];
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
			<RootPaperCard
				// file name in the key is to force a re-render when the file changes or rerender if paper id is present in multiple files
				key={paper.paperId + index + props.view?.file.name}
				rootPaper={paper}
				references={props.references[index]}
				citations={props.citations[index]}
			/>
		);
	});

	return <div className="orm-reference-map">{paperList}</div>;
};
