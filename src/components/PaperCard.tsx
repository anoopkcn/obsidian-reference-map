import React, { useState } from "react";
import { PaperButtonGroup } from "./PaperButtonGroup";
import { PaperTitleGroup } from "./PaperTitleGroup";
import { SemanticPaper } from "src/types";

export const PaperCard = (props: { paper: SemanticPaper }) => {
	const paper = props.paper;
	const [isButtonShown, setIsButtonShown] = useState(false);
	return (
		<div
			className="orm-paper-card"
			onMouseEnter={() => setIsButtonShown(true)}
			onMouseLeave={() => setIsButtonShown(false)}
		>
			<PaperTitleGroup paper={paper} />
			{isButtonShown && <PaperButtonGroup paper={paper} />}
		</div>
	);
};
