import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  IconButton,
  Button,
} from "@material-tailwind/react";
import {AnnotationData, AnnotationActionPoint} from "../../types";
import {getClassForTag} from "../../types";
import {EditIcon, DeleteIcon} from "../AnnotationIcons";
import TodoCard, {ToDoItems} from "./TodoCard";
import {Notes} from "./Notes";
import {useHighlighterDispatch} from "../../store/HighlightContext";
import {useState, useRef, useEffect} from "react";
import ConfirmationModal from "../ConfirmationModal";
interface AnnotationCardProps {
  annotationData: AnnotationData;
  onDelete: () => void;
}
export default function AnnotatedCard({
  annotationData,
  onDelete,
}: AnnotationCardProps) {
  const text = annotationData.annotation.text;

  const truncatedText =
    text.length > 100 ? text.substring(0, 100) + "..." : text;
  const highlighterDispatch = useHighlighterDispatch();

  const updateToDO = (actionItems: AnnotationActionPoint[]) => {
    highlighterDispatch({
      type: "UPDATE_HIGHLIGHT_ACTION_ITEMS",
      payload: {
        id: annotationData.annotation.id,
        actionItems: actionItems,
      },
    });
    setEditing(false);
  };
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  return (
    <div id={`card-view-${annotationData.annotation.id}`}>
      <Card className="mt-6 max-w-full w-70 border-solid border-4 border-black-500 overflow-hidden box-border before:opacity-0 before:group-hover:opacity-100 card">
        <CardBody className="overflow-y-auto">
          <blockquote
            className={`border-${getClassForTag(
              annotationData.annotation.annotationTag
            )} flex-grow border-l-4 pl-4 text-left clickable`}
            onClick={() => {
              setEditing(true);
            }}
          >
            <p className="text text-gray-700 italic">
              <span className="block text-xl text-gray-500 mb-1">
                {annotationData.annotation.annotationTag}
              </span>
              {editing ? text : truncatedText}
            </p>
          </blockquote>
          <div className=" w-full">
            {
              // always show notes if not aciton item
              editing && (annotationData.actionItems?.length ?? 0) === 0 ? (
                <Notes
                  key={annotationData?.annotation.id}
                  setNote={(input) => {
                    setEditing(false);
                    highlighterDispatch({
                      type: "UPDATE_HIGHLIGHT_NOTES",
                      payload: {id: annotationData.annotation.id, notes: input},
                    });
                  }}
                  notes={annotationData.annotation.notes || ""}
                  cancelFunc={() => setEditing(false)}
                ></Notes>
              ) : (
                editing &&
                (annotationData.actionItems?.length ?? 0) > 0 && (
                  <TodoCard
                    key={annotationData?.annotation.id}
                    saveFunc={updateToDO}
                    todoitems={annotationData.actionItems}
                    viewOnly={false}
                  ></TodoCard>
                )
              )
            }
            {
              // Check if there are action items to render the TodoCard component
              !editing &&
              annotationData.actionItems &&
              annotationData.actionItems.length > 0 ? (
                <TodoCard
                  key={annotationData?.annotation.id}
                  saveFunc={updateToDO}
                  todoitems={annotationData.actionItems}
                  viewOnly={true}
                ></TodoCard>
              ) : null
            }
            {
              // Render notes if not editing and notes exist
              !editing &&
              annotationData.annotation.notes &&
              annotationData.annotation.notes.length > 0 ? (
                <p className="break-words text-left">
                  {annotationData.annotation.notes}
                </p>
              ) : null
            }
          </div>
        </CardBody>
        <CardFooter className="pt-0">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <IconButton
                variant="text"
                title="Edit Highlight notes or Action Items"
                ripple={true}
                onClick={() => setEditing(!editing)}
              >
                {EditIcon}
              </IconButton>

              <IconButton
                onClick={() => setShowModal(true)}
                variant="text"
                title="Delete Highlight, its notes and Action Items"
                ripple={true}
              >
                {" "}
                {DeleteIcon}
              </IconButton>
            </div>
          </div>
        </CardFooter>
      </Card>
      <ConfirmationModal
        key={annotationData.annotation.id}
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          onDelete();
          setShowModal(false);
        }}
        message="Deleting Highlight, its notes and Action Items. This action cannot be undo"
      ></ConfirmationModal>
    </div>
  );
}
