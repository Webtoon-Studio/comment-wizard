import React from "react";
import ReactDOM from "react-dom/client";

import "@assets/content.css";

import Main from "./main";

const rootElem = document.getElementById("cs-in-comment-root") as HTMLElement;

if (rootElem) {
	const root = ReactDOM.createRoot(rootElem);

	root.render(
		<React.StrictMode>
			<Main />
		</React.StrictMode>,
	);
}
