import React, { useEffect, useState } from "react";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";

import { useFileStore } from "../../store/fileStore";
import { Annotation, AnnotationTag, Feedback } from "../../types";
import { annotationTagsIcons } from "../AnnotationIcons";
import { Button } from "@material-tailwind/react";
import { v4 as uuidv4 } from "uuid";
import { addLogs, eventSource, eventType } from "../../services/logs.serivce";

const uploadIcon = require("../../assets/icons/upload.png").default as string;

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

  const createHighLight = () => {
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
  };

  const uploadFile = () => {
    // Create hidden file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
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

  return (
    <div
      style={{
        border: "1px solid black",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <p className="text-lg font-bold">Manage PDF file</p>
      <div className="flex flex-col overflow-y-hidden mt-2 justify-center items-center">
        <div
          className="flex"
          style={{
            maxWidth: "80%",
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
                onClick={() => {
                  if (selectedFile?.id === file.id) {
                    setSelectedFile(null);
                    return;
                  }
                  // set the file
                  setSelectedFile(file);

                  // find the highlights associated with this file
                  const highlights = feedback.highlights;
                  const associatedHighlights = [];
                  if (highlights && highlights.length > 0) {
                    for (const highlight of highlights) {
                      if (
                        highlight &&
                        highlight.annotation &&
                        highlight.annotation.startMeta &&
                        highlight.annotation.startMeta.parentTagName ===
                          file.id.toString()
                      ) {
                        associatedHighlights.push(highlight);
                      }
                    }
                  }

                  setAssociatedHighlights(associatedHighlights);
                }}
              >
                {`PDF - ${index + 1}`}
              </div>
            ))}
        </div>

        <div
          style={{
            padding: 5,
            marginTop: 20,
          }}
        >
          {loading ? (
            renderLoading()
          ) : (
            <Button onClick={() => uploadFile()}>Upload PDF</Button>
          )}
        </div>

        {/* showing the selected text */}
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
                  onClick={() => setSelectedTag(tag)}
                >
                  <img
                    src={annotationTagsIcons[tag]}
                    style={{ width: 50, height: 25 }}
                  />
                  <p style={{ textAlign: "center" }}>{tag}</p>
                </div>
              );
            })}
          </div>

          <Button
            className="bg-black"
            style={{
              marginTop: 20,
            }}
            disabled={!selectedText && !selectedTag}
            onClick={() => createHighLight()}
          >
            Create Highlight
          </Button>
        </div>
      )}
    </div>
  );
};

export { PdfManagement };
