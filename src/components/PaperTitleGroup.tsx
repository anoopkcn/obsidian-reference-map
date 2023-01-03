import React from "react";
import { SEMANTICSCHOLAR_URL } from "src/constants";
import { SemanticPaper } from "src/types";

export const PaperTitleGroup = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
	return (
		<>
			<div className="orm-paper-title-group">
				<span className="orm-paper-title">
					<a href={`${SEMANTICSCHOLAR_URL}/paper/${paper.paperId}`}>
						{" " + paper.title + " "}
					</a>
				</span>
				{/* <span className="orm-external-link">
					<RiExternalLinkFill size={14} />
				</span> */}
			</div>
			<div className="orm-paper-authors-group">
				<span className="orm-paper-authors">
					<a
						href={`${SEMANTICSCHOLAR_URL}/author/${paper.authors[0].authorId}`}
					>
						{paper.authors[0].name + ", " + paper.year + " "}
					</a>
				</span>
			</div>
		</>
	);
};
