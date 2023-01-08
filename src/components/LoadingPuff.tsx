import React from "react";

export const LoadingPuff = () => {
	return (
		<div className="orm-loading-puff">
			<svg viewBox="0 0 40 2" xmlns="http://www.w3.org/2000/svg">
				<circle fill="#000" stroke="none" cx="18" cy="1" r="0.25">
					<animate
						attributeName="opacity"
						dur="2s"
						values="0;1;0"
						repeatCount="indefinite"
						begin="0.1"
					/>
				</circle>
				<circle fill="#000" stroke="none" cx="20" cy="1" r="0.25">
					<animate
						attributeName="opacity"
						dur="2s"
						values="0;1;0"
						repeatCount="indefinite"
						begin="0.4"
					/>
				</circle>
				<circle fill="#000" stroke="none" cx="22" cy="1" r="0.25">
					<animate
						attributeName="opacity"
						dur="2s"
						values="0;1;0"
						repeatCount="indefinite"
						begin="0.7"
					/>
				</circle>
			</svg>
		</div>
	);
};
