import {useState} from "react";
import {Button} from "@material-tailwind/react";
export function Notes({
  setNote,
  notes,
}: {
  setNote: (input: string) => void;
  notes: string;
}) {
  console.log(notes);
  const [value, setValue] = useState(notes);

  return (
    <div className="flex flex-col space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your notes here"
      ></textarea>
      <hr className="my-4" />
      <Button fullWidth className="bg-black" onClick={() => setNote(value)}>
        {" "}
        Save note{" "}
      </Button>
    </div>
  );
}
