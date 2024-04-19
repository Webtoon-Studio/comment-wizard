import React from "react";
import ReactDOM from "react-dom/client";

// import Main from "./main";

const rootElem = document.getElementById("cs-in-comment-root") as HTMLElement;

console.log(rootElem);

if (rootElem) {
  const root = ReactDOM.createRoot(rootElem);

  root.render(
    <React.StrictMode>
      <div>hello world</div>
    </React.StrictMode>
  );
}
