import React from "react";
import { SEMANTICSCHOLAR_URL } from "src/constants";
import { ReferenceMapSettings, SemanticPaper } from "src/types";

export const PaperHeading = (props: {
	paper: SemanticPaper;
	settings: ReferenceMapSettings;
}) => {
	const paper: SemanticPaper = props.paper;
	const paperTitle = paper.title ? paper.title : "Unknown Title";
	const firstAuthor = paper.authors[0]
		? paper.authors[0].name
		: "Unknown Author";
	let authors = "";
	if (paper.authors.length > 0)
		authors = paper.authors.map((author) => author.name).join(", ");
	const year = paper.year ? paper.year : "Unknown Year";
	let authorID = null;
	if (paper.authors[0]) {
		authorID = paper.authors[0].authorId;
	}
	return (
		<>
			<div className="orm-paper-heading">
				<div className="orm-paper-title">
					<a href={`${SEMANTICSCHOLAR_URL}/paper/${paper.paperId}`}>
						{" " + paperTitle + " "}
					</a>
				</div>
				{props.settings.showDetails && (
					<span className="orm-paper-abstract">
						{" " + paper.abstract + " "}
					</span>
				)}
				{props.settings.showDetails && (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{authors + ", " + year}
						</a>
					</span>
				)}
				{!props.settings.showDetails && (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{firstAuthor + ", " + year}
						</a>
					</span>
				)}
			</div>
		</>
	);
};
