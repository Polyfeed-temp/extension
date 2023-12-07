import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Ensure this is imported only once
import {useState} from "react";
import {AnnotationNotes} from "../../types";
import {Button} from "@material-tailwind/react";

function viewNotes(notes: AnnotationNotes) {
  return (
    <div className="flex flex-col space-y-4">
      <ReactQuill
        theme="snow"
        value={notes.content}
        readOnly={true}
        modules={{toolbar: false}}
      />
    </div>
  );
}

export function Notes({setNote}: {setNote: (input: string) => void}) {
  const [value, setValue] = useState("");
  const [saveNote, setSaveNote] = useState(false);

  return (
    <div className="flex flex-col space-y-4">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          setValue(content);
        }}
      />
      <hr className="my-4" />
      <button onClick={() => setNote(value)}> Save note </button>
      {/* {saveNote ? viewNotes({content: value}) : null} */}
    </div>
  );
}
