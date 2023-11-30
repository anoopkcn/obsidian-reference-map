import React from 'react'
import { FiPaperclip, FiClipboard } from 'react-icons/fi'
import { SiOpenaccess } from 'react-icons/si'
import { BsClipboardData } from 'react-icons/bs'
import { METADATA_COPY_TEMPLATE_ONE, METADATA_COPY_TEMPLATE_THREE, METADATA_COPY_TEMPLATE_TWO, } from 'src/constants'
import { IndexPaper, LocalCache, ReferenceMapSettings } from 'src/types'
import { copyElToClipboard } from 'src/utils/functions'
import { makeMetaData, templateReplace } from 'src/utils/postprocess'

type Props = {
	settings: ReferenceMapSettings
	cacheDir: string
	paper: IndexPaper
	showCountButtons?: boolean
	setShowReferences?: React.Dispatch<React.SetStateAction<boolean>>
	showReferences?: boolean
	setShowCitations?: React.Dispatch<React.SetStateAction<boolean>>
	showCitations?: boolean
	setIsButtonShown?: React.Dispatch<React.SetStateAction<boolean>>
	isButtonShown?: boolean
	batchCopyMetadataOne?: string
	batchCopyMetadataTwo?: string
	batchCopyMetadataThree?: string
}

export const PaperButtons = ({
	settings,
	cacheDir,
	paper,
	showCountButtons = true,
	setShowReferences = undefined,
	showReferences = false,
	setShowCitations = undefined,
	showCitations = false,
	setIsButtonShown = undefined,
	isButtonShown = false,
	batchCopyMetadataOne = '',
	batchCopyMetadataTwo = '',
	batchCopyMetadataThree = '',
}: Props) => {
	const metadataTemplateOne = settings.formatMetadataCopyOne
		? settings.metadataCopyTemplateOne
		: METADATA_COPY_TEMPLATE_ONE

	const metadataTemplateTwo = settings.formatMetadataCopyTwo
		? settings.metadataCopyTemplateTwo
		: METADATA_COPY_TEMPLATE_TWO

	const metadataTemplateThree = settings.formatMetadataCopyThree
		? settings.metadataCopyTemplateThree
		: METADATA_COPY_TEMPLATE_THREE


	const cache: LocalCache = {
		cacheDirPath: cacheDir,
		citationStyle: settings.citationStyle,
		citationLocale: settings.citationLocale
	}

	const metaData = makeMetaData(paper, cache)
	let copyMetadataOne = ''
	let copyMetadataTwo = ''
	let copyMetadataThree = ''
	if (settings.formatMetadataCopyOne) {
		settings.metadataCopyOneBatch && batchCopyMetadataOne
			? (copyMetadataOne = batchCopyMetadataOne)
			: (copyMetadataOne = templateReplace(
				metadataTemplateOne,
				metaData,
				paper.id
			))
	}
	if (settings.formatMetadataCopyTwo) {
		settings.metadataCopyTwoBatch && batchCopyMetadataTwo
			? (copyMetadataTwo = batchCopyMetadataTwo)
			: (copyMetadataTwo = templateReplace(
				metadataTemplateTwo,
				metaData,
				paper.id
			))
	}
	if (settings.formatMetadataCopyThree) {
		settings.metadataCopyThreeBatch && batchCopyMetadataThree
			? (copyMetadataThree = batchCopyMetadataThree)
			: (copyMetadataThree = templateReplace(
				metadataTemplateThree,
				metaData,
				paper.id
			))
	}

	let citingCited = null
	const isReferenceCount = metaData.referenceCount > 0
	const isCitationCount = metaData.citationCount > 0

	const handleShowReferencesClick = () => {
		if (setShowReferences && setShowCitations && setIsButtonShown) {
			setShowReferences(!showReferences);
			setShowCitations(false);
			if (showReferences || showCitations) {
				setIsButtonShown(true);
			}
		}
	};

	const handleShowCitationsClick = () => {
		if (setShowCitations && setShowReferences && setIsButtonShown) {
			setShowCitations(!showCitations);
			setShowReferences(false);
			if (showReferences || showCitations) {
				setIsButtonShown(true);
			}
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderButton = (showCondition: boolean, clickHandler: any, count: number, className: string, isEnabled: boolean) => (
		<div
			className={isEnabled ? className : 'orm-button-disabled'}
			style={
				showCondition && isEnabled
					? {
						fontWeight: 'bold',
						color: 'var(--text-accent)',
					}
					: {}
			}
			onClick={isEnabled ? clickHandler : null}
		>
			{count}
		</div>
	);

	citingCited = (
		<>
			{renderButton(showReferences, handleShowReferencesClick, metaData.referenceCount, "orm-button-references", isReferenceCount && showCountButtons)}
			{renderButton(showCitations, handleShowCitationsClick, metaData.citationCount, "orm-button-citations", isCitationCount && showCountButtons)}
		</>
	);

	return (
		<div className="orm-paper-buttons">
			{settings.formatMetadataCopyOne && (
				<div
					className="orm-copy-metadata-one"
					onClick={() => {
						copyElToClipboard(copyMetadataOne)
					}}
				>
					<FiClipboard size={16} />
				</div>
			)}
			{settings.formatMetadataCopyTwo && (
				<div
					className="orm-copy-metadata-two"
					onClick={() => {
						copyElToClipboard(copyMetadataTwo)
					}}
				>
					<FiPaperclip size={15} />
				</div>
			)}
			{settings.formatMetadataCopyThree && (
				<div
					className="orm-copy-metadata-three"
					onClick={() => {
						copyElToClipboard(copyMetadataThree)
					}}
				>
					<BsClipboardData size={15} />
				</div>
			)}
			{paper.paper?.isOpenAccess ? (
				<div className="orm-openaccess">
					<a href={`${metaData.pdfurl}`}>
						<SiOpenaccess size={15} />
					</a>
				</div>
			) : (
				<div className="orm-button-disable">
					<SiOpenaccess size={15} />
				</div>
			)}
			{citingCited}
			{settings.influentialCount && (
				<div className="orm-button-disabled">
					{metaData.influentialCount}
				</div>
			)}
		</div>
	)
}
