import _ from 'lodash';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, NodeObject } from 'react-force-graph-2d';
import EventBus, { EVENTS } from 'src/events';
import { IndexPaper, Reference, ReferenceMapSettings } from 'src/types';
import { PaperCard } from 'src/components/PaperCard';
import { PartialLoading } from 'src/components/PartialLoading';
import { ReferenceMapData } from 'src/data/data';
import { UpdateChecker } from 'src/data/updateChecker';

interface MapGraphData {
    paper: IndexPaper
    references: Reference[]
    citations: Reference[]
}
const formatData = (data: MapGraphData[]): GraphData => {
    let maxCitationCount = 1;
    let minCitationCount = 0;

    const nodesAndLinks = data.flatMap((item, index) => {
        const indexId = item.paper.paper.paperId ? item.paper.paper.paperId : item.paper.id
        const indexCitationCount = item.paper.paper.citationCount;
        maxCitationCount = Math.max(maxCitationCount, indexCitationCount);
        minCitationCount = Math.min(minCitationCount, indexCitationCount);

        const nodes = [
            {
                id: indexId,
                paperId: item.paper.id,
                name: item.paper.paper.title,
                val: indexCitationCount,
                color: "#61C1E8",
                type: 'index',
                data: { id: indexId, location: null, paper: item.paper.paper }
            },
            ...item.references.map((reference, refIndex) => {
                const referenceId = String(reference.paperId ? reference.paperId : `${indexId}-cited-${refIndex}`);
                const referenceCitationCount = reference.citationCount;
                maxCitationCount = Math.max(maxCitationCount, referenceCitationCount);
                minCitationCount = Math.min(minCitationCount, referenceCitationCount);

                return {
                    id: referenceId,
                    paperId: reference.paperId,
                    name: reference.title,
                    val: referenceCitationCount,
                    color: "#7ABA57",
                    type: 'reference',
                    data: { id: referenceId, location: null, paper: reference }
                };
            }),
            ...item.citations.map((citation, citIndex) => {
                const citationId = String(citation.paperId ? citation.paperId : `${indexId}-citing-${citIndex}`);
                const citationCitationCount = citation.citationCount;
                maxCitationCount = Math.max(maxCitationCount, citationCitationCount);
                minCitationCount = Math.min(minCitationCount, citationCitationCount);

                return {
                    id: citationId,
                    paperId: citation.paperId,
                    name: citation.title,
                    val: citationCitationCount,
                    color: "#A15399",
                    type: 'citation',
                    data: { id: citationId, location: null, paper: citation }
                };
            })
        ];

        const links = [
            ...item.references.map((reference, refIndex) => ({
                source: indexId,
                target: String(reference.paperId ? reference.paperId : `${indexId}-cited-${refIndex}`)
            })),
            ...item.citations.map((citation, citIndex) => ({
                source: String(citation.paperId ? citation.paperId : `${indexId}-citing-${citIndex}`),
                target: indexId
            }))
        ];

        return { nodes, links };
    });

    const nodes = nodesAndLinks.flatMap(({ nodes }) => nodes);
    const links = nodesAndLinks.flatMap(({ links }) => links);

    // Normalize the citation counts
    nodes.forEach(node => {
        node.val = 3 + (node.val - minCitationCount) * 20 / (maxCitationCount - minCitationCount);
    });

    const tempData: GraphData = {
        nodes: _.uniqBy(nodes, 'id'),
        links: links
    }

    return tempData;
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
    const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);

    const { settings } = props;
    const { viewManager } = props.referenceMapData;
    const tempTextColor = getComputedStyle(document.body).getPropertyValue('--text-normal')
    // const tempAccentColor = getComputedStyle(document.body).getPropertyValue('--text-accent')
    const lineColor = 'rgba(147, 117, 239, 0.2)' //tempAccentColor ? addAlpha(tempAccentColor, 0.2) : '#3f3f3f';
    const textColor = tempTextColor ? tempTextColor : 'black';
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

    //unset data when basename is changed
    useEffect(() => {
        setData({ nodes: [], links: [] })
        setSelectedNode(null)
    }, [props.updateChecker.basename]);

    useEffect(() => {
        if (fgRef.current) {
            // avoid collition 
            fgRef.current.d3Force("collide", d3.forceCollide().radius((node: NodeObject) => node.val + 3));
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
        props.settings,
        props.updateChecker.indexIds,
        props.updateChecker.citeKeys,
        props.updateChecker.fileName,
        props.updateChecker.frontmatter,
        props.referenceMapData.library.libraryData
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeObject = useCallback((node: NodeObject, ctx: any) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.linkColor = lineColor;

        if (node.id === selectedNode?.id) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val + 3, 0, 2 * Math.PI, false);
            ctx.fillStyle = selectionColor;
            ctx.fill();
            //redraw original
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
            ctx.fillText(node.paperId, node.x, node.y);
        }
    }, [selectedNode,
        props.updateChecker.indexIds,
        props.updateChecker.citeKeys,
        props.updateChecker.fileName,
        props.updateChecker.frontmatter
    ]);


    const handleNodeSelect = (node: NodeObject) => {
        setSelectedNode(node);
    };

    const toggleZoom = (node: NodeObject) => {
        if (fgRef.current.zoom() < 1.0) {
            fgRef.current.zoom(1.9, 200);
            fgRef.current.centerAt(node.x, node.y, 200);
        } else {
            fgRef.current.zoom(0.7, 200);
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
                    onNodeDrag={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    onNodeDragEnd={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    nodeCanvasObject={nodeObject}
                    onNodeClick={handleNodeSelect}
                    // onBackgroundClick={() => setSelectedNode(null)}
                    onNodeRightClick={toggleZoom}
                    linkColor={(link) => lineColor}
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