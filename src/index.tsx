import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {HighlighterProvider} from "./store/HighlightContext";
import UserProvider from "./store/UserContext";
import {SidebarProvider} from "./hooks/useSidebar";

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

  // // Injecting Tailwind script into the shadow root
  // const materialScript = document.createElement("script");
  // materialScript.src =
  //   "https://unpkg.com/@material-tailwind/html@latest/scripts/script-name.js";
  // shadowRoot.appendChild(materialScript);

  // Injecting Material Icons into the shadow root
  const materialIcons = document.createElement("link");
  materialIcons.href =
    "https://fonts.googleapis.com/icon?family=Material+Icons";
  materialIcons.rel = "stylesheet";
  shadowRoot.appendChild(materialIcons);

  // const tailwind = document.createElement("script");
  // tailwind.src = "https://cdn.tailwindcss.com";
  // shadowRoot.appendChild(tailwind);

  const toastify = document.createElement("link");
  toastify.href =
    "https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.min.css";
  toastify.rel = "stylesheet";
  shadowRoot.appendChild(toastify);

  // Appending a div to shadow root for React to mount to
  const reactRootDiv = document.createElement("div");
  shadowRoot.appendChild(reactRootDiv);

  const root = ReactDOM.createRoot(reactRootDiv);
  const tailwindStyle = document.createElement("style");

  // Add Tailwind CSS utility class
  tailwindStyle.innerHTML = `
@layer components {
  button {
    @apply bg-gray-500 text-white hover:bg-black;
  }
}
`;

  // Append the style element to the head of the document
  document.head.appendChild(tailwindStyle);
  const style = document.createElement("style");
  style.textContent = `
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
li {
    display: block;      /* Stretch to the full width of its parent */
    width: 100%;         /* Ensure it covers full width */
    padding: 3px 10px;   /* Example padding, adjust as needed */
    cursor: pointer;     /* Change cursor on hover */
}

li:hover {
    background-color: #f3f3f3; /* Change background on hover */
}

/* Hide scrollbar for Chrome, Safari and Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

Button:hover {
  background-color: #1a202c;
}


`;
  shadowRoot.appendChild(style);

  root.render(
    <React.StrictMode>
      <UserProvider>
        <SidebarProvider>
          <HighlighterProvider>
            <App />
          </HighlighterProvider>
        </SidebarProvider>
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
