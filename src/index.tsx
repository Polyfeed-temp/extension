import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {HighlighterProvider} from "./store/HighlightContext";
import UserProvider from "./store/UserContext";

function load() {
  const host = document.createElement("div");
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({mode: "open"});

  // Injecting Material Tailwind CSS into the shadow root
  const link = document.createElement("link");
  link.href =
    "https://unpkg.com/@material-tailwind/html@latest/styles/material-tailwind.css";
  link.rel = "stylesheet";
  shadowRoot.appendChild(link);

  // Injecting Tailwind script into the shadow root
  const tailwind = document.createElement("script");
  tailwind.src =
    "https://unpkg.com/@material-tailwind/html@latest/scripts/script-name.js";
  shadowRoot.appendChild(tailwind);

  // Injecting Material Icons into the shadow root
  const materialIcons = document.createElement("link");
  materialIcons.href =
    "https://fonts.googleapis.com/icon?family=Material+Icons";
  materialIcons.rel = "stylesheet";
  shadowRoot.appendChild(materialIcons);

  // Appending a div to shadow root for React to mount to
  const reactRootDiv = document.createElement("div");
  shadowRoot.appendChild(reactRootDiv);

  const root = ReactDOM.createRoot(reactRootDiv);

  const style = document.createElement("style");
  style.textContent = `
  
@layer components {
  button {
    @apply bg-gray-500 text-white hover:bg-black;
  }
}

.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: black;
  color: white;
  padding: 10px;
  border-radius: 5px;
}
.border-Strength {
  border-color: #3a70b7 !important;
}

.border-Weakness {
  border-color: #ef5975 !important;
}

.border-ActionItem {
  border-color: #23bfc6 !important;
}

.border-Confused {
  border-color: #f79633 !important;
}

.border-Other {
  border-color: #8960aa !important;
}

`;
  shadowRoot.appendChild(style);

  root.render(
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
