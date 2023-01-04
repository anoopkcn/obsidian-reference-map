import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React, { useState } from "react";
import { removeNullReferences } from "src/utils";
import { ReferencesList } from "./PaperList";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";

export const RootPaperCard = (props: {
	settings: ReferenceMapSettings;
	rootPaper: SemanticPaper;
	references: SemanticPaper[];
	citations: SemanticPaper[];
}) => {
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);
	const [isButtonShown, setIsButtonShown] = useState(
		props.settings.hideButtonsOnHover ? false : true
	);
	const handleHoverButtons = (isShow: boolean) => {
		if (props.settings.hideButtonsOnHover) {
			if (showReferences || showCitations) return;
			setIsButtonShown(isShow);
		}
	};

	const rootPaper: SemanticPaper = props.rootPaper;
	const references = removeNullReferences(props.references);
	const citations = removeNullReferences(props.citations);

	return (
		<div
			className="orm-root-paper"
			onMouseEnter={() => handleHoverButtons(true)}
			onMouseLeave={() => handleHoverButtons(false)}
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
			{showReferences && (
				<ReferencesList settings={props.settings} papers={references} />
			)}
			{showCitations && (
				<ReferencesList settings={props.settings} papers={citations} />
			)}
		</div>
	);
};
