import { CslJson, ReferenceMapSettings, SemanticPaper } from "src/types";
import React, { useEffect, useState } from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";
import { ViewManager } from "src/viewManager";
import { getCitekeys, getPaperIds, removeNullReferences } from "src/utils";
import { LoadingPuff } from "./LoadingPuff";

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	view: MarkdownView | null;
	viewManager: ViewManager;
	frontMatterString: string;
	fileNameString: string;
	citeKeyData: CslJson[] | null;
}) => {
	const [papers, setPapers] = useState<SemanticPaper[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (props.view) processPapers(props.view);
	}, [props.view?.data, props.frontMatterString, props.fileNameString]);

	useEffect(() => {
		setIsLoading(true);
	}, [props.view?.file.basename]);

	const processPapers = async (currentView: MarkdownView) => {
		let rootPapers: SemanticPaper[] = [];
		const fileContent = await app.vault.cachedRead(currentView.file);
		const paperIds = getPaperIds(fileContent);
		rootPapers = await props.viewManager.getRootPapers(
			currentView.file,
			paperIds
		);
		if (props.settings.searchTitle && props.fileNameString) {
			const titleSearchPapers = await props.viewManager.searchRootPapers(
				props.fileNameString,
				[0, props.settings.searchLimit]
			);
			rootPapers = rootPapers.concat(titleSearchPapers);
		}
		if (props.settings.searchFrontMatter && props.frontMatterString) {
			const frontMatterPapers = await props.viewManager.searchRootPapers(
				props.frontMatterString,
				[0, props.settings.searchFrontMatterLimit]
			);
			rootPapers = rootPapers.concat(frontMatterPapers);
		}
		if (props.settings.searchCiteKey && props.citeKeyData) {
			const citeKeys = getCitekeys(fileContent);
			if (citeKeys.size > 0) {
				// get DOI form citekeyData corresponding to each item in citeKeys
				const doiList = [];
				for (const citeKey of citeKeys) {
					const doi = props.citeKeyData.find(
						(item) => item.id === citeKey
					)?.DOI;
					if (doi) doiList.push(doi);
				}
				if (doiList.length > 0) {
					const citeKeyPapers = await props.viewManager.getRootPapers(
						currentView.file,
						new Set(doiList)
					);
					rootPapers = rootPapers.concat(citeKeyPapers);
				}
			}
		}
		if (rootPapers.length > 0) {
			setPapers(removeNullReferences(rootPapers));
		} else {
			setPapers([]);
		}
		setIsLoading(false);
	};

	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					No Active Markdown File
				</div>
			</div>
		);
	} else if (isLoading) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<LoadingPuff />
				</div>
			</div>
		);
	} else if (papers.length > 0) {
		return (
			<div className="orm-reference-map">
				{papers.map((paper, index) => {
					return (
						<RootPaperCard
							settings={props.settings}
							key={paper.paperId + index + props.view?.file.name}
							rootPaper={paper}
							viewManager={props.viewManager}
						/>
					);
				})}
			</div>
		);
	} else {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					No References Found
				</div>
			</div>
		);
	}
};
