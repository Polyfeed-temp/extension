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
  const [mark, setMark] = useState<number | null>(null);
  // const [marker, setMarker] = useState<string | null>("");

  const [performance, setPerformance] = useState("");
  const [feedbackUsefulness, setFeedbackUsefulness] = useState("");

  // Options for performance dropdown
  const performanceOptions = [
    {
      value: "better_than_thought",
      label: "No, my performance was better than I thought",
    },
    { value: "as_expected", label: "Yes, it's about what I thought" },
    {
      value: "worse_than_thought",
      label: "No, my performance was worse than I thought",
    },
  ];

  // Options for feedback usefulness dropdown
  const feedbackUsefulnessOptions = [
    { value: "very_useful", label: "Very Useful" },
    { value: "moderately_useful", label: "Moderately Useful" },
    { value: "slightly_useful", label: "Slightly Useful" },
    { value: "not_useful_at_all", label: "Not Useful At All" },
  ];

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

  const handleMarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setMark(isNaN(value) ? null : value);
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-semibold">Select assessment feedback</h1>
      <div className="relative mt-2 rounded-md shadow-sm">
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
        ></SearchableSelect>
      </div>

      {selectedUnit && (
        <div className="relative mt-2 rounded-md shadow-sm">
          {selectedUnit.assessments ? (
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
          ) : (
            <div className="flex justify-center items-center h-10">
              <span className="font-medium">No assignments found</span>
            </div>
          )}
        </div>
      )}

      {selectedUnit && selectedAssignment && (
        <div className="relative mt-2 rounded-md shadow-sm">
          <input
            type="number"
            min="0"
            max={100}
            id="marks"
            name="marks"
            value={mark || ""}
            onChange={handleMarksChange}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Enter marks"
            required
          />
          {/* <input
            id="markers"
            name="markers"
            value={marker || ""}
            onChange={handleMarkerChange}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Marker"
          /> */}

          <div
            className="flex flex-col space-y-4"
            style={{
              marginTop: 20,
            }}
          >
            {/* Performance Evaluation */}
            <div>
              <div className="mb-2">
                <label
                  htmlFor="performance"
                  className="block text-sm font-medium text-gray-700 text-left mt-m"
                >
                  How did you assess your performance?
                </label>
              </div>
              <select
                id="performance"
                className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
              >
                <option key={"default-performance"} disabled value={""}>
                  Please Select
                </option>
                {performanceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback Usefulness */}
            <div>
              <div className="mb-2">
                <label
                  htmlFor="feedback_usefulness"
                  className="block text-sm font-medium text-gray-700 text-left mt-m"
                >
                  Was the feedback useful to your learning?
                </label>
              </div>
              <select
                id="feedback_usefulness"
                className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={feedbackUsefulness}
                onChange={(e) => setFeedbackUsefulness(e.target.value)}
              >
                <option key={"default-feedbackUsefulness"} disabled value={""}>
                  Please Select
                </option>
                {feedbackUsefulnessOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedUnit && selectedAssignment && (
        <div className="relative mt-5 rounded-md shadow-sm">
          <Button
            fullWidth
            className="bg-black"
            onClick={async () => {
              const feedback: Feedback = {
                id: 0, //temp id
                assessmentId: selectedAssignment.id,
                assessmentName: selectedAssignment.assessmentName,
                unitCode: selectedUnit.unitCode,
                mark: mark || 0,
                studentEmail: user?.email || "",
                performance: performance,
                feedbackUseful: feedbackUsefulness,
                // marker: marker || "",
                url: window.location.href,
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
            Start highlighting
          </Button>
        </div>
      )}

      <div className="mt-10 text-sm">
        <h5>
          Start highlighting the feedback you received to create your own
          learning plan.
        </h5>
      </div>
    </div>
  );
}
