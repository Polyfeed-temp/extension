import React, { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { useFileStore } from "../store/fileStore";
import { pdfjs } from "react-pdf";

// Update to use your correct worker path
pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
  "/scripts/pdf.worker.mjs"
);

interface Highlight {
  text: string;
  pageNumber: number;
  startOffset: number;
  endOffset: number;
  timestamp: number;
}

const PdfReviewer: React.FC = () => {
  const { selectedFile } = useFileStore();
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<string>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log("PDF loaded successfully with", numPages, "pages");
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF Load Error:", error);
    setError(error.message);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText) {
      const range = selection.getRangeAt(0);

      const newHighlight: Highlight = {
        text: selectedText,
        pageNumber,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        timestamp: Date.now(),
      };

      setHighlights((prev) => [...prev, newHighlight]);
      console.log("All highlights:", [...highlights, newHighlight]);
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      console.log("selection", selection);
      if (selection && !selection.isCollapsed) {
        const selectedText = selection.toString().trim();
        if (selectedText) {
          const range = selection.getRangeAt(0);
          const container = pdfViewerRef.current;
          if (container && range.commonAncestorContainer) {
            const isWithinPdfViewer = container.contains(
              range.commonAncestorContainer.nodeType === 3
                ? range.commonAncestorContainer.parentNode
                : range.commonAncestorContainer
            );

            if (isWithinPdfViewer) {
              const newHighlight: Highlight = {
                text: selectedText,
                pageNumber, // Adjust if multiple pages are rendered
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                timestamp: Date.now(),
              };

              setHighlights((prev) => [...prev, newHighlight]);
              console.log("All highlights:", [...highlights, newHighlight]);
            }
          }
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [pageNumber, highlights, pdfViewerRef]);

  if (!selectedFile) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "10%",
        zIndex: 9999,
        height: "80%",
        width: "66%",
        left: "1%",
        overflow: "auto",
      }}
      ref={pdfViewerRef}
    >
      <Document
        file={selectedFile.file_content}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading="Loading PDF..."
      >
        {numPages && (
          <Page
            key={`page_${pageNumber}`}
            pageNumber={pageNumber}
            renderMode="none"
            renderAnnotationLayer={false}
            renderTextLayer={true}
            customRenderer={(textItem: any) => (
              <span data-page-number={pageNumber}>{textItem.str}</span>
            )}
          />
        )}
      </Document>
    </div>
  );
};

export { PdfReviewer };
