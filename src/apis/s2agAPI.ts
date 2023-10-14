import _ from 'lodash';
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
	return _.map(response.json.data, 'citedPaper');
};

export const getCitationItems = async (paperId: string, debugMode = false): Promise<Reference[]> => {
	const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}/citations?fields=${SEMANTIC_FIELDS.join(',')}`;
	const response = await requestUrl(url);
	if (response.status !== 200) {
		if (debugMode) console.log(`Error ${response.status}`); //TODO: better error handling
		return [];
	}
	return _.map(response.json.data, 'citingPaper');
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
	return response.json.data;
};