import { requestUrl } from "obsidian";
import { FIELDS, SEMANTICSCHOLAR_API_URL } from "./constants";
import { Paper } from "./types";

export const getPaperMetadata = async (paperId: string, refType = 'paper', offlimit = [0, null], unknownRef = false): Promise<Paper[]> => {
    let fields: string;
    let cite: string;
    const offset = offlimit[0]
    const limit = offlimit[1]


    if (refType == 'references') { fields = `/references?fields=${FIELDS.join(',')}`; cite = 'citedPaper' }
    else if (refType == 'citations') { fields = `/citations?fields=${FIELDS.join(',')}`; cite = 'citingPaper' }
    else { fields = `?fields=${FIELDS.join(',')}` }

    if (offset != 0) fields += `&offset=${offset}`
    if (limit != null) fields += `&limit=${limit}`
    if (unknownRef) fields += '&include_unknown_references=true'

    const url = `${SEMANTICSCHOLAR_API_URL}/paper/${paperId}${fields}`
    const papermetadata: Paper[] = await requestUrl(url).then(
        (response) => {
            if (response.status != 200) {
                console.error(`Error ${response.status}`)
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
