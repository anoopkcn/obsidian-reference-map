import React, { useEffect, useState, useRef } from 'react'
import { IndexPaper, LocalCache } from 'src/types'
import ReferenceMap from 'src/main'
import EventBus, { EVENTS } from 'src/events'
import { IndexPaperCard } from 'src/components/IndexPaperCard'
import { getCSLFormats, indexSearch } from 'src/utils/postprocess'
import { UpdateChecker } from 'src/data/updateChecker'
import { ReferenceMapData } from 'src/data/data'
import { CopyIcon } from 'src/icons'
import { copyToClipboard, fragWithHTML } from 'src/utils/functions'
import { htmlToMarkdown } from 'obsidian'

type UserSearchProps = {
	isSearchList?: boolean;
	setQuery?: (query: string) => void;
	papers?: IndexPaper[];
	cache?: LocalCache;
}

const UserSearch: React.FC<UserSearchProps> = ({ isSearchList, setQuery, papers, cache }) => (
	<div className="orm-plugin-name">
		<div className="orm-search-form">
			<div className="index-search">
				{papers && papers?.length > 0 &&
					<div className="orm-plugin-global-copy" onClick={async () => {
						if (!papers) return;
						const copyData = await getCSLFormats(papers, cache)?.map(
							(item: string) => htmlToMarkdown(fragWithHTML(item)).replace(/\n/, ' ')
						)
						copyToClipboard(copyData.join('\n\n'))
					}}>
						<CopyIcon />
					</div>
				}
				<input
					type="search"
					className={`orm-search-input ${isSearchList ? 'orm-index-search' : 'orm-index-no-search'}`}
					placeholder={`Reference Map`}
					onChange={(e) => {
						if (!setQuery) return;
						return setQuery(e.target.value)
					}}
					style={{ padding: '0 35px 0 35px' }}
				/>
				{isSearchList && <div className="cardCount">{papers && papers?.length > 0 ? papers.length : ''}</div>}
			</div>
		</div>
	</div>
)

type SetKeyInfoProps = {
	searchCiteKey?: boolean;
}

const SetKeyInfo: React.FC<SetKeyInfoProps> = ({ searchCiteKey }) => {
	return (
		<div>
			{!searchCiteKey &&
				<div className="orm-no-content-subtext">
					Configure <code>Get References Using CiteKey</code> in the settings tab to process citations using pandoc citekey
				</div>
			}
		</div>
	)
}


export const ReferenceMapList = (props: {
	plugin: ReferenceMap
	referenceMapData: ReferenceMapData
	updateChecker: UpdateChecker
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([])
	const [selection, setSelection] = useState('')
	const [query, setQuery] = useState('')
	const activeRef = useRef<HTMLDivElement>(null)
	const { viewManager, getLocalReferences } = props.referenceMapData;

	const fetchData = async () => {
		const { indexIds, citeKeyMap, fileName, frontmatter, basename } = props.updateChecker
		let updatedIndexIds = indexIds;
		if (props.plugin.settings.removeDuplicateIds) {
			const updatedIndexIdsArray = [...indexIds].filter((id: string) => !Object.values(citeKeyMap).some(item => item.paperId.toLocaleLowerCase() === id.toLocaleLowerCase()));
			updatedIndexIds = new Set(updatedIndexIdsArray);
		}
		const indexCards = await props.referenceMapData.getIndexCards(
			updatedIndexIds, citeKeyMap, fileName, frontmatter, basename
		)
		setPapers(indexCards)
	}

	useEffect(() => {
		const localPapers = getLocalReferences(props.updateChecker.citeKeyMap)
		setPapers(localPapers);
	}, [props.updateChecker.basename])

	useEffect(() => {
		if (props.plugin.settings.isLocalExclusive) {
			setPapers(getLocalReferences(props.updateChecker.citeKeyMap));
		} else {
			fetchData()
		}
	}, [
		props.updateChecker.basename,
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
				// block: 'nearest',
				behavior: 'smooth',
				inline: 'start'
			})
		EventBus.on(EVENTS.SELECTION, (sel) => setSelection(sel))
	}, [selection])


	if (!props.updateChecker.basename) {
		return (
			<div className="orm-no-content">
				<UserSearch />
				<div className="orm-no-content-subtext">
					No Active Markdown File.
					<br />
					Click on a file to view its references.
				</div>
				<SetKeyInfo searchCiteKey={props.plugin.settings.searchCiteKey} />
			</div>
		)
	}
	if (papers.length > 0) {
		return (
			<>
				<div className="orm-reference-map">
					<UserSearch
						isSearchList={true}
						setQuery={setQuery}
						papers={papers}
						cache={props.referenceMapData.cache}
					/>
					{indexSearch(papers, query).map((paper, index) => {
						const paperId = paper.id.replace('@', '');
						const activeIndexCardClass = selection?.includes(paperId) ? 'orm-active-index' : '';
						const ref = activeIndexCardClass ? activeRef : null
						return (
							<div
								key={`${paper.id}${index}${props.updateChecker.basename}`}
								ref={ref}
							>
								<IndexPaperCard
									className={activeIndexCardClass}
									plugin={props.plugin}
									rootPaper={paper}
									viewManager={viewManager}
								/>
							</div>
						)
					})}
				</div>
			</>
		)
	}

	return (
		<div className="orm-no-content">
			<UserSearch />
			<div className="orm-no-content-subtext">
				No Valid References Found.
			</div>
			<SetKeyInfo searchCiteKey={props.plugin.settings.searchCiteKey} />
		</div>
	)
}