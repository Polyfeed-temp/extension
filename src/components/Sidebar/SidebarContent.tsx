import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";
import { AnnotationData, Feedback } from "../../types";
type SidebarTab =
  | "Summary"
  | "My Notes"
  | "Highlight Texts"
  | "Select Assignment";

import { SummaryCard, UnitAssignmentSummary } from "./tabs/SummaryCard";
import { CurrentFeedbackSummary } from "../MyNotesSummaryCard";
import AnnotatedCard from "./AnnotatedCard";
import { SelectUnitAssignmentTab } from "./tabs/StartAssignmentTab";
import { HighlightingTab } from "./tabs/HighlightTextsTab";
import { RateFeedbackTab } from "./tabs/RateFeedbackTab";
import { useUserState } from "../../store/UserContext";
import AnnotationService from "../../services/annotation.service";
import config from "../../config.json";
import { ExplainFutherToggle } from "./ExplainFutherInput";
import { addLogs, eventType, eventSource } from "../../services/logs.serivce";

function RenderTabs({
  currentTab,
  setCurrentTab,
  feedback,
  feedbacks,
}: {
  currentTab: SidebarTab;
  setCurrentTab: (tab: SidebarTab) => void;
  feedback: Feedback | null;
  feedbacks: Feedback[];
}) {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();

  switch (currentTab) {
    case "Summary":
      return (
        <div className="flex flex-col gap-y-5">
          {feedbacks.map((feedback, index) => (
            <UnitAssignmentSummary
              feedback={feedback}
              key={index}
            ></UnitAssignmentSummary>
          ))}
        </div>
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
                onClick={async () => {
                  await addLogs({
                    eventType: eventType[0],
                    content: "Start Highlight",
                    eventSource: eventSource[2],
                  });

                  setCurrentTab("Select Assignment");
                }}
              >
                Start Highlight
              </Button>
            ) : (
              <>
                {highlighterState.records && (
                  <SummaryCard annotationData={highlighterState.records} />
                )}
                {setCurrentTab("Highlight Texts")}
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
              {
                highlighterDispatch({
                  type: "SET_IS_HIGHLIGHTING",
                  payload: true,
                });
              }
              setCurrentTab("Highlight Texts");
            }}
          ></SelectUnitAssignmentTab>
        </div>
      );
    //drop down for summary of feedback the tags
    //assignemnt drop down add a other option from teacher
    case "Highlight Texts":
      const currentUrl = window.location.pathname;

      const enableBtn =
        currentUrl === "/mod/assign/view.php" ||
        currentUrl === "/mod/quiz/view.php";

      return (
        <div className="mb-4">
          {feedback && (
            <>
              <CurrentFeedbackSummary
                feedback={{ ...feedback, highlights: highlighterState.records }}
              ></CurrentFeedbackSummary>
              <Button
                fullWidth
                className={`${
                  enableBtn ? "bg-black" : "!bg-grey"
                } my-4 shadow-md`}
                disabled={!enableBtn}
                onClick={() => {
                  highlighterDispatch({
                    type: "SET_IS_HIGHLIGHTING",
                    payload: !highlighterState.isHighlighting,
                  });

                  addLogs({
                    eventType: eventType[0],
                    content: !highlighterState.isHighlighting
                      ? "Continue Highlighting"
                      : "Stop Highlighting",
                    eventSource: currentTab,
                  });
                }}
              >
                {!highlighterState.isHighlighting
                  ? "Continue Highlighting"
                  : "Stop Highlighting"}
              </Button>
            </>
          )}
          <HighlightingTab></HighlightingTab>
          <ExplainFutherToggle></ExplainFutherToggle>
          {highlighterState.records.map((record: AnnotationData, index) => (
            <div key={index} className="mb-4">
              <AnnotatedCard
                key={index}
                annotationData={record}
                onDelete={() => {
                  highlighterDispatch({
                    type: "DELETE_RECORD",
                    payload: record.annotation.id,
                  });

                  addLogs({
                    eventType: eventType[8],
                    content: record.annotation.id,
                    eventSource: eventSource[0],
                  });
                }}
              ></AnnotatedCard>
            </div>
          ))}
          <hr className="my-4 pb-2" />
          <RateFeedbackTab
            feedbackId={feedback?.id || 0}
            rating={{
              clarity: feedback?.clarity || 0,
              personalise: feedback?.personalise || 0,
              evaluativeJudgement: feedback?.evaluativeJudgement || 0,
              usability: feedback?.usability || 0,
              emotion: feedback?.emotion || 0,
            }}
          ></RateFeedbackTab>
        </div>
      );
  }
}

const SidebarPanel = () => {
  const [currentTab, setCurrentTab] = useState("My Notes" as SidebarTab);
  const [feedbacks, setAllFeedbacks] = useState<Feedback[]>([]);

  const [loading, setLoading] = useState(true);
  const annotationService = new AnnotationService();
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const userState = useUserState();

  useEffect(() => {
    const fetchAnnotations = async () => {
      const feedback = await annotationService.getCurrentPageFeedback();

      highlighterDispatch({ type: "INITIALIZE", payload: feedback });
      setLoading(false);
    };
    const fetchFeedbacks = async () => {
      const feedbacks = await annotationService.getAllFeedack();
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
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <div id="content" className="p-6 text-center gap-x-4 relative">
            <div className="flex">
              <Button
                className={`${
                  currentTab != "Summary"
                    ? "bg-black text-white"
                    : "bg-gray text-black"
                } flex-1`}
                onClick={() => {
                  setCurrentTab("My Notes");

                  addLogs({
                    eventType: eventType[7],
                    content: JSON.stringify({
                      currentTab,
                      navigateTo: "My Notes",
                    }),
                    eventSource: eventSource[11],
                  });
                }}
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

                  addLogs({
                    eventType: eventType[7],
                    content: JSON.stringify({
                      currentTab,
                      navigateTo: "Summery",
                    }),
                    eventSource: eventSource[11],
                  });
                }}
              >
                Summary
              </Button>
              <Button
                className="bg-gray text-black flex-1 ml-2"
                onClick={() => {
                  window.open(config.dashboard, "_blank");
                  addLogs({
                    eventType: eventType[7],
                    content: JSON.stringify({
                      currentTab,
                      navigateTo: "Dashboard",
                    }),
                    eventSource: eventSource[11],
                  });
                }}
              >
                Dashboard
              </Button>
            </div>
            <hr className="my-4" />
            {loading ? (
              <div className="center animate-spin rounded-full border-t-4 border-black border-b-4 border-black-500 border-opacity-25 h-12 w-12"></div>
            ) : (
              <RenderTabs
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                feedback={highlighterState.feedbackInfo}
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
