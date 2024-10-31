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

const cancelIcon = require("../assets/tag_icons/cancel.png").default as string;

function ToolbarMenu({
  Label,
  createHighLight,
}: {
  Label: AnnotationTag;
  createHighLight: (tag: AnnotationTag) => void;
}) {
  //hover the index
  const [open, setOpen] = useState(false);

  return (
    <Menu open={open}>
      <button
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
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
        <span style={{ marginTop: "5px", whiteSpace: "nowrap" }}>{Label}</span>
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

  const annotationTags: AnnotationTag[] = [
    "Strength",
    "Weakness",
    "Suggestions",
    "Confused",
    "Other",
  ];

  const annotationDispatch = useHighlighterDispatch();

  const createHighLight = (tag: AnnotationTag) => {
    if (tag === "Suggestions") tag = "Action Item";

    console.log("called createHighLight");
    // addLogs({
    //   eventType: eventType[0],
    //   content: JSON.stringify({ tag }),
    //   eventSource: eventSource[0],
    // });

    const annotation: Annotation = {
      feedbackId: feedbackId,
      id: highlightingID,
      annotationTag: tag,
      startMeta: highlighting.startMeta,
      endMeta: highlighting.endMeta,
      text: highlighting.text,
    };

    console.log("annotation", annotation);
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
          {annotationTags.map((Label) => (
            <ToolbarMenu
              key={Label}
              Label={Label}
              createHighLight={(Label) => createHighLight(Label)}
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
