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
} from "@material-tailwind/react";
import {createPortal} from "react-dom";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../store/HighlightContext";
import HighlightSource from "web-highlighter/dist/model/source";
import {AnnotationTag, SideBarAction, Annotation} from "../types";

function ToolbarMenu({
  Label,
  setAnnotationTag,
}: {
  Label: string;
  setAnnotationTag: (sideBarAction: SideBarAction) => void;
}) {
  return (
    <Menu>
      <MenuHandler>
        <Button>{Label}</Button>
      </MenuHandler>
      <MenuList>
        <MenuItem onClick={() => setAnnotationTag("Notes")}>Add Note</MenuItem>
        <MenuItem onClick={() => setAnnotationTag("To-Dos")}>
          Add to-do list
        </MenuItem>
        <MenuItem>Explain Further</MenuItem>
      </MenuList>
    </Menu>
  );
}

export function RenderPop({highlighting}: {highlighting: HighlightSource}) {
  const highlighter = useHighlighterState().highlighterLib;
  const highlightingID = highlighting.id;
  const _id = `__highlight-${highlightingID}`;
  const el = document.getElementById(_id);
  const [visible, setVisible] = useState(true);
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
        id: highlightingID,
        AnnotationTag: tag,
        startMeta: highlighting.startMeta,
        endMeta: highlighting.endMeta,
        text: highlighting.text,
        url: window.location.href,
      };
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
  return el
    ? createPortal(
        <Popover open={visible} handler={setVisible}>
          <PopoverHandler {...triggers}>
            <span></span>
          </PopoverHandler>
          <PopoverContent {...triggers}>
            {annotationTags.map((tag) => (
              <ToolbarMenu
                Label={tag}
                setAnnotationTag={setAnnotationTag(tag)}
              ></ToolbarMenu>
            ))}
          </PopoverContent>
        </Popover>,
        el
      )
    : null;
}
