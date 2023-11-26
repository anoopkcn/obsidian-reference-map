import React from 'react';
import { SEMANTICSCHOLAR_URL } from 'src/constants';
import { IndexPaper, ReferenceMapSettings } from 'src/types';
import { splitString } from 'src/utils/functions';
import { BsInfoCircle } from "react-icons/bs";
import { Notice } from 'obsidian';

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
		let formatTitle = (
			<>
				<div className='orm-paper-info'>
					{(isLocal &&
						<BsInfoCircle
							size={16}
							onClick={() => { new Notice('Could not recover metadata. Check the validity of DOI/URL in the local library') }}
						/>
					)}
				</div>
				<span className="orm-paper-title-disabled ">
					{spliTitle}
				</span>
			</>
		)
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
		const className = isLocal ? "orm-paper-title-disabled orm-paper-abstract-disabled" : "orm-paper-abstract"
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
			<span className="orm-paper-title-disabled ">
				{(authors && authors.length > 0 ? authors[0].name : 'Unknown Author') + ' ' + year}
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
			<>
				<span className="orm-paper-link-citekey">
					<a href={`zotero://select/items/${paper?.id}`}>
						{paper?.id}
					</a>
				</span>
				{paper.paper.publicationTypes && paper.paper.publicationTypes.map((type, index) => (
					<span key={`z${index}`} className="orm-paper-link-citekey">
						<a href={`zotero://select/items/${paper?.id}`}>
							{type}
						</a>
					</span>
				))}
				{(isLocal && paper.paper.type) && <span className="orm-paper-link-citekey">
					<a href={`zotero://select/items/${paper?.id}`}>
						{paper.paper.type}
					</a>
				</span>
				}
			</>
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
			{settings.showAbstract && (
				<Abstract />
			)}
			{showCitekey && (
				<ZoteroLink />
			)}

		</div>
	);
};

export default PaperHeading;