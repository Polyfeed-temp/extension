import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  IconButton,
  Button,
} from "@material-tailwind/react";

import {
  AnnotationData,
  AnnotationActionPoint,
  getClassForTag,
} from "../../types";

import { EditIcon, DeleteIcon } from "../AnnotationIcons";
import TodoCard from "./TodoCard";
import { Notes } from "./Notes";
import ConfirmationModal from "../ConfirmationModal";
import { useHighlighterDispatch } from "../../store/HighlightContext";

interface AnnotationCardProps {
  annotationData: AnnotationData;
  onDelete: () => void;
}

const AnnotationCard = ({ annotationData, onDelete }: AnnotationCardProps) => {
  const [activeTab, setActiveTab] = useState("notes");
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const highlighterDispatch = useHighlighterDispatch();

  const updateToDO = (actionItems: AnnotationActionPoint[]) => {
    highlighterDispatch({
      type: "UPDATE_HIGHLIGHT_ACTION_ITEMS",
      payload: {
        id: annotationData.annotation.id,
        actionItems,
      },
    });
    setEditing(false);
  };

  return (
    <div id={`card-view-${annotationData.annotation.id}`}>
      <Card className="mt-6 max-w-full w-70 border-solid border-4 border-black-500 overflow-hidden box-border">
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
              {annotationData.annotation.annotationTag}
            </p>
          </blockquote>

          <div className="mt-2">
            <p
              className="text-black"
              style={{
                textAlign: "left",
              }}
            >
              {annotationData.annotation.text}
            </p>
          </div>

          <div className="flex flex-row mt-2">
            <Button
              className={`p-2  ${
                activeTab === "notes" ? "bg-black text-white" : "bg-gray-300"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </Button>
            <Button
              className={`ml-2 p-2 ${
                activeTab === "actionItems"
                  ? "bg-black text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setActiveTab("actionItems")}
            >
              Action Items
            </Button>
          </div>
          {activeTab === "notes" && (
            <Notes
              key={annotationData.annotation.id}
              setNote={(input) => {
                setEditing(false);
                highlighterDispatch({
                  type: "UPDATE_HIGHLIGHT_NOTES",
                  payload: {
                    id: annotationData.annotation.id,
                    notes: input,
                  },
                });
              }}
              notes={annotationData.annotation.notes || ""}
              cancelFunc={() => setEditing(false)}
            />
          )}
          {activeTab === "actionItems" && (
            <TodoCard
              key={annotationData.annotation.id}
              saveFunc={updateToDO}
              todoitems={annotationData.actionItems}
              viewOnly={false}
            />
          )}
        </CardBody>
        <CardFooter className="pt-0">
          <div className="flex justify-end">
            {/* <IconButton
                variant="text"
                title="Edit Highlight notes or Action Items"
                ripple={true}
                onClick={() => setEditing(!editing)}
              >
                {EditIcon}
              </IconButton> */}

            <IconButton
              onClick={() => setShowModal(true)}
              variant="text"
              title="Delete Highlight, its notes and Action Items"
              ripple={true}
            >
              {DeleteIcon}
            </IconButton>
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
        message="Deleting Highlight, its notes and Action Items. This action cannot be undone."
      ></ConfirmationModal>
    </div>
  );
};

export default AnnotationCard;
