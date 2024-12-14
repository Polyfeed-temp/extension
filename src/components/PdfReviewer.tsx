import React, { useRef, useEffect, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { useFileStore } from "../store/fileStore";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin } from "@react-pdf-viewer/search";

// Import CSS styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

const PdfReviewer: React.FC = () => {
  const {
    selectedFile,
    setSelectedFile,
    setSelectedText,
    associatedHighlights,
    documentLoaded,
    setDocumentLoaded,
  } = useFileStore();
  const viewerRef = useRef<HTMLDivElement>(null);
  const searchPluginInstance = searchPlugin();
  const { highlight, clearHighlights } = searchPluginInstance;

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
  }, [selectedFile, associatedHighlights]);

  useEffect(() => {
    if (!documentLoaded) return;

    if (associatedHighlights.length > 0) {
      console.log("going to update the highlights");
      clearHighlights();
      const highlightKeywords = associatedHighlights.map(({ annotation }) => {
        return annotation.text;
      });
      highlight(highlightKeywords);
    }

    return () => {
      clearHighlights();
      setDocumentLoaded(false);
    };
  }, [associatedHighlights, documentLoaded]);

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
        onDocumentLoad={() => {
          console.log("Document loaded");
          setDocumentLoaded(true);
        }}
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
