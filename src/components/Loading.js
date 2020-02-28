import React from "react";
import ReactLoading from "react-loading";

const Loading = ({ type = null, color }) => (
	<div className="loading-container">
		<ReactLoading
			type={type || "spinningBubbles"}
			color={color || "greeb"}
			height={"11%"}
			width={"1`%"}
		/>
	</div>
);

export default Loading;
