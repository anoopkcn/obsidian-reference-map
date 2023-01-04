import React from "react";
import { FiPaperclip, FiSlash } from "react-icons/fi";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";

export const PaperButtonGroup = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
	const paperTitle = paper.title ? paper.title : "Unknown Title";
	const firstAuthor = paper.authors[0]?.name
		? paper.authors[0].name
		: "Unknown Author";
	const year = paper.year ? paper.year : "Unknown Year";
	const abstract = paper.abstract ? paper.abstract : "No abstract available";
	const bibTex = paper.citationStyles.bibtex
		? paper.citationStyles.bibtex
		: "No BibTex available";
	let openAccessPdfUrl = "";
	if (paper.isOpenAccess) {
		openAccessPdfUrl = paper.openAccessPdf.url
			? paper.openAccessPdf.url
			: "";
	}
	return (
		<div className="orm-paper-buttons">
			<div
				className="orm-copy-bibtex"
				onClick={() => {
					copyElToClipboard(bibTex);
				}}
			>
				<IoMdClipboard size={17} />
			</div>
			<div
				className="orm-copy-metadata"
				onClick={() => {
					copyElToClipboard(
						`${paperTitle}, ${firstAuthor}, ${year}\n${abstract}`
					);
				}}
			>
				<FiPaperclip size={16} />
			</div>
			<div className="orm-openaccess">
				{paper.isOpenAccess ? (
					<a href={`${openAccessPdfUrl}`}>
						<SiOpenaccess size={16} />
					</a>
				) : (
					<FiSlash size={16} />
				)}
			</div>
			<div className="orm-references-2">
				{paper.referenceCount.toString()}
			</div>
			<div className="orm-citations-2">
				{paper.citationCount.toString()}
			</div>
			{/* <div className="orm-influential-citations">
				{paper.influentialCitationCount.toString()}
			</div> */}
		</div>
	);
};
