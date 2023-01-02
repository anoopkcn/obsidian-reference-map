import { SemanticPaper } from "src/types";
import React from "react";
import { copyElToClipboard } from "src/utils";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { FiSlash } from "react-icons/fi";

export const RootReferenceList = (props: Record<string, SemanticPaper[]>) => {
	const rootPapers: SemanticPaper[] = props.papers;
	if (!(rootPapers.length > 0)) {
		return (
			<div className="orm-no-content">
				No VALID reference ID's are found in the active document
			</div>
		);
	}

	const paperList = rootPapers.map((paper, paperIndex) => {
		return (
			<div key={paperIndex} className="orm-root-paper">
				<div className="orm-paper-title">{paper.title}</div>
				<div className="orm-paper-authors">
					{paper.authors[0].name + ", " + paper.year}
				</div>
				<div className="orm-paper-buttons">
					<div
						className="orm-copy-bibtex"
						onClick={() => {
							copyElToClipboard(paper.citationStyles.bibtex);
						}}
					>
						<IoMdClipboard size={17} />
					</div>
					<div className="orm-copy-bibtex">
						{paper.isOpenAccess ? (
							<SiOpenaccess size={16} />
						) : (
							<FiSlash size={16} />
						)}
					</div>
					<div className="orm-copy-bibtex">
						{paper.referenceCount.toString()}
					</div>
					<div className="orm-copy-bibtex">
						{paper.citationCount.toString()}
					</div>
					<div className="orm-copy-bibtex">
						{paper.influentialCitationCount.toString()}
					</div>
				</div>
			</div>
		);
	});

	return <div>{paperList}</div>;
};
