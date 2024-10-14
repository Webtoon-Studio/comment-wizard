import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import DevConsole from "@popup/features/_dev/DevConsole";
import App from "@popup/App";
import ThemeProvider from "@popup/context/ThemeProvider";
import { IS_DEV } from "@shared/global";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<React.StrictMode>
		<ThemeProvider>
			{IS_DEV ? <DevConsole /> : null}
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);