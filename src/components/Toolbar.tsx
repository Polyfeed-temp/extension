import React, {useEffect, useState} from "react";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
  Typography,
} from "@material-tailwind/react";
import {createRoot} from "react-dom/client";
export function RenderPop({id, highlighter}: {id: string; highlighter: any}) {
  console.log("rendering");
  const _id = `__highlight-${id}`;
  const el = document.getElementById(_id);
  const [visible, setVisible] = useState(true);
  const triggers = {
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false),
  };

  useEffect(() => {
    const dom = highlighter.getDoms(id)[0];
    const onClick = () => {
      setVisible(true);
    };
    if (dom) {
      dom.addEventListener("click", onClick);
      return () => {
        dom.removeEventListener("click", onClick);
      };
    }
  }, [highlighter, id]);
  useEffect(() => {
    if (el) {
      const root = createRoot(el);
      root.render(
        <Popover>
          <PopoverHandler {...triggers}>
            <Button variant="text">Profile Info</Button>
          </PopoverHandler>
          <PopoverContent {...triggers}> HII</PopoverContent>
        </Popover>
      );
    }
  }, [el]);

  return null;
}
