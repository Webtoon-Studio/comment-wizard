import React from "react";
import ReactDOM from "react-dom/client";
import { IS_DEV } from "@shared/global";

import "./index.css";

import Main from "./main";

const rootElem = document.getElementById(
	IS_DEV ? "root" : "cs-in-comment-root"
) as HTMLElement;

if (rootElem) {
	const root = ReactDOM.createRoot(rootElem);

	root.render(
		<React.StrictMode>
			<Main />
		</React.StrictMode>,
	);
}
