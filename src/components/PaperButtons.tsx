import React from "react";
import { FiPaperclip, FiClipboard } from "react-icons/fi";
import { SiOpenaccess } from "react-icons/si";
import { BsClipboardData } from "react-icons/bs";
import {
	METADATA_COPY_TEMPLATE_ONE,
	METADATA_COPY_TEMPLATE_THREE,
	METADATA_COPY_TEMPLATE_TWO,
} from "src/constants";
import { IndexPaper, ReferenceMapSettings } from "src/types";
import { copyElToClipboard, makeMetaData, standardizeBibtex, templateReplace } from "src/utils";

type Props = {
	settings: ReferenceMapSettings;
	paper: IndexPaper;
	setShowReferences?: React.Dispatch<React.SetStateAction<boolean>>;
	showReferences?: boolean;
	setShowCitations?: React.Dispatch<React.SetStateAction<boolean>>;
	showCitations?: boolean;
	setIsButtonShown?: React.Dispatch<React.SetStateAction<boolean>>;
	isButtonShown?: boolean;
	batchCopyMetadataOne?: string;
	batchCopyMetadataTwo?: string;
	batchCopyMetadataThree?: string;

};

export const PaperButtons = ({
	settings,
	paper,
	setShowReferences = undefined,
	showReferences = false,
	setShowCitations = undefined,
	showCitations = false,
	setIsButtonShown = undefined,
	isButtonShown = false,
	batchCopyMetadataOne = "",
	batchCopyMetadataTwo = "",
	batchCopyMetadataThree = "",
}: Props) => {
	const metadataTemplateOne = settings.formatMetadataCopyOne
		? settings.metadataCopyTemplateOne
		: METADATA_COPY_TEMPLATE_ONE;

	const metadataTemplateTwo = settings.formatMetadataCopyTwo
		? settings.metadataCopyTemplateTwo
		: METADATA_COPY_TEMPLATE_TWO;

	const metadataTemplateThree = settings.formatMetadataCopyThree
		? settings.metadataCopyTemplateThree
		: METADATA_COPY_TEMPLATE_THREE;

	const metaData = makeMetaData(paper.paper);
	settings.standardizeBibtex ? metaData.bibtex = standardizeBibtex(metaData.bibtex) : metaData.bibtex
	let copyMetadataOne = "";
	let copyMetadataTwo = "";
	let copyMetadataThree = "";
	if (settings.formatMetadataCopyOne) {
		(settings.metadataCopyOneBatch && batchCopyMetadataOne)
			? copyMetadataOne = batchCopyMetadataOne
			: copyMetadataOne = templateReplace(metadataTemplateOne, metaData, paper.id)
	}
	if (settings.formatMetadataCopyTwo) {
		(settings.metadataCopyTwoBatch && batchCopyMetadataTwo)
			? copyMetadataTwo = batchCopyMetadataTwo
			: copyMetadataTwo = templateReplace(metadataTemplateTwo, metaData, paper.id)
	}
	if (settings.formatMetadataCopyThree) {
		(settings.metadataCopyThreeBatch && batchCopyMetadataThree)
			? copyMetadataThree = batchCopyMetadataThree
			: copyMetadataThree = templateReplace(metadataTemplateThree, metaData, paper.id)
	}

	let citingCited = null;
	if (
		setShowReferences !== undefined &&
		setShowCitations !== undefined &&
		setIsButtonShown !== undefined
	) {
		const handleShowReferencesClick = () => {
			setShowReferences(!showReferences);
			setShowCitations(false);
			if (showReferences || showCitations) {
				setIsButtonShown(true);
			}
		};

		const handleShowCitationsClick = () => {
			setShowCitations(!showCitations);
			setShowReferences(false);
			if (showReferences || showCitations) {
				setIsButtonShown(true);
			}
		};
		citingCited = (
			<>
				<div
					className="orm-references"
					style={
						showReferences
							? {
								fontWeight: "bold",
								color: "var(--text-accent)",
								// eslint-disable-next-line no-mixed-spaces-and-tabs
							}
							: {}
					}
					onClick={() => handleShowReferencesClick()}
				>
					{metaData.referenceCount}
				</div>
				<div
					className="orm-citations"
					style={
						showCitations
							? {
								fontWeight: "bold",
								color: "var(--text-accent)",
								// eslint-disable-next-line no-mixed-spaces-and-tabs
							}
							: {}
					}
					onClick={() => handleShowCitationsClick()}
				>
					{metaData.citationCount}
				</div>
			</>
		);
	} else {
		citingCited = (
			<>
				<div className="orm-references-2">
					{metaData.referenceCount}
				</div>
				<div className="orm-citations-2">{metaData.citationCount}</div>
			</>
		);
	}

	return (
		<div className="orm-paper-buttons">
			{settings.formatMetadataCopyOne && (
				<div
					className="orm-copy-metadata-one"
					onClick={() => {
						copyElToClipboard(copyMetadataOne);
					}}
				>
					<FiClipboard size={16} />
				</div>
			)}
			{settings.formatMetadataCopyTwo && (
				<div
					className="orm-copy-metadata-two"
					onClick={() => {
						copyElToClipboard(copyMetadataTwo);
					}}
				>
					<FiPaperclip size={15} />
				</div>
			)}
			{settings.formatMetadataCopyThree && (
				<div
					className="orm-copy-metadata-three"
					onClick={() => {
						copyElToClipboard(copyMetadataThree);
					}}
				>
					<BsClipboardData size={15} />
				</div>
			)}
			{paper.paper?.isOpenAccess ? (
				<div className="orm-openaccess">
					<a href={`${metaData.pdfurl}`}>
						<SiOpenaccess size={15} />
					</a>
				</div>
			) : (
				<div className="orm-button-disable">
					<SiOpenaccess size={15} />
				</div>
			)}
			{citingCited}
			{settings.influentialCount && (
				<div className="orm-influential">
					{metaData.influentialCount}
				</div>
			)}
		</div>
	);
};
