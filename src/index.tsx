import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {Provider} from "react-redux";
import store from "./store/highlighterStore";
import {setHighlighter} from "./store/highlightSlice";
import {useDispatch} from "react-redux";
import Highlighter from "web-highlighter";
const root = document.createElement("div");
root.id = "react-root";
console.log("rendring react");
document.body.appendChild(root);
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
// const dispatcher = useDispatch();
// const highlighter = new Highlighter({
//   exceptSelectors: ["#react-root"],
// });
// dispatcher(setHighlighter(highlighter));
rootDiv.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
