import React, { useState } from "react";
import { PaperHeading } from "./PaperHeading";
import { PaperButtons } from "./PaperButtons";
import { ReferenceMapSettings, SemanticPaper } from "src/types";

export const PaperCard = (props: {
	paper: SemanticPaper;
	settings: ReferenceMapSettings;
}) => {
	const paper = props.paper;
	const [isButtonShown, setIsButtonShown] = useState(
		props.settings.hideButtonsOnHover ? false : true
	);
	const handleHoverButtons = (isShow: boolean) => {
		props.settings.hideButtonsOnHover
			? setIsButtonShown(isShow)
			: setIsButtonShown(true);
	};
	return (
		<div
			className="orm-paper-card"
			onMouseEnter={() => handleHoverButtons(true)}
			onMouseLeave={() => handleHoverButtons(false)}
		>
			<PaperHeading paper={paper} settings={props.settings} />
			{isButtonShown && (
				<PaperButtons settings={props.settings} paper={paper} />
			)}
		</div>
	);
};
