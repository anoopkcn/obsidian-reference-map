import React from "react";
import { SemanticPaper } from "src/types";
// import { RefManager } from "src/refManager";

export const ReferencesList = (props: { references: SemanticPaper[] }) => {
	const references = props.references;
	const referenceList = references.map((reference) => {
		return <div key={reference.paperId}>{reference.title}</div>;
	});
	return (
		<div className="orm-reference-list">
			<div className="orm-reference-list-title">References</div>
			{referenceList}
		</div>
	);
};
