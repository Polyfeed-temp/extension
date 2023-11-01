import {Unit} from "../types";
export function UnitForm({units}: {units: Unit[]}) {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900">
        Select Unit
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <select
          id="unit"
          name="unit"
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {units.map((unit, index) => (
            <option key={index} value={unit.unitCode}>
              {unit.unitCode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
