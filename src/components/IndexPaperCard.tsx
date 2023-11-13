import { IndexPaper, ReferenceMapSettings, Reference } from 'src/types'
import React, { useEffect, useState } from 'react'
import { isEmpty, makeMetaData, templateReplace } from 'src/utils'
import { PaperList } from './PaperList'
import { PaperHeading } from './PaperHeading'
import { PaperButtons } from './PaperButtons'
import { ViewManager } from 'src/data/viewManager'
import { LoadingPuff } from './LoadingPuff'

interface Props {
	className?: string
	settings: ReferenceMapSettings
	rootPaper: IndexPaper
	viewManager: ViewManager
}

export const IndexPaperCard = (props: Props) => {
	const [references, setReferences] = useState<Reference[]>([])
	const [citations, setCitations] = useState<Reference[]>([])
	const [showReferences, setShowReferences] = useState(false)
	const [showCitations, setShowCitations] = useState(false)
	const [isButtonShown, setIsButtonShown] = useState(!props.settings.hideButtonsOnHover)
	const [isReferenceLoading, setIsReferenceLoading] = useState(false)
	const [isCitationLoading, setIsCitationLoading] = useState(false)

	useEffect(() => {
		if (!isEmpty(props.rootPaper.paper)) {
			getCitations()
			getReferences()
		}
	}, [])

	useEffect(() => {
		setIsButtonShown(!props.settings.hideButtonsOnHover)
	}, [props.settings.hideButtonsOnHover])

	const handleHoverButtons = (isShow: boolean) => {
		if (!props.settings.hideButtonsOnHover || showReferences || showCitations) {
			setIsButtonShown(true);
			return;
		}
		setIsButtonShown(isShow);
	};

	const getReferences = async () => {
		setIsReferenceLoading(true);
		const references = await props.viewManager.getReferences(props.rootPaper.paper.paperId);
		const filteredReferences = props.settings.filterRedundantReferences
			? references.filter((reference) => reference.referenceCount > 0 || reference.citationCount > 0)
			: references;
		setReferences(filteredReferences);
		setIsReferenceLoading(false);
	};

	const getCitations = async () => {
		setIsCitationLoading(true);
		const citations = await props.viewManager.getCitations(props.rootPaper.paper.paperId);
		const filteredCitations = props.settings.filterRedundantReferences
			? citations.filter((citation) => citation.referenceCount > 0 || citation.citationCount > 0)
			: citations;
		setCitations(filteredCitations);
		setIsCitationLoading(false);
	};

	const metadataTemplates = [
		{ format: props.settings.formatMetadataCopyOne, template: props.settings.metadataCopyTemplateOne, batch: props.settings.metadataCopyOneBatch },
		{ format: props.settings.formatMetadataCopyTwo, template: props.settings.metadataCopyTemplateTwo, batch: props.settings.metadataCopyTwoBatch },
		{ format: props.settings.formatMetadataCopyThree, template: props.settings.metadataCopyTemplateThree, batch: props.settings.metadataCopyThreeBatch },
	]

	const batchCopyMetadata = metadataTemplates.flatMap(({ format, template, batch }) => {
		if (batch && format) {
			return references.map((paper) => {
				const metaData = makeMetaData(paper)
				return templateReplace(template, metaData) + '\n'
			})
		}
		return []
	})

	return (
		<div
			className={`orm-root-paper ${props.className}`}
			onMouseEnter={() => handleHoverButtons(true)}
			onMouseLeave={() => handleHoverButtons(false)}
		>
			<PaperHeading paper={props.rootPaper} settings={props.settings} />
			{isButtonShown && (
				<PaperButtons
					settings={props.settings}
					paper={props.rootPaper}
					setShowReferences={setShowReferences}
					showReferences={showReferences}
					setShowCitations={setShowCitations}
					showCitations={showCitations}
					setIsButtonShown={setIsButtonShown}
					isButtonShown={isButtonShown}
					batchCopyMetadataOne={batchCopyMetadata[0]}
					batchCopyMetadataTwo={batchCopyMetadata[1]}
					batchCopyMetadataThree={batchCopyMetadata[2]}
				/>
			)}
			{(isCitationLoading || isReferenceLoading) && (
				<div className="orm-loading">
					<LoadingPuff />
				</div>
			)}
			{showReferences && (
				<PaperList settings={props.settings} papers={references} type={'References'} />
			)}
			{showCitations && (
				<PaperList settings={props.settings} papers={citations} type={'Citations'} />
			)}
		</div>
	)
}