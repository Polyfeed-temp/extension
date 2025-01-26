import React, { useRef, useEffect, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { useFileStore } from "../store/fileStore";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin, RenderHighlightsProps } from "@react-pdf-viewer/search";

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

  console.log("associatedHighlights", associatedHighlights);
  const renderHighlights = React.useCallback(
    (props: RenderHighlightsProps) => (
      <>
        {props.highlightAreas.map((area, index) => {
          // Find the corresponding annotation for this highlight
          const annotation = associatedHighlights.find(
            ({ annotation }) =>
              area.keywordStr &&
              annotation.text.includes(area.keywordStr.toString())
          )?.annotation;

          // Determine color based on annotation tag
          let backgroundColor = "rgba(135, 135, 135, 0.4)";

          console.log("area", area);
          console.log("annotation", annotation);
          if (annotation) {
            switch (annotation.annotationTag) {
              case "Strength":
                backgroundColor = "rgba(41, 128, 185, 0.4)"; // Blue from image
                break;
              case "Weakness":
                backgroundColor = "rgba(231, 76, 60, 0.4)"; // Pink/Red from image
                break;
              case "Action Item":
                backgroundColor = "rgba(26, 188, 156, 0.4)"; // Turquoise from image
                break;
              case "Confused":
                backgroundColor = "rgba(243, 156, 18, 0.4)"; // Orange from image
                break;
              case "Other":
                backgroundColor = "rgba(155, 89, 182, 0.4)"; // Purple from image
                break;
              case "Suggestions":
                backgroundColor = "rgba(243, 156, 18, 0.4)"; // Orange from image
                break;
            }
          }

          return (
            <div
              key={`${area.pageIndex}-${index}`}
              style={{
                ...props.getCssProperties(area),
                position: "absolute",
                backgroundColor,
              }}
            />
          );
        })}
      </>
    ),
    [associatedHighlights]
  );

  const searchPluginInstance = searchPlugin({
    renderHighlights,
  });

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
      clearHighlights();

      // Extract the full text from each annotation
      const highlightTexts = associatedHighlights.map(
        ({ annotation }) => annotation.text.trim() // Just trim whitespace but keep the full text
      );

      // Apply highlights
      highlight(highlightTexts);
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
