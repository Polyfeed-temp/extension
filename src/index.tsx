import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {HighlighterProvider} from "./store/HighlightContext";

// Inject Material Icons stylesheet
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Then inject your React component...
// ... your code for injecting the React component

const root = document.createElement("div");
root.id = "react-root";

document.body.appendChild(root);
// const  shado
document.body.style.margin = "left 250px";

const rootDiv = ReactDOM.createRoot(root);
root.setAttribute(
  "style",
  ` position: fixed;
  top: 0;
  left: 0;
  width: 250px; /* width of your choice */
  height: 100%;
  overflow-y: auto;
  z-index: 9999; /* to ensure it stays on top of other elements */
  background-color: #f7f7f7;
  border-right: 1px solid #ddd;`
);
rootDiv.render(
  <React.StrictMode>
    <HighlighterProvider>
      <App />
    </HighlighterProvider>
  </React.StrictMode>
);
