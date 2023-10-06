import React, { useState } from 'react';
import { ReferenceMapSettings, Reference } from 'src/types';
import { PaperCard } from './PaperCard';
import { search, sort } from 'src/utils';

interface Props {
	papers: Reference[];
	settings: ReferenceMapSettings;
	type: string;
}

export const PaperList: React.FC<Props> = ({ papers, settings, type }) => {
	const [query, setQuery] = useState('');

	const sortedPapers = settings.enableReferenceSorting
		? sort(papers, settings.sortByReference, settings.sortOrderReference)
		: papers;

	const paperList = search(sortedPapers, query).map((paper, index) => (
		<PaperCard
			key={`${paper.paperId}-${index}`}
			paper={{ id: paper.paperId, paper }}
			settings={settings}
		/>
	));

	return (
		<div className="orm-paper-list">
			<div className="orm-paper-list-buttons">
				<div className="orm-search-form">
					<input
						type="search"
						className="orm-search-input"
						placeholder={type}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</div>
			{paperList}
		</div>
	);
};

export default PaperList;