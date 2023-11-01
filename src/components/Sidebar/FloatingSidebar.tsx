import React, {useState} from "react";
import {Button} from "@material-tailwind/react";
import {UnitForm} from "../UnitForm";
import {mockUser} from "../../services/user";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";
const DraggableWindow = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [position, setPosition] = useState({x: 35, y: 120});
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();

  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
    } else {
      setIsMaximized(true);
      setPosition({x: 0, y: 0});
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeWindow = () => {
    setIsVisible(false);
  };

  const openWindow = () => {
    setIsVisible(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div
      id="wrapper"
      className={`bg-white w-96 h-[420px] rounded-2xl absolute resize overflow-auto ${
        isMaximized ? "w-full h-full" : ""
      } ${isMinimized ? "h-[60px] overflow-hidden" : ""}
        `}
      style={{left: `${position.x}px`, top: `${position.y}px`}}
    >
      <div
        id="header"
        className="p-6 border-b border-gray-300 text-xl text-purple-700 flex justify-between cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Polyfeed
        <div
          id="actions"
          className="flex gap-3 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <i
            className="fa-sharp fa-regular fa-window-maximize"
            onClick={toggleMaximize}
          ></i>
          <span className="material-icons" onClick={toggleMinimize}>
            minimize
          </span>

          <i className="fa-sharp fa-solid fa-xmark" onClick={closeWindow}></i>
        </div>
      </div>
      <div id="content" className="p-6 text-center">
        <Button>My Notes</Button>
        <Button>My Summary</Button>
        <Button
          onClick={() => {
            highlighterDispatch({
              type: "SET_IS_HIGHLIGHTING",
              payload: !highlighterState.isHighlighting,
            });
          }}
        >
          {highlighterState.isHighlighting
            ? "Disable Annotation"
            : "Enable Annotation"}
        </Button>
        <UnitForm units={mockUser.units}></UnitForm>
      </div>
    </div>
  );
};

export default DraggableWindow;
