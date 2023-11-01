import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {useState} from "react";
import {AnnotationNotes} from "../../types";

export function Notes({
  text,
  setNote,
}: {
  text: string;
  setNote: (note: AnnotationNotes) => void;
}) {
  const [value, setValue] = useState("");
  const truncatedText =
    text.length > 100 ? text.substring(0, 100) + "..." : text;

  return (
    <div>
      <p>{truncatedText}</p>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          console.log(content);
          setValue(content);
        }}
      />
      <button onClick={() => setNote({content: value})}> Save </button>
    </div>
  );
}
