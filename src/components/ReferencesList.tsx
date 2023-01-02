import React from "react";
import { FiSlash } from "react-icons/fi";
import { IoMdClipboard } from "react-icons/io";
import { SiOpenaccess } from "react-icons/si";
import { SemanticPaper } from "src/types";
import { copyElToClipboard, removeNullReferences } from "src/utils";
import { PaperTitleGroup } from "./PaperTitleGroup";

export const ReferencesList = (props: { references: SemanticPaper[] }) => {
	const references = removeNullReferences(props.references);
	const referenceList = references.map((reference, index) => {
		return (
			<div
				key={reference.paperId + index}
				className="orm-reference-paper"
			>
				<PaperTitleGroup paper={reference} />
				<div className="orm-paper-buttons">
					<div
						className="orm-copy-bibtex"
						onClick={() => {
							copyElToClipboard(reference.citationStyles.bibtex);
						}}
					>
						<IoMdClipboard size={17} />
					</div>
					<div className="orm-openaccess">
						{reference.isOpenAccess ? (
							<SiOpenaccess size={16} />
						) : (
							<FiSlash size={16} />
						)}
					</div>
					<div className="orm-references">
						{reference.referenceCount.toString()}
					</div>
					<div className="orm-citations">
						{reference.citationCount.toString()}
					</div>
					<div className="orm-influential-citations">
						{reference.influentialCitationCount.toString()}
					</div>
				</div>
			</div>
		);
	});
	return (
		<div className="orm-reference-list">
			<div className="orm-reference-list-title">References</div>
			{referenceList}
		</div>
	);
};
