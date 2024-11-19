import React, { useState, useRef } from "react";
import {
  Viewer,
  Worker,
  Button,
  Position,
  Tooltip,
} from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  Trigger,
  MessageIcon,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";
import { useFileStore } from "../store/fileStore";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import the styles

const PdfReviewer: React.FC = () => {
  const { selectedFile, setSelectedFile } = useFileStore();
  // const [highlights, setHighlights] = useState<Highlight[]>([]);
  const viewerRef = useRef(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const highlightPluginInstance = highlightPlugin({
    trigger: Trigger.None,
  });

  if (!selectedFile) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        zIndex: 9999,
        height: "88%",
        left: "3%",
        overflow: "auto",
        width: "65%",
        backgroundColor: "#f8f8f8",
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
        padding: "1%",
        borderRadius: "20px",
      }}
      ref={viewerRef}
    >
      {/* Use the Worker component and set the workerUrl */}
      {/* <Worker workerUrl={chrome.runtime.getURL("/scripts/pdf.worker.min.js")}>
       */}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
          fileUrl={selectedFile.file_content}
        />
      </Worker>

      <button
        style={{
          position: "absolute",
          bottom: " 5%",
          right: " 5%",
        }}
        onClick={() => setSelectedFile(null)}
      >
        Close
      </button>
    </div>
  );
};

export { PdfReviewer };
