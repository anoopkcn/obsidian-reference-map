import React, { useState } from "react";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";
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
			<PaperHeading paper={paper} />
			{isButtonShown && <PaperButtons paper={paper} />}
		</div>
	);
};
