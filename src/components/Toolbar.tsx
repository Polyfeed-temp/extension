import React, { useEffect, useState } from "react";
import { Menu, MenuHandler, MenuList } from "@material-tailwind/react";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../store/HighlightContext";
import HighlightSource from "web-highlighter/dist/model/source";
import { AnnotationTag, SideBarAction, Annotation } from "../types";
import { annotationTagsIcons } from "./AnnotationIcons";
import { useSidebar } from "../hooks/useSidebar";
import Tippy from "@tippyjs/react";
import { addLogs, eventSource, eventType } from "../services/logs.serivce";
import { useFileStore } from "../store/fileStore";

const cancelIcon = require("../assets/tag_icons/cancel.png").default as string;

function ToolbarMenu({
  Label,
  createHighLight,
  disabled = false,
}: {
  Label: AnnotationTag;
  createHighLight: (tag: AnnotationTag) => void;
  disabled?: boolean;
}) {
  //hover the index
  const [open, setOpen] = useState(false);

  // If disabled, render a simple div instead of interactive Menu
  if (disabled) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "#e0e0e0",
          opacity: 0.5,
          cursor: "not-allowed",
          height: 59,
          width: 65,
          paddingTop: 8,
          pointerEvents: "none", // Completely disable all mouse interactions
        }}
      >
        <img
          src={annotationTagsIcons[Label]}
          style={{ width: 50, height: 25, opacity: 0.5 }}
        />
        <span style={{ marginTop: "5px", fontSize: 8 }}>{Label}</span>
      </div>
    );
  }

  return (
    <Menu open={open}>
      <button
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
        }}
        onClick={() => {
          addLogs({
            eventType: eventType[1],
            content: Label,
            eventSource: eventSource[0],
          });
          setOpen(!open);

          createHighLight(Label);
        }}
      >
        <img
          src={annotationTagsIcons[Label]}
          style={{ width: 50, height: 25 }}
        />
        <span style={{ marginTop: "5px", whiteSpace: "nowrap" }}>
          {Label === "Confused" ? "Confusion" : Label}
        </span>
      </button>
      {/* <MenuList>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setAnnotationTag("Notes")}
            style={{
              width: "150px",
              height: "40px",
              marginBottom: "10px",
            }}
          >
            Add Note
          </button>
          <button
            onClick={() => setAnnotationTag("To-Dos")}
            style={{
              width: "150px",
              height: "40px",
            }}
          >
            Add to-do list
          </button>
        </div>
      </MenuList> */}
    </Menu>
  );
}

export function RenderPop({ highlighting }: { highlighting: HighlightSource }) {
  const highlighter = useHighlighterState().highlighterLib;
  const feedbackId = useHighlighterState().feedbackInfo?.id || 0;
  const highlightingID = highlighting.id;
  const _id = `__highlight-${highlightingID}`;
  const el = document.getElementById(_id);
  const [visible, setVisible] = useState(true);
  const { setCollapsed } = useSidebar();

  // Check if selected text has at least 2 words
  const hasMinimumWords = (text: string): boolean => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
  };

  const isValidSelection = hasMinimumWords(highlighting.text);

  const annotationTags: AnnotationTag[] = [
    "Strength",
    "Weakness",
    "Suggestions",
    "Confused",
    "Other",
  ];

  const annotationDispatch = useHighlighterDispatch();

  const createHighLight = (tag: AnnotationTag) => {
    // Validate minimum word count before proceeding
    if (!isValidSelection) {
      return; // Exit early if validation fails
    }

    if (tag === "Suggestions") tag = "Action Item";

    // Get the calculated textOffset and page from the file store
    const { selectedTextIndex, currentPage } = useFileStore.getState();

    const annotation: Annotation = {
      feedbackId: feedbackId,
      id: highlightingID,
      annotationTag: tag,
      startMeta: {
        ...highlighting.startMeta,
        textOffset: selectedTextIndex,  // Use our calculated occurrence index
        parentIndex: currentPage        // Use the current PDF page
      },
      endMeta: {
        ...highlighting.endMeta,
        parentIndex: currentPage        // Use the current PDF page
      },
      text: highlighting.text,
    };

    setCollapsed(false);
    annotationDispatch({
      type: "ADD_RECORD",
      payload: { annotation: annotation },
    });
  };

  useEffect(() => {
    const dom = highlighter?.getDoms(highlightingID)[0];
    const onClick = () => {
      setVisible(true);
    };
    if (dom) {
      dom.addEventListener("click", onClick);
      return () => {
        dom.removeEventListener("click", onClick);
        setVisible(false);
        // highlighter.remove(highlightingID);
      };
    }
  }, [highlighter, highlightingID]);

  return (
    <Tippy
      reference={el}
      interactive={true}
      render={() => (
        <div
          style={{
            zIndex: 9999999,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isValidSelection && (
            <div
              style={{
                position: "absolute",
                top: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "12px",
                color: "#856404",
                whiteSpace: "nowrap",
                zIndex: 10000000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              Please select at least 2 words to highlight
            </div>
          )}
          {annotationTags.map((Label) => (
            <ToolbarMenu
              key={Label}
              Label={Label}
              createHighLight={(Label) => createHighLight(Label)}
              disabled={!isValidSelection}
            />
          ))}

          <Menu>
            <button
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: 59,
                width: 65,
                paddingTop: 8,
                backgroundColor: "#f0f0f0",
              }}
              onClick={() => {
                addLogs({
                  eventType: eventType[1],
                  content: "Cancel",
                  eventSource: eventSource[0],
                });

                annotationDispatch({
                  type: "CANCEL_HIGHLIGHTED",
                });
              }}
            >
              <img src={cancelIcon} style={{ width: 18, height: 18 }} />
              <span style={{ marginTop: "5px", whiteSpace: "nowrap" }}>
                Cancel
              </span>
            </button>
          </Menu>
        </div>
      )}
      visible={visible}
    ></Tippy>
  );
}
