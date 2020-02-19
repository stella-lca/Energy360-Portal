import React from "react";

const CheckIcon = ({ invalid }) => (
	<svg
		className="bi bi-check"
		width="1em"
		height="1em"
		viewBox="0 0 20 20"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		style={{
			stroke: invalid ? "red" : "green",
			strokeWidth: 3,
			marginRight: "3px"
		}}
	>
		<path
			fillRule="evenodd"
			d="M15.854 5.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L8.5 12.293l6.646-6.647a.5.5 0 01.708 0z"
			clipRule="evenodd"
		></path>
	</svg>
);

export default CheckIcon;
