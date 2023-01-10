import React from "react";
import { FiPaperclip, FiClipboard } from "react-icons/fi";
import { SiOpenaccess } from "react-icons/si";
import { BsClipboardData } from "react-icons/bs";
import {
	METADATA_COPY_TEMPLATE_ONE,
	METADATA_COPY_TEMPLATE_TWO,
} from "src/constants";
import { ReferenceMapSettings, SemanticPaper } from "src/types";
import { copyElToClipboard, templateReplace } from "src/utils";

type Props = {
	settings: ReferenceMapSettings;
	paper: SemanticPaper;
	setShowReferences?: React.Dispatch<React.SetStateAction<boolean>>;
	showReferences?: boolean;
	setShowCitations?: React.Dispatch<React.SetStateAction<boolean>>;
	showCitations?: boolean;
	setIsButtonShown?: React.Dispatch<React.SetStateAction<boolean>>;
	isButtonShown?: boolean;
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
}: Props) => {
	const paperTitle = paper.title ? paper.title : "Unknown Title";
	let authors = "Unknown Authors";
	let author = "Unknown Author";
	if (paper.authors.length > 0)
		author = paper.authors[0].name
			? paper.authors[0].name
			: "Unknown Author";
	authors = paper.authors.map((author) => author.name).join(", ");
	const year = paper.year ? paper.year.toString() : "Unknown Year";
	const abstract = paper.abstract ? paper.abstract : "No abstract available";
	const bibTex = paper.citationStyles?.bibtex
		? paper.citationStyles.bibtex
		: "No BibTex available";
	const referenceCount = paper.referenceCount
		? paper.referenceCount.toString()
		: "0";
	const citationCount = paper.citationCount
		? paper.citationCount.toString()
		: "0";
	const influentialCount = paper.influentialCitationCount
		? paper.influentialCitationCount.toString()
		: "0";
	let openAccessPdfUrl = "";
	if (paper.isOpenAccess) {
		openAccessPdfUrl = paper.openAccessPdf?.url
			? paper.openAccessPdf.url
			: "";
	}
	const paperURL = paper.url ? paper.url : "Unknown URL";
	const doi = paper.externalIds?.DOI ? paper.externalIds.DOI : "Unknown DOI";

	const metadataTemplateOne = settings.formatMetadataCopyOne
		? settings.metadataCopyTemplateOne
		: METADATA_COPY_TEMPLATE_ONE;

	const metadataTemplateTwo = settings.formatMetadataCopyTwo
		? settings.metadataCopyTemplateTwo
		: METADATA_COPY_TEMPLATE_TWO;

	const metadataTemplateThree = settings.formatMetadataCopyThree
		? settings.metadataCopyTemplateThree
		: METADATA_COPY_TEMPLATE_TWO;

	const metaData = {
		bibtex: bibTex,
		title: paperTitle,
		author: author,
		authors: authors,
		year: year,
		abstract: abstract,
		url: paperURL,
		pdfurl: openAccessPdfUrl,
		doi: doi,
	};

	const copyMetadataOne = templateReplace(metadataTemplateOne, metaData);
	const copyMetadataTwo = templateReplace(metadataTemplateTwo, metaData);
	const copyMetadataThree = templateReplace(metadataTemplateThree, metaData);

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
					{referenceCount}
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
					{citationCount}
				</div>
			</>
		);
	} else {
		citingCited = (
			<>
				<div className="orm-references-2">{referenceCount}</div>
				<div className="orm-citations-2">{citationCount}</div>
			</>
		);
	}

	return (
		<div className="orm-paper-buttons">
			<div
				className="orm-copy-metadata-one"
				onClick={() => {
					copyElToClipboard(copyMetadataOne);
				}}
			>
				<FiClipboard size={16} />
			</div>
			<div
				className="orm-copy-metadata-two"
				onClick={() => {
					copyElToClipboard(copyMetadataTwo);
				}}
			>
				<FiPaperclip size={15} />
			</div>
			<div
				className="orm-copy-metadata-three"
				onClick={() => {
					copyElToClipboard(copyMetadataThree);
				}}
			>
				<BsClipboardData size={15} />
			</div>
			{paper.isOpenAccess ? (
				<div className="orm-openaccess">
					<a href={`${openAccessPdfUrl}`}>
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
				<div className="orm-influential">{influentialCount}</div>
			)}
		</div>
	);
};
