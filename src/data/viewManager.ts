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
	private indexCache = new LRUCache<string, Reference | number | null>({ max: 150 })
	private batchCache = new LRUCache<string, Reference[]>({ max: 50 })
	private refCache = new LRUCache<string, Reference[]>({ max: 150 })
	private citeCache = new LRUCache<string, Reference[]>({ max: 150 })
	private searchCache = new LRUCache<string, Reference[]>({ max: 20 })

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

	getIndexPaper = async (paperId: string, cacheError = true): Promise<Reference | number | null> => {
		const cachedPaper = this.indexCache.get(paperId)
		if (cachedPaper) {
			return cachedPaper
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
			if (cacheError) this.indexCache.set(paperId, 404)
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
		const cachedRefs = this.refCache.get(paperId)
		if (cachedRefs) {
			return cachedRefs
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const references = await getReferenceItems(paperId, debugMode)
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
		const cachedCitations = this.citeCache.get(paperId)
		if (cachedCitations) {
			return cachedCitations
		}

		const debugMode = this.plugin.settings.debugMode
		try {
			const citations = await getCitationItems(paperId, debugMode)
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