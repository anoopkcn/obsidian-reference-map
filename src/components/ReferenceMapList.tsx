import { CiteKey, IndexPaper, Library, ReferenceMapSettings } from "src/types";
import React, { useEffect, useState, useRef } from "react";
import { IndexPaperCard } from "./IndexPaperCard";
import { MarkdownView, TFile } from "obsidian";
import { ViewManager } from "src/viewManager";
import { getCiteKeyIds, getCiteKeys, getPaperIds, iSearch, iSort, removeNullReferences, setCiteKeyId } from "src/utils";
import { LoadingPuff } from "./LoadingPuff";

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	view: MarkdownView | null;
	viewManager: ViewManager;
	frontMatterString: string;
	fileNameString: string;
	library: Library;
	selection: string;
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState("");
	const activeRef = useRef<null | HTMLDivElement>(null)

	useEffect(() => {
		if (props.view) {
			processPapers(props.view.file)
		}
	}, [
		props.settings,
		props.view?.data,
		props.frontMatterString,
		props.fileNameString,
		props.library.libraryData
	]);

	useEffect(() => {
		setIsLoading(true);
	}, [props.view?.file.basename]);

	useEffect(() => {
		if (activeRef.current !== null) activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
	}, [props.selection])

	const processPapers = async (currentMarkdownFile: TFile) => {
		const indexCards: IndexPaper[] = [];
		let citeKeyMap: CiteKey[] = [];
		const fileContent = await app.vault.cachedRead(currentMarkdownFile);
		const paperIds = getPaperIds(fileContent);
		const isLibrary = props.settings.searchCiteKey && props.library.libraryData
		if (isLibrary) {
			const citeKeys = getCiteKeys(fileContent, props.settings.findCiteKeyFromLinksWithoutPrefix);
			citeKeyMap = getCiteKeyIds(citeKeys, props.library);
		}

		paperIds.forEach(async (paperId) => {
			const paper = await props.viewManager.getIndexPaper(paperId);
			let paperCiteId = paperId
			if (isLibrary && props.settings.findZoteroCiteKeyFromID)
				paperCiteId = setCiteKeyId(paperId, props.library);
			if (paper !== null && typeof paper !== "number") indexCards.push({ id: paperCiteId, paper: paper });
			if (indexCards.length > 0) setPapers(removeNullReferences(indexCards));
		});

		if (citeKeyMap) {
			citeKeyMap.forEach(async (item) => {
				const paper = await props.viewManager.getIndexPaper(item.paperId);
				if (paper !== null && typeof paper !== "number") indexCards.push({ id: item.citeKey, paper: paper });
				if (indexCards.length > 0) setPapers(removeNullReferences(indexCards));
			});
		}

		if (props.settings.searchTitle && props.fileNameString) {
			const titleSearchPapers = await props.viewManager.searchIndexPapers(
				props.fileNameString, props.settings.searchLimit
			);
			titleSearchPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper: paper });
			});
		}

		if (props.settings.searchFrontMatter && props.frontMatterString) {
			const frontMatterPapers = await props.viewManager.searchIndexPapers(
				props.frontMatterString, props.settings.searchFrontMatterLimit
			);
			frontMatterPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper: paper });
			});
		}

		(indexCards.length > 0) ? setPapers(indexCards) : setPapers([]);
		setIsLoading(false);
	};

	const Search = (isSearchList: boolean) => {
		const searchFieldName = isSearchList ? 'orm-index-search' : 'orm-index-no-search'
		return (
			<div className="orm-search-form index-search" >
				<input
					type="search"
					className={`orm-search-input ${searchFieldName}`}
					placeholder="Reference Map"
					onChange={(e) => setQuery(e.target.value)}
				/>
			</div>
		)
	}

	const postProcessPapers = (indexCards: IndexPaper[]) => {
		let listItems = removeNullReferences(indexCards);
		if (props.settings.enableIndexSorting) {
			listItems = iSort(listItems, props.settings.sortByIndex, props.settings.sortOrderIndex);
		}
		return listItems;
	};

	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					{Search(false)}
					<div className="orm-no-content-subtext">
						No Active Markdown File.
						<br />
						Click on a file to view its references.
					</div>
				</div>
			</div>
		);
	} else if (isLoading) {
		return (
			<div className="orm-no-content">
				<div>
					{Search(false)}
					<LoadingPuff />
				</div>
			</div>
		);
	} else if (papers.length > 0) {
		return (
			<div className="orm-reference-map">
				{Search(true)}
				{iSearch(postProcessPapers(papers), query).map((paper, index) => {
					const activeIndexCardClass = (
						paper.id === props.selection ||
						paper.id === '@' + props.selection ||
						'https://doi.org/' + paper.id === props.selection
					) ? 'orm-active-index' : '';
					const ref = activeIndexCardClass ? activeRef : null
					return (
						<div key={paper.paper.paperId + index + props.view?.file.basename} ref={ref}>
							<IndexPaperCard
								className={activeIndexCardClass}
								settings={props.settings}
								rootPaper={paper}
								viewManager={props.viewManager}
							/>
						</div>
					);
				})}
			</div>
		);
	} else {
		return (
			<div className="orm-no-content">
				<div>
					{Search(false)}
					<div className="orm-no-content-subtext">
						No Valid References Found.
					</div>
				</div>
			</div>
		);
	}
};
