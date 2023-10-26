import React, {useEffect, useState} from "react";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
  Typography,
} from "@material-tailwind/react";
import {createRoot} from "react-dom/client";
import {createPortal} from "react-dom";
import {useHighlighterState} from "../store/HighlightContext";
export function RenderPop({id}: {id: string}) {
  const highlighter = useHighlighterState().highlighterLib;
  const _id = `__highlight-${id}`;
  const el = document.getElementById(_id);
  const [visible, setVisible] = useState(true);
  const triggers = {
    onmouseenter: () => setVisible(true),
    onmouseleave: () => setVisible(false),
  };

  useEffect(() => {
    const dom = highlighter?.getDoms(id)[0];
    const onClick = () => {
      setVisible(true);
    };
    if (dom) {
      dom.addEventListener("click", onClick);
      return () => {
        dom.removeEventListener("click", onClick);
        setVisible(false);
      };
    }
  }, [highlighter, id]);
  return el
    ? createPortal(
        <Popover open={visible} handler={setVisible}>
          <PopoverHandler {...triggers}>
            <span></span>
          </PopoverHandler>
          <PopoverContent {...triggers}>
            <Button> Strength</Button> <Button> Weakness</Button>
            <Button> Action Item</Button>
            <Button>Confused</Button>
            <Button>Other</Button>
          </PopoverContent>
        </Popover>,
        el
      )
    : null;
}
