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

import OpenAIService from "../../../services/openai.service";
import {useState, useEffect} from "react";
function getColorForTag(tag: AnnotationTag | undefined) {
  console.log(tag);
  switch (tag) {
    case "Strength":
      return "#3a70b7";
    case "Weakness":
      return "#ef5975";
    case "Action Item":
      return "#23bfc6";
    case "Confused":
      return "#f79633";
    case "Other":
      return "#8960aa";
    default:
      return "gray-500";
  }
}

function RenderTabs() {
  const [explanation, setExplanation] = useState("");
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const currentEditing = highlighterState.editing;

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
  useEffect(() => {
    const fetchExplanationData = async () => {
      console.log("fetchExplanationData");
      const gptResponse = await fetch(
        "http://localhost:8000/api/openai/explain",
        {
          method: "POST",
          body: JSON.stringify({
            content: currentEditing?.annotation.text,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());
      console.log("gptResponse", gptResponse);

      setExplanation(gptResponse);
    };
    if (currentEditing?.sidebarAction === "Explain Further") {
      fetchExplanationData();
    }
  }, [currentEditing?.sidebarAction]);
  const fetchExplanationData = async () => {
    const text = currentEditing?.annotation.text;
    if (!text) {
      return;
    }
    const gptResponse = await new OpenAIService().explainFuther(text);
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
            <Notes setNote={addNotes}></Notes>
          </div>
        </div>
      );
    case "To-Dos":
      return (
        <div>
          <TodoCard saveFunc={addToDo}></TodoCard>
        </div>
      );
    case "Explain Further":
      return (
        <div>
          <p>{explanation}</p>
          <button onClick={handleButtonClick}> explain futher</button>
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

  console.log(currentEditing);
  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <blockquote
          className={`flex-grow border-l-4 pl-4 text-left`}
          style={{borderColor: `${annotationTagColor}`}}
        >
          <p className="text text-gray-700 italic">
            <span className="block text-sm text-gray-500 mb-1">
              {currentEditing?.annotation.annotationTag}
            </span>
            {currentEditing?.annotation.text}
          </p>
        </blockquote>
      </div>
      <div className="w-full">
        <RenderTabs></RenderTabs>
      </div>
    </div>
  );
}
