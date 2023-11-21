import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Ensure this is imported only once
import {useState} from "react";
import {AnnotationNotes} from "../../types";
import {Button} from "@material-tailwind/react";

export function Notes({
  text,
  setNote,
}: {
  text: string;
  setNote: (note: AnnotationNotes) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col space-y-4">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          console.log(content);
          setValue(content);
        }}
      />
      <hr className="my-4" />
      <Button
        fullWidth
        className="bg-black"
        onClick={() => setNote({content: value})}
      >
        Save
      </Button>
    </div>
  );
}
