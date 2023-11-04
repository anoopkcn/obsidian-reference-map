import React, { useEffect, useState } from 'react'
// import { ViewManager } from 'src/viewManager'
import ForceGraph2D, { GraphData } from 'react-force-graph-2d';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';
import { ViewManager } from 'src/viewManager';

interface MapGrapData {
    paper: Reference
    references: Reference[]
    citations: Reference[]
}

export const ReferenceMapGraph = (props: {
    settings: ReferenceMapSettings
    viewManager: ViewManager
    indexCards: IndexPaper[]
    width: number
    height: number
}) => {
    const [data, setData] = useState<MapGrapData[]>()

    const getReferences = async (paper: IndexPaper) => {
        const references = await props.viewManager.getReferences(paper.paper.paperId);
        const filteredReferences = props.settings.filterRedundantReferences
            ? references.filter((reference) => reference.referenceCount > 0 || reference.citationCount > 0)
            : references;
        return filteredReferences;
    };

    const getCitations = async (paper: IndexPaper) => {
        const citations = await props.viewManager.getCitations(paper.paper.paperId);
        const filteredCitations = props.settings.filterRedundantReferences
            ? citations.filter((citation) => citation.referenceCount > 0 || citation.citationCount > 0)
            : citations;
        return filteredCitations;
    };

    // Fetch data
    const fetchData = async () => {
        const dataPromises = props.indexCards.map(async (paper) => {
            const references = await getReferences(paper);
            const citations = await getCitations(paper);
            return {
                paper: paper.paper,
                references: references,
                citations: citations
            }
        });

        const resolvedData = await Promise.all(dataPromises);
        setData(resolvedData);
    }
    // Call fetchData in an effect hook
    useEffect(() => {
        fetchData();
    }, [props.indexCards]);

    const formatData = (data: MapGrapData[]): GraphData => {
        const nodes: any[] = [];
        const links: any[] = [];

        data.forEach((item, index) => {
            const paperId = item.paper.paperId ? item.paper.paperId : `paper${index}`;
            nodes.push({
                id: paperId,
                name: item.paper.title,
                val: 10,
                color: "#61C1E8"
            });

            item.references.forEach((reference, refIndex) => {
                const referenceId = reference.paperId ? reference.paperId : `reference${index}${refIndex}`;
                nodes.push({
                    id: referenceId,
                    name: reference.title,
                    val: 5,
                    color: "#7ABA57"
                });
                links.push({
                    source: referenceId,
                    target: paperId
                });
            });

            item.citations.forEach((citation, citIndex) => {
                const citationId = citation.paperId ? citation.paperId : `citation${index}${citIndex}`;
                nodes.push({
                    id: citationId,
                    name: citation.title,
                    val: 2,
                    color: "#A15399"
                });
                links.push({
                    source: paperId,
                    target: citationId
                });
            });
        });

        return {
            nodes: nodes,
            links: links
        };
    };

    if (!data) return null;
    const graphData = formatData(data);
    console.log(graphData);

    return (
        <ForceGraph2D width={props.width} height={props.height} graphData={graphData} />
    )
}

// const dataLayout: GraphData = {
//     "nodes": [
//         {
//             "id": "id1",
//             "name": "citedPaper",
//             "val": 5,
//             "color": "#7ABA57"
//         },
//         {
//             "id": "id2",
//             "name": "indexPaper",
//             "val": 10,
//             "color": "#61C1E8"
//         },
//         {
//             "id": "id3",
//             "name": "citingPaper",
//             "val": 2,
//             "color": "#A15399"
//         },
//     ],
//     "links": [
//         {
//             "source": "id1",
//             "target": "id2"
//         },
//         {
//             "source": "id2",
//             "target": "id3"
//         }
//     ]
// }