import React from "react";
import { SemanticPaper } from "src/types";
import { PaperTitleGroup } from "./PaperTitleGroup";
import { PaperButtonGroup } from "./PaperButtonGroup";

export const ReferencesList = (props: { references: SemanticPaper[] }) => {
	const references = props.references;
	const referenceList = references.map((reference, index) => {
		return (
			<div
				key={reference.paperId + index}
				className="orm-reference-paper"
			>
				<PaperTitleGroup paper={reference} />
				<PaperButtonGroup paper={reference} />
			</div>
		);
	});
	return (
		<div className="orm-reference-list">
			<div className="orm-reference-list-title">References</div>
			{referenceList}
		</div>
	);
};
