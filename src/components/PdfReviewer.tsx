import React, { useRef, useEffect } from 'react';
import { Viewer, PageChangeEvent } from '@react-pdf-viewer/core';
import { useFileStore } from '../store/fileStore';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin, RenderHighlightsProps } from '@react-pdf-viewer/search';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { addLogs, eventType, eventSource } from '../services/logs.serivce';

// Import CSS styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

const PdfReviewer: React.FC = () => {
  const {
    selectedFile,
    setSelectedFile,
    setSelectedText,
    setSelectedTextIndex,
    associatedHighlights,
    documentLoaded,
    setDocumentLoaded,
    currentPage,
    setCurrentPage,
  } = useFileStore();
  const viewerRef = useRef<HTMLDivElement>(null);

  // Use a ref to track if we've logged for this render cycle
  const loggedRef = useRef<Set<string>>(new Set());

  const renderHighlights = React.useCallback(
    (props: RenderHighlightsProps) => {
      return (
        <>
          {props.highlightAreas.map((area, index) => {
            // Find the corresponding annotation for this highlight area by matching text
            const matchingAnnotation = associatedHighlights.find(({ annotation }) => {
              // Try to match by text content
              const highlightText = area.keywordStr?.trim();
              const annotationText = annotation.text?.trim();
              return highlightText && annotationText && annotationText.includes(highlightText);
            });

            // Get color based on annotation tag
            let backgroundColor = 'rgba(255, 255, 0, 0.4)'; // Default yellow

            if (matchingAnnotation) {
              switch (matchingAnnotation.annotation.annotationTag) {
                case 'Strength':
                  backgroundColor = 'rgba(41, 128, 185, 0.4)'; // Blue
                  break;
                case 'Weakness':
                  backgroundColor = 'rgba(231, 76, 60, 0.4)'; // Red
                  break;
                case 'Action Item':
                  backgroundColor = 'rgba(26, 188, 156, 0.4)'; // Green
                  break;
                case 'Confused':
                  backgroundColor = 'rgba(243, 156, 18, 0.4)'; // Orange
                  break;
                case 'Other':
                  backgroundColor = 'rgba(155, 89, 182, 0.4)'; // Purple
                  break;
                case 'Suggestions':
                  backgroundColor = 'rgba(243, 156, 18, 0.4)'; // Orange
                  break;
              }
            }

            return (
              <div
                key={`highlight-${index}`}
                style={{
                  ...props.getCssProperties(area),
                  position: 'absolute',
                  backgroundColor,
                  cursor: 'pointer',
                }}
                title={matchingAnnotation ?
                  `${matchingAnnotation.annotation.annotationTag}: ${matchingAnnotation.annotation.text}` :
                  area.keywordStr
                }
              />
            );
          })}
        </>
      );
    },
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

  // Modify the selection change handler to include logging and index calculation
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedStr = selection?.toString().trim();

      if (selection && selectedStr && selectedStr.length > 0) {
        // Calculate sequential occurrence index by getting all text from the page
        let textOccurrenceIndex = 0;

        try {
          const range = selection.getRangeAt(0);

          // Get the page element
          let containerEl = range.commonAncestorContainer;
          if (containerEl.nodeType === Node.TEXT_NODE) {
            containerEl = containerEl.parentElement!;
          }

          const pageEl = (containerEl as Element).closest('.rpv-core__inner-page') ||
                         (containerEl as Element).closest('[data-testid*="page"]') ||
                         (containerEl as Element).closest('[class*="page"]');

          if (pageEl) {
            // Get all text content from the page
            const pageText = pageEl.textContent || '';

            // Find the position of our selection in the page text
            const selectionStart = range.startOffset;
            let currentPos = 0;
            let occurrenceCount = 0;

            // Get text up to our selection position (approximate)
            const walker = document.createTreeWalker(
              pageEl,
              NodeFilter.SHOW_TEXT,
              null
            );

            let beforeSelectionText = '';
            let node;
            let foundSelection = false;

            while ((node = walker.nextNode()) && !foundSelection) {
              if (node === range.startContainer) {
                beforeSelectionText += (node.textContent || '').substring(0, range.startOffset);
                foundSelection = true;
              } else {
                beforeSelectionText += node.textContent || '';
              }
            }

            // Count occurrences of selectedStr in text before our selection
            let index = 0;
            while ((index = beforeSelectionText.indexOf(selectedStr, index)) !== -1) {
              occurrenceCount++;
              index += selectedStr.length;
            }

            textOccurrenceIndex = occurrenceCount;
          } else {
            // Fallback: use timestamp
            textOccurrenceIndex = Date.now() % 1000;
          }

        } catch (error) {
          // Fallback: use timestamp-based index
          textOccurrenceIndex = Date.now() % 1000;
        }

        // Store the occurrence index
        const { setSelectedTextIndex } = useFileStore.getState();
        setSelectedTextIndex(textOccurrenceIndex);


        setSelectedText(selectedStr);
        setSelectedTextIndex(textOccurrenceIndex);
        addLogs({
          eventType: eventType[4], // "typing"
          content: `Selected text in PDF ${
            selectedFile?.id
          }: ${selectedStr.substring(0, 100)}... (occurrence ${
            textOccurrenceIndex
          } on page ${currentPage})`,
          eventSource: eventSource[12], // "pdf"
        });
      }
    };

    if (selectedFile) {
      document.addEventListener('selectionchange', handleSelectionChange);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [selectedFile, currentPage]);

  useEffect(() => {
    if (!documentLoaded) return;

    // ============================================
    // PDF HIGHLIGHT RENDERING
    // Note: Web page highlights are handled separately in HighlightContext.tsx
    // This section only processes and renders PDF highlights
    // ============================================

    // Filter to only highlight text with at least 2 words
    const textsToHighlight = associatedHighlights
      .flatMap(({ annotation }) => {
        const originalText = annotation.text.trim();

        // If text contains newlines, split by newlines and treat each line as separate highlight
        if (originalText.includes('\n')) {
          const lines = originalText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          return lines;
        }

        // Otherwise, return as single text
        return [originalText];
      })
      .filter(text => {
        const wordCount = text.split(/\s+/).length;
        return wordCount >= 2;
      });

    // Clear and re-render highlights
    searchPluginInstance.clearHighlights();

    const timeoutId = setTimeout(() => {
      if (textsToHighlight.length > 0) {
        searchPluginInstance.highlight(textsToHighlight);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Don't clear highlights in cleanup - let the next render handle it
    };
  }, [associatedHighlights, documentLoaded, selectedFile]);


  if (!selectedFile) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: '5%',
        zIndex: 9990,
        height: '90%',
        left: '3%',
        overflow: 'auto',
        width: '65%',
        backgroundColor: '#f8f8f8',
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
      }}
      ref={viewerRef}
    >
      {selectedFile.file_content && selectedFile.file_content.startsWith('data:application/pdf;base64,') ? (
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
          // Note: onDocumentLoadError is not available in this PDF viewer version
          onPageChange={handlePageChange}
          initialPage={currentPage}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📝 No valid PDF loaded</p>
            <p className="text-sm">Please upload a real PDF file to test the highlighting system</p>
          </div>
        </div>
      )}

      <button
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          border: '1px solid black',
          borderRadius: '10px',
          padding: '10px 20px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontWeight: '500',
          boxShadow: '0px 2px 4px rgba(0, 0, 1, 0.1)',
        }}
        onClick={handleClose}
      >
        Close
      </button>
    </div>
  );
};

export { PdfReviewer };
export default PdfReviewer;