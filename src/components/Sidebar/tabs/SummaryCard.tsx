import React, { useState } from "react";
import { AnnotationData, AnnotationTag, Feedback, Unit } from "../../../types";
import { Button } from "@material-tailwind/react";
import {
  annotationTagsIcons,
  chevronIconDown,
  chevronIconUp,
} from "../../AnnotationIcons";

import {
  addLogs,
  eventType,
  eventSource,
} from "../../../services/logs.serivce";
interface Props {
  annotationData: AnnotationData[];
}

export function UnitAssignmentSummary({ feedback }: { feedback: Feedback }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    addLogs({
      eventType: isDropdownOpen ? eventType[6] : eventType[1],
      content: "Highlight Summary for " + feedback.unitCode,
      eventSource: eventSource[6],
    });
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="border rounded-lg">
      <button
        onClick={toggleDropdown}
        className=" flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left"
      >
        {isDropdownOpen
          ? feedback.unitCode
          : "Highlight Summary for " + feedback.unitCode}

        {isDropdownOpen ? chevronIconUp : chevronIconDown}
      </button>
      {isDropdownOpen && feedback.highlights ? (
        <>
          <div className="border-2 border-solid">
            Assessment: {feedback.assessmentName}
          </div>

          <SummaryCard annotationData={feedback.highlights} />
          <Button
            fullWidth
            className="bg-black"
            onClick={() => {
              addLogs({
                eventSource: eventSource[6],
                content: feedback.url,
                eventType: eventType[7],
              });
              window.location.href = feedback.url;
            }}
          >
            Go to Feedback
          </Button>
        </>
      ) : null}
    </div>
  );
}

export const SummaryCard: React.FC<Props> = ({ annotationData }) => {
  const annotationTagCount: { [key in AnnotationTag]: number } = {
    Strength: 0,
    Weakness: 0,
    "Action Item": 0,
    Suggestions: 0,
    Confused: 0,
    Other: 0,
  };

  annotationData.forEach(({ annotation }) => {
    annotationTagCount[annotation.annotationTag] += 1;
  });

  // Render the grouped data
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(annotationTagCount).map(([category, counter]) => (
        <div key={category} className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={annotationTagsIcons[category as AnnotationTag]}
              alt={category}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            {category + ": " + counter}
          </div>
        </div>
      ))}
    </div>
  );
};
