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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [feedbackClarity, setFeedbackClarity] = useState(rating.clarity);
  const [feedbackPersonalised, setFeedbackPersonalised] = useState(
    rating.personalise
  );
  const [feedbackEvaluativeJudgement, setFeedbackEvaluativeJudgement] =
    useState(rating.evaluativeJudgement);
  const [feedbackUsability, setFeedbackUsability] = useState(rating.usability);
  const [feedbackEmotion, setFeedbackEmotion] = useState(rating.emotion);

  const rateFeedbackStatements = [
    "is easy to understand",
    "relates to my work",
    "helps me to critically evaluate my work",
    "can be used even after this unit",
    "makes me feel positive",
  ];
  const rateFeedbackStatmentsFunction = [
    setFeedbackClarity,
    setFeedbackPersonalised,
    setFeedbackEvaluativeJudgement,
    setFeedbackUsability,
    setFeedbackEmotion,
  ];
  const ratingArray = [
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
        return 10;
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
      feedbackClarity &&
      feedbackPersonalised &&
      feedbackEvaluativeJudgement &&
      feedbackUsability &&
      feedbackEmotion
    ) {
      const feedback = {
        clarity: feedbackClarity,
        personalise: feedbackPersonalised,
        evaluativeJudgement: feedbackEvaluativeJudgement,
        usability: feedbackUsability,
        emotion: feedbackEmotion,
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
    <div className="border rounded-lg">
      <button
        onClick={toggleDropdown}
        className="flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left"
      >
        <span>{!isDropdownOpen ? "Rate this feedback" : "This Feedback"}</span>
        {isDropdownOpen ? chevronIconUp : chevronIconDown}
      </button>
      {isDropdownOpen &&
        rateFeedbackStatements.map((feedback, index) => (
          <div
            key={index}
            className="flex justify-between items-center mb-2 p-2 text-left"
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
    </div>
  );
};
