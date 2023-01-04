import { SemanticPaper } from "src/types";
import React, { useState } from "react";
import { removeNullReferences } from "src/utils";
import { ReferencesList } from "./PaperList";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";

export const RootPaperCard = (props: {
	key: string;
	rootPaper: SemanticPaper;
	references: SemanticPaper[];
	citations: SemanticPaper[];
}) => {
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);
	const [isButtonShown, setIsButtonShown] = useState(false);

	const references = removeNullReferences(props.references);
	const citations = removeNullReferences(props.citations);

	const rootPaper: SemanticPaper = props.rootPaper;

	return (
		<div
			className="orm-root-paper"
			onMouseEnter={() => setIsButtonShown(true)}
			onMouseLeave={() => {
				showReferences || showCitations
					? null
					: setIsButtonShown(false);
			}}
		>
			<PaperHeading paper={rootPaper} />
			{isButtonShown && (
				<PaperButtons
					paper={rootPaper}
					setShowReferences={setShowReferences}
					showReferences={showReferences}
					setShowCitations={setShowCitations}
					showCitations={showCitations}
					setIsButtonShown={setIsButtonShown}
					isButtonShown={isButtonShown}
				/>
			)}
			{showReferences && <ReferencesList papers={references} />}
			{showCitations && <ReferencesList papers={citations} />}
		</div>
	);
};
