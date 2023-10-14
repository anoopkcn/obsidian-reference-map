import LRUCache from 'lru-cache'
import { Reference } from './types'
import ReferenceMap from './main'
import {
	getIndexItem,
	getReferenceItems,
	getCitationItems,
	getSearchItems,
} from './apis/s2agAPI'

export class ViewManager {
	private indexCache = new LRUCache<string, Reference | number | null>({ max: 150 })
	private refCache = new LRUCache<string, Reference[]>({ max: 20 })
	private citeCache = new LRUCache<string, Reference[]>({ max: 20 })
	private searchCache = new LRUCache<string, Reference[]>({ max: 20 })

	constructor(private plugin: ReferenceMap) { }

	clearCache = () => {
		this.indexCache.clear()
		this.refCache.clear()
		this.citeCache.clear()
		this.searchCache.clear()
	}

	getIndexPaper = async (paperId: string): Promise<Reference | number | null> => {
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
				console.log('ORM: S2AG API Index Card request error', e)
			}
			if (e.status === 404) {
				this.indexCache.set(paperId, e.status)
			}
			return e.status
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
				console.log('ORM: S2AG API SEARCH request error', e)
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
				console.log('ORM: S2AG API GET references request error', e)
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
				console.log('ORM: S2AG API  GET citations request error', e)
			}
			return []
		}
	}
}