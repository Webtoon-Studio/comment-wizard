import React from "react";
import ReactDOM from "react-dom/client";
import { IS_DEV } from "@shared/global";

import "./index.css";

import Main from "./main";
import { Provider } from "react-redux";
import { store } from "@incom/common/store";

const rootElem = document.getElementById(
	IS_DEV ? "root" : "cs-in-comment-root"
) as HTMLElement;

if (rootElem) {
	const root = ReactDOM.createRoot(rootElem);

	root.render(
		<React.StrictMode>
			<Provider store={store}>
				<Main />
			</Provider>
		</React.StrictMode>,
	);
}
