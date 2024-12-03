import React, { useState, useRef, useEffect } from "react";
import {
  Icon,
  MinimalButton,
  Position,
  Tooltip,
  Viewer,
} from "@react-pdf-viewer/core";
import { useFileStore } from "../store/fileStore";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  FlagKeyword,
  NextIcon,
  PreviousIcon,
  searchPlugin,
} from "@react-pdf-viewer/search";

// Import CSS styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PdfReviewer: React.FC = () => {
  const {
    selectedFile,
    setSelectedFile,
    setSelectedText,
    associatedHighlights,
  } = useFileStore();
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      }
    };

    if (selectedFile) {
      document.addEventListener("selectionchange", handleSelectionChange);
    }

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [selectedFile]);

  useEffect(() => {
    const { highlight } = searchPluginInstance;

    console.log("associatedHighlights", associatedHighlights);
  }, [associatedHighlights]);

  const searchPluginInstance = searchPlugin();

  const defaultLayoutPluginInstance = defaultLayoutPlugin({});

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
        borderRadius: "20px",
      }}
      ref={viewerRef}
    >
      <Viewer
        fileUrl={selectedFile.file_content}
        plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
        onDocumentLoad={() => {}}
      />

      <button
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          border: "1px solid black",
          borderRadius: "10px",
          padding: "1%",
        }}
        onClick={() => setSelectedFile(null)}
      >
        Close
      </button>
    </div>
  );
};

export { PdfReviewer };
