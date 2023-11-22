import {emoticons} from "../../AnnotationIcons";

import React, {useState} from "react";

export const RateFeedbackTab = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
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

  return (
    <div className="border rounded-lg">
      <button
        onClick={toggleDropdown}
        className="flex justify-between items-center bg-gray-200 font-medium text-xl p-2 w-full text-left"
      >
        <span>{!isDropdownOpen ? "Rate this feedback" : "This Feedback "}</span>
        {isDropdownOpen ? chevronIconUp : chevronIconDown}
      </button>
      {isDropdownOpen &&
        [
          "Easy to understand",
          "Relates to my work",
          "Helps me to critically evaluate my work",
          "Can be used even after this unit",
          "Made me feel positive",
        ].map((feedback, index) => (
          <div
            key={index}
            className="flex justify-between items-center mb-2 p-2"
          >
            <span className="flex-1">{feedback}</span>
            <div className="flex items-center">
              {Object.entries(emoticons).map(([category, counter]) => (
                <button key={category} className="ml-2 bg-blue-500">
                  <img
                    src={counter}
                    alt={category}
                    style={{width: 40, height: 40}}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
