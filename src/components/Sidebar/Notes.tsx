import {useState} from "react";
import {Button} from "@material-tailwind/react";
export function Notes({
  ref,
  setNote,
  notes,
  cancelFunc,
}: {
  setNote: (input: string) => void;
  notes: string;
  cancelFunc: () => void;
  ref?: any;
}) {
  console.log(notes);
  const [value, setValue] = useState(notes);

  return (
    <div className="flex flex-col space-y-4">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your notes here"
      ></textarea>
      <hr className="my-4" />
      <div className="flex justify-between">
        <Button className="bg-black my-4" onClick={() => setNote(value)}>
          {" "}
          Save note{" "}
        </Button>

        <Button className="bg-black my-4" onClick={cancelFunc}>
          {" "}
          Cancel
        </Button>
      </div>
    </div>
  );
}
