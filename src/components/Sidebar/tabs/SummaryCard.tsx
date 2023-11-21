import React from "react";
import {AnnotationData, AnnotationTag, Unit} from "../../../types";
import {Card, Typography} from "@material-tailwind/react";
import {annotationTagsIcons} from "../../AnnotationIcons";
interface Props {
  annotationData: AnnotationData[];
}

export function UnitAssignmentSummary({unit}: {unit: Unit}) {
  return (
    <div className="border rounded-lg">
      <div className="bg-gray font-bold text-xl mb-4 border border-2">
        {unit.unitCode}
      </div>
      {unit.assignments.map((assignment) =>
        assignment.feedback && assignment.feedback.annotations ? (
          <SummaryCard annotationData={assignment.feedback.annotations} />
        ) : null
      )}
    </div>
  );
}

const SummaryCard: React.FC<Props> = ({annotationData}) => {
  const annotationTagCount: {[key in AnnotationTag]: number} = {
    Strength: 0,
    Weakness: 0,
    "Action Item": 0,
    Confused: 0,
    Other: 0,
  };

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
