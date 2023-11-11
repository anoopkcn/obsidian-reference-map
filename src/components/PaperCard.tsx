import React, { useState } from 'react'
import { PaperHeading } from './PaperHeading'
import { PaperButtons } from './PaperButtons'
import { IndexPaper, ReferenceMapSettings } from 'src/types'

export const PaperCard = (props: {
	paper: IndexPaper
	settings: ReferenceMapSettings
	showButtons?: boolean
}) => {
	const paper = props.paper
	const [isButtonShown, setIsButtonShown] = useState(!props.settings.hideButtonsOnHover)
	const handleHoverButtons = (isShow: boolean) => {
		props.settings.hideButtonsOnHover
			? setIsButtonShown(isShow)
			: setIsButtonShown(true)
	}
	return (
		<div
			className="orm-paper-card"
			onMouseEnter={() => handleHoverButtons(true)}
			onMouseLeave={() => handleHoverButtons(false)}
		>
			<PaperHeading paper={paper} settings={props.settings} />
			{(isButtonShown || props.showButtons) && (
				<PaperButtons settings={props.settings} paper={paper} />
			)}
		</div>
	)
}
