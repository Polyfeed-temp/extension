import React from "react";
import ReactDOM from "react-dom/client";
import App, { restoreHostDom } from "./App";
import "./index.css";
import { HighlighterProvider } from "./store/HighlightContext";
import UserProvider from "./store/UserContext";
import { SidebarProvider } from "./hooks/useSidebar";
import { ConsentProvider } from "./hooks/useConsentStore";

function injectStyles(shadowRoot: any) {
  const styles = ["material-tailwind.css", "icon.css", "ReactToastify.min.css"];

  styles.forEach((style) => {
    const link = document.createElement("link");
    link.href = chrome.runtime.getURL(`styles/${style}`);
    link.rel = "stylesheet";
    shadowRoot.appendChild(link);
  });
}

function injectScripts(shadowRoot: any) {
  const styles = ["popper.min.js", "tippy-bundle.umd.min.js"];

  styles.forEach((style) => {
    const link = document.createElement("script");
    link.src = chrome.runtime.getURL(`scripts/${style}`);
    shadowRoot.appendChild(link);
  });
}

function shadowHostInitailize() {
  const host = document.createElement("div");
  host.id = "sidebar-root";
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  injectStyles(shadowRoot);
  injectScripts(shadowRoot);

  const mainBodyStyle = document.createElement("style");
  mainBodyStyle.innerHTML = `.button-with-hover:hover {
  background-color: #f0f0f0; /* Example hover color */
  cursor: pointer;
}`;
  document.head.appendChild(mainBodyStyle);

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
  color: white;
}

button:hover {
  background-color: #1a202c;
  color: white;
}

.card {
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Initial subtle shadow */
    border: 1px solid #ddd; /* Light border for definition */
    background-color: #fff; /* A background color for the card */
}

.card-container:hover .card {
    /* Slightly reduce the opacity of other cards when any card is hovered */
    opacity: 0.9; 
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
    border-color: #ccc
    cursor: pointer;
    background-color: #f8f8f8;
    transform: scale(1.05)
}

.selected{
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
  border-color: #ccc
  background-color: #f8f8f8;
  transform: scale(1.1)

}

.fit-menu {
  padding: 0.4em !important;
}


`;

  shadowRoot.appendChild(style);

  return shadowRoot;
}

let root: ReactDOM.Root | null = null;
function load() {
  const shadowRoot = shadowHostInitailize();
  const reactRootDiv = document.createElement("div");

  shadowRoot.appendChild(reactRootDiv);

  root = ReactDOM.createRoot(reactRootDiv);

  root.render(
    <React.StrictMode>
      <UserProvider>
        <ConsentProvider>
          <SidebarProvider>
            <HighlighterProvider>
              <App />
            </HighlighterProvider>
          </SidebarProvider>
        </ConsentProvider>
      </UserProvider>
    </React.StrictMode>
  );
}

const allowedDomains = [
  "https://lms.monash.edu/*",
  "https://learning.monash.edu/*",
  "https://docs.google.com/*",
];
let active = false;

if (allowedDomains.some((domain) => window.location.href.match(domain))) {
  chrome.runtime.sendMessage({ action: "contentScriptActive" });

  active = true;
  load();
} else {
  chrome.runtime.sendMessage({ action: "contentScriptInActive" });
}

chrome.runtime.onMessage.addListener(function (response, sendResponse) {
  if (response.action === "contentScriptOn" && !active) {
    active = true;
    load();
  }
  if (response.action === "contentScriptOff" && active) {
    root ? root.unmount() : null;
    root = null;
    active = false;
    restoreHostDom();
  }
});
