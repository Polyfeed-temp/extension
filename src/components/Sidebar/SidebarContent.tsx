import React, {useEffect, useState} from "react";
import {Button} from "@material-tailwind/react";
import {UnitForm} from "../UnitForm";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";
import {
  Annotation,
  AnnotationNotes,
  AnnotationData,
  Feedback,
} from "../../types";

type SidebarTab =
  | "Summary"
  | "My Notes"
  | "Highlight Texts"
  | "Select Assignment";
import {SummaryCard, UnitAssignmentSummary} from "./tabs/SummaryCard";
import AnnotatedCard from "./AnnotatedCard";
import {SelectUnitAssignmentTab} from "./tabs/StartAssignmentTab";
import {HighlightingTab} from "./tabs/HighlightTextsTab";
import {RateFeedbackTab} from "./tabs/RateFeedbackTab";
import {useUserState} from "../../store/UserContext";
import AnnotationService from "../../services/annotation.service";
import config from "../../config.json";

function RenderTabs({
  currentTab,
  setCurrentTab,
  feedback,
  setFeedback,
  feedbacks,
}: {
  currentTab: SidebarTab;
  setCurrentTab: (tab: SidebarTab) => void;
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback) => void;
  feedbacks: Feedback[];
}) {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();

  switch (currentTab) {
    case "Summary":
      return (
        <>
          {feedbacks.map((feedback, index) => (
            <UnitAssignmentSummary
              feedback={feedback}
              key={index}
            ></UnitAssignmentSummary>
          ))}
        </>
      );
    case "My Notes":
      return (
        <>
          <hr className="my-4" />

          <div className="mb-4">
            {!feedback ? (
              <Button
                fullWidth
                className="bg-black"
                onClick={() => {
                  setCurrentTab("Select Assignment");
                }}
              >
                Start Highlight
              </Button>
            ) : (
              <>
                {feedback.highlights && (
                  <SummaryCard annotationData={feedback.highlights} />
                )}

                <Button
                  fullWidth
                  className="bg-black"
                  onClick={() => {
                    setCurrentTab("Highlight Texts");
                    highlighterDispatch({
                      type: "SET_IS_HIGHLIGHTING",
                      payload: true,
                    });
                  }}
                >
                  Continue Highlighting
                </Button>
              </>
            )}
          </div>
        </>
      );
    case "Select Assignment":
      return (
        <div className="mb-4">
          <SelectUnitAssignmentTab
            // units={currentUser.units}
            switchTabFunc={() => {
              highlighterDispatch({
                type: "SET_IS_HIGHLIGHTING",
                payload: true,
              });
              setCurrentTab("Highlight Texts");
            }}
          ></SelectUnitAssignmentTab>
        </div>
      );
    //drop down for summary of feedback the tags
    //assignemnt drop down add a other option from teacher
    case "Highlight Texts":
      return (
        <div className="mb-4">
          {feedback && (
            <UnitAssignmentSummary feedback={feedback}></UnitAssignmentSummary>
          )}
          <HighlightingTab></HighlightingTab>
          {highlighterState.records.map((record: AnnotationData, index) => (
            <div key={index} className="mb-4">
              <AnnotatedCard
                text={record.annotation.text}
                onEdit={() => {}}
                onDelete={() => {}}
              ></AnnotatedCard>
            </div>
          ))}
          <hr className="my-4 pb-2" />
          <RateFeedbackTab></RateFeedbackTab>
          <Button> Save highlights</Button>
        </div>
      );
  }
}

const SidebarPanel = () => {
  const [currentTab, setCurrentTab] = useState("My Notes" as SidebarTab);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [feedbacks, setAllFeedbacks] = useState<Feedback[]>([]);

  const [loading, setLoading] = useState(true);
  const annotationService = new AnnotationService();
  const highlighterDispatch = useHighlighterDispatch();
  const userState = useUserState();

  useEffect(() => {
    const fetchAnnotations = async () => {
      const feedback = await annotationService.getCurrentPageFeedback();
      console.log(feedback);
      if (feedback) {
        setCurrentFeedback(feedback);
      }
      highlighterDispatch({type: "INITIALIZE", payload: feedback});
      setLoading(false);
    };
    const fetchFeedbacks = async () => {
      const feedbacks = await annotationService.getAllFeedack();
      console.log(feedbacks);
      setAllFeedbacks(feedbacks);
    };
    if (userState.login) {
      fetchAnnotations();
      fetchFeedbacks();
    }
  }, [userState.login]);

  return (
    <>
      {userState.login && (
        <div style={{width: "100%", boxSizing: "border-box"}}>
          <div id="content" className="p-6 text-center gap-x-4 relative">
            <div className="flex">
              <Button
                className={`${
                  currentTab === "My Notes"
                    ? "bg-black text-white"
                    : "bg-gray text-black"
                } flex-1`}
                onClick={() => setCurrentTab("My Notes")}
              >
                My Notes
              </Button>
              <Button
                className={`${
                  currentTab === "Summary"
                    ? "bg-black text-white"
                    : "bg-gray text-black"
                } flex-1 ml-2`}
                onClick={() => {
                  setCurrentTab("Summary");
                  highlighterDispatch({
                    type: "SET_IS_HIGHLIGHTING",
                    payload: false,
                  });
                }}
              >
                Summary
              </Button>
              <Button
                className="bg-gray text-black flex-1 ml-2"
                onClick={() => {
                  window.location.href = config.dashboard;
                }}
              >
                {" "}
                Dashboard
              </Button>
            </div>
            <hr className="my-4" />
            {loading ? (
              <div className="center animate-spin rounded-full border-t-4 border-black border-opacity-25 border-b-4 border-black-500 border-opacity-25 h-12 w-12"></div>
            ) : (
              <RenderTabs
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                feedback={currentFeedback}
                setFeedback={setCurrentFeedback}
                feedbacks={feedbacks}
              ></RenderTabs>
            )}

            <hr className="my-4" />
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarPanel;
