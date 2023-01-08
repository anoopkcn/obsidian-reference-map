import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React, { useEffect, useState } from "react";
import { removeNullReferences } from "src/utils";
import { PaperList } from "./PaperList";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";
import { ViewManager } from "src/viewManager";
import { LoadingPuff } from "./LoadingPuff";

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
	const [isReferenceLoading, setIsReferenceLoading] = useState(false);
	const [isCitationLoading, setIsCitationLoading] = useState(false);

	useEffect(() => {
		if (props.rootPaper) {
			getCitations();
			getReferences();
		}
	}, []);

	const handleHoverButtons = (isShow: boolean) => {
		if (props.settings.hideButtonsOnHover) {
			if (showReferences || showCitations) return;
			setIsButtonShown(isShow);
		}
	};

	const getReferences = async () => {
		setIsReferenceLoading(true);
		const references = await props.viewManager.getReferences(
			props.rootPaper.paperId
		);
		if (references) setReferences(removeNullReferences(references));
		setIsReferenceLoading(false);
	};

	const getCitations = async () => {
		setIsCitationLoading(true);
		const citations = await props.viewManager.getCitations(
			props.rootPaper.paperId
		);
		if (citations) setCitations(removeNullReferences(citations));
		setIsCitationLoading(false);
	};

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
				<>
					{isReferenceLoading && (
						<div className="orm-loading">
							<LoadingPuff />
						</div>
					)}
					<PaperList
						settings={props.settings}
						papers={references}
						type={"References"}
					/>
				</>
			)}
			{showCitations && (
				<>
					{isCitationLoading && (
						<div className="orm-loading">
							<LoadingPuff />
						</div>
					)}
					<PaperList
						settings={props.settings}
						papers={citations}
						type={"Citations"}
					/>
				</>
			)}
		</div>
	);
};
