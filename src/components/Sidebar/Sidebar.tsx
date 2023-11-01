import {
  Card,
  Typography,
  List,
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";
import {Notes} from "./Notes";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../../store/HighlightContext";
import AnnotatedCard from "./AnnotatedCard";
import HighlightSource from "web-highlighter/dist/model/source";
import LabelDropdown from "../LabelDropdown";
import {useState} from "react";
import TodoCard from "./TodoCard";
import {UnitForm} from "../UnitForm";
import {AnnotationToDo, AnnotationNotes, AnnotationData} from "../../types";

export function DefaultSidebar() {
  const highlighterState = useHighlighterState();
  const highlighterDispatch = useHighlighterDispatch();
  const currentEditing = highlighterState.editing;
  console.log(highlighterState.records);
  const [visible, setVisible] = useState(false);
  const addNotes = (input: AnnotationNotes) => {
    highlighterDispatch({
      type: "ADD_RECORD",
      payload: {
        annotation: currentEditing?.annotation,
        notes: input,
      } as AnnotationData,
    });
  };
  function renderTabs() {
    console.log(currentEditing);
    switch (currentEditing?.sidebarAction) {
      case "Notes":
        return (
          <div>
            <div>
              <Notes
                text={currentEditing.annotation.text}
                setNote={addNotes}
              ></Notes>

              <button>Save</button>
            </div>
          </div>
        );
      case "To-Dos":
        return (
          <div>
            <p>{currentEditing.annotation.text}</p>
            <TodoCard></TodoCard>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      {/* <UnitForm units={["FIT2099", "FIT3174", "FIT3171", "FIT2014"]}></UnitForm> */}
      <Button onClick={() => setVisible(!visible)}>Confirm</Button>
      {visible ? (
        <div className="">
          <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
            <div className="mb-2 p-4">
              <button
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
              </button>
            </div>
            <List>
              {renderTabs()}
              {/* 
              {highlighterState.records.map((record: HighlightSource) => (
                <AnnotatedCard
                  text={record.text}
                  onEdit={() => {
                    highlighterDispatch({
                      type: "SET_EDITING",
                      payload: record,
                    });
                  }}
                  onDelete={() => {
                    highlighterDispatch({
                      type: "DELETE_RECORD",
                      payload: record,
                    });
                  }}
                />
              ))} */}
            </List>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
