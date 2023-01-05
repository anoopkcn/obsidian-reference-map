import React, { useState } from "react";
import { ReferenceMapSettings, SemanticPaper } from "src/types";
import { PaperCard } from "./PaperCard";
import { SEARCH_PARAMETERS } from "src/constants";
// import { SORTING_METADATA } from "src/constants";

export const ReferencesList = (props: {
	papers: SemanticPaper[];
	settings: ReferenceMapSettings;
	type: string;
}) => {
	const [query, setQuery] = useState("");

	const search = (data: SemanticPaper[]) => {
		return data.filter((item: SemanticPaper) =>
			SEARCH_PARAMETERS.some((parameter) =>
				item[parameter as keyof typeof item]
					?.toString()
					.toLowerCase()
					.includes(query)
			)
		);
	};

	const papers = props.papers;
	const paperList = search(papers).map((paper, index) => {
		return (
			<PaperCard
				key={paper.paperId + index}
				paper={paper}
				settings={props.settings}
			/>
		);
	});
	return (
		<div className="orm-paper-list">
			<form className="orm-search-form">
				<input
					type="search"
					className="orm-search-input"
					placeholder={props.type}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</form>
			{paperList}
		</div>
	);
};
