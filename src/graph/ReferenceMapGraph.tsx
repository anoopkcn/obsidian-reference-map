import React, { useEffect, useRef, useState } from 'react'
// import { ViewManager } from 'src/viewManager'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import { ReferenceMapData } from 'src/referenceData';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';


interface MapGraphData {
    paper: Reference
    references: Reference[]
    citations: Reference[]
}

export const ReferenceMapGraph = (props: {
    settings: ReferenceMapSettings
    referenceMapData: ReferenceMapData
    indexCards: IndexPaper[]
    width: number
    height: number
}) => {
    const [data, setData] = useState<GraphData>()
    const fgRef = useRef<any>();

    const fetchData = async () => {
        try {
            if (!props.indexCards) return;

            const dataPromises = props.indexCards.map(async (paper) => {
                const references = await props.referenceMapData.viewManager.getReferences(paper.paper.paperId);
                const filteredReferences = props.settings.filterRedundantReferences
                    ? references.filter((reference) => reference.referenceCount > 0 || reference.citationCount > 0)
                    : references;
                const citations = await props.referenceMapData.viewManager.getCitations(paper.paper.paperId);
                const filteredCitations = props.settings.filterRedundantReferences
                    ? citations.filter((citation) => citation.referenceCount > 0 || citation.citationCount > 0)
                    : citations;
                return {
                    paper: paper.paper,
                    references: filteredReferences,
                    citations: filteredCitations
                };
            });

            const resolvedData = await Promise.all(dataPromises);
            const formattedData = formatData(resolvedData);
            setData(formattedData);
        } catch (error) {
            console.error(error);
        }
    };


    const formatData = (data: MapGraphData[]): GraphData => {
        const nodes: NodeObject[] = [];
        const links: LinkObject[] = [];

        let maxCitationCount = 1;
        let minCitationCount = 0;

        data.forEach((item, index) => {
            const paperId = item.paper.paperId ? item.paper.paperId : `index${index}`;
            maxCitationCount = Math.max(maxCitationCount, item.paper.citationCount);
            minCitationCount = Math.min(minCitationCount, item.paper.citationCount);

            nodes.push({
                id: paperId,
                name: item.paper.title,
                val: item.paper.citationCount,
                color: "#61C1E8",
                isIndex: true
            });

            item.references.forEach((reference, refIndex) => {
                const referenceId = reference.paperId ? reference.paperId : `reference${index}${refIndex}`;
                maxCitationCount = Math.max(maxCitationCount, reference.citationCount);
                minCitationCount = Math.min(minCitationCount, reference.citationCount);

                nodes.push({
                    id: referenceId,
                    name: reference.title,
                    val: reference.citationCount,
                    color: "#7ABA57"
                });
                links.push({
                    source: referenceId,
                    target: paperId
                });
            });

            item.citations.forEach((citation, citIndex) => {
                const citationId = citation.paperId ? citation.paperId : `citation${index}${citIndex}`;
                maxCitationCount = Math.max(maxCitationCount, citation.citationCount);
                minCitationCount = Math.min(minCitationCount, citation.citationCount);

                nodes.push({
                    id: citationId,
                    name: citation.title,
                    val: citation.citationCount,
                    color: "#A15399"
                });
                links.push({
                    source: paperId,
                    target: citationId
                });
            });
        });
        // Normalize the citation counts
        nodes.forEach(node => {
            node.val = 1 + (node.val - minCitationCount) * (20 - 1) / (maxCitationCount - minCitationCount);
        });

        return {
            nodes: nodes,
            links: links
        };
    };

    useEffect(() => {
        fetchData()
    }, [props.indexCards]);

    useEffect(() => {
        fgRef.current.d3Force("charge").strength(-40);
        fgRef.current.d3Force("link").distance(50);
        fgRef.current.d3Force("charge").distanceMax(150);
    }, [data]);

    const handleNodeClick = (node: NodeObject) => {
        fgRef.current.zoom(3.5, 400);
        fgRef.current.centerAt(node.x, node.y, 400);
    };

    return (
        <ForceGraph2D
            ref={fgRef}
            width={props.width}
            height={props.height}
            graphData={data}
            onNodeClick={handleNodeClick}
            linkColor={() => '#d3d3d3'}
        // nodeRelSize={1}
        />
    )
}