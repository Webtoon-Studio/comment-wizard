import React from "react";
import ReactDOM from "react-dom/client";

import "@assets/popup.css";

import App from "@popup/src/app/App";
import DevConsole from "@popup/src/_dev/DevConsole";
import ThemeProvider from "@popup/src/common/context/ThemeProvider";

const IS_DEV = (() => {
  try {
    return import.meta.env.DEV;
  } catch {
    return false;
  }
})();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      {IS_DEV ? <DevConsole /> : null}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

export { IS_DEV };
