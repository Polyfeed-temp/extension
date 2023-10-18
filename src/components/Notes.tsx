import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {useState} from "react";

export function Notes({text}: {text: string}) {
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
          setValue(content);
        }}
      />
    </div>
  );
}
