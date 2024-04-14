import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "@popup/src/app/App";
import DevConsole from "@popup/src/_dev/DevConsole";


const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
        {import.meta.env.DEV ? (
            <DevConsole />
        ) : <DevConsole embedded />}
        <App />
    </React.StrictMode>
)