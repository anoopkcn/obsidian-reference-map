import React from "react";
import { ReferenceMapSettings, SemanticPaper } from "src/types";
import { PaperCard } from "./PaperCard";
// import { SORTING_METADATA } from "src/constants";

export const ReferencesList = (props: {
	papers: SemanticPaper[];
	settings: ReferenceMapSettings;
}) => {
	const papers = props.papers;
	// let index = 0;
	// if (props.settings.sortingMetadata === SORTING_METADATA[0]) index = 0;
	// if (props.settings.sortingMetadata === SORTING_METADATA[1]) index = 1;
	// if (props.settings.sortingMetadata === SORTING_METADATA[2]) index = 2;
	// if (props.settings.sortingMetadata === SORTING_METADATA[3]) index = 3;

	// papers = props.papers.sort((a, b) => {
	// 	return b[SORTING_METADATA[index]] - a[SORTING_METADATA[index]];
	// });
	// if (props.settings.sortingOrder === "asc") {
	// 	papers = papers.reverse();
	// }
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
