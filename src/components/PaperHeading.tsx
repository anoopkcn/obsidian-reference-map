import React from 'react';
import { SEMANTIC_SCHOLAR_URL } from 'src/constants';
import { IndexPaper, ReferenceMapSettings } from 'src/types';
import { splitString } from 'src/utils/functions';

interface Props {
	paper: IndexPaper;
	settings: ReferenceMapSettings;
}

export const PaperHeading = ({ paper, settings }: Props) => {
	const { authors, directors, editors, title, year, abstract, paperId, url } = paper.paper;
	const authorID = authors?.[0]?.authorId;
	const isCitekey = paper?.id?.includes('@');
	const showCitekey = settings.linkCiteKey && isCitekey;
	const isLocal = paper.isLocal;

	const splitTitle = splitString(title, 20);
	const splitAbstract = splitString(abstract, 20);

	const Title = () => {
		let formatTitle = (
			<span className="orm-paper-title orm-paper-title-disabled">
				{(paper.location && !settings.lookupLinkedFiles) &&
					<span className="orm-paper-tag">{paper.location}</span>
				}
				{' ' + (splitTitle || 'Unknown Title') + ' '}
			</span>
		)
		if (!isLocal) {
			formatTitle = (
				<a href={`${SEMANTIC_SCHOLAR_URL}/paper/${paperId}`}>
					{(paper.location && !settings.lookupLinkedFiles) &&
						<span className="orm-paper-tag">{paper.location}</span>
					}
					{' ' + (splitTitle || 'Unknown Title') + ' '}
				</a>
			)
		} else if (url) {
			formatTitle = (
				<span className="orm-paper-title">
					{<a href={url}>
						{(paper.location && !settings.lookupLinkedFiles) &&
							<span className="orm-paper-tag">{paper.location}</span>
						}
						{' ' + (splitTitle || 'Unknown Title') + ' '}
					</a>
					}
				</span>
			)
		}

		return (
			<div className="orm-paper-title">
				{formatTitle}
			</div>
		);
	}

	const Abstract = () => {
		const className = isLocal ? "orm-paper-abstract orm-paper-abstract-disabled" : "orm-paper-abstract"
		let truncatedAbstract = splitAbstract
		if (settings.abstractTruncateLength > 0 && truncatedAbstract.length > settings.abstractTruncateLength) {
			truncatedAbstract = splitAbstract.slice(0, settings.abstractTruncateLength) + ' ...'
		}
		return (
			<div className={className}>
				{' ' + (truncatedAbstract || '') + ' '}
			</div >
		);
	}

	const Authors = (all = false) => {
		if (isLocal) {
			if (!all) {
				return (
					<span className="orm-paper-authors orm-paper-authors-disabled">
						{(authors && authors.length > 0 ? authors[0].name : '') + ' '}
						{(directors && directors.length > 0 ? directors[0].name : '') + ' '}
						{(editors && editors.length > 0 ? editors[0].name : '') + ' '}
						{year}
					</span>
				)
			} else {
				return (
					<span className="orm-paper-authors orm-paper-authors-disabled">
						{(authors || []).map((author) => author.name).join(', ') + ' '}
						{(directors || []).map((director) => director.name).join(', ') + ' '}
						{(editors || []).map((editor) => editor.name).join(', ') + ' '}
						{year}
					</span>
				);
			}
		} else {
			if (!all) {
				return (
					<span className="orm-paper-authors">
						<a href={`${SEMANTIC_SCHOLAR_URL}/author/${authorID}`}>
							{(authors?.[0]?.name || 'Unknown Author') + ' ' + year}
						</a>
					</span>
				)
			} else {
				return (
					<span className="orm-paper-authors">
						<a href={`${SEMANTIC_SCHOLAR_URL}/author/${authorID}`}>
							{(authors || []).map((author) => author.name).join(', ') + ' ' + year}
						</a>
					</span>
				);
			}
		}

	}

	const Journal = () => {
		const className = "orm-paper-journal orm-paper-journal-disabled"
		const journalParts = [
			paper.paper.journal?.name,
			paper.paper.journal?.volume,
			paper.paper.journal?.pages
		];
		const journal = journalParts.filter(Boolean).join(', ');
		return (
			<div className={className}>
				{journal}
			</div >
		);

	}

	const CardTags = () => {
		return (
			<div className='orm-paper-tags'>
				{showCitekey && (
					<span className="orm-paper-tag">
						<a href={`zotero://select/items/${paper?.id}`}>
							{paper?.id}
						</a>
					</span>
				)}
				{paper.paper.publicationTypes && paper.paper.publicationTypes.map((type, index) => (
					<span key={`z${index}`} className="orm-paper-tag">
						{type}
					</span>
				))}
				{(isLocal && paper.paper.type) && <span className="orm-paper-tag">
					{paper.paper.type}
				</span>
				}
			</div>
		);
	}

	return (
		<div className="orm-paper-heading">
			<Title />
			{settings.showAuthors && (
				Authors(true)
			)}
			{!settings.showAuthors && (
				Authors()
			)}
			{settings.showJournal && (
				<Journal />
			)}
			{settings.showAbstract && (
				<Abstract />
			)}
			<CardTags />
		</div>
	);
};

export default PaperHeading;