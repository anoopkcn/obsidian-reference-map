import { SemanticPaper } from "src/types";
import React, { useState } from "react";
import { copyElToClipboard } from "src/utils";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { FiSlash } from "react-icons/fi";
import { ReferencesList } from "./ReferencesList";

export const RootReference = (props: {
	key: string;
	rootPaper: SemanticPaper;
}) => {
	const [showReferences, setShowReferences] = useState(false);
	const [showCitations, setShowCitations] = useState(false);

	const handleShowReferencesClick = () => {
		setShowReferences(!showReferences);
		setShowCitations(false);
	};

	const handleShowCitationsClick = () => {
		setShowCitations(!showCitations);
		setShowReferences(false);
	};
	const rootPaper: SemanticPaper = props.rootPaper;
	return (
		<div className="orm-root-paper">
			<div className="orm-paper-title">{rootPaper.title}</div>
			<div className="orm-paper-authors">
				{rootPaper.authors[0].name + ", " + rootPaper.year}
			</div>
			<div className="orm-paper-buttons">
				<div
					className="orm-copy-bibtex"
					onClick={() => {
						copyElToClipboard(rootPaper.citationStyles.bibtex);
					}}
				>
					<IoMdClipboard size={17} />
				</div>
				<div className="orm-openaccess">
					{rootPaper.isOpenAccess ? (
						<SiOpenaccess size={16} />
					) : (
						<FiSlash size={16} />
					)}
				</div>
				<div
					className="orm-references"
					onClick={() => handleShowReferencesClick()}
				>
					{rootPaper.referenceCount.toString()}
				</div>
				<div
					className="orm-citations"
					onClick={() => handleShowCitationsClick()}
				>
					{rootPaper.citationCount.toString()}
				</div>
				<div className="orm-influential-citations">
					{rootPaper.influentialCitationCount.toString()}
				</div>
			</div>
			{showReferences && <ReferencesList paperId={rootPaper.paperId} />}
			{showCitations && <div>Citations</div>}
		</div>
	);
};
