import { LoadingPuff } from "./LoadingPuff"
import React from 'react'
export const PartialLoading = (props: { isLoading: boolean }) => {
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
