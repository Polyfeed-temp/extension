import {Unit} from "../../../types";
import {useState} from "react";
import {Button} from "@material-tailwind/react";

export function SelectUnitAssignmentTab({
  units,
  switchTabFunc,
  setUnitCode,
  setAssignment,
}: {
  units: Unit[];
  switchTabFunc: () => void;
  setUnitCode: (unitCode: string) => void;
  setAssignment: (assignment: string) => void;
}) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");

  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = units.find((unit) => unit.unitCode === event.target.value);
    selected ? setSelectedUnit(selected) : null;
  };
  const handleAssignmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedAssignment(event.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative mt-2 rounded-md shadow-sm">
        <select
          id="unit"
          name="unit"
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={handleUnitChange}
        >
          <option value="">Select a unit</option>
          {units.map((unit, index) => (
            <option key={index} value={unit.unitCode}>
              {unit.unitCode}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment Dropdown - Conditional Rendering */}
      {selectedUnit && (
        <div className="relative mt-2 rounded-md shadow-sm">
          <select
            id="assignment"
            name="assignment"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleAssignmentChange}
          >
            <option value="">Select an assignment</option>
            {selectedUnit.assignments.map((assignment, index) => (
              <option key={index} value={assignment.assignmentName}>
                {assignment.assignmentName}
              </option>
            ))}
          </select>
        </div>
      )}

      {
        // Marks Input - Conditional Rendering
        selectedAssignment && (
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              min="0"
              type="number"
              id="marks"
              name="marks"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Enter marks"
            />
          </div>
        )
      }

      {
        // Save Button - Conditional Rendering
        selectedUnit && selectedAssignment && (
          <div className="relative mt-2 rounded-md shadow-sm">
            <Button
              fullWidth
              className="bg-black"
              onClick={() => {
                setUnitCode(selectedUnit.unitCode);
                setAssignment(selectedAssignment);
                switchTabFunc();
              }}
            >
              Start highlighting
            </Button>
          </div>
        )
      }

      {/* Footer */}
      <div className="mt-auto text-sm">
        <h5>
          Start highlighting the feedback you received to create your own
          learning plan.
        </h5>
      </div>
    </div>
  );
}
