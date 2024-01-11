import {Notes} from "../Notes";
import TodoCard from "../TodoCard";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../../store/HighlightContext";

import {
  AnnotationNotes,
  AnnotationData,
  AnnotationActionPoint,
  AnnotationTag,
  Annotation,
} from "../../../types";
import {SideBarAction} from "../../../types";
import {getColorForTag, getClassForTag} from "../../../types";
import OpenAIService from "../../../services/openai.service";
import {useState, useEffect} from "react";
import {toast} from "react-toastify";
import {input} from "@material-tailwind/react";
import AnnotationService from "../../../services/annotation.service";
import {ExplainFutherToggle} from "../ExplainFutherInput";
function RenderTabs() {
  const [explanation, setExplanation] = useState("");
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const currentEditing = highlighterState.editing;
  const editing = highlighterState.records.find(
    (annotation) => annotation.annotation.id === currentEditing?.annotation.id
  );
  console.log("editing", editing);
  const addNotes = (input: String) => {
    highlighterDispatch({
      type: "ADD_RECORD",
      payload: {
        annotation: {
          ...currentEditing?.annotation,
          notes: input,
        } as Annotation,
      } as AnnotationData,
    });
  };
  const addToDo = (actionItems: AnnotationActionPoint[]) => {
    highlighterDispatch({
      type: "ADD_RECORD",
      payload: {
        annotation: currentEditing?.annotation,
        actionItems: actionItems,
      } as AnnotationData,
    });
  };
  const fetchExplanationData = async () => {
    const text = currentEditing?.annotation.text;
    if (!text) {
      return;
    }
    const gptStatus = new OpenAIService().explainFuther(text);
    toast.promise(gptStatus, {
      pending: "Generating explanation...",
      success: "Explanation generated!",
      error: "Failed to generate explanation",
    });
    const gptResponse = await gptStatus;
    console.log("gptResponse", gptResponse);

    setExplanation(gptResponse);
  };
  const handleButtonClick = () => {
    console.log("handleButtonClick");
    fetchExplanationData();
  };

  switch (currentEditing?.sidebarAction) {
    case "Notes":
      return (
        <div>
          <div>
            <Notes
              setNote={addNotes}
              notes={currentEditing.annotation.notes || ""}
            ></Notes>
          </div>
        </div>
      );
    case "To-Dos":
      return <div>{<TodoCard saveFunc={addToDo}></TodoCard>}</div>;
    case "Editing":
      return (
        <div>
          <p>
            <Notes
              setNote={(input) =>
                highlighterDispatch({
                  type: "UPDATE_HIGHLIGHT_NOTES",
                  payload: {id: currentEditing.annotation.id, notes: input},
                })
              }
              notes={currentEditing.annotation.notes || ""}
            ></Notes>

            <TodoCard
              saveFunc={addToDo}
              todoitems={
                highlighterState.records.find(
                  (annotation) =>
                    annotation.annotation.id === currentEditing?.annotation.id
                )?.actionItems
              }
            ></TodoCard>
          </p>
        </div>
      );
    default:
      return null;
  }
}

export function HighlightingTab() {
  const highlighterState = useHighlighterState();
  const currentEditing = highlighterState.editing;

  const annotationTagColor = getColorForTag(
    currentEditing?.annotation.annotationTag
  );
  useEffect(() => {
    highlighterState.highlighterLib?.addClass(
      getClassForTag(currentEditing?.annotation.annotationTag),
      currentEditing?.annotation.id
    );
  }, [currentEditing]);

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        {currentEditing &&
        currentEditing.sidebarAction !== "Explain Further" ? (
          <blockquote
            className={`flex-grow border-l-4 pl-4 text-left`}
            style={{borderColor: `${annotationTagColor}`}}
          >
            <p className="text text-gray-700 italic">
              <span className="block text-xl text-gray-500 mb-1">
                {currentEditing.annotation.annotationTag}
              </span>
              {currentEditing.annotation.text}
            </p>
          </blockquote>
        ) : null}
      </div>
      <div className="w-full">
        <RenderTabs></RenderTabs>
      </div>
    </div>
  );
}
