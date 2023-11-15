import React, { useEffect, useState, useRef, ReactNode } from 'react'
import { BsSearch } from 'react-icons/bs'
import { IndexPaper } from 'src/types'
import ReferenceMap from 'src/main'
import EventBus, { EVENTS } from 'src/events'
import { IndexPaperCard } from 'src/components/IndexPaperCard'
import { indexSearch } from 'src/utils/postprocess'
import { UpdateChecker } from 'src/data/updateChecker'
import { ReferenceMapData } from 'src/data/data'
// import { PartialLoading } from './PartialLoading'

interface NoContentProps {
	children: ReactNode;
}

export const ReferenceMapList = (props: {
	plugin: ReferenceMap
	referenceMapData: ReferenceMapData
	updateChecker: UpdateChecker
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([])
	const [selection, setSelection] = useState('')
	// const [isLoading, setIsLoading] = useState(false)
	const [query, setQuery] = useState('')
	const activeRef = useRef<null | HTMLDivElement>(null)

	const { viewManager } = props.referenceMapData;

	const fetchData = async () => {
		// setIsLoading(true)
		const { indexIds, citeKeyMap, fileName, frontmatter, basename } = props.updateChecker
		const indexCards = await props.referenceMapData.getIndexCards(
			indexIds, citeKeyMap, fileName, frontmatter, basename
		)
		setPapers(indexCards)
		// setIsLoading(false)
	}

	// unset paper when basename is changed 

	useEffect(() => {
		setPapers([])
	}, [props.updateChecker.basename])

	useEffect(() => {
		fetchData()
	}, [
		props.updateChecker.indexIds,
		props.updateChecker.citeKeyMap,
		props.updateChecker.fileName,
		props.updateChecker.frontmatter,
		props.plugin.settings,
		props.referenceMapData.library.libraryData
	])

	useEffect(() => {
		if (activeRef.current !== null)
			activeRef.current.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			})
		EventBus.on(EVENTS.SELECTION, (sel) => setSelection(sel))
	}, [])

	const userSearch = (isSearchList: boolean) => {
		const searchFieldName = isSearchList
			? 'orm-index-search'
			: 'orm-index-no-search'
		return (
			<div className="orm-plugin-name">
				<div className="orm-search-form">
					<div className="index-search">
						<div className="orm-plugin-global-search">
							<BsSearch size={15} className="global-search-icon" />
						</div>
						<input
							type="search"
							className={`orm-search-input ${searchFieldName}`}
							placeholder={`Reference Map`}
							onChange={(e) => setQuery(e.target.value)}
							style={{ padding: '0 35px 0 35px' }}
						/>
						{/* <BsSearch size={15} className="search-icon" /> */}
						{isSearchList &&
							<div className="cardCount">{papers.length > 0 ? papers.length : ''}</div>
						}
					</div>
				</div>

			</div>
		)
	}

	const SetKeyInfo = () => {
		return (
			<div>
				{!props.plugin.settings.searchCiteKey &&
					<div className="orm-no-content-subtext">
						Configure <code>Get References Using CiteKey</code> in the settings tab to process citations using pandoc citekey
					</div>
				}
			</div>
		)
	}

	const noContentItems = () => {
		// in citekeyMap if items have citeKey and paperId are the same then return a new array with only citeKey
		const items = props.updateChecker.citeKeyMap.filter((item) => item.citeKey === item.paperId)
		// convert the items to an array of strings
		const citeKeys = items.map((item) => item.citeKey)
		return citeKeys
	}

	const NoContent: React.FC<NoContentProps> = ({ children }) => (
		<div className="orm-no-content">
			<div>
				{userSearch(false)}
				{children}
				<SetKeyInfo />
			</div>
		</div>
	);

	if (!props.updateChecker.basename) {
		return <NoContent>
			<div className="orm-no-content-subtext">
				No Active Markdown File.
				<br />
				Click on a file to view its references.
			</div>
		</NoContent>
	}

	if (papers.length > 0) {
		return (
			<>
				<div className="orm-reference-map">
					{userSearch(true)}
					{/* <PartialLoading isLoading={isLoading} /> */}
					{indexSearch(papers, query).map((paper, index) => {
						const paperId = paper.id.replace('@', '');
						const activeIndexCardClass = selection?.includes(paperId) ? 'orm-active-index' : '';
						const ref = activeIndexCardClass ? activeRef : null
						return (
							<div
								key={`${paper.paper.paperId}${index}${props.updateChecker.basename}`}
								ref={ref}
							>
								<IndexPaperCard
									className={activeIndexCardClass}
									settings={props.plugin.settings}
									rootPaper={paper}
									viewManager={viewManager}
								/>
							</div>
						)
					})}
				</div>
				{(noContentItems().length > 0 && props.plugin.settings.showInvalidItems) &&
					<NoContent>
						{noContentItems().map((item) => (
							<div className="orm-no-content-subtext" key={item}>
								<code>{item.substring(1)}</code> has no DOI or URL in the Library.
							</div>
						))}
					</NoContent>
				}
			</>
		)
	}

	if (noContentItems().length > 0 && props.plugin.settings.showInvalidItems) {
		return <NoContent>
			{noContentItems().map((item) => (
				<div className="orm-no-content-subtext" key={item}>
					<code>{item.substring(1)}</code> has no DOI or URL in the Library.
				</div>
			))}
		</NoContent>
	}

	return <NoContent>
		<div className="orm-no-content-subtext">
			No Valid References Found.
		</div>
	</NoContent>
}