import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@material-tailwind/react";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../store/HighlightContext";
import { AnnotationData, Feedback, Unit, Assessment } from "../types";
import {
  EditIcon,
  chevronIconDown,
  chevronIconUp,
  CancelIcon,
} from "./AnnotationIcons";
import { getAllUnits } from "../services/unit.service";
import { SummaryCard } from "./Sidebar/tabs/SummaryCard";
import SearchableSelect from "./Sidebar/SearchableSelect";
import { toast } from "react-toastify";
import AnnotationService from "../services/annotation.service";
import {
  addLogs,
  eventType,
  eventSource,
  tagName,
} from "../services/logs.serivce";
export function CurrentFeedbackSummary({ feedback }: { feedback: Feedback }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const highlightState = useHighlighterState();
  const highlighterDispatch = useHighlighterDispatch();
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    addLogs({
      eventType: eventType[0],
      tagName: "dropDownList",
      content: "",
      eventSource: eventSource[7],
    });
  };

  const [editing, setEditing] = useState(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assessment | null>(null);

  const handleAssignmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedAssignmentId = parseInt(event.target.value);
    const selectedAssignment = selectedUnit?.assessments.find(
      (assignment) => assignment.id === selectedAssignmentId
    );

    setSelectedAssignment(selectedAssignment || null);
    addLogs({
      eventType: eventType[1],
      tagName: "",
      content: "",
      eventSource: eventSource[6],
    });
  };
  useEffect(() => {
    const retriveUnitsInfo = () =>
      getAllUnits().then((res) => {
        setUnits(res);
      });

    retriveUnitsInfo();
  }, []);
  return (
    <div className="border rounded-lg">
      <div className=" flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left">
        {editing ? (
          <>
            <SearchableSelect
              options={units}
              displayFunction={(option) =>
                `${option.unitCode} - Year: ${option.year}, Semester: ${option.semester}`
              }
              filterFunction={(option, searchTerm) =>
                `${option.unitCode} ${option.year} S${option.semester}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              }
              onSelectFunction={(selectedUnit: Unit) => {
                setSelectedUnit(selectedUnit);

                addLogs({
                  eventType: eventType[1],
                  tagName: "",
                  content: "",
                  eventSource: eventSource[7],
                });
              }}
            ></SearchableSelect>
            <IconButton
              variant="text"
              ripple={true}
              title="Cancel Editing"
              onClick={() => {
                setEditing(false);
                addLogs({
                  eventType: eventType[6],
                  tagName: "",
                  content: "",
                  eventSource: eventSource[7],
                });
              }}
            >
              {CancelIcon}
            </IconButton>
          </>
        ) : (
          <>
            Highlights For {feedback.unitCode}
            <IconButton
              variant="text"
              ripple={true}
              title="Change Assessment"
              onClick={() => {
                setEditing(true);

                addLogs({
                  eventType: eventType[1],
                  tagName: "",
                  content: "",
                  eventSource: eventSource[0],
                });
              }}
            >
              {EditIcon}
            </IconButton>
          </>
        )}

        <IconButton onClick={toggleDropdown} variant="text" ripple={true}>
          {isDropdownOpen ? chevronIconUp : chevronIconDown}
        </IconButton>
      </div>

      {isDropdownOpen && (
        <>
          <div className="border-2 border-solid">
            {editing && selectedUnit ? (
              <div>
                <select
                  id="assignment"
                  name="assignment"
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={handleAssignmentChange}
                >
                  <option value="" disabled selected>
                    Select an assignment
                  </option>
                  {selectedUnit.assessments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.assessmentName}
                    </option>
                  ))}
                </select>
                {selectedAssignment && (
                  <button
                    type="button"
                    className="my-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={async () => {
                      try {
                        const status =
                          new AnnotationService().updateFeedbackAssessment(
                            feedback.id ?? 0,
                            selectedAssignment.id
                          );

                        toast.promise(status, {
                          pending: "Saving assessment information",
                          success: "Saved",
                          error: "Error saving please try again",
                        });

                        const updatedFeedback = await status;
                        highlighterDispatch({
                          type: "ADD_FEEDBACK",
                          payload: {
                            ...feedback,
                            assessmentName: selectedAssignment.assessmentName,
                            unitCode: selectedUnit.unitCode,
                            assessmentId: selectedAssignment.id,
                          },
                        });

                        addLogs({
                          eventType: eventType[2],
                          tagName: tagName[1],
                          content: JSON.stringify({
                            ...feedback,
                            assessmentName: selectedAssignment.assessmentName,
                            unitCode: selectedUnit.unitCode,
                            assessmentId: selectedAssignment.id,
                          }),
                          eventSource: eventSource[2],
                        });

                        setSelectedAssignment(null);
                        setSelectedUnit(null);

                        setEditing(false);
                      } catch (error) {}
                    }}
                  >
                    Confirm Changing Assessment
                  </button>
                )}
              </div>
            ) : (
              feedback.assessmentName
            )}
          </div>
          {feedback.highlights && (
            <SummaryCard annotationData={feedback.highlights} />
          )}
        </>
      )}
    </div>
  );
}
