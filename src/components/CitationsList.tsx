import React from "react";
import { SemanticPaper } from "src/types";
import { PaperTitleGroup } from "./PaperTitleGroup";
import { PaperButtonGroup } from "./PaperButtonGroup";

export const CitationsList = (props: { citations: SemanticPaper[] }) => {
	const citations = props.citations;
	const referenceList = citations.map((citation, index) => {
		return (
			<div key={citation.paperId + index} className="orm-reference-paper">
				<PaperTitleGroup paper={citation} />
				<PaperButtonGroup paper={citation} />
			</div>
		);
	});
	return (
		<div className="orm-reference-list">
			<div className="orm-reference-list-title">Citations</div>
			{referenceList}
		</div>
	);
};
