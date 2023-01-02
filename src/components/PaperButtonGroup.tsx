import React from "react";
import { FiSlash } from "react-icons/fi";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";

export const PaperButtonGroup = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
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
			<div className="orm-openaccess">
				{paper.isOpenAccess ? (
					<a href={`${paper.openAccessPdf.url}`}>
						<SiOpenaccess size={16} />
					</a>
				) : (
					<FiSlash size={16} />
				)}
			</div>
			<div className="orm-references">
				{paper.referenceCount.toString()}
			</div>
			<div className="orm-citations">
				{paper.citationCount.toString()}
			</div>
			<div className="orm-influential-citations">
				{paper.influentialCitationCount.toString()}
			</div>
		</div>
	);
};
