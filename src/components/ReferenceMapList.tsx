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
			<div className="orm-search-form">
				<div className="index-search">
					<input
						type="search"
						className={`orm-search-input ${searchFieldName}`}
						placeholder={`Reference Map`}
						onChange={(e) => setQuery(e.target.value)}
					/>
					{isSearchList &&
						<div className="cardCount">{papers.length > 0 ? papers.length : ''}</div>
					}
				</div>
			</div>
		)
	}

	const SetKeyInfo = () => {
		return (
			<div>
				{!props.settings.searchCiteKey &&
					<div className="orm-no-content-subtext">
						Configure <code>Get References Using CiteKey</code> in the settings tab to process citations using pandoc citekey
					</div>
				}
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
					<SetKeyInfo />
				</div>
			</div>
		)
	} else if (papers.length > 0) {
		return (
			<div className="orm-reference-map">
				{Search(true)}
				{iSearch(papers, query).map((paper, index) => {
					const paperId = paper.id.replace('@', '');
					const activeIndexCardClass =
						props.selection.includes(paperId) ? 'orm-active-index' : '';
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
					<SetKeyInfo />
				</div>
			</div>
		)
	}
}
