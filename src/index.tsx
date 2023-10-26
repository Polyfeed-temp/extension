import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {HighlighterProvider} from "./store/HighlightContext";

// Inject Material Icons stylesheet
const link = document.createElement("link");
link.href =
  "https://unpkg.com/@material-tailwind/html@latest/styles/material-tailwind.css";

link.rel = "stylesheet";
const tailwind = document.createElement("script");
tailwind.src =
  "https://unpkg.com/@material-tailwind/html@latest/scripts/script-name.js";
document.head.appendChild(link);

// Then inject your React component...
// ... your code for injecting the React component

const root = document.createElement("div");
root.id = "react-root";

document.body.appendChild(root);
// const  shado
document.body.style.marginLeft = "400px";

const rootDiv = ReactDOM.createRoot(root);
root.setAttribute(
  "style",
  ` position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 50px); /* take up almost the entire viewport width, but leave a little space */
  max-width: 350px; /* maximum width it can stretch to */
  height: 100%;
  overflow-y: auto;
  z-index: 9999;
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
