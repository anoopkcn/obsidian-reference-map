import { SemanticPaper } from "src/types";
import React from "react";
import { RootReference } from "./RootReference";

export const ReferenceMapList = (props: Record<string, SemanticPaper[]>) => {
	const rootPapers: SemanticPaper[] = props.papers;
	if (!(rootPapers.length > 0)) {
		return (
			<div className="orm-no-content">
				No VALID reference ID's are found in the active document
			</div>
		);
	}

	const paperList = rootPapers.map((paper) => {
		return <RootReference key={paper.paperId} rootPaper={paper} />;
	});

	return <div>{paperList}</div>;
};
