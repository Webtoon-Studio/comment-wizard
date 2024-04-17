import React from "react";
import ReactDOM from "react-dom/client";

import "./assets/inject.css";

function Post(props) {
  const {
    commentId,
    name,
    title,
    text,
    date,
    isReply = false,
    replies = [],
  } = props;

  return (
    <div>
      <div>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("cs-in-comment-root"));

root.render(
  <React.StrictMode>
    <div className="w-full">hello world</div>
  </React.StrictMode>
);
