import React from "react";
import { FiPaperclip, FiSlash } from "react-icons/fi";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";

export const PaperButtonGroup = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
	let abstract = "";
	if (paper.abstract) abstract = paper.abstract;
	return (
		<div className="orm-paper-buttons">
			<div
				className="orm-copy-bibtex"
				onClick={() => {
					copyElToClipboard(paper.citationStyles.bibtex);
				}}
			>
				<IoMdClipboard size={17} />
			</div>
			<div
				className="orm-copy-metadata"
				onClick={() => {
					copyElToClipboard(
						paper.title +
							", " +
							paper.authors[0].name +
							", " +
							paper.year +
							"\n" +
							abstract
					);
				}}
			>
				<FiPaperclip size={16} />
			</div>
			<div className="orm-openaccess">
				{paper.isOpenAccess ? (
					<a href={`${paper.openAccessPdf.url}`}>
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
