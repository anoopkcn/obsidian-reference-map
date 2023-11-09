import { MarkdownView } from 'obsidian';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import EventBus from 'src/EventBus';
import { LoadingPuff } from 'src/components/LoadingPuff';
import { ReferenceMapData } from 'src/referenceData';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';

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

export const ReferenceMapGraph = (props: {
    width: number
    height: number
    settings: ReferenceMapSettings
    referenceMapData: ReferenceMapData
    activeView: MarkdownView | null
}) => {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fgRef = useRef<any>();
    const { settings, activeView } = props;
    const { viewManager } = props.referenceMapData;
    const basename = activeView?.file?.basename;


    const fetchData = useCallback(async (indexCards: IndexPaper[]) => {
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
    }, [settings, viewManager]);


    const handleNodeClick = (node: NodeObject) => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            fgRef.current.zoom(2.0, 400);
            fgRef.current.centerAt(node.x, node.y, 400);
        }
    };

    useEffect(() => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            fgRef.current.d3Force("charge").strength(-10);
            fgRef.current.d3Force("link").distance(100);
            // fgRef.current.d3Force("charge").distanceMax(150);
        }
    }, [data]);

    useEffect(() => {
        props.referenceMapData.getIndexCards(activeView).then(async (cards) => {
            setIsLoading(true)
            const graphData = await fetchData(cards)
            setData(formatData(graphData))
            console.log('Cite keys have changed', graphData);
            setIsLoading(false)
        });
    }, [basename, settings]);

    useEffect(() => {
        EventBus.on('keys-changed', () => {
            props.referenceMapData.getIndexCards(activeView).then(async (cards) => {
                setIsLoading(true)
                const graphData = await fetchData(cards)
                setData(formatData(graphData))
                console.log('Cite keys have changed', graphData);
                setIsLoading(false)
            });
        });
    }, []);

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

    if (!basename) {
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