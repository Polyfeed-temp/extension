import React, { useEffect, useState } from "react";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";

import { useFileStore } from "../../store/fileStore";
import { Annotation, AnnotationTag, Feedback } from "../../types";
import { annotationTagsIcons } from "../AnnotationIcons";
import { Button, collapse } from "@material-tailwind/react";
import { v4 as uuidv4 } from "uuid";
import { addLogs, eventSource, eventType } from "../../services/logs.serivce";
import AnnotationService from "../../services/annotation.service";

const PdfManagement = ({ feedback }: { feedback: Feedback }) => {
  const highlighterState = useHighlighterState();

  const {
    createFile,
    fetchFilesByFeedbackId,
    fileList,
    loading,
    setSelectedFile,
    selectedFile,
    fetchingListLoading,
    selectedText,
    setAssociatedHighlights,
    setSelectedText,
  } = useFileStore();

  useEffect(() => {
    if (feedback) {
      fetchFilesByFeedbackId(feedback.id);
    }
  }, [feedback]);

  const renderLoading = () => {
    return (
      <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
    );
  };

  const annotationTags: AnnotationTag[] = [
    "Strength",
    "Weakness",
    "Suggestions",
    "Confused",
    "Other",
  ];

  const [selectedTag, setSelectedTag] = useState<AnnotationTag>("Strength");
  const annotationDispatch = useHighlighterDispatch();
  const annotationService = new AnnotationService();

  const createHighLight = async () => {
    let tag = selectedTag;
    if (tag === "Suggestions") tag = "Action Item";

    const annotation: Annotation = {
      feedbackId: feedback.id,
      id: uuidv4(),
      annotationTag: tag,
      startMeta: {
        parentTagName: `${selectedFile?.id || ""}`,
        parentIndex: 0,
        textOffset: 0,
      },
      endMeta: {
        parentTagName: "",
        parentIndex: 0,
        textOffset: 0,
      },
      text: selectedText,
    };

    addLogs({
      eventType: eventType[2],
      content: JSON.stringify(annotation),
      eventSource: eventSource[0],
    });

    annotationDispatch({
      type: "ADD_RECORD",
      payload: { annotation: annotation },
    });

    setTimeout(async () => {
      const newFeedback = await annotationService.getCurrentPageFeedback();
      annotationDispatch({ type: "INITIALIZE", payload: newFeedback });

      // Update associated highlights after creating new highlight
      if (selectedFile && newFeedback?.highlights) {
        const newAssociatedHighlights = newFeedback.highlights.filter(
          (highlight) =>
            highlight?.annotation?.startMeta?.parentTagName ===
            selectedFile.id.toString()
        );

        // Store current file
        const currentFile = selectedFile;

        // Temporarily clear selected file
        setSelectedFile(null);

        // Reset selected file after a brief delay to trigger reload
        setTimeout(() => {
          setSelectedFile(currentFile);
          setAssociatedHighlights(newAssociatedHighlights);
        }, 100);
      }
      setSelectedText("");
    }, 1000);
  };

  const uploadFile = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        addLogs({
          eventType: eventType[2],
          content: `Uploaded new PDF file: ${file.name}`,
          eventSource: eventSource[12],
        });

        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          createFile(highlighterState?.feedbackInfo?.id || 0, base64String);
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  };

  const handleFileSelection = (file: any) => {
    if (selectedFile?.id === file.id) {
      addLogs({
        eventType: eventType[6],
        content: `Closed PDF file: ${file.id}`,
        eventSource: eventSource[12],
      });
      setSelectedFile(null);
      return;
    }

    addLogs({
      eventType: eventType[1],
      content: `Selected PDF file: ${file.id}`,
      eventSource: eventSource[12],
    });

    if (feedback.highlights) {
      const associatedHighlights = feedback.highlights.filter(
        (highlight) =>
          highlight?.annotation?.startMeta?.parentTagName === file.id.toString()
      );
      setAssociatedHighlights(associatedHighlights);
    }
    setSelectedFile(file);
  };

  return (
    <div
      style={{
        border: "1px solid black",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <p className="text-lg font-bold">Manage PDF Feedback file</p>
      <div
        className="flex flex-col overflow-y-hidden  mt-2 justify-center items-center"
        style={{
          overflowX: "hidden",
        }}
      >
        <div style={{ width: "100%" }}>
          <div className="flex items-center gap-2">
            <p
              style={{
                textAlign: "left",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              1.
            </p>
            <p
              style={{
                textAlign: "left",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Click to upload the PDF file
            </p>
          </div>
          <div
            style={{
              padding: 5,
            }}
          >
            {loading ? (
              renderLoading()
            ) : (
              <Button onClick={() => uploadFile()}>Upload PDF</Button>
            )}
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <div className="flex items-center gap-2">
            <p
              style={{
                textAlign: "left",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              2.
            </p>
            <p
              style={{
                textAlign: "left",
                whiteSpace: "nowrap",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Click to open the PDF file to be highlighted
            </p>
          </div>
          <div
            className="flex"
            style={{
              marginRight: "10%",
              overflowX: "auto",
              padding: 10,
            }}
          >
            {fetchingListLoading && renderLoading()}
            {/* showing file list here */}

            {fileList.length > 0 &&
              fileList.map((file, index) => (
                <div
                  className={`rounded-md mr-2 cursor-pointer ${
                    selectedFile?.id === file.id
                      ? "bg-black text-white"
                      : "bg-gray-200"
                  }`}
                  style={{
                    minWidth: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 40,
                  }}
                  key={file.id}
                  onClick={() => handleFileSelection(file)}
                >
                  {`PDF - ${index + 1}`}
                </div>
              ))}
          </div>
        </div>
      </div>

      {selectedText && (
        <div>
          <p
            style={{
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            Selected Text On PDF
          </p>
          <p>{selectedText}</p>

          {/* rendering the annotation */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginTop: 20,
            }}
          >
            {annotationTags.map((tag) => {
              return (
                <div
                  key={tag}
                  style={{
                    border: "1px solid black",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1%",
                    cursor: "pointer",
                    borderRadius: "20px",
                    backgroundColor:
                      selectedTag === tag ? "lightblue" : "white",
                  }}
                  onClick={() => {
                    setSelectedTag(tag);
                    addLogs({
                      eventType: eventType[0], // click
                      content: `Selected annotation tag: ${tag}`,
                      eventSource: eventSource[12], // pdf
                    });
                  }}
                >
                  <img
                    src={annotationTagsIcons[tag]}
                    style={{ width: 50, height: 25 }}
                    alt={tag}
                  />
                  <p style={{ textAlign: "center" }}>
                    {tag === "Confused" ? "Confusion" : tag}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <Button
              className="bg-black"
              style={{
                marginTop: 20,
              }}
              disabled={!selectedText && !selectedTag}
              onClick={() => {
                addLogs({
                  eventType: eventType[2], // create
                  content: `Created highlight with tag ${selectedTag}`,
                  eventSource: eventSource[12], // pdf
                });
                createHighLight();
              }}
            >
              Create Highlight
            </Button>

            <Button
              className="bg-black"
              style={{
                marginTop: 20,
              }}
              disabled={!selectedText && !selectedTag}
              onClick={() => {
                addLogs({
                  eventType: eventType[8], // delete
                  content: "Cleared highlight selection",
                  eventSource: eventSource[12], // pdf
                });
                setSelectedText("");
              }}
            >
              Clear Highlight
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { PdfManagement };
