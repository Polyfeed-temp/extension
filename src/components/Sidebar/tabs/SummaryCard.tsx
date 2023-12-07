import React, {useState} from "react";
import {AnnotationData, AnnotationTag, Feedback, Unit} from "../../../types";
import {Card, Button} from "@material-tailwind/react";
import {annotationTagsIcons} from "../../AnnotationIcons";
interface Props {
  annotationData: AnnotationData[];
}
const chevronIconDown = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);
const chevronIconUp = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);
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

export function currentFeedbackSummary(feedback: Feedback) {
  return (
    <div className="border rounded-lg">
      <div className="flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left">
        {feedback.unitCode}
      </div>
      <div className="border-2 border-solid">{feedback.assessmentName}</div>
      {/* <SummaryCard annotationData={feedback.highlights} /> */}
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
