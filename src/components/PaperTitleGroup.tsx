import React from "react";
import { AiOutlinePaperClip } from "react-icons/ai";
import { SEMANTICSCHOLAR_URL } from "src/constants";
import { SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";

export const PaperTitleGroup = (props: { paper: SemanticPaper }) => {
	const paper: SemanticPaper = props.paper;
	let abstract = "";
	if (paper.abstract) abstract = paper.abstract;
	return (
		<>
			<div className="orm-paper-title-group">
				<span
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
					<AiOutlinePaperClip size={17} />
				</span>
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
