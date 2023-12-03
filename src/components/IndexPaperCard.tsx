import React, { useEffect, useState } from 'react'
import { IndexPaper } from 'src/types'
import { makeMetaData, templateReplace } from 'src/utils/postprocess'
import { PaperList } from './PaperList'
import { PaperHeading } from './PaperHeading'
import { PaperButtons } from './PaperButtons'
import { ViewManager } from 'src/data/viewManager'
import { LoadingPuff } from './LoadingPuff'
import { Reference } from 'src/apis/s2agTypes'
import ReferenceMap from 'src/main'

type IndexCardsProps = {
	className?: string
	plugin: ReferenceMap
	rootPaper: IndexPaper
	viewManager: ViewManager
}

export const IndexPaperCard = (props: IndexCardsProps) => {
	const [references, setReferences] = useState<Reference[]>([])
	const [citations, setCitations] = useState<Reference[]>([])
	const [showReferences, setShowReferences] = useState(false)
	const [showCitations, setShowCitations] = useState(false)
	const [isButtonShown, setIsButtonShown] = useState(!props.plugin.settings.hideButtonsOnHover)
	const [isReferenceLoading, setIsReferenceLoading] = useState(false)
	const [isCitationLoading, setIsCitationLoading] = useState(false)
	const { settings, cacheDir } = props.plugin

	useEffect(() => {
		if (props.rootPaper.paper.paperId && !props.rootPaper.isLocal) {
			getCitations()
			getReferences()
		}
	}, [props.rootPaper.isLocal])

	useEffect(() => {
		setIsButtonShown(!settings.hideButtonsOnHover)
	}, [settings.hideButtonsOnHover])

	const handleHoverButtons = (isShow: boolean) => {
		if (!settings.hideButtonsOnHover || showReferences || showCitations) {
			setIsButtonShown(true);
			return;
		}
		setIsButtonShown(isShow);
	};

	const getReferences = async () => {
		setIsReferenceLoading(true);
		const references = await props.viewManager.getReferences(props.rootPaper.paper.paperId);
		const filteredReferences = settings.filterRedundantReferences
			? references.filter((reference) => (reference.referenceCount && reference.referenceCount > 0) || (reference.citationCount && reference.citationCount > 0))
			: references;
		setReferences(filteredReferences);
		setIsReferenceLoading(false);
	};

	const getCitations = async () => {
		setIsCitationLoading(true);
		const citations = await props.viewManager.getCitations(props.rootPaper.paper.paperId);
		const filteredCitations = settings.filterRedundantReferences
			? citations.filter((citation) => (citation.referenceCount && citation.referenceCount > 0) || (citation.citationCount && citation.citationCount > 0))
			: citations;
		setCitations(filteredCitations);
		setIsCitationLoading(false);
	};

	const metadataTemplates = [
		{ format: settings.formatMetadataCopyOne, template: settings.metadataCopyTemplateOne, batch: settings.metadataCopyOneBatch },
		{ format: settings.formatMetadataCopyTwo, template: settings.metadataCopyTemplateTwo, batch: settings.metadataCopyTwoBatch },
		{ format: settings.formatMetadataCopyThree, template: settings.metadataCopyTemplateThree, batch: settings.metadataCopyThreeBatch },
	]

	const batchCopyMetadata = metadataTemplates.flatMap(({ format, template, batch }) => {
		if (batch && format) {
			return references.map((paper) => {
				const metaData = makeMetaData({ id: paper.paperId, location: null, paper: paper })
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
			<PaperHeading paper={props.rootPaper} settings={settings} />
			{isButtonShown && (
				<PaperButtons
					settings={settings}
					cacheDir={cacheDir}
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
				<PaperList settings={settings} cacheDir={cacheDir} papers={references} type={'References'} />
			)}
			{showCitations && (
				<PaperList settings={settings} cacheDir={cacheDir} papers={citations} type={'Citations'} />
			)}
		</div>
	)
}