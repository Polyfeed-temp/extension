import React, {useState, useEffect} from "react";
import OpenAIService from "../../services/openai.service";
import {toast} from "react-toastify";
// import {chevronIconDown, chevronIconUp} from "../../icons";
import {useHighlighterState} from "../../store/HighlightContext";
import {Button} from "@material-tailwind/react";
export function ExplainFutherToggle() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [value, setValue] = useState("");
  const [explanation, setExplanation] = useState("");
  const highlightState = useHighlighterState();
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  useEffect(() => {
    if (highlightState.editing?.sidebarAction === "Explain Further") {
      setIsDropdownOpen(true);
      setValue(highlightState.editing?.annotation.text || "");
      if (highlightState.editing?.annotation.id) {
        highlightState.highlighterLib?.remove(
          highlightState.editing.annotation.id
        );
      }
    }
  }, [highlightState.editing]);

  const fetchExplanationData = async () => {
    const text = value;
    if (value.length === 0) {
      return;
    }
    const gptStatus = new OpenAIService().explainFuther(text);
    toast.promise(gptStatus, {
      pending: "Generating explanation...",
      success: "Explanation generated!",
      error: "Failed to generate explanation",
    });
    const gptResponse = await gptStatus;
    console.log("gptResponse", gptResponse);

    setExplanation(gptResponse);
  };
  return (
    <div className="border rounded-lg">
      <button
        onClick={toggleDropdown}
        className=" flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left"
      >
        Ask Chat GPT
        {/* {isDropdownOpen ? chevronIconUp : chevronIconDown} */}
      </button>

      {isDropdownOpen ? (
        <div>
          {explanation?.length > 0 ? (
            <div className="border-2 bg-gray-100 p-4 text-left">
              <p>{"Explanation from Chat GPT"}</p>
              {explanation}
            </div>
          ) : null}
          <textarea
            className="w-full"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            placeholder="Enter your text here"
          ></textarea>
          {value.length > 0 ? (
            <Button
              fullWidth
              className="bg-black"
              onClick={() => {
                fetchExplanationData();
                console.log(value);
              }}
            >
              Ask ChatGpt to explain further
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
