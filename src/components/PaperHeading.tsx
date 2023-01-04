import React from "react";
import { SEMANTICSCHOLAR_URL } from "src/constants";
import { SemanticPaper } from "src/types";

export const PaperHeading = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
	const paperTitle = paper.title ? paper.title : "Unknown Title";
	const firstAuthor = paper.authors[0]
		? paper.authors[0].name
		: "Unknown Author";
	const year = paper.year ? paper.year : "Unknown Year";
	let authorID = null;
	if (paper.authors[0]) {
		authorID = paper.authors[0].authorId;
	}
	return (
		<>
			<div className="orm-paper-title-group">
				<span className="orm-paper-title">
					<a href={`${SEMANTICSCHOLAR_URL}/paper/${paper.paperId}`}>
						{" " + paperTitle + " "}
					</a>
				</span>
			</div>
			<div className="orm-paper-authors-group">
				<span className="orm-paper-authors">
					<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
						{firstAuthor + ", " + year}
					</a>
				</span>
			</div>
		</>
	);
};
