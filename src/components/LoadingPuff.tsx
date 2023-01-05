import React from "react";

const width = 44;
const height = 44;
const stroke = "var(--text-accent)";
const circlePosition = Math.round(width / 2);
const circleRadius = 1;
const strokeWidth = 2;
export const LoadingPuff = () => {
	return (
		<div className="orm-loading-puff">
			<svg
				width={`${width}`}
				height={`${height}`}
				viewBox={`0 0 ${width} ${height}`}
				xmlns="http://www.w3.org/2000/svg"
				stroke={stroke}
			>
				<g
					fill="none"
					fillRule="evenodd"
					strokeWidth={`${strokeWidth}`}
				>
					<circle
						cx={`${circlePosition}`}
						cy={`${circlePosition}`}
						r={`${circleRadius}`}
					>
						<animate
							attributeName="r"
							begin="0s"
							dur="1.8s"
							values="1; 20"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.165, 0.84, 0.44, 1"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="stroke-opacity"
							begin="0s"
							dur="1.8s"
							values="1; 0"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.3, 0.61, 0.355, 1"
							repeatCount="indefinite"
						/>
					</circle>
					<circle
						cx={`${circlePosition}`}
						cy={`${circlePosition}`}
						r={`${circleRadius}`}
					>
						<animate
							attributeName="r"
							begin="-0.9s"
							dur="1.8s"
							values="1; 20"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.165, 0.84, 0.44, 1"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="stroke-opacity"
							begin="-0.9s"
							dur="1.8s"
							values="1; 0"
							calcMode="spline"
							keyTimes="0; 1"
							keySplines="0.3, 0.61, 0.355, 1"
							repeatCount="indefinite"
						/>
					</circle>
				</g>
			</svg>
		</div>
	);
};
