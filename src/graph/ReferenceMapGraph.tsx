import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import EventBus, { EVENTS } from 'src/EventBus';
import { PaperCard } from 'src/components/PaperCard';
import { PartialLoading } from 'src/components/PartialLoading';
import { ReferenceMapData } from 'src/referenceData';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';
import { UpdateChecker } from 'src/utils';
import * as d3 from 'd3';

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
        const indexCitationCount = item.paper.paper.citationCount;
        maxCitationCount = Math.max(maxCitationCount, indexCitationCount);
        minCitationCount = Math.min(minCitationCount, indexCitationCount);

        nodes.push({
            id: paperId,
            name: item.paper.paper.title,
            val: indexCitationCount,
            color: "#61C1E8",
            type: 'index',
            data: { id: paperId, location: null, paper: item.paper.paper }
        });

        item.references.forEach((reference, refIndex) => {
            const referenceId = String(reference.paperId ? reference.paperId : `${paperId}-cited-${refIndex}`);
            const referenceCitationCount = reference.citationCount;
            maxCitationCount = Math.max(maxCitationCount, referenceCitationCount);
            minCitationCount = Math.min(minCitationCount, referenceCitationCount);

            nodes.push({
                id: referenceId,
                name: reference.title,
                val: referenceCitationCount,
                color: "#7ABA57",
                type: 'reference',
                data: { id: referenceId, location: null, paper: reference }
            });
            links.push({
                source: paperId,
                target: referenceId
            });
        });

        item.citations.forEach((citation, citIndex) => {
            const citationId = String(citation.paperId ? citation.paperId : `${paperId}-citing-${citIndex}`);
            const citationCitationCount = citation.citationCount;
            maxCitationCount = Math.max(maxCitationCount, citationCitationCount);
            minCitationCount = Math.min(minCitationCount, citationCitationCount);

            nodes.push({
                id: citationId,
                name: citation.title,
                val: citationCitationCount,
                color: "#A15399",
                type: 'citation',
                data: { id: citationId, location: null, paper: citation }
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

    links.forEach((link: LinkObject) => {

        // Select nodes that have id as links.source or links.target
        const a = nodes.find(node => node.id === link.source);
        const b = nodes.find(node => node.id === link.target);

        if (!a || !b) {
            return;
        }

        a.neighbors = a.neighbors || [];
        b.neighbors = b.neighbors || [];

        a.neighbors.push(b);
        b.neighbors.push(a);

        if (!a.links) {
            a.links = [];
        }
        if (!b.links) {
            b.links = [];
        }

        a.links.push(link);
        b.links.push(link);
    });

    const tempData: GraphData = {
        nodes: _.uniqBy(nodes, 'id'),
        links: links
    }

    return tempData
};

export const ReferenceMapGraph = (props: {
    width: number
    height: number
    settings: ReferenceMapSettings
    referenceMapData: ReferenceMapData
    updateChecker: UpdateChecker
}) => {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>();
    // const [hoverNode, setHoverNode] = useState<NodeObject | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);
    const [highlightNodes] = useState(new Set());
    const [highlightLinks] = useState(new Set());


    const { settings } = props;
    const { viewManager } = props.referenceMapData;
    const tempLineColor = getComputedStyle(document.body).getPropertyValue('--color-base-30')
    const tempTextColor = getComputedStyle(document.body).getPropertyValue('--text-normal')
    // const tempHighlightColor = getComputedStyle(document.body).getPropertyValue('--text-accent')
    const lineColor = tempLineColor ? tempLineColor : '#3f3f3f';
    const textColor = tempTextColor ? tempTextColor : 'black';
    // const highlightColor = tempHighlightColor ? tempHighlightColor : '#835EEC';
    const selectionColor = '#ff7f0e'

    const filterReferences = (references: Reference[], settings: ReferenceMapSettings) => {
        return settings.filterRedundantReferences
            ? references.filter((reference) => reference.referenceCount > 0 || reference.citationCount > 0)
            : references;
    }

    const fetchData = async (indexCards: IndexPaper[]) => {
        const dataPromises = indexCards.map(async (paper) => {
            const references = await viewManager.getReferences(paper.paper.paperId);
            const filteredReferences = filterReferences(references, settings);

            const citations = await viewManager.getCitations(paper.paper.paperId);
            const filteredCitations = filterReferences(citations, settings);

            return {
                paper: paper,
                references: filteredReferences,
                citations: filteredCitations
            };
        });

        return await Promise.all(dataPromises);
    }

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force("x", d3.forceX(props.width / 2).strength(0.1));
            fgRef.current.d3Force("y", d3.forceY(props.height / 2).strength(0.1));
        }
    }, [data, props.width, props.height]);

    useEffect(() => {
        const fetchDataAndUpdate = () => {
            setIsLoading(true)
            const { indexIds, citeKeyMap, fileName, frontmatter, basename } = props.updateChecker;
            props.referenceMapData.getIndexCards(indexIds, citeKeyMap, fileName, frontmatter, basename)
                .then(async (cards) => {
                    const graphData = await fetchData(cards)
                    const newSubgraph = formatData(graphData);
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
                    setSelectedNode(null)
                });
        }
        fetchDataAndUpdate();
        EventBus.on(EVENTS.UPDATE, fetchDataAndUpdate);
    }, [
        settings,
        props.updateChecker.basename,
        props.updateChecker.indexIds,
        props.updateChecker.citeKeys,
        props.updateChecker.fileName,
        props.updateChecker.frontmatter,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paintRing = useCallback((node: NodeObject, ctx: any) => {
        if (node.id === selectedNode?.id) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val + 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = selectionColor;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            if (node.type !== 'index') {
                ctx.font = '12px Arial';
                ctx.fillStyle = textColor;
                ctx.fillText(node.name, node.x, node.y);
            }
        }
        if (node.type === 'index') {
            ctx.font = '12px Arial';
            ctx.fillStyle = textColor;
            ctx.fillText(node.id, node.x, node.y);
        }
    }, [selectedNode]);

    const clearHighlights = () => {
        highlightNodes.clear();
        highlightLinks.clear();
    };

    const handleNodeHover = (node: NodeObject) => {
        clearHighlights();
        if (node) {
            // highlightNodes.add(node);
            // node.neighbors.forEach((neighbor: NodeObject) => highlightNodes.add(neighbor));
            node.links.forEach((link: LinkObject) => highlightLinks.add(link));
        }
        // setHoverNode(node || null);
    };

    const handleLinkHover = (link: LinkObject) => {
        clearHighlights();
        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }
    };

    const handleNodeSelect = (node: NodeObject) => {
        setSelectedNode(node);
    };

    const nodeCanvasObjectMode = useCallback((node: NodeObject) => {
        return highlightNodes.has(node) ? 'before' : 'after';
    }, [highlightNodes]);

    const toggleZoom = (node: NodeObject) => {
        if (fgRef.current.zoom() < 1.0) {
            fgRef.current.zoom(1.9, 200);
            fgRef.current.centerAt(node.x, node.y, 200);
        } else {
            fgRef.current.zoom(0.9, 200);
            fgRef.current.centerAt(node.x, node.y, 200);
        }
    }

    //check if data is empty or not
    if (!props.updateChecker.basename) {
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
    } else if (data.nodes.length > 0 || isLoading) {
        return (
            <div>
                <div className="orm-graph-content">
                    <div className="orm-graph-paper-card">
                        {selectedNode && (
                            <PaperCard paper={selectedNode.data} settings={settings} showGraphButtons={true} />
                        )}
                        <PartialLoading isLoading={isLoading} />
                    </div>
                </div>
                <ForceGraph2D
                    ref={fgRef}
                    width={props.width}
                    height={props.height}
                    graphData={data}
                    autoPauseRedraw={false}
                    linkWidth={link => highlightLinks.has(link) ? 3 : 1}
                    linkColor={lineColor}
                    onNodeDrag={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    onNodeDragEnd={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    nodeCanvasObjectMode={nodeCanvasObjectMode}
                    nodeCanvasObject={paintRing}
                    onNodeHover={handleNodeHover}
                    onLinkHover={handleLinkHover}
                    onNodeClick={handleNodeSelect}
                    onBackgroundClick={() => setSelectedNode(null)}
                    onNodeRightClick={toggleZoom}
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