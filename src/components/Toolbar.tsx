import React, {useEffect, useState} from "react";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import {createPortal} from "react-dom";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../store/HighlightContext";
import HighlightSource from "web-highlighter/dist/model/source";
import {AnnotationTag, SideBarAction, Annotation} from "../types";
import {annotationTagsIcons} from "./AnnotationIcons";
import {useSidebar} from "../hooks/useSidebar";
import Tippy from "@tippyjs/react";

function ToolbarMenu({
  Label,
  setAnnotationTag,
}: {
  Label: AnnotationTag;
  setAnnotationTag: (sideBarAction: SideBarAction) => void;
}) {
  //hover the index
  return (
    <Menu>
      <MenuHandler className="p-1">
        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <img
            src={annotationTagsIcons[Label]}
            style={{width: 50, height: 25}}
          />
          <span style={{marginTop: "5px", whiteSpace: "nowrap"}}>{Label}</span>
        </button>
      </MenuHandler>
      <MenuList>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {" "}
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
      </MenuList>
    </Menu>
  );
}

export function RenderPop({highlighting}: {highlighting: HighlightSource}) {
  const highlighter = useHighlighterState().highlighterLib;
  const feedbackId = useHighlighterState().feedbackInfo?.id || 0;
  const highlightingID = highlighting.id;
  const _id = `__highlight-${highlightingID}`;
  const el = document.getElementById(_id);
  const [visible, setVisible] = useState(true);
  const {setCollapsed} = useSidebar();
  const triggers = {
    onmouseenter: () => setVisible(true),
    onmouseleave: () => setVisible(false),
  };
  const annotationTags: AnnotationTag[] = [
    "Strength",
    "Weakness",
    "Action Item",
    "Confused",
    "Other",
  ];

  const annotationDispatch = useHighlighterDispatch();
  const setAnnotationTag =
    (tag: AnnotationTag) => (sidebarAction: SideBarAction) => {
      const annotation: Annotation = {
        feedbackId: feedbackId,
        id: highlightingID,
        annotationTag: tag,
        startMeta: highlighting.startMeta,
        endMeta: highlighting.endMeta,
        text: highlighting.text,
      };
      setCollapsed(false);
      annotationDispatch({
        type: "SET_EDITING",
        payload: {sidebarAction: sidebarAction, annotation: annotation},
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
              setAnnotationTag={setAnnotationTag(Label)}
            />
          ))}
        </div>
      )}
      visible={visible}
    ></Tippy>
  );
}
