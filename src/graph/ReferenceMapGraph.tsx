import React, { useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import { LoadingPuff } from 'src/components/LoadingPuff';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';
import { ViewManager } from 'src/viewManager';

interface MapGraphData {
    paper: IndexPaper
    references: Reference[]
    citations: Reference[]
}

const formatData = (data: MapGraphData[]): GraphData => {
    const nodes: NodeObject[] = [];
    const links: LinkObject[] = [];

    let maxCitationCount = 1;
    let minCitationCount = 0;

    data.forEach((item, index) => {
        const paperId = item.paper.paper.paperId ? item.paper.paper.paperId : item.paper.id;
        maxCitationCount = Math.max(maxCitationCount, item.paper.paper.citationCount);
        minCitationCount = Math.min(minCitationCount, item.paper.paper.citationCount);

        nodes.push({
            id: paperId,
            name: item.paper.paper.title,
            val: item.paper.paper.citationCount,
            color: "#61C1E8",
            isIndex: true
        });

        item.references.forEach((reference, refIndex) => {
            const referenceId = reference.paperId ? reference.paperId : `reference${paperId}`;
            maxCitationCount = Math.max(maxCitationCount, reference.citationCount);
            minCitationCount = Math.min(minCitationCount, reference.citationCount);

            nodes.push({
                id: referenceId,
                name: reference.title,
                val: reference.citationCount,
                color: "#7ABA57"
            });
            links.push({
                source: paperId,
                target: referenceId
            });
        });

        item.citations.forEach((citation, citIndex) => {
            const citationId = citation.paperId ? citation.paperId : `citation${paperId}`;
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

const fetchData = async (indexCards: IndexPaper[], settings: ReferenceMapSettings, viewManager: ViewManager) => {
    try {
        if (!indexCards) return [];

        const dataPromises = indexCards.map(async (paper) => {
            const references = await viewManager.getReferences(paper.paper.paperId);
            const filteredReferences = settings.filterRedundantReferences
                ? references.filter((reference) => reference.referenceCount > 0 || reference.citationCount > 0)
                : references;
            const citations = await viewManager.getCitations(paper.paper.paperId);
            const filteredCitations = settings.filterRedundantReferences
                ? citations.filter((citation) => citation.referenceCount > 0 || citation.citationCount > 0)
                : citations;
            return {
                paper: paper,
                references: filteredReferences,
                citations: filteredCitations
            };
        });

        const resolvedData = await Promise.all(dataPromises);
        return resolvedData
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const ReferenceMapGraph = (props: {
    width: number
    height: number
    settings: ReferenceMapSettings
    viewManager: ViewManager
    indexCards: IndexPaper[]
    basename: string | undefined
}) => {
    const [data, setData] = useState<GraphData>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fgRef = useRef<any>();

    const gatherData = async () => {
        setIsLoading(true)
        const graphData = await fetchData(props.indexCards, props.settings, props.viewManager)
        setData(formatData(graphData))
        setIsLoading(false)
    }

    const handleNodeClick = (node: NodeObject) => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            fgRef.current.zoom(3.5, 400);
            fgRef.current.centerAt(node.x, node.y, 400);
        }
    };

    useEffect(() => {
        gatherData()
    }, [props.basename, props.settings, props.indexCards]);

    useEffect(() => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            fgRef.current.d3Force("charge").strength(-10);
            fgRef.current.d3Force("link").distance(100);
            // fgRef.current.d3Force("charge").distanceMax(150);
        }
    }, [data]);

    const PartialLoading = (props: { isLoading: boolean }) => {
        if (props.isLoading) {
            return (
                <div className="orm-no-content">
                    <div>
                        <div className="orm-no-content-subtext">
                            <div className="orm-loading">
                                <LoadingPuff />
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (<></>)
        }
    }

    if (props.basename === undefined) {
        return (
            <div className="orm-no-content">
                <div>
                    <div className="orm-no-content-subtext">
                        No Active Markdown File.
                        <br />
                        Click on a file to view its references.
                    </div>
                </div>
            </div>
        )
    } else if (!(Array.isArray(data) && data.length === 0) || isLoading) {
        return (
            <div>
                <PartialLoading isLoading={isLoading} />
                <ForceGraph2D
                    ref={fgRef}
                    width={props.width}
                    height={props.height}
                    graphData={data}
                    onNodeClick={handleNodeClick}
                    linkColor={() => '#363636'}
                />
            </div>
        )
    } else {
        return (
            <div className="orm-no-content">
                <div>
                    <div className="orm-no-content-subtext">
                        No Valid References Found.
                    </div>
                </div>
            </div>
        )
    }
}