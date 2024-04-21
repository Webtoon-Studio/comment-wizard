import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "@popup/src/app/App";
import DevConsole from "@popup/src/_dev/DevConsole";
import ThemeProvider from "@popup/src/common/context/ThemeProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      {import.meta.env.DEV ? <DevConsole /> : null}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
