import { IndexPaper, ReferenceMapSettings, SemanticPaper } from "src/types";
import React, { useEffect, useState } from "react";
import { isEmpty, makeMetaData, templateReplace } from "src/utils";
import { PaperList } from "./PaperList";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";
import { ViewManager } from "src/viewManager";
import { LoadingPuff } from "./LoadingPuff";
import { METADATA_COPY_TEMPLATE_ONE, METADATA_COPY_TEMPLATE_THREE, METADATA_COPY_TEMPLATE_TWO } from "src/constants";

export const IndexPaperCard = (props: {
	className?: string;
	settings: ReferenceMapSettings;
	rootPaper: IndexPaper;
	viewManager: ViewManager;
}) => {
	const [references, setReferences] = useState<SemanticPaper[]>([]);
	const [citations, setCitations] = useState<SemanticPaper[]>([]);
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);
	const [isButtonShown, setIsButtonShown] = useState(!props.settings.hideButtonsOnHover);
	const [isReferenceLoading, setIsReferenceLoading] = useState(false);
	const [isCitationLoading, setIsCitationLoading] = useState(false);

	useEffect(() => {
		if (!isEmpty(props.rootPaper.paper)) {
			getCitations();
			getReferences();
		}
	}, []);

	useEffect(() => {
		setIsButtonShown(!props.settings.hideButtonsOnHover);
	}, [props.settings.hideButtonsOnHover]);

	const handleHoverButtons = (isShow: boolean) => {
		if (props.settings.hideButtonsOnHover) {
			if (showReferences || showCitations) return;
			setIsButtonShown(isShow);
		} else {
			setIsButtonShown(true);
		}
	};

	const getReferences = async () => {
		setIsReferenceLoading(true);
		const references = await props.viewManager.getReferences(
			props.rootPaper.paper.paperId
		);
		if (references) setReferences(references)
		setIsReferenceLoading(false);
	};

	const getCitations = async () => {
		setIsCitationLoading(true);
		const citations = await props.viewManager.getCitations(
			props.rootPaper.paper.paperId
		);
		if (citations) setCitations(citations)
		setIsCitationLoading(false);
	};

	const metadataTemplateOne = props.settings.formatMetadataCopyOne
		? props.settings.metadataCopyTemplateOne
		: METADATA_COPY_TEMPLATE_ONE;

	const metadataTemplateTwo = props.settings.formatMetadataCopyTwo
		? props.settings.metadataCopyTemplateTwo
		: METADATA_COPY_TEMPLATE_TWO;

	const metadataTemplateThree = props.settings.formatMetadataCopyThree
		? props.settings.metadataCopyTemplateThree
		: METADATA_COPY_TEMPLATE_THREE;

	let batchCopyMetadataOne = "";
	let batchCopyMetadataTwo = "";
	let batchCopyMetadataThree = "";
	if (references && props.settings.metadataCopyOneBatch) {
		references.forEach((paper) => {
			const metaData = makeMetaData(paper);
			batchCopyMetadataOne +=
				templateReplace(metadataTemplateOne, metaData) + "\n";
		});
	}
	if (references && props.settings.metadataCopyTwoBatch) {
		references.forEach((paper) => {
			const metaData = makeMetaData(paper);
			batchCopyMetadataTwo +=
				templateReplace(metadataTemplateTwo, metaData) + "\n";
		});
	}

	if (references && props.settings.metadataCopyThreeBatch) {
		references.forEach((paper) => {
			const metaData = makeMetaData(paper);
			batchCopyMetadataThree +=
				templateReplace(metadataTemplateThree, metaData) + "\n";
		});
	}

	return (
		<div
			className={`orm-root-paper ${props.className}`}
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
					batchCopyMetadataTwo={batchCopyMetadataTwo}
					batchCopyMetadataOne={batchCopyMetadataOne}
					batchCopyMetadataThree={batchCopyMetadataThree}
				/>
			)}
			{(isCitationLoading || isReferenceLoading) && (
				<div className="orm-loading">
					<LoadingPuff />
				</div>
			)}
			{showReferences && (
				<>
					<PaperList
						settings={props.settings}
						papers={references}
						type={"References"}
					/>
				</>
			)}
			{showCitations && (
				<>
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
