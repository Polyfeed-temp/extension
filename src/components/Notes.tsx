import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {useState} from "react";

export function Notes({text}: {text: string}) {
  const [value, setValue] = useState("");
  return (
    <div>
      <p>{text}</p>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          setValue(content);
        }}
      />
    </div>
  );
}
