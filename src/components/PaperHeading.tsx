import React from 'react';
import { SEMANTICSCHOLAR_URL } from 'src/constants';
import { IndexPaper, ReferenceMapSettings } from 'src/types';

interface Props {
	paper: IndexPaper;
	settings: ReferenceMapSettings;
}

export const PaperHeading = ({ paper, settings }: Props) => {
	const { paper: paperData } = paper;
	const { authors, title, year, abstract, paperId } = paperData || {};
	const authorID = authors?.[0]?.authorId;
	const isCitekey = paper?.id?.includes('@');
	const showCitekey = settings.linkCiteKey && isCitekey;

	return (
		<div className="orm-paper-heading">
			<div className="orm-paper-title">
				{paper.location &&
					<span className="cardLocation">{paper.location}</span>
				}
				<a href={`${SEMANTICSCHOLAR_URL}/paper/${paperId}`}>
					{' ' + (title || 'Unknown Title') + ' '}
				</a>
			</div>
			{settings.showAbstract && (
				<span className="orm-paper-abstract">
					{' ' + (abstract || '') + ' '}
				</span>
			)}
			{settings.showAuthors && (
				<span className="orm-paper-authors">
					<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
						{(authors || []).map((author) => author.name).join(', ') + ', ' + year}
					</a>
				</span>
			)}
			{!settings.showAuthors && (
				<span className="orm-paper-authors">
					<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
						{(authors?.[0]?.name || 'Unknown Author') + ', ' + year}
					</a>
				</span>
			)}
			{showCitekey && (
				<span className="orm-paper-link-citekey">
					<a href={`zotero://select/items/${paper?.id}`}>
						{paper?.id}
					</a>
				</span>
			)}
		</div>
	);
};

export default PaperHeading;