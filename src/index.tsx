import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {HighlighterProvider} from "./store/HighlightContext";
import UserProvider from "./store/UserContext";

// Inject Material Icons stylesheet
const link = document.createElement("link");
link.href =
  "https://unpkg.com/@material-tailwind/html@latest/styles/material-tailwind.css";

link.rel = "stylesheet";
const tailwind = document.createElement("script");
tailwind.src =
  "https://unpkg.com/@material-tailwind/html@latest/scripts/script-name.js";
document.head.appendChild(link);

const materialIcons = document.createElement("link");
materialIcons.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIcons.rel = "stylesheet";
document.head.appendChild(materialIcons);
// Then inject your React component...
// ... your code for injecting the React component
function load() {
  const root = document.createElement("div");
  root.id = "react-root";

  document.body.appendChild(root);

  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(
    <React.StrictMode>
      <UserProvider>
        <HighlighterProvider>
          <App />
        </HighlighterProvider>
      </UserProvider>
    </React.StrictMode>
  );
}

setTimeout(load, 1000);
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.message === "triggerContentScript") {
//     load();
//   }
// });
