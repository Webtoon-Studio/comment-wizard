import React from "react";
import ReactDOM from "react-dom/client";
import { IS_DEV } from "@shared/global";

import "./index.css";

import Main from "./main";
import { Provider } from "react-redux";
import { store } from "@incom/common/store";
import EventProvider from "@incom/features/client/components/EventProvider";

const rootElem = document.getElementById("root") as HTMLElement;
const injectRootElem = document.getElementById("cs-in-comment-root") as HTMLElement;

if (rootElem || injectRootElem) {
	const root = ReactDOM.createRoot(rootElem === null ? injectRootElem : rootElem);

	// To mock webtoon page where the app is injected to
	if (IS_DEV) {
		document.body.style.backgroundColor = "black";
		if (rootElem) {
			rootElem.style.width = "fit-content";
			rootElem.style.backgroundColor = "white";
		}
	}

	root.render(
		<React.StrictMode>
			<Provider store={store}>
				<EventProvider>
					<Main />
				</EventProvider>
			</Provider>
		</React.StrictMode>,
	);
}
