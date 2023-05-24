import _ from 'lodash'
import { requestUrl } from 'obsidian'
import { SEMANTIC_FIELDS, SEMANTICSCHOLAR_API_URL } from 'src/constants'
import { Reference } from 'src/types'

export const getIndexItem = async (
	paperId: string,
	debugMode = false
): Promise<Reference | null> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}?fields=${SEMANTIC_FIELDS.join(
		','
	)}`
	const paperMetadata: Reference | null = await requestUrl(url).then(
		(response) => {
			if (response.status !== 200) {
				if (debugMode) console.log(`Error ${response.status}`) //TODO: better error handling
				return null
			}
			return response.json as Reference
		}
	)
	return paperMetadata
}

export const getReferenceItems = async (
	paperId: string,
	debugMode = false
): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}/references?limit=1000&fields=${SEMANTIC_FIELDS.join(
		','
	)}`
	const references: Reference[] = await requestUrl(url).then(
		(response) => {
			if (response.status !== 200) {
				if (debugMode) console.log(`Error ${response.status}`) //TODO: better error handling
				return []
			}
			return _.map(response.json.data, 'citedPaper')
		}
	)
	return references
}

export const getCitationItems = async (
	paperId: string,
	debugMode = false
): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}/citations?limit=1000&fields=${SEMANTIC_FIELDS.join(
		','
	)}`
	const citations: Reference[] = await requestUrl(url).then(
		(response) => {
			if (response.status !== 200) {
				if (debugMode) console.log(`Error ${response.status}`) //TODO: better error handling
				return []
			}
			return _.map(response.json.data, 'citingPaper')
		}
	)
	return citations
}

export const getSearchItems = async (
	query: string,
	limit: number,
	debugMode = false
): Promise<Reference[]> => {
	let url = `${SEMANTICSCHOLAR_API_URL}/paper/search?query=${query}&fields=${SEMANTIC_FIELDS.join(
		','
	)}`
	if (limit !== 0) url += `&offset=0&limit=${limit}`
	const search: Reference[] = await requestUrl(url).then((response) => {
		if (response.status !== 200) {
			if (debugMode) console.log(`Error ${response.status}`) //TODO: better error handling
			return []
		}
		return response.json.data
	})
	return search
}

export const getPaperMetadata = async (
	paperId = '',
	refType = 'paper',
	query = '',
	offlimit = [0, null],
	unknownRef = false
): Promise<Reference[]> => {
	let fields: string
	let cite: string
	const offset = offlimit[0]
	const limit = offlimit[1]

	if (refType === 'references') {
		fields = `${paperId}/references?fields=${SEMANTIC_FIELDS.join(',')}`
		cite = 'citedPaper'
	} else if (refType === 'citations') {
		fields = `${paperId}/citations?fields=${SEMANTIC_FIELDS.join(',')}`
		cite = 'citingPaper'
	} else if (refType === 'search') {
		if (query === '') return []
		fields = `search?query=${query}&fields=${SEMANTIC_FIELDS.join(',')}`
	} else {
		fields = `${paperId}?fields=${SEMANTIC_FIELDS.join(',')}`
	}

	if (offset != 0) fields += `&offset=${offset}`
	if (limit != null) fields += `&limit=${limit}`
	if (unknownRef) fields += '&include_unknown_references=true'

	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${fields}`
	const papermetadata: Reference[] = await requestUrl(url).then(
		(response) => {
			if (response.status !== 200) {
				console.log(`Error ${response.status}`) //TODO: better error handling
				return []
			} else if (response.json.data) {
				if (refType === 'search') return response.json.data
				return _.map(response.json.data, cite)
			} else {
				return [response.json]
			}
		}
	)
	return papermetadata
}

export const postPaperMetadata = async (
	paperIds: Set<string>
): Promise<Reference[]> => {
	const fields = `?fields=${SEMANTIC_FIELDS.join(',')}`
	// add json body to request
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/batch${fields}`
	const papermetadata: Reference[] = await requestUrl({
		url: url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ids: Array.from(paperIds) }),
	}).then((response) => {
		if (response.status !== 200) {
			// console.log(`Error ${response.status}`)
			//TODO: better error handling
			return []
		} else if (response.json.data) {
			return response.json.data
		} else {
			return response.json
		}
	})
	return papermetadata
}
