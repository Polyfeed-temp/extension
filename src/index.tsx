import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = document.createElement("div");
root.id = "react-root";
console.log("rendring react");
document.body.appendChild(root);
document.body.style.margin = "0px";
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
