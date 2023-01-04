import React from "react";
import { SemanticPaper } from "src/types";
import { PaperCard } from "./PaperCard";

export const ReferencesList = (props: { papers: SemanticPaper[] }) => {
	const papers = props.papers;
	const paperList = papers.map((paper, index) => {
		return <PaperCard key={paper.paperId + index} paper={paper} />;
	});
	return <div className="orm-paper-list">{paperList}</div>;
};
