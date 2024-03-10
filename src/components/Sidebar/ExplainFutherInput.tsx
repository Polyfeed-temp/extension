import React, {useState, useEffect, useRef} from "react";
import {explainFuther} from "../../services/openai.service";
import {toast} from "react-toastify";

import Highlighter from "web-highlighter";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../../store/HighlightContext";
import {Button, rating} from "@material-tailwind/react";
import {
  emoticons,
  emoticonsInversed,
  chevronIconDown,
  chevronIconUp,
} from "../AnnotationIcons";
import AnnotationService from "../../services/annotation.service";

export function ExplainFutherToggle() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const highlightState = useHighlighterState();

  const [explanation, setExplanation] = useState(
    highlightState.feedbackInfo?.gptResponse || ""
  );

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const [query, setQuery] = useState(
    highlightState.feedbackInfo?.gptQueryText || ""
  );
  const [viewOnly, setViewOnly] = useState<Boolean>(false);
  useEffect(() => {
    setExplanation(highlightState.feedbackInfo?.gptResponse || "");
    setQuery(highlightState.feedbackInfo?.gptQueryText || "");
    setViewOnly(
      highlightState.feedbackInfo?.gptQueryText &&
        highlightState.feedbackInfo?.gptResponse
        ? true
        : false
    );
  }, [
    highlightState.feedbackInfo?.gptQueryText,
    highlightState.feedbackInfo?.gptResponse,
  ]);
  const fetchExplanationData = async (text: string) => {
    const gptStatus = explainFuther(highlightState.feedbackInfo?.id || 0, text);
    toast.promise(gptStatus, {
      pending: "Generating explanation...",
      success: "Explanation generated!",
      error: "Failed to generate explanation",
    });
    const gptResponse = await gptStatus;
    setQuery(text);
    setExplanation(gptResponse);

    setViewOnly(true);
  };

  return (
    <>
      <div className="border rounded-lg">
        <button
          onClick={toggleDropdown}
          className=" flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left hover:bg-gray-300 transition duration-300"
        >
          Explanation from Chat GPT (Only once per feedback)
          {isDropdownOpen ? chevronIconUp : chevronIconDown}
        </button>
        {isDropdownOpen &&
          (viewOnly ? (
            <ViewOnlyGPTResponse
              query={query}
              response={explanation}
              feedbackId={highlightState.feedbackInfo?.id || 0}
              rating={highlightState.feedbackInfo?.gptResponseRating}
            />
          ) : (
            <GPTQueryTextBox submitFunc={fetchExplanationData} />
          ))}
      </div>
    </>
  );
}

function GPTQueryTextBox({
  prevHighlight,
  submitFunc,
}: {
  prevHighlight?: string;
  submitFunc: (text: string) => void;
}) {
  const [highlightedText, setHighlightedText] = useState(prevHighlight || "");
  const highlighterDispatch = useHighlighterDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Adjust height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to recalculate
      textarea.style.height = textarea.scrollHeight + "px"; // Set height based on scroll height
    }
  }, [highlightedText]);

  useEffect(() => {
    const highlighter = new Highlighter({
      exceptSelectors: ["#react-root"],
    });

    highlighter.on("selection:create", ({sources}) => {
      setHighlightedText((prev) => prev + "\n" + sources[0].text);
      highlighter.remove(sources[0].id);
    });
    highlighter.run();
    highlighterDispatch({type: "SET_IS_HIGHLIGHTING", payload: false});
    return () => {
      highlighter.stop();
    };
  }, []);

  return (
    <>
      <textarea
        ref={textareaRef}
        className="w-full"
        onChange={(e) => setHighlightedText(e.target.value)}
        value={highlightedText}
        placeholder="Highlight the feedback and click on ask chat gpt please enter at least 50 characters"
      ></textarea>
      {highlightedText.length > 50 ? (
        <Button
          fullWidth
          className="bg-black"
          onClick={() => submitFunc(highlightedText)}
        >
          Ask Chat GPT
        </Button>
      ) : null}
    </>
  );
}

function ViewOnlyGPTResponse({
  query,
  response,
  feedbackId,
  rating,
}: {
  query: string;
  response: string;
  rating?: number;
  feedbackId: number;
}) {
  const formatted = response.split("\n").map((line, index) => (
    <li key={index} className="bg-gray-100 p-4 text-left">
      {line}
    </li>
  ));
  return (
    <div>
      <p className="text-left text-gray-700 italic">{query}</p>

      <div className="border-2 bg-gray-100 p-4 text-left">
        <p className="font-bold">{"Explanation from Chat GPT"}</p>

        <p className="bg-gray-100 p-4 text-left">{formatted}</p>
      </div>

      <RateGPTResponse feedbackId={feedbackId} rating={rating} />
    </div>
  );
}

function RateGPTResponse({
  feedbackId,
  rating,
}: {
  feedbackId: number;
  rating?: number;
}) {
  const [gptRating, setGptRating] = useState(rating || 0);
  const colorToRating = (color: string) => {
    switch (color) {
      case "red":
        return 1;
      case "orange":
        return 2;
      case "yellow":
        return 3;
      case "green":
        return 4;
      default:
        return 10;
    }
  };
  const handleEmoticonClick = (color: string) => {
    setGptRating(colorToRating(color));
    const status = new AnnotationService().rateGptResponse(
      feedbackId,
      colorToRating(color)
    );
    toast.promise(status, {
      pending: "Saving rating...",
      success: "Rating saved!",
      error: "Failed to save rating",
    });
  };

  return (
    <div className="flex item-center text-left border-4 bg-gray-400">
      How do you feel about the explanation?
      {Object.entries(emoticons).map(([color, icon]) => (
        <button
          key={color}
          className="ml-2"
          onClick={() => handleEmoticonClick(color)}
        >
          <img
            src={
              gptRating == colorToRating(color) || gptRating == 0
                ? icon
                : emoticonsInversed[color]
            }
            alt={color}
            style={{width: 40, height: 40}}
          />
        </button>
      ))}
    </div>
  );
}
