import { MarkdownView } from 'obsidian';
import React, { useEffect, useRef, useState } from 'react'
import ForceGraph2D, { GraphData, LinkObject, NodeObject } from 'react-force-graph-2d';
import { LoadingPuff } from 'src/components/LoadingPuff';
import { ReferenceMapData } from 'src/referenceData';
import { Reference, ReferenceMapSettings } from 'src/types';

interface MapGraphData {
    paper: Reference
    references: Reference[]
    citations: Reference[]
}

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

export const ReferenceMapGraph = (props: {
    width: number
    height: number
    settings: ReferenceMapSettings
    referenceMapData: ReferenceMapData
    activeView: MarkdownView | null
    basename: string | undefined
}) => {
    const [data, setData] = useState<GraphData>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fgRef = useRef<any>();

    const gatherData = async () => {
        setIsLoading(true)
        const indexCards = await props.referenceMapData.getIndexCards(props.activeView)
        const graphData = await props.referenceMapData.fetchData(indexCards)
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
    }, [props.activeView?.file?.basename, props.settings]);

    useEffect(() => {
        if (fgRef.current !== null && fgRef.current !== undefined) {
            fgRef.current.d3Force("charge").strength(-20);
            fgRef.current.d3Force("link").distance(50);
            fgRef.current.d3Force("charge").distanceMax(150);
        }
    }, [data]);

    if (props.activeView?.file?.basename === undefined) {
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
    } else if (isLoading) {
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
    } else if (!(Array.isArray(data) && data.length === 0)) {
        return (
            <ForceGraph2D
                ref={fgRef}
                width={props.width}
                height={props.height}
                graphData={data}
                onNodeClick={handleNodeClick}
                linkColor={() => '#d3d3d3'}
            />
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