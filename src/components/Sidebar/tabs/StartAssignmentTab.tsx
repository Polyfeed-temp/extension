import React, {useState, useEffect} from "react";
import {Button} from "@material-tailwind/react";
import SearchableSelect from "../SearchableSelect";
import {getAllUnits} from "../../../services/unit.service";
import {Assessment, Unit, Feedback} from "../../../types";
import {useHighlighterDispatch} from "../../../store/HighlightContext";
import {useUserState} from "../../../store/UserContext";
import AnnotationService from "../../../services/annotation.service";
import {toast} from "react-toastify";
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
            min="0"
            type="number"
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
        </div>
      )}

      {selectedUnit && selectedAssignment && (
        <div className="relative mt-2 rounded-md shadow-sm">
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
