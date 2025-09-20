import React, { useState, useEffect, useRef } from "react";
import { explainFuther } from "../../services/openai.service";
import { toast } from "react-toastify";

import Highlighter from "web-highlighter";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../../store/HighlightContext";
import { Button } from "@material-tailwind/react";
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
                          If a ChatGPT response doesn't meet your expectations,
                          please ask again for improvement.
                        </p>
                        <GPTQueryTextBox
                          submitFunc={(text) => fetchExplanationData(text, 2)}
                          attemptTime={2}
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
  attemptTime = 1,
}: {
  prevHighlight?: string;
  submitFunc: (text: string) => void;
  attemptTime?: number;
}) {
  const [highlightedText, setHighlightedText] = useState(prevHighlight || "");
  const highlighterDispatch = useHighlighterDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Adjust height up to max height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to recalculate
      const maxHeight = 160; // 40 * 4 = 160px (max-h-40 in Tailwind)
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = newHeight + "px"; // Set height based on scroll height but respect max
    }
  }, [highlightedText]);

  useEffect(() => {
    // Listen for text selections from anywhere on the page
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        console.log('🎯 ExplainFutherInput: Text selected:', selectedText.substring(0, 50) + '...');

        // Check if the selection is from within a PDF viewer or any relevant content
        const range = selection?.getRangeAt(0);
        const container = range?.commonAncestorContainer;

        // Get path information for debugging
        const getElementInfo = (node: Node) => {
          let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
          const path = [];
          while (current && current !== document.body && path.length < 5) {
            path.push({
              tagName: current.tagName,
              className: current.className,
              id: current.id
            });
            current = current.parentElement;
          }
          return path;
        };

        const elementPath = container ? getElementInfo(container) : [];
        console.log('🎯 ExplainFutherInput: Selection path:', elementPath);

        // Check if the selection is from within a PDF viewer or relevant content area
        let isRelevantSelection = false;
        let element = container?.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;

        while (element && element !== document.body) {
          const className = element.className || '';
          const tagName = element.tagName || '';

          // Look for PDF viewer specific classes, content areas, or any text that looks like feedback content
          if (className.includes('rpv-') ||
              className.includes('pdf') ||
              className.includes('viewer') ||
              className.includes('content') ||
              tagName === 'CANVAS' ||
              (element as HTMLElement).style?.borderRadius === '20px') {
            isRelevantSelection = true;
            console.log('🎯 ExplainFutherInput: Found relevant element:', {
              tagName: element.tagName,
              className: element.className
            });
            break;
          }
          element = element.parentElement;
        }

        // For now, capture all text selections to make it work, then we can refine
        console.log('🎯 ExplainFutherInput: Is relevant selection:', isRelevantSelection);

        // Capture text regardless for testing - we can refine this later
        setHighlightedText((prev) => {
          const existingText = prev.trim();
          if (existingText && !existingText.includes(selectedText)) {
            console.log('🎯 ExplainFutherInput: Appending text to existing');
            return existingText + "\n" + selectedText;
          } else if (!existingText) {
            console.log('🎯 ExplainFutherInput: Setting new text');
            return selectedText;
          }
          console.log('🎯 ExplainFutherInput: Text already exists, not adding');
          return prev;
        });

        // Clear the selection after capturing
        setTimeout(() => {
          selection?.removeAllRanges();
        }, 100);
      }
    };

    // Add event listener for selection changes
    document.addEventListener("selectionchange", handleSelectionChange);

    // Also set up the original highlighter for compatibility
    const highlighter = new Highlighter({
      exceptSelectors: ["#react-root"],
    });

    highlighter.on("selection:create", ({ sources }) => {
      setHighlightedText((prev) => {
        const existingText = prev.trim();
        const newText = sources[0].text.trim();
        if (existingText && !existingText.includes(newText)) {
          return existingText + "\n" + newText;
        } else if (!existingText) {
          return newText;
        }
        return prev;
      });
      highlighter.remove(sources[0].id);
    });

    highlighter.run();
    highlighterDispatch({ type: "SET_IS_HIGHLIGHTING", payload: false });

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      highlighter.stop();
    };
  }, []);

  return (
    <>
      {attemptTime === 1 && (
        <div className="p-4">
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">
              <strong>How to use:</strong> Select any text from the page (PDF or webpage content), and it will automatically appear in the text box below. You can also type directly.
            </p>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              💡 Tip: You can select multiple pieces of text - they will be added on new lines
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="w-full p-3 border-2 rounded-lg border-gray-400 focus:border-black focus:outline-none resize-none max-h-40 overflow-y-auto"
            onChange={(e) => setHighlightedText(e.target.value)}
            value={highlightedText}
            placeholder="Select text from anywhere on the page or type your question here (minimum 50 characters)"
            rows={4}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${highlightedText.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
              {highlightedText.length}/50 characters minimum
            </span>
            {highlightedText.length > 0 && (
              <button
                onClick={() => setHighlightedText("")}
                className="text-xs text-gray-500 hover:text-red-500 underline"
              >
                Clear text
              </button>
            )}
          </div>
        </div>
      )}
      <div className="px-4 pb-4">
        <Button
          disabled={attemptTime === 1 ? highlightedText.length < 50 : false}
          fullWidth
          className={`font-medium py-3 rounded-lg transition-all duration-200 ${
            attemptTime === 1
              ? highlightedText.length < 50
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl"
              : "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl"
          }`}
          onClick={() => submitFunc(highlightedText)}
        >
          Ask ChatGPT{attemptTime === 2 && " AGAIN"}
        </Button>
      </div>
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
      {!attemptTime && (
        <>
          <p className="underline">Submitted Highlights:</p>
          <p className="text-left text-gray-700 italic">{query}</p>
        </>
      )}
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

    await toast.promise(status, {
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
