import { CiteKey, IndexPaper, Library, ReferenceMapSettings } from 'src/types'
import React, { useEffect, useState, useRef } from 'react'
import { IndexPaperCard } from './IndexPaperCard'
import { ViewManager } from 'src/viewManager'
import { iSearch } from 'src/utils'

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings
	library: Library
	viewManager: ViewManager
	basename: string
	paperIDs: Set<string>
	citeKeyMap: CiteKey[]
	indexCards: IndexPaper[]
	selection: string
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([])
	const [query, setQuery] = useState('')
	const activeRef = useRef<null | HTMLDivElement>(null)

	useEffect(() => {
		setPapers(props.indexCards)
	}, [
		props.settings,
		props.indexCards,
		props.library.libraryData,
		props.basename,
	])

	useEffect(() => {
		if (activeRef.current !== null)
			activeRef.current.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			})
	}, [props.selection])

	const Search = (isSearchList: boolean) => {
		const searchFieldName = isSearchList
			? 'orm-index-search'
			: 'orm-index-no-search'
		return (
			<div className="orm-search-form index-search">
				<input
					type="search"
					className={`orm-search-input ${searchFieldName}`}
					placeholder="Reference Map"
					onChange={(e) => setQuery(e.target.value)}
				/>
			</div>
		)
	}

	if (!props.basename) {
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
		)
	} else if (papers.length > 0) {
		return (
			<div className="orm-reference-map">
				{Search(true)}
				{iSearch(papers, query).map((paper, index) => {
					const activeIndexCardClass =
						paper.id === props.selection ||
						paper.id === `@${props.selection}` ||
						`https://doi.org/${paper.id}` === props.selection
							? 'orm-active-index'
							: ''
					const ref = activeIndexCardClass ? activeRef : null
					return (
						<div
							key={`${paper.paper.paperId}${index}${props.basename}`}
							ref={ref}
						>
							<IndexPaperCard
								className={activeIndexCardClass}
								settings={props.settings}
								rootPaper={paper}
								viewManager={props.viewManager}
							/>
						</div>
					)
				})}
			</div>
		)
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
		)
	}
}
