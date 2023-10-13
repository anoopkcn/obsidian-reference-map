import { requestUrl } from 'obsidian'
import { SEMANTIC_FIELDS, SEMANTICSCHOLAR_API_URL } from 'src/constants'
import { Reference } from 'src/types'

export const getIndexItem = async (paperId: string, debugMode = false): Promise<Reference | null> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}?fields=${SEMANTIC_FIELDS.join(',')}`;
	const response = await requestUrl(url);
	if (response.status !== 200) {
		if (debugMode) console.log(`Error ${response.status}`); //TODO: better error handling
		return null;
	}
	return response.json as Reference;
};

export const getReferenceItems = async (paperId: string, debugMode = false): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}/references?fields=${SEMANTIC_FIELDS.join(',')}`;
	const response = await requestUrl(url);
	if (response.status !== 200) {
		if (debugMode) console.log(`Error ${response.status}`); //TODO: better error handling
		return [];
	}
	const references = response.json.data.map((item: { citedPaper: Reference }) => item.citedPaper);
	return references;
};

export const getCitationItems = async (paperId: string, debugMode = false): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}/citations?fields=${SEMANTIC_FIELDS.join(',')}`;
	const response = await requestUrl(url);
	if (response.status !== 200) {
		if (debugMode) console.log(`Error ${response.status}`); //TODO: better error handling
		return [];
	}
	const citations = response.json.data.map((item: { citingPaper: Reference }) => item.citingPaper);
	return citations;
};

export const getSearchItems = async (
	query: string,
	limit: number,
	debugMode = false
): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/search?query=${query}&fields=${SEMANTIC_FIELDS.join(',')}&offset=0&limit=${limit}`;
	const response = await requestUrl(url);
	if (response.status !== 200) {
		if (debugMode) console.log(`Error ${response.status}`); //TODO: better error handling
		return [];
	}

	const responseData = response.json.data;
	return responseData;
};