import {useState} from "react";

export function Notes({
  setNote,
  notes,
}: {
  setNote: (input: string) => void;
  notes: string;
}) {
  const [value, setValue] = useState(notes);

  return (
    <div className="flex flex-col space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        defaultValue={"Enter your notes here"}
      >
        Enter your notes here
      </textarea>
      <hr className="my-4" />
      <button onClick={() => setNote(value)}> Save note </button>
    </div>
  );
}
