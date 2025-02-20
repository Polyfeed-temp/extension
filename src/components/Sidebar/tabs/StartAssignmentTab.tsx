import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import SearchableSelect from "../SearchableSelect";
import { getAllUnits } from "../../../services/unit.service";
import { Assessment, Unit, Feedback } from "../../../types";
import { useHighlighterDispatch } from "../../../store/HighlightContext";
import { useUserState } from "../../../store/UserContext";
import AnnotationService from "../../../services/annotation.service";
import { toast } from "react-toastify";
export function SelectUnitAssignmentTab({
  switchTabFunc,
}: {
  switchTabFunc: () => void;
}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assessment | null>(null);
  const [yourMark, setYourMark] = useState<number | null>(null);
  const [totalMark, setTotalMark] = useState<number | null>(null);

  const highlightterDispatch = useHighlighterDispatch();
  const user = useUserState().user;

  useEffect(() => {
    const retriveUnitsInfo = () =>
      getAllUnits().then((res) => {
        setUnits(res);
      });

    retriveUnitsInfo();
  }, []);

  const handleAssignmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedAssignmentId = parseInt(event.target.value);
    const selectedAssignment = selectedUnit?.assessments.find(
      (assignment) => assignment.id === selectedAssignmentId
    );
    setSelectedAssignment(selectedAssignment || null);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Select Assessment Feedback
      </h1>

      <div className="space-y-4">
        {/* Unit Selection */}
        <div>
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Unit
          </label>
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
            onSelectFunction={(selectedUnit: Unit) =>
              setSelectedUnit(selectedUnit)
            }
          />
        </div>

        {/* Assignment Selection */}
        {selectedUnit && (
          <div>
            <label
              htmlFor="assignment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Assignment
            </label>
            {selectedUnit.assessments ? (
              <select
                id="assignment"
                name="assignment"
                className="block w-full rounded-md border-gray-300 shadow-sm py-2 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
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
            ) : (
              <div className="flex justify-center items-center h-10 bg-gray-50 rounded-md">
                <span className="text-gray-500">No assignments found</span>
              </div>
            )}
          </div>
        )}

        {/* Marks Input */}
        {selectedUnit && selectedAssignment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Marks
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={yourMark || ""}
                onChange={(e) =>
                  setYourMark(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Your mark"
                className="p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                style={{ width: "100%" }}
                min="0"
              />
              <span className="text-gray-700 font-medium">/</span>
              <input
                type="number"
                value={totalMark || ""}
                onChange={(e) =>
                  setTotalMark(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Total"
                className="p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                style={{ width: "100%" }}
                min="1"
              />
            </div>
          </div>
        )}

        {/* Start Button */}
        {selectedUnit && selectedAssignment && (
          <Button
            fullWidth
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition-colors duration-200"
            onClick={async () => {
              const feedback: Feedback = {
                id: 0, //temp id
                assessmentId: selectedAssignment.id,
                assessmentName: selectedAssignment.assessmentName,
                unitCode: selectedUnit.unitCode,
                mark: yourMark || 0,
                studentEmail: user?.email || "",
                url: window.location.href,
                totalMark: totalMark || 0,
              };
              try {
                const status = new AnnotationService().createFeedback(feedback);

                toast.promise(status, {
                  pending: "Saving assessment information",
                  success: "Saved",
                  error: "Error saving please try again",
                });
                const updatedFeedback = await status;
                highlightterDispatch({
                  type: "ADD_FEEDBACK",
                  payload: {
                    ...updatedFeedback,
                    assessmentName: selectedAssignment.assessmentName,
                    unitCode: selectedUnit.unitCode,
                  },
                });
                switchTabFunc();
              } catch (error) {}
            }}
          >
            Start Highlighting
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Start highlighting the feedback you received to create your own
          learning plan.
        </p>
      </div>
    </div>
  );
}
