import LRUCache from 'lru-cache'
import ReferenceMap from 'src/main'
import {
	getIndexItem,
	getReferenceItems,
	getCitationItems,
	getSearchItems,
	getBatchItems,
} from 'src/apis/s2agAPI'
import { Reference } from 'src/apis/s2agTypes'

export class ViewManager {
	private indexCache = new LRUCache<string, Reference | null | undefined>({ max: 150 })
	private refCache = new LRUCache<string, Reference[]>({ max: 150 })
	private citeCache = new LRUCache<string, Reference[]>({ max: 150 })
	private searchCache = new LRUCache<string, Reference[]>({ max: 20 })
	private batchCache = new LRUCache<string, Reference[]>({ max: 50 })

	constructor(private plugin: ReferenceMap) { }

	clearCache = () => {
		this.indexCache.clear()
		this.batchCache.clear()
		this.refCache.clear()
		this.citeCache.clear()
		this.searchCache.clear()
	}

	getBatchPapers = async (paperIds: string[]): Promise<Reference[]> => {
		const cachedBatch = this.batchCache.get(paperIds.join(','))
		if (cachedBatch) {
			return cachedBatch
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const batchPapers = await getBatchItems(paperIds, debugMode)
			this.batchCache.set(paperIds.join(','), batchPapers)
			return batchPapers
		} catch (e) {
			if (debugMode) {
				console.log('ORM: S2AG API Batch request error', e)
			}
			return []
		}
	}

	getIndexPaper = async (paperId: string, cacheError = true): Promise<Reference | null | undefined> => {

		if (this.indexCache.has(paperId)) {
			return this.indexCache.get(paperId)
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const paper = await getIndexItem(paperId, debugMode)
			this.indexCache.set(paperId, paper)
			return paper
		} catch (e) {
			if (debugMode) {
				console.log(`ORM: S2AG API index card request error with status ${e}. Fallback library is used to show metadata. Check your internet connection, Validity of DOI/URL in the local library`)
			}
			if (cacheError) this.indexCache.set(paperId, null)
			return null
		}
	}

	searchIndexPapers = async (query: string, limit = 0, cache = true): Promise<Reference[]> => {
		const cacheKey = `${query}${limit}`
		const cachedSearch = this.searchCache.get(cacheKey)
		if (cachedSearch) {
			return cachedSearch
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const indexCardsList = await getSearchItems(query, limit, debugMode)
			if (cache) {
				this.searchCache.set(cacheKey, indexCardsList)
			}
			return indexCardsList
		} catch (e) {
			if (debugMode) {
				console.log(`ORM: S2AG API index card request error with status ${e}`)
			}
			return []
		}
	}

	getReferences = async (paperId: string): Promise<Reference[]> => {
		if (this.refCache.has(paperId)) {
			return this.refCache.get(paperId) ?? []
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const references = await getReferenceItems(paperId, this.plugin.settings.citedLimit, debugMode)
			this.refCache.set(paperId, references)
			return references
		} catch (e) {
			if (debugMode) {
				console.log(`ORM: S2AG API reference card request error with status ${e}`)
			}
			return []
		}
	}

	getCitations = async (paperId: string): Promise<Reference[]> => {
		if (this.citeCache.has(paperId)) {
			return this.citeCache.get(paperId) ?? []
		}
		const debugMode = this.plugin.settings.debugMode
		try {
			const citations = await getCitationItems(paperId, this.plugin.settings.citingLimit, debugMode)
			this.citeCache.set(paperId, citations)
			return citations
		} catch (e) {
			if (debugMode) {
				console.log(`ORM: S2AG API citation card request error with status ${e}`)
			}
			return []
		}
	}
}