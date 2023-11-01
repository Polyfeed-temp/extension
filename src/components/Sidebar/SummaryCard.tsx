import React from "react";
import {AnnotationData} from "../../types";

interface Props {
  annotationData: AnnotationData[];
}

const SummaryCard: React.FC<Props> = ({annotationData}) => {
  // const annotationTagCount:{AnnotationgTag:number} = {"strength":0}
  // Group annotationData by category
  const groupedData = annotationData.reduce((acc, curr) => {
    const category = curr.annotation.AnnotationTag;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(curr);
    return acc;
  }, {} as {[key: string]: AnnotationData[]});

  // Render the grouped data
  return (
    <div>
      {Object.entries(groupedData).map(([category, data]) => (
        <div key={category}>
          <h3>{category}</h3>
          <p>Count: {data.length}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;
