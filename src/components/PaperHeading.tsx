import React from 'react'
import { SEMANTICSCHOLAR_URL } from 'src/constants'
import { IndexPaper, ReferenceMapSettings } from 'src/types'

export const PaperHeading = (props: {
	paper: IndexPaper
	settings: ReferenceMapSettings
}) => {
	const paperTitle = props.paper?.paper?.title
		? props.paper?.paper?.title.trim()
			.replace(/[^\x20-\x7E]/g, '')
			.replace(/(<([^>]+)>)/gi, "")
		: 'Unknown Title'
	const firstAuthor = props.paper?.paper?.authors[0]
		? props.paper?.paper?.authors[0]?.name
		: 'Unknown Author'
	let authors = ''
	if (props.paper?.paper?.authors.length > 0)
		authors = props.paper?.paper?.authors
			.map((author) => author.name)
			.join(', ')
	const year = props.paper?.paper?.year
		? props.paper?.paper?.year
		: 'Unknown Year'
	let authorID = null
	if (props.paper?.paper?.authors[0]) {
		authorID = props.paper?.paper?.authors[0].authorId
	}
	const isCitekey = props.paper?.id?.includes('@')
	const showCitekey = props.settings.linkCiteKey && isCitekey
	return (
		<>
			<div className="orm-paper-heading">
				<div className="orm-paper-title">
					<a
						href={`${SEMANTICSCHOLAR_URL}/paper/${props.paper?.paper?.paperId}`}
					>
						{' ' + paperTitle + ' '}
					</a>
				</div>
				{props.settings.showAbstract && (
					<span className="orm-paper-abstract">
						{' ' + props.paper.paper?.abstract + ' '}
					</span>
				)}
				{props.settings.showAuthors && (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{authors + ', ' + year}
						</a>
					</span>
				)}
				{!props.settings.showAuthors && (
					<span className="orm-paper-authors">
						<a href={`${SEMANTICSCHOLAR_URL}/author/${authorID}`}>
							{firstAuthor + ', ' + year}
						</a>
					</span>
				)}
				{showCitekey && (
					<span className="orm-paper-link-citekey">
						<a href={`zotero://select/items/${props.paper?.id}`}>
							{props.paper?.id}
						</a>
					</span>
				)}
			</div>
		</>
	)
}
