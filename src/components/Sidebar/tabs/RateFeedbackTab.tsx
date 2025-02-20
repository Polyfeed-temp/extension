import { emoticons, emoticonsInversed } from "../../AnnotationIcons";
import { toast } from "react-toastify";
import React, { useRef, useEffect, useState } from "react";
import AnnotationService from "../../../services/annotation.service";
import { FeedbackRating } from "../../../types";
import {
  addLogs,
  eventType,
  eventSource,
} from "../../../services/logs.serivce";

export const RateFeedbackTab = ({
  feedbackId,
  rating,
}: {
  feedbackId: number;
  rating: FeedbackRating;
}) => {
  console.log("rating", rating);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [feedbackPerformance, setFeedbackPerformance] = useState(
    rating.performance
  );
  const [feedbackClarity, setFeedbackClarity] = useState(rating.clarity);
  const [feedbackPersonalised, setFeedbackPersonalised] = useState(
    rating.personalise
  );
  const [feedbackEvaluativeJudgement, setFeedbackEvaluativeJudgement] =
    useState(rating.evaluativeJudgement);
  const [feedbackUsability, setFeedbackUsability] = useState(rating.usability);
  const [feedbackEmotion, setFeedbackEmotion] = useState(rating.emotion);
  const [feedbackQuestion, setFeedbackQuestion] = useState(
    rating.furtherQuestions || ""
  );
  const [feedbackComment, setFeedbackComment] = useState(rating.comment || "");

  const rateFeedbackStatements = [
    "matches my belief of my own performance",
    "is easy to understand",
    "related to my work",
    "helps me to critically evaluate my work",
    "can be used in my current and future studies",
    "makes me feel positive",
  ];
  const rateFeedbackStatmentsFunction = [
    setFeedbackPerformance,
    setFeedbackClarity,
    setFeedbackPersonalised,
    setFeedbackEvaluativeJudgement,
    setFeedbackUsability,
    setFeedbackEmotion,
  ];
  const ratingArray = [
    feedbackPerformance,
    feedbackClarity,
    feedbackPersonalised,
    feedbackEvaluativeJudgement,
    feedbackUsability,
    feedbackEmotion,
  ];
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
        return 1;
    }
  };
  const handleEmoticonClick = (ratingIndex: number, color: string) => {
    const rating = colorToRating(color);
    rateFeedbackStatmentsFunction[ratingIndex](rating);
  };
  const toggleDropdown = () => {
    addLogs({
      eventType: eventType[0],
      content: !isDropdownOpen ? "Rate this feedback" : "This Feedback ",
      eventSource: eventSource[4],
    });
    setIsDropdownOpen(!isDropdownOpen);
  };
  const chevronIconDown = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
  const chevronIconUp = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 15.75l7.5-7.5 7.5 7.5"
      />
    </svg>
  );
  const handleSubmit = () => {
    if (
      feedbackPerformance &&
      feedbackClarity &&
      feedbackPersonalised &&
      feedbackEvaluativeJudgement &&
      feedbackUsability &&
      feedbackEmotion
    ) {
      const feedback = {
        performance: feedbackPerformance,
        clarity: feedbackClarity,
        personalise: feedbackPersonalised,
        evaluativeJudgement: feedbackEvaluativeJudgement,
        usability: feedbackUsability,
        emotion: feedbackEmotion,
        furtherQuestions: feedbackQuestion,
        comment: feedbackComment,
      };
      const submission = new AnnotationService().rateFeedback(
        feedbackId,
        feedback
      );

      addLogs({
        eventType: eventType[2],
        content: JSON.stringify({
          ...feedback,
          feedbackId,
        }),
        eventSource: eventSource[3],
      });

      toast.promise(submission, {
        pending: "Submitting Rating...",
        success: "Submitted Rating!",
        error: "Submission failed, please try again.",
      });
    }
  };

  const firstRender = useRef(true);
  useEffect(() => {
    //do not submitt after first render
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    handleSubmit();
  }, [
    feedbackClarity,
    feedbackPersonalised,
    feedbackEvaluativeJudgement,
    feedbackUsability,
    feedbackEmotion,
  ]);

  return (
    <div className="border rounded-xl shadow-sm my-6">
      <button
        onClick={toggleDropdown}
        className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-xl p-4 w-full text-left rounded-t-xl"
      >
        <span>{!isDropdownOpen ? "Rate this feedback" : "This Feedback"}</span>
        {isDropdownOpen ? chevronIconUp : chevronIconDown}
      </button>
      {isDropdownOpen && (
        <div className="p-6">
          {rateFeedbackStatements.map((feedback, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="flex-1">{feedback}</span>
              <div className="flex items-center">
                {Object.entries(emoticons).map(([color, icon]) => (
                  <button
                    key={color}
                    className="ml-2"
                    onClick={() => handleEmoticonClick(index, color)}
                  >
                    <img
                      src={
                        ratingArray[index] === colorToRating(color) ||
                        ratingArray[index] === 0
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
          ))}

          <div className="space-y-6 pt-6 border-t mt-2">
            <div>
              <p className="mb-3 font-medium text-gray-700">
                Ask further questions?
              </p>
              <textarea
                placeholder="Type your question/s here"
                className="w-full p-3 border rounded-lg min-h-[80px] resize-y focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:outline-none transition-all"
                value={feedbackQuestion}
                onChange={(e) => setFeedbackQuestion(e.target.value)}
              />
            </div>

            <div>
              <p className="mb-3 font-medium text-gray-700">
                Share further comments?
              </p>
              <textarea
                placeholder="Type your comment here"
                className="w-full p-3 border rounded-lg min-h-[80px] resize-y focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:outline-none transition-all"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4"
            >
              SAVE
            </button>

            <p className="text-sm text-gray-500 italic text-center mt-4">
              Disclaimer: These ratings and comments may be used by teachers to
              improve their feedback in future
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
