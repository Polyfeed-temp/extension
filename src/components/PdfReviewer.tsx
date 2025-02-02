import React, { useRef, useEffect } from "react";
import { Viewer, PageChangeEvent } from "@react-pdf-viewer/core";
import { useFileStore } from "../store/fileStore";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin, RenderHighlightsProps } from "@react-pdf-viewer/search";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { addLogs, eventType, eventSource } from "../services/logs.serivce";

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
    currentPage,
    setCurrentPage,
  } = useFileStore();
  const viewerRef = useRef<HTMLDivElement>(null);

  const renderHighlights = React.useCallback(
    (props: RenderHighlightsProps) => (
      <>
        {props.highlightAreas.map((area, index) => {
          // Find the corresponding annotation for this highlight
          const annotation = associatedHighlights.find(
            ({ annotation }) =>
              area.keywordStr &&
              annotation.text.trim().includes(area.keywordStr.toString().trim())
          )?.annotation;

          // Determine color based on annotation tag
          let backgroundColor = "rgba(135, 135, 135, 0.4)";

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

  // Move plugin initialization after renderHighlights
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const searchPluginInstance = searchPlugin({
    renderHighlights,
  });

  // Function to handle page jumping
  const handleJumpToPage = (pageNumber: number) => {
    if (jumpToPage && documentLoaded) {
      jumpToPage(pageNumber);
    }
  };

  useEffect(() => {
    if (documentLoaded && currentPage > 0) {
      handleJumpToPage(currentPage);
    }
  }, [currentPage, documentLoaded, handleJumpToPage]);

  // Add logging when PDF is opened
  useEffect(() => {
    if (selectedFile && documentLoaded) {
      addLogs({
        eventType: eventType[1], // "open"
        content: `Opened PDF file: ${selectedFile.id}`,
        eventSource: eventSource[12], // "pdf"
      });
    }
  }, [selectedFile, documentLoaded]);

  // Modify the page change handler to include logging
  const handlePageChange = (e: PageChangeEvent) => {
    setCurrentPage(e.currentPage);
    addLogs({
      eventType: eventType[7], // "navigate"
      content: `Navigated to page ${e.currentPage} in PDF ${selectedFile?.id}`,
      eventSource: eventSource[12], // "pdf"
    });
  };

  // Modify the close handler to include logging
  const handleClose = () => {
    addLogs({
      eventType: eventType[6], // "close"
      content: `Closed PDF file: ${selectedFile?.id}`,
      eventSource: eventSource[12], // "pdf"
    });
    setSelectedFile(null);
  };

  // Modify the selection change handler to include logging
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedStr = selection?.toString().trim();

      if (selection && selectedStr && selectedStr.length > 0) {
        setSelectedText(selectedStr);
        addLogs({
          eventType: eventType[4], // "typing"
          content: `Selected text in PDF ${
            selectedFile?.id
          }: ${selectedStr.substring(0, 100)}...`,
          eventSource: eventSource[12], // "pdf"
        });
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
    if (!documentLoaded) return;

    // Always clear highlights first
    searchPluginInstance.clearHighlights();

    if (associatedHighlights.length > 0) {
      // Force a re-render of highlights by clearing and re-applying after a brief delay
      setTimeout(() => {
        // Extract and clean the text from each annotation
        const highlightTexts = associatedHighlights.flatMap(
          ({ annotation }) => {
            return annotation.text
              .split("\n")
              .map((text) => text.trim())
              .filter((text) => text.length > 0);
          }
        );

        // Apply highlights if we have any texts to highlight
        if (highlightTexts.length > 0) {
          searchPluginInstance.highlight(highlightTexts);
        }
      }, 50);
    }

    return () => {
      searchPluginInstance.clearHighlights();
      setDocumentLoaded(false);
    };
  }, [associatedHighlights, documentLoaded, selectedFile?.id]);

  if (!selectedFile) return null;
  console.log("currentPage", currentPage);
  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        zIndex: 9990,
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
        plugins={[
          defaultLayoutPluginInstance,
          searchPluginInstance,
          pageNavigationPluginInstance,
        ]}
        onDocumentLoad={() => {
          setDocumentLoaded(true);
        }}
        onPageChange={handlePageChange}
        initialPage={currentPage}
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
        onClick={handleClose}
      >
        Close
      </button>
    </div>
  );
};

export { PdfReviewer };
