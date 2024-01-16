import React, {useState, useEffect} from "react";
import {AnnotationData, AnnotationTag, Feedback, Unit} from "../../../types";
import {IconButton, Button} from "@material-tailwind/react";
import {
  annotationTagsIcons,
  chevronIconDown,
  chevronIconUp,
  EditIcon,
} from "../../AnnotationIcons";

import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../../store/HighlightContext";
import SearchableSelect from "../SearchableSelect";
import {getAllUnits} from "../../../services/unit.service";
interface Props {
  annotationData: AnnotationData[];
}

export function UnitAssignmentSummary({feedback}: {feedback: Feedback}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  console.log(feedback);
  const toggleDropdown = () => {
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
            Assessment {feedback.assessmentName}
          </div>

          <SummaryCard annotationData={feedback.highlights} />
          <Button
            fullWidth
            className="bg-black"
            onClick={() => (window.location.href = feedback.url)}
          >
            {" "}
            Go to Feedback
          </Button>
        </>
      ) : null}
    </div>
  );
}

export const SummaryCard: React.FC<Props> = ({annotationData}) => {
  const annotationTagCount: {[key in AnnotationTag]: number} = {
    Strength: 0,
    Weakness: 0,
    "Action Item": 0,
    Confused: 0,
    Other: 0,
  };
  console.log(annotationData[0]);

  annotationData.forEach(({annotation}) => {
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
              style={{width: 20, height: 20, marginRight: 8}}
            />
            {category + ": " + counter}
          </div>
        </div>
      ))}
    </div>
  );
};
