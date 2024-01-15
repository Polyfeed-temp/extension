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
        <button>
          <img
            src={annotationTagsIcons[Label]}
            style={{width: 50, height: 25}}
          />
          <span>{Label}</span>
        </button>
      </MenuHandler>
      <MenuList>
        <MenuItem onClick={() => setAnnotationTag("Notes")}>Add Note</MenuItem>
        <MenuItem onClick={() => setAnnotationTag("To-Dos")}>
          Add to-do list
        </MenuItem>
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
  const theme = {
    popover: {
      defaultProps: {
        placement: "top",
        offset: 5,
        dismiss: {},
        animate: {
          unmount: {},
          mount: {},
        },
        className: "",
      },
      styles: {
        base: {
          bg: "bg-white",
          p: "p-4",
          border: "border border-blue-gray-50",
          borderRadius: "rounded-lg",
          boxShadow: "shadow-lg shadow-blue-gray-500/10",
          fontFamily: "font-sans",
          fontSize: "text-sm",
          fontWeight: "font-normal",
          color: "text-blue-gray-500",
          outline: "focus:outline-none",
          overflowWrap: "break-words",
          whiteSpace: "whitespace-normal",
        },
      },
    },
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
  return el
    ? createPortal(
        <Popover open={visible} handler={setVisible}>
          <PopoverHandler {...triggers}>
            <span></span>
          </PopoverHandler>
          <PopoverContent {...triggers} className="border border-2 p-0 z-100">
            {annotationTags.map((tag) => (
              <ToolbarMenu
                Label={tag}
                setAnnotationTag={setAnnotationTag(tag)}
              ></ToolbarMenu>
            ))}

            <button
              onClick={() => setAnnotationTag("Other")("Explain Further")}
              className="p-1"
            >
              <span>Ask Chat GPT</span>
            </button>
          </PopoverContent>
        </Popover>,
        el
      )
    : null;
}
