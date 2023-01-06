import { requestUrl } from "obsidian";
import { SEMANTIC_FIELDS, SEMANTICSCHOLAR_API_URL } from "./constants";
import { SemanticPaper } from "./types";

export const getPaperMetadata = async (
    paperId: string,
    refType = 'paper',
    offlimit = [0, null],
    unknownRef = false
): Promise<SemanticPaper[]> => {
    let fields: string;
    let cite: string;
    const offset = offlimit[0]
    const limit = offlimit[1]


    if (refType == 'references') { fields = `/references?fields=${SEMANTIC_FIELDS.join(',')}`; cite = 'citedPaper' }
    else if (refType == 'citations') { fields = `/citations?fields=${SEMANTIC_FIELDS.join(',')}`; cite = 'citingPaper' }
    else { fields = `?fields=${SEMANTIC_FIELDS.join(',')}` }

    if (offset != 0) fields += `&offset=${offset}`
    if (limit != null) fields += `&limit=${limit}`
    if (unknownRef) fields += '&include_unknown_references=true'

    const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}${fields}`
    const papermetadata: SemanticPaper[] = await requestUrl(url).then(
        (response) => {
            if (response.status != 200) {
                console.log(`Error ${response.status}`) //TODO: better error handling
                return []
            } else if (response.json.data) {
                return response.json.data.map((e: Record<string, unknown>) => e[cite])
            } else {
                return [response.json]
            }
        }
    )
    return papermetadata
}

export const postPaperMetadata = async (paperIds: Set<string>): Promise<SemanticPaper[]> => {
    const fields = `?fields=${SEMANTIC_FIELDS.join(',')}`
    // add json body to request
    const url = `${SEMANTICSCHOLAR_API_URL}/paper/batch${fields}`
    const papermetadata: SemanticPaper[] = await requestUrl({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: Array.from(paperIds) })
    }).then(
        (response) => {
            if (response.status != 200) {
                // console.log(`Error ${response.status}`) 
                //TODO: better error handling
                return []
            } else if (response.json.data) {
                return response.json.data
            } else {
                return response.json
            }
        }
    )
    return papermetadata

}
