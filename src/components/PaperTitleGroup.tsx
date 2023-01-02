import React from "react";
import { AiOutlinePaperClip } from "react-icons/ai";
import { SemanticPaper } from "src/types";
import { copyElToClipboard } from "src/utils";

export const PaperTitleGroup = (props: { rootPaper: SemanticPaper }) => {
	const rootPaper: SemanticPaper = props.rootPaper;
	return (
		<>
			<div className="orm-paper-title-group">
				<span
					className="orm-copy-metadata"
					onClick={() => {
						copyElToClipboard(
							rootPaper.title +
								", " +
								rootPaper.authors[0].name +
								", " +
								rootPaper.year
						);
					}}
				>
					<AiOutlinePaperClip size={17} />
				</span>
				<span className="orm-paper-title">
					{" " + rootPaper.title + " "}
				</span>
				{/* <span className="orm-external-link">
					<RiExternalLinkFill size={14} />
				</span> */}
			</div>
			<div className="orm-paper-authors-group">
				<span className="orm-paper-authors">
					{rootPaper.authors[0].name + ", " + rootPaper.year + " "}
				</span>
			</div>
		</>
	);
};
