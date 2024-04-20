import React from "react";
import ReactDOM from "react-dom/client";

import "@assets/content.css";

import Main from "./main";

const rootElem = document.getElementById("cs-in-comment-root") as HTMLElement;

console.log(process.env.NODE_ENV);
console.log(chrome);
console.log(chrome.storage);
chrome.storage.sync.get().then((items) => console.log(items));

if (rootElem) {
  const root = ReactDOM.createRoot(rootElem);

  root.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  );
}
