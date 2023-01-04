import React from "react";
import { ReferenceMapSettings, SemanticPaper } from "src/types";
import { PaperCard } from "./PaperCard";

export const ReferencesList = (props: {
	papers: SemanticPaper[];
	settings: ReferenceMapSettings;
}) => {
	const papers = props.papers;
	const paperList = papers.map((paper, index) => {
		return (
			<PaperCard
				key={paper.paperId + index}
				paper={paper}
				settings={props.settings}
			/>
		);
	});
	return <div className="orm-paper-list">{paperList}</div>;
};
