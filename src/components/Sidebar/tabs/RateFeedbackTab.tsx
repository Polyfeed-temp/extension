import {emoticons} from "../../AnnotationIcons";

export function RateFeedbackTab() {
  return (
    <div className="border rounded-lg">
      <div className="bg-gray-200 font-bold text-xl mb-4 p-2">
        This feedback
      </div>
      {[
        "Easy to understand",
        "Relates to my work",
        "Helps me to critically evaluate my work",
        "Can be used even after this unit",
        "Made me feel positive",
      ].map((feedback, index) => (
        <div key={index} className="flex justify-between items-center mb-2 p-2">
          <span className="flex-1">{feedback}</span>
          <div className="flex items-center">
            {Object.entries(emoticons).map(([category, counter]) => (
              <button key={category} className="ml-2">
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
}
