import React, { useState, useEffect, useRef } from "react";
import { explainFuther } from "../../services/openai.service";
import { toast } from "react-toastify";

import Highlighter from "web-highlighter";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../../store/HighlightContext";
import { Button, rating } from "@material-tailwind/react";
import {
  emoticons,
  emoticonsInversed,
  chevronIconDown,
  chevronIconUp,
} from "../AnnotationIcons";
import AnnotationService from "../../services/annotation.service";
import { addLogs, eventSource, eventType } from "../../services/logs.serivce";

export function ExplainFutherToggle() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const highlightState: any = useHighlighterState();

  const [explanation, setExplanation] = useState(
    highlightState.feedbackInfo?.gptResponse || ""
  );

  const [explanation_2, setExplanation_2] = useState(
    highlightState.feedbackInfo?.gptResponse_2 || ""
  );

  const toggleDropdown = () => {
    addLogs({
      eventSource: eventSource[1],
      content: isDropdownOpen ? "close" : "open",
      eventType: eventType[0],
    });

    setIsDropdownOpen(!isDropdownOpen);
  };
  const [query, setQuery] = useState(
    highlightState.feedbackInfo?.gptQueryText || ""
  );

  const [query_2, setQuery_2] = useState(
    highlightState.feedbackInfo?.gptQueryText_2 || ""
  );
  const [viewOnly, setViewOnly] = useState<Boolean>(false);

  useEffect(() => {
    setExplanation(highlightState.feedbackInfo?.gptResponse || "");
    setExplanation_2(highlightState.feedbackInfo?.gptResponse_2 || "");
    setQuery(highlightState.feedbackInfo?.gptQueryText || "");
    setQuery_2(highlightState.feedbackInfo?.gptQueryText_2 || "");
    setViewOnly(
      highlightState.feedbackInfo?.gptQueryText &&
        highlightState.feedbackInfo?.gptResponse
        ? true
        : false
    );
  }, [
    highlightState.feedbackInfo?.gptQueryText,
    highlightState.feedbackInfo?.gptResponse,
    highlightState.feedbackInfo?.gptResponse_2,
    highlightState.feedbackInfo?.gptQueryText_2,
  ]);

  const fetchExplanationData = async (text: string, attemptTime = 1) => {
    const gptStatus = explainFuther(
      highlightState.feedbackInfo?.id || 0,
      text,
      attemptTime
    );
    toast.promise(gptStatus, {
      pending: "Generating explanation...",
      success: "Explanation generated!",
      error: "Failed to generate explanation",
    });
    const gptResponse = await gptStatus;

    if (attemptTime === 1) {
      setQuery(text);
      setExplanation(gptResponse);
    } else {
      setQuery_2(text);
      setExplanation_2(gptResponse);
    }

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
            <div>
              <ViewOnlyGPTResponse
                query={query}
                response={explanation}
                feedbackId={highlightState.feedbackInfo?.id || 0}
                rating={highlightState.feedbackInfo?.gptResponseRating}
              />

              {highlightState?.feedbackInfo?.gptResponseRating < 3 &&
                highlightState?.feedbackInfo?.gptResponseRating > 0 && (
                  <div className="p-5">
                    {!explanation_2 && (
                      <>
                        <p className="text-left">
                          This is your second chances to ask chat gpt for the
                          feedback
                        </p>
                        <GPTQueryTextBox
                          submitFunc={(text) => fetchExplanationData(text, 2)}
                        />
                      </>
                    )}

                    {explanation_2 && (
                      <ViewOnlyGPTResponse
                        query={query_2}
                        response={explanation_2}
                        feedbackId={highlightState.feedbackInfo?.id || 0}
                        rating={
                          highlightState.feedbackInfo?.gptResponseRating_2
                        }
                        attemptTime={2}
                      />
                    )}
                  </div>
                )}
            </div>
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

    highlighter.on("selection:create", ({ sources }) => {
      setHighlightedText((prev) => prev + "\n" + sources[0].text);
      highlighter.remove(sources[0].id);
    });
    highlighter.run();
    highlighterDispatch({ type: "SET_IS_HIGHLIGHTING", payload: false });
    return () => {
      highlighter.stop();
    };
  }, []);

  return (
    <>
      <textarea
        ref={textareaRef}
        className="w-full p-2 border rounded-[5px] border-black"
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
  attemptTime,
}: {
  query: string;
  response: string;
  rating?: number;
  feedbackId: number;
  attemptTime?: number;
}) {
  const formatted = response.split("\n").map((line, index) => (
    <li key={index} className="bg-gray-100 p-4 text-left">
      {line}
    </li>
  ));
  return (
    <div className="mt-2">
      <p className="underline">Submitted Highlights:</p>
      <p className="text-left text-gray-700 italic">{query}</p>

      <div className="border-2 bg-gray-100 p-4 text-left">
        <p className="font-bold">
          {"Explanation from Chat GPT"} {attemptTime && " (Second time)"}
        </p>

        <p className="bg-gray-100 p-4 text-left">{formatted}</p>
      </div>

      <RateGPTResponse
        feedbackId={feedbackId}
        rating={rating}
        attemptTime={attemptTime || 1}
      />
    </div>
  );
}

function RateGPTResponse({
  feedbackId,
  rating,
  attemptTime,
}: {
  feedbackId: number;
  rating?: number;
  attemptTime?: number;
}) {
  const [gptRating, setGptRating] = useState(rating || 0);
  const annotationService = new AnnotationService();
  const highlighterDispatch = useHighlighterDispatch();

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
  const handleEmoticonClick = async (color: string) => {
    setGptRating(colorToRating(color));

    const status = annotationService.rateGptResponse(
      feedbackId,
      colorToRating(color),
      attemptTime
    );

    addLogs({
      eventSource: eventSource[1],
      content: JSON.stringify({ feedbackId, rate: colorToRating(color) }),
      eventType: eventType[0],
    });

    toast.promise(status, {
      pending: "Saving rating...",
      success: "Rating saved!",
      error: "Failed to save rating",
    });

    // update the feedback
    const feedback = await annotationService.getCurrentPageFeedback();
    highlighterDispatch({ type: "INITIALIZE", payload: feedback });
  };

  const highlightState: any = useHighlighterState();

  return (
    <div className="flex flex-col item-center text-left border-4 bg-gray-400 p-2">
      <p className="ml-2"> How do you feel about the explanation?</p>
      <div className="flex flex-row mt-5">
        {Object.entries(emoticons).map(([color, icon]) => (
          <button
            disabled={
              attemptTime === 1
                ? highlightState?.feedbackInfo?.gptResponseRating > 0
                : highlightState?.feedbackInfo?.gptResponseRating_2 > 0
            }
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
              style={{ width: 40, height: 40 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
