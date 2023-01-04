import { SemanticPaper } from "src/types";
import React, { useState } from "react";
import { removeNullReferences } from "src/utils";
import { ReferencesList } from "./ReferencesList";
import { PaperTitleGroup } from "./PaperTitleGroup";
import { CitationsList } from "./CitationsList";
import { PaperButtonGroup } from "./PaperButtonGroup";

export const RootReference = (props: {
	key: string;
	rootPaper: SemanticPaper;
	references: SemanticPaper[];
	citations: SemanticPaper[];
}) => {
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);

	const references = removeNullReferences(props.references);
	const citations = removeNullReferences(props.citations);

	const rootPaper: SemanticPaper = props.rootPaper;

	return (
		<div className="orm-root-paper">
			<PaperTitleGroup paper={rootPaper} />
			<PaperButtonGroup
				paper={rootPaper}
				setShowReferences={setShowReferences}
				showReferences={showReferences}
				setShowCitations={setShowCitations}
				showCitations={showCitations}
			/>
			{showReferences && <ReferencesList references={references} />}
			{showCitations && <CitationsList citations={citations} />}
		</div>
	);
};
