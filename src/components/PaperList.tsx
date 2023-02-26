import React, { useState } from 'react'
import { ReferenceMapSettings, Reference } from 'src/types'
import { PaperCard } from './PaperCard'
import { search, sort } from 'src/utils'

export const PaperList = (props: {
	papers: Reference[]
	settings: ReferenceMapSettings
	type: string
}) => {
	const [query, setQuery] = useState('')

	let papers = props.papers
	if (props.settings.enableReferenceSorting)
		papers = sort(
			props.papers,
			props.settings.sortByReference,
			props.settings.sortOrderReference
		)

	const paperList = search(papers, query).map((paper, index) => {
		return (
			<PaperCard
				key={paper.paperId + index}
				paper={{ id: paper.paperId, paper: paper }}
				settings={props.settings}
			/>
		)
	})
	return (
		<div className="orm-paper-list">
			<div className="orm-paper-list-buttons">
				<div className="orm-search-form">
					<input
						type="search"
						className="orm-search-input"
						placeholder={props.type}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</div>
			{paperList}
		</div>
	)
}
