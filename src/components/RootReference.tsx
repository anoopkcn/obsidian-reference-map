import { SemanticPaper } from "src/types";
import React, { useState } from "react";
import { copyElToClipboard } from "src/utils";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { FiPaperclip, FiSlash } from "react-icons/fi";
import { ReferencesList } from "./ReferencesList";
import { PaperTitleGroup } from "./PaperTitleGroup";
import { CitationsList } from "./CitationsList";

export const RootReference = (props: {
	key: string;
	rootPaper: SemanticPaper;
	references: SemanticPaper[];
	citations: SemanticPaper[];
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
	let abstract = "";
	if (rootPaper.abstract) abstract = rootPaper.abstract;
	return (
		<div className="orm-root-paper">
			<PaperTitleGroup paper={rootPaper} />
			<div className="orm-paper-buttons">
				<div
					className="orm-copy-bibtex"
					onClick={() => {
						copyElToClipboard(rootPaper.citationStyles.bibtex);
					}}
				>
					<IoMdClipboard size={17} />
				</div>

				<div
					className="orm-copy-metadata"
					onClick={() => {
						copyElToClipboard(
							rootPaper.title +
								", " +
								rootPaper.authors[0].name +
								", " +
								rootPaper.year +
								"\n" +
								abstract
						);
					}}
				>
					<FiPaperclip size={16} />
				</div>

				<div className="orm-openaccess">
					{rootPaper.isOpenAccess ? (
						<a href={`${rootPaper.openAccessPdf.url}`}>
							<SiOpenaccess size={16} />
						</a>
					) : (
						<FiSlash size={16} />
					)}
				</div>
				<div
					className={`orm-references`}
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
				{/* <div className="orm-influential-citations">
					{rootPaper.influentialCitationCount.toString()}
				</div> */}
			</div>
			{showReferences && <ReferencesList references={props.references} />}
			{showCitations && <CitationsList citations={props.citations} />}
		</div>
	);
};
