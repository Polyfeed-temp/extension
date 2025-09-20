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
  const [markError, setMarkError] = useState<string>("");

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
    // Reset marks when changing assignment
    setYourMark(null);
    setTotalMark(null);
    setMarkError("");
  };

  // Check if form is complete
  const isFormComplete = selectedUnit && selectedAssignment && yourMark !== null && totalMark !== null && !markError;

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header with progress indicator */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Assessment</h1>
        <div className="flex items-center text-sm text-gray-600">
          <div className={`flex items-center ${selectedUnit ? 'text-black' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${selectedUnit ? 'border-black bg-black' : 'border-gray-400'}`}>
              {selectedUnit && <span className="text-white text-xs">✓</span>}
            </span>
            <span>Unit</span>
          </div>
          <span className="mx-2 text-gray-400">→</span>
          <div className={`flex items-center ${selectedAssignment ? 'text-black' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${selectedAssignment ? 'border-black bg-black' : 'border-gray-400'}`}>
              {selectedAssignment && <span className="text-white text-xs">✓</span>}
            </span>
            <span>Assignment</span>
          </div>
          <span className="mx-2 text-gray-400">→</span>
          <div className={`flex items-center ${isFormComplete ? 'text-black' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${isFormComplete ? 'border-black bg-black' : 'border-gray-400'}`}>
              {isFormComplete && <span className="text-white text-xs">✓</span>}
            </span>
            <span>Marks</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* Unit Selection */}
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <div className="mb-3">
            <label
              htmlFor="unit"
              className="block text-sm font-semibold text-gray-900 mb-1"
            >
              Select Unit <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">Choose the unit you're currently studying</p>
          </div>
          <SearchableSelect
            options={units}
            selectedValue={selectedUnit}
            placeholder="Choose a unit..."
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
              // Reset assignment and marks when changing unit
              setSelectedAssignment(null);
              setYourMark(null);
              setTotalMark(null);
              setMarkError("");
            }}
          />
        </div>

        {/* Assignment Selection */}
        {selectedUnit && (
          <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
            <div className="mb-3">
              <label
                htmlFor="assignment"
                className="block text-sm font-semibold text-gray-900 mb-1"
              >
                Select Assignment <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Pick the assignment you want to review</p>
            </div>
            {selectedUnit.assessments && selectedUnit.assessments.length > 0 ? (
              <select
                id="assignment"
                name="assignment"
                className="block w-full rounded-md border border-gray-400 shadow-sm py-2.5 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-600 text-sm bg-white cursor-pointer"
                onChange={handleAssignmentChange}
                value={selectedAssignment?.id || ""}
              >
                <option value="">
                  — Choose an assignment —
                </option>
                {selectedUnit.assessments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.assessmentName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-col justify-center items-center py-4 bg-gray-50 rounded-md">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="text-gray-500 text-sm">No assignments available</span>
                <span className="text-gray-400 text-xs mt-1">Assignments will appear here when added</span>
              </div>
            )}
          </div>
        )}

        {/* Marks Input */}
        {selectedUnit && selectedAssignment && (
          <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Enter Marks <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Record your assessment score</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={yourMark || ""}
                onChange={(e) => {
                  const newMark = e.target.value ? Number(e.target.value) : null;
                  setYourMark(newMark);
                  // Validate marks
                  if (newMark !== null && totalMark !== null) {
                    if (newMark > totalMark) {
                      setMarkError("Your mark cannot exceed the total mark");
                    } else if (newMark < 0) {
                      setMarkError("Your mark cannot be negative");
                    } else {
                      setMarkError("");
                    }
                  } else if (newMark !== null && newMark < 0) {
                    setMarkError("Your mark cannot be negative");
                  } else {
                    setMarkError("");
                  }
                }}
                placeholder="Your mark"
                className={`p-2 border rounded-md text-center focus:ring-2 focus:ring-gray-500 focus:border-gray-600 text-black bg-white ${
                  markError ? "border-red-500" : "border-gray-400"
                }`}
                style={{ width: "100%" }}
                min="0"
              />
              <span className="text-gray-700 font-medium">/</span>
              <input
                type="number"
                value={totalMark || ""}
                onChange={(e) => {
                  const newTotal = e.target.value ? Number(e.target.value) : null;
                  setTotalMark(newTotal);
                  // Validate marks
                  if (yourMark !== null && newTotal !== null) {
                    if (yourMark > newTotal) {
                      setMarkError("Your mark cannot exceed the total mark");
                    } else if (newTotal <= 0) {
                      setMarkError("Total mark must be greater than 0");
                    } else {
                      setMarkError("");
                    }
                  } else if (newTotal !== null && newTotal <= 0) {
                    setMarkError("Total mark must be greater than 0");
                  } else {
                    setMarkError("");
                  }
                }}
                placeholder="Total"
                className={`p-2 border rounded-md text-center focus:ring-2 focus:ring-gray-500 focus:border-gray-600 text-black bg-white ${
                  markError ? "border-red-500" : "border-gray-400"
                }`}
                style={{ width: "100%" }}
                min="1"
              />
            </div>
            {markError && (
              <p className="mt-1 text-sm text-red-600">{markError}</p>
            )}
          </div>
        )}

        {/* Start Button - Show disabled state when incomplete */}
        {selectedUnit && selectedAssignment && (
          <Button
            fullWidth
            disabled={!!markError || yourMark === null || totalMark === null}
            className={`font-medium py-3 rounded-md transition-all duration-200 ${
              !markError && yourMark !== null && totalMark !== null
                ? "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={async () => {
              if (markError || yourMark === null || totalMark === null) return;
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
            {!markError && yourMark !== null && totalMark !== null ? (
              <>Start Highlighting →</>
            ) : (
              "Complete All Fields to Continue"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
