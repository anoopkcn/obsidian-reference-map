import React, { useState } from 'react'
import { ReferenceMapSettings } from 'src/types'
import { PaperCard } from './PaperCard'
import { dataSearch, dataSort } from 'src/utils/postprocess'
import { BsSearch } from 'react-icons/bs'
import { Reference } from 'src/apis/s2agTypes'

interface Props {
	papers: Reference[]
	settings: ReferenceMapSettings
	type: string
}

export const PaperList: React.FC<Props> = ({ papers, settings, type }) => {
	const [query, setQuery] = useState('')

	const sortedPapers = settings.enableReferenceSorting
		? dataSort(
			papers,
			settings.sortByReference,
			settings.sortOrderReference
		)
		: papers

	const paperList = dataSearch(sortedPapers, query).map((paper, index) => (
		<PaperCard
			key={`${paper.paperId}-${index}`}
			paper={{ id: paper.paperId, location: null, paper }}
			settings={settings}
		/>
	))

	return (
		<div className="orm-paper-list">
			<div className="orm-paper-list-buttons">
				<div className="orm-search-form">
					<div className="index-search">
						<input
							type="search"
							className="orm-search-input"
							placeholder={type}
							onChange={(e) => setQuery(e.target.value)}
							style={{ padding: '0 30px 0 30px' }}
						/>
						<BsSearch size={15} className="search-icon" />
					</div>
				</div>
			</div>
			{paperList}
		</div>
	)
}

export default PaperList
