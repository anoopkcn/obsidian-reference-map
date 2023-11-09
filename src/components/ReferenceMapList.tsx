import { IndexPaper } from 'src/types'
import React, { useEffect, useState, useRef } from 'react'
import { IndexPaperCard } from './IndexPaperCard'
import { UpdateChecker, indexSearch } from 'src/utils'
import { BsSearch } from 'react-icons/bs'
import ReferenceMap from 'src/main'
import { ReferenceMapData } from 'src/referenceData'
import EventBus from 'src/EventBus'
import { PartialLoading } from './PartialLoading'

export const ReferenceMapList = (props: {
	plugin: ReferenceMap
	referenceMapData: ReferenceMapData
	updateChecker: UpdateChecker
	selection: string
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [query, setQuery] = useState('')
	const activeRef = useRef<null | HTMLDivElement>(null)

	const { viewManager } = props.referenceMapData;
	const basename = props.updateChecker.basename;
	const indexIds = props.updateChecker.indexIds;
	const citeKeyMap = props.updateChecker.citeKeyMap;
	const fileName = props.updateChecker.fileName;
	const frontmatter = props.updateChecker.frontmatter;

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			const indexCards = await props.referenceMapData.getIndexCards(indexIds, citeKeyMap, fileName, frontmatter, basename)
			setPapers(indexCards)
			setIsLoading(false)
		}
		fetchData()
		EventBus.on('keys-changed', fetchData);
	}, [
		indexIds, citeKeyMap, fileName, frontmatter, basename,
		props.plugin.settings,
		props.referenceMapData.library.libraryData
	])

	useEffect(() => {
		if (activeRef.current !== null)
			activeRef.current.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			})
	}, [props.selection])

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
		const items = citeKeyMap.filter((item) => item.citeKey === item.paperId)
		// convert the items to an array of strings
		const citeKeys = items.map((item) => item.citeKey)
		return citeKeys
	}


	if (basename === undefined) {
		return (
			<div className="orm-no-content">
				<div>
					{userSearch(false)}
					<div className="orm-no-content-subtext">
						No Active Markdown File.
						<br />
						Click on a file to view its references.
					</div>
					<SetKeyInfo />
				</div>
			</div>
		)
	} else if (papers.length > 0 || isLoading) {
		return (
			<>
				<div className="orm-reference-map">
					{userSearch(true)}
					{indexSearch(papers, query).map((paper, index) => {
						const paperId = paper.id.replace('@', '');
						const activeIndexCardClass =
							props.selection.includes(paperId) ? 'orm-active-index' : '';
						const ref = activeIndexCardClass ? activeRef : null
						return (
							<div
								key={`${paper.paper.paperId}${index}${basename}`}
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
					<div className="orm-no-content">
						<div>
							{noContentItems().map((item) => {
								return (
									<div className="orm-no-content-subtext" key={item}>
										<code>{item.substring(1)}</code> has no DOI or URL in the Library.
									</div>
								)
							})}
							<SetKeyInfo />
						</div>
					</div>
				}
				<PartialLoading isLoading={isLoading} />
			</>
		)
	} else {
		if (noContentItems().length > 0 && props.plugin.settings.showInvalidItems) {
			return (
				<div className="orm-no-content">
					<div>
						{userSearch(false)}
						{noContentItems().map((item) => {
							return (
								<div className="orm-no-content-subtext" key={item}>
									<code>{item.substring(1)}</code> has no DOI or URL in the Library.
								</div>
							)
						})}
						<SetKeyInfo />
					</div>
				</div>
			)
		} else {
			return (
				<div className="orm-no-content">
					<div>
						{userSearch(false)}
						<div className="orm-no-content-subtext">
							No Valid References Found.
						</div>
						<SetKeyInfo />
					</div>
				</div>
			)
		}
	}
}
