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
} from "../../../types";
import {useState} from "react";

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
            <p className="text-gray-700 font-semibold">
              {currentEditing.annotation.text}
            </p>
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

  return (
    <div>
      <div>{renderTabs()}</div>
    </div>
  );
}
