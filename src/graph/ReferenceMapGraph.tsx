// import { CiteKey, IndexPaper, Library, ReferenceMapSettings } from 'src/types'
import React from 'react'
// import { ViewManager } from 'src/viewManager'
import ForceGraph2D, { GraphData } from 'react-force-graph-2d';

export const ReferenceMapGraph = (props: {
    // settings: ReferenceMapSettings
    // library: Library
    // viewManager: ViewManager
    // basename: string
    // paperIDs: Set<string>
    // citeKeyMap: CiteKey[]
    // indexCards: IndexPaper[]
    data: GraphData
    width: number
    height: number
}) => {
    return (
        <ForceGraph2D width={props.width} height={props.height} graphData={props.data} />
    )
}