import _ from 'lodash';
import { MarkdownView } from 'obsidian';
import React, { useEffect, useRef, useState } from 'react'
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
        const paperId = String(item.paper.id ? item.paper.id : item.paper.paper.paperId);
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
            const referenceId = String(reference.paperId ? reference.paperId : `reference${paperId}${refIndex}`);
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
            const citationId = String(citation.paperId ? citation.paperId : `citation${paperId}${citIndex}`);
            maxCitationCount = Math.max(maxCitationCount, citation.citationCount);
            minCitationCount = Math.min(minCitationCount, citation.citationCount);

            nodes.push({
                id: citationId,
                name: citation.title,
                val: citation.citationCount,
                color: "#A15399"
            });
            links.push({
                source: citationId,
                target: paperId
            });
        });
    });
    // Normalize the citation counts
    nodes.forEach(node => {
        node.val = 1 + (node.val - minCitationCount) * (20 - 1) / (maxCitationCount - minCitationCount);
    });

    return {
        nodes: _.uniqBy(nodes, 'id'),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>();
    const { settings, activeView } = props;
    const { viewManager } = props.referenceMapData;
    const basename = activeView?.file?.basename;


    const fetchData = async (indexCards: IndexPaper[]) => {
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
    }

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
            setIsLoading(false)
        });
    }, [basename, settings]);

    useEffect(() => {
        EventBus.on('keys-changed', () => {
            props.referenceMapData.getIndexCards(activeView).then(async (cards) => {
                setIsLoading(true)
                const graphData = await fetchData(cards)
                const newSubgraph = formatData(graphData);
                // Get the ids of the new nodes
                const newNodeIds = new Set(newSubgraph.nodes.map(node => node.id));
                setData(prevData => ({
                    nodes: _.uniqBy([...prevData.nodes, ...newSubgraph.nodes].filter(node => newNodeIds.has(node.id)), 'id'),
                    links: [...prevData.links, ...newSubgraph.links].filter(link => {
                        const target = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
                        const source = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
                        return newNodeIds.has(source) && newNodeIds.has(target);
                    })
                }))
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
                    linkColor={() => '#363636'}
                    onNodeClick={handleNodeClick}
                    linkDirectionalArrowRelPos={1}
                    linkDirectionalArrowLength={10}
                    onNodeDrag={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    onNodeDragEnd={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
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