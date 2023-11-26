import React from 'react';
import { SEMANTICSCHOLAR_URL } from 'src/constants';
import { IndexPaper, ReferenceMapSettings } from 'src/types';
import { splitString } from 'src/utils/functions';

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
	const isLocal = paper.isLocal;

	const spliTitle = splitString(title, 20);
	const splitAbstract = splitString(abstract, 20);

	const Title = () => {
		let formatTitle = (<span className="orm-paper-title-disabled "> {spliTitle} </span>)
		if (!isLocal) {
			formatTitle = (
				<a href={`${SEMANTICSCHOLAR_URL}/paper/${paperId}`}>
					{' ' + (spliTitle || 'Unknown Title') + ' '}
				</a>
			)
		} else if (paper.paper.url) {
			formatTitle = (
				<a href={paper.paper.url}>
					{' ' + (spliTitle || 'Unknown Title') + ' '}
				</a>
			)
		}

		return (
			<div className="orm-paper-title">
				{(paper.location && !settings.lookupLinkedFiles) &&
					<span className="cardLocation">{paper.location}</span>
				}
				{formatTitle}
			</div>
		);
	}

	const Abstract = () => {
		const className = isLocal ? "orm-paper-title-disabled " : "orm-paper-abstract"
		return (
			<div className={className}>
				{' ' + (splitAbstract || '') + ' '}
			</div >
		);
	}

	const Authors = (all = false) => {
		if (isLocal) {
			<span className="orm-paper-title-disabled ">
				<span>
					{(authors?.[0]?.name || 'Unknown Author') + ' ' + year}
				</span>
			</span>

		} else {
			if (!all) {
				return (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{(authors?.[0]?.name || 'Unknown Author') + ' ' + year}
						</a>
					</span>
				)
			} else {
				return (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{(authors || []).map((author) => author.name).join(', ') + ' ' + year}
						</a>
					</span>
				);
			}
		}

	}

	const ZoteroLink = () => {
		return (
			<span className="orm-paper-link-citekey">
				<a href={`zotero://select/items/${paper?.id}`}>
					{paper?.id}
				</a>
			</span>
		);
	}

	return (
		<div className="orm-paper-heading">
			<Title />
			{settings.showAbstract && (
				<Abstract />
			)}
			{settings.showAuthors && (
				Authors(true)
			)}
			{!settings.showAuthors && (
				Authors()
			)}
			{showCitekey && (
				<ZoteroLink />
			)}
		</div>
	);
};

export default PaperHeading;