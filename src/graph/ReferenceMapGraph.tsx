import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import EventBus, { EVENTS } from 'src/EventBus';
import { PaperCard } from 'src/components/PaperCard';
import { PartialLoading } from 'src/components/PartialLoading';
import { ReferenceMapData } from 'src/referenceData';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';
import { UpdateChecker } from 'src/utils';

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
            type: 'index',
            data: item.paper
        });

        item.references.forEach((reference, refIndex) => {
            const referenceId = String(reference.paperId ? reference.paperId : `reference${paperId}${refIndex}`);
            maxCitationCount = Math.max(maxCitationCount, reference.citationCount);
            minCitationCount = Math.min(minCitationCount, reference.citationCount);

            nodes.push({
                id: referenceId,
                name: reference.title,
                val: reference.citationCount,
                color: "#7ABA57",
                type: 'reference',
                data: { id: reference.paperId, location: null, paper: reference }
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
                color: "#A15399",
                type: 'citation',
                data: { id: citation.paperId, location: null, paper: citation }
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
    const [hoverNode, setHoverNode] = useState<NodeObject | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());


    const { settings } = props;
    const { viewManager } = props.referenceMapData;
    const tempLineColor = getComputedStyle(document.body).getPropertyValue('--color-base-30')
    const temptextColor = getComputedStyle(document.body).getPropertyValue('--text-normal')
    const tempHighlightColor = getComputedStyle(document.body).getPropertyValue('--text-accent')
    const lineColor = tempLineColor ? tempLineColor : '#3f3f3f';
    const textColor = temptextColor ? temptextColor : 'black';
    const highlightColor = tempHighlightColor ? tempHighlightColor : '#835EEC';

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


    useEffect(() => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            // fgRef.current.d3Force("collide", d3.forceCollide(7));
            fgRef.current.d3Force("charge").strength(-10);
            fgRef.current.d3Force("link").distance(100);
            // fgRef.current.d3Force("charge").distanceMax(250);
        }
    }, [data]);


    useEffect(() => {
        const fetchDataAndUpdate = async () => {
            props.referenceMapData.getIndexCards(
                props.updateChecker.indexIds,
                props.updateChecker.citeKeyMap,
                props.updateChecker.fileName,
                props.updateChecker.frontmatter,
                props.updateChecker.basename
            ).then(async (cards) => {
                setIsLoading(true)
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
                setSelectedNode(null)
                setIsLoading(false)
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
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val + 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = highlightColor;
        ctx.fill();

        if (node.type === 'index') {
            ctx.font = '12px Arial';
            ctx.fillStyle = textColor;
            ctx.fillText(node.id, node.x, node.y);
        }
    }, [hoverNode]);

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleNodeHover = (node: NodeObject) => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach((neighbor: NodeObject) => highlightNodes.add(neighbor));
            node.links.forEach((link: LinkObject) => highlightLinks.add(link));
        }

        setHoverNode(node || null);
        updateHighlight();
    };

    const handleLinkHover = (link: LinkObject) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        updateHighlight();
    };

    const handleNodeSelect = (node: NodeObject) => {
        if (selectedNode) {
            selectedNode.color = node.color;
        }
        node.color = "red";
        setSelectedNode(node);
    }

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
    } else if (!(Array.isArray(data) && data.length === 0) || isLoading) {
        return (
            <div>
                <div className="orm-graph-content">
                    <div className="orm-graph-paper-card">
                        {selectedNode && (
                            <PaperCard paper={selectedNode.data} settings={settings} showButtons={true} />
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
                    // linkDirectionalParticles={2}
                    // linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
                    // linkDirectionalParticleColor={() => 'rgba(131, 94, 236, 0.2)'}
                    // linkDirectionalParticleSpeed={link => highlightLinks.has(link) ? 0.007 : 0}
                    // linkColor={link => highlightLinks.has(link) ? accentColor : lineColor}
                    // linkDirectionalArrowRelPos={1}
                    // linkDirectionalArrowLength={10}
                    // onNodeDrag={(node) => {
                    //     node.fx = node.x;
                    //     node.fy = node.y;
                    // }}
                    // onNodeDragEnd={(node) => {
                    //     node.fx = node.x;
                    //     node.fy = node.y;
                    // }}
                    nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
                    nodeCanvasObject={paintRing}
                    onNodeHover={handleNodeHover}
                    onLinkHover={handleLinkHover}
                    onNodeClick={handleNodeSelect}
                    nodeColor={(node) => node.color}
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