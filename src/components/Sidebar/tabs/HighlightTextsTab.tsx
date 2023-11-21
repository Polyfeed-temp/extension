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
} from "../../../types";
import {useState} from "react";
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
export function HighlightingTab({
  unitCode,
  assignment,
}: {
  unitCode: string;
  assignment: string;
}) {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const currentEditing = highlighterState.editing;
  const [actionItems, setActionItems] = useState<AnnotationActionPoint[]>([]);

  const addNotes = (input: AnnotationNotes) => {
    highlighterDispatch({
      type: "ADD_RECORD",
      payload: {
        unitCode: unitCode,
        assignment: assignment,
        annotation: {
          ...currentEditing?.annotation,
          notes: input.content.toString(),
        },
      } as AnnotationData,
    });
  };
  const addToDo = () => {
    highlighterDispatch({
      type: "ADD_RECORD",
      payload: {
        unitCode: unitCode,
        assignment: assignment,
        annotation: currentEditing?.annotation,
        todo: actionItems,
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
            </div>
          </div>
        );
      case "To-Dos":
        return (
          <div>
            <TodoCard
              actionItems={actionItems}
              setActionItems={setActionItems}
            ></TodoCard>
          </div>
        );
      default:
        return null;
    }
  }

  const annotationTagColor = getColorForTag(
    currentEditing?.annotation.annotationTag
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <blockquote
          className={`flex-grow border-l-4 pl-4 text-left`}
          style={{borderColor: `${annotationTagColor}`}}
        >
          <p className="text-gray-700 italic">
            <span className="block text-sm text-gray-500 mb-1">
              {currentEditing?.annotation.annotationTag}
            </span>
            {currentEditing?.annotation.text}
          </p>
        </blockquote>
      </div>
      <div className="w-full">{renderTabs()}</div>
    </div>
  );
}
