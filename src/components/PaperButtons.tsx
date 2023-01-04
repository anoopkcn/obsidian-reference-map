import React from "react";
import { FiPaperclip, FiSlash } from "react-icons/fi";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { ReferenceMapSettings, SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";
import styled from "styled-components";

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

const ButtonR = styled.div`
	${(props: { showReferences: boolean }) =>
		props.showReferences &&
		`
		font-weight: bold;
	`}
`;

const ButtonC = styled.div`
	border: 1px solid transparent;
	${(props: { showCitations: boolean }) =>
		props.showCitations &&
		`
		font-weight: bold;
	`}
`;

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
	const firstAuthor = paper.authors[0]?.name
		? paper.authors[0].name
		: "Unknown Author";
	const year = paper.year ? paper.year : "Unknown Year";
	const abstract = paper.abstract ? paper.abstract : "No abstract available";
	const bibTex = paper.citationStyles.bibtex
		? paper.citationStyles.bibtex
		: "No BibTex available";
	const influentialCount = paper.influentialCitationCount
		? paper.influentialCitationCount.toString()
		: "0";
	let openAccessPdfUrl = "";
	if (paper.isOpenAccess) {
		openAccessPdfUrl = paper.openAccessPdf.url
			? paper.openAccessPdf.url
			: "";
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
				<ButtonR showReferences={showReferences}>
					<div
						className="orm-references"
						onClick={() => handleShowReferencesClick()}
					>
						{paper.referenceCount.toString()}
					</div>
				</ButtonR>
				<ButtonC showCitations={showCitations}>
					<div
						className="orm-citations"
						onClick={() => handleShowCitationsClick()}
					>
						{paper.citationCount.toString()}
					</div>
				</ButtonC>
			</>
		);
	} else {
		citingCited = (
			<>
				<div className="orm-references-2">
					{paper.referenceCount.toString()}
				</div>
				<div className="orm-citations-2">
					{paper.citationCount.toString()}
				</div>
			</>
		);
	}
	return (
		<div className="orm-paper-buttons">
			<div
				className="orm-copy-bibtex"
				onClick={() => {
					copyElToClipboard(bibTex);
				}}
			>
				<IoMdClipboard size={16} />
			</div>
			<div
				className="orm-copy-metadata"
				onClick={() => {
					copyElToClipboard(
						`${paperTitle}, ${firstAuthor}, ${year}\n${abstract}`
					);
				}}
			>
				<FiPaperclip size={15} />
			</div>
			<div className="orm-openaccess">
				{paper.isOpenAccess ? (
					<a href={`${openAccessPdfUrl}`}>
						<SiOpenaccess size={15} />
					</a>
				) : (
					<FiSlash size={15} />
				)}
			</div>
			{citingCited}
			{settings.influentialCount && (
				<div className="orm-influential">{influentialCount}</div>
			)}
		</div>
	);
};
