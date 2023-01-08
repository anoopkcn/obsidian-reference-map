import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React, { useEffect, useState } from "react";
import { removeNullReferences } from "src/utils";
import { PaperList } from "./PaperList";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";
import { ViewManager } from "src/viewManager";

export const RootPaperCard = (props: {
	settings: ReferenceMapSettings;
	rootPaper: SemanticPaper;
	viewManager: ViewManager;
}) => {
	const [references, setReferences] = useState<SemanticPaper[]>([]);
	const [citations, setCitations] = useState<SemanticPaper[]>([]);
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);
	const [isButtonShown, setIsButtonShown] = useState(
		props.settings.hideButtonsOnHover ? false : true
	);
	useEffect(() => {
		if (props.rootPaper) {
			getCitations();
		}
	}, [showCitations]);

	useEffect(() => {
		if (props.rootPaper) {
			getReferences();
		}
	}, [showReferences]);

	const handleHoverButtons = (isShow: boolean) => {
		if (props.settings.hideButtonsOnHover) {
			if (showReferences || showCitations) return;
			setIsButtonShown(isShow);
		}
	};

	const getReferences = async () => {
		const references = await props.viewManager.getReferences(
			props.rootPaper.paperId
		);
		if (references) setReferences(removeNullReferences(references));
	};

	const getCitations = async () => {
		const citations = await props.viewManager.getCitations(
			props.rootPaper.paperId
		);
		if (citations) setCitations(removeNullReferences(citations));
	};

	// const rootPaper: SemanticPaper = props.rootPaper;
	// const references = props.references
	// 	? removeNullReferences(props.references)
	// 	: [];
	// const citations = props.citations
	// 	? removeNullReferences(props.citations)
	// 	: [];

	// const search_parameters = Object.keys(Object.assign({}, ...references));
	// console.log(search_parameters);

	return (
		<div
			className="orm-root-paper"
			onMouseEnter={() => handleHoverButtons(true)}
			onMouseLeave={() => handleHoverButtons(false)}
		>
			<PaperHeading paper={props.rootPaper} settings={props.settings} />
			{isButtonShown && (
				<PaperButtons
					settings={props.settings}
					paper={props.rootPaper}
					setShowReferences={setShowReferences}
					showReferences={showReferences}
					setShowCitations={setShowCitations}
					showCitations={showCitations}
					setIsButtonShown={setIsButtonShown}
					isButtonShown={isButtonShown}
				/>
			)}
			{showReferences && (
				<PaperList
					settings={props.settings}
					papers={references}
					type={"References"}
				/>
			)}
			{showCitations && (
				<PaperList
					settings={props.settings}
					papers={citations}
					type={"Citations"}
				/>
			)}
		</div>
	);
};
