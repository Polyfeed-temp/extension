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
function RenderTabs({
  currentTab,
  setCurrentTab,
  feedback,
  setFeedback,
}: {
  currentTab: SidebarTab;
  setCurrentTab: (tab: SidebarTab) => void;
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback) => void;
}) {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const [unitCode, setUnitCode] = useState("");
  const [assignment, setAssignment] = useState("");

  switch (currentTab) {
    case "Summary":
      return <>{/* loading then add */}</>;
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
          <HighlightingTab
            unitCode={unitCode}
            assignment={assignment}
          ></HighlightingTab>
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
  const [currentTab, setCurrentTab] = useState("Summary" as SidebarTab);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);

  const [loading, setLoading] = useState(false);
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
    };
    if (userState.login) {
      fetchAnnotations();
    }
  }, [userState.login]);

  return (
    <>
      {userState.login && (
        <div style={{width: "100%", boxSizing: "border-box"}}>
          <div
            id="content"
            className="p-6 text-center gap-x-4"
            style={{width: "100%"}}
          >
            <div className="mb-4">
              <Button
                className="bg-black mr-2"
                onClick={() => setCurrentTab("My Notes")}
              >
                My Notes
              </Button>
              <Button className="bg-black" onClick={redirectToDashBoard}>
                Summary
              </Button>
            </div>
            <hr className="my-4" />

            <RenderTabs
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              feedback={currentFeedback}
              setFeedback={setCurrentFeedback}
            ></RenderTabs>
            <hr className="my-4" />
          </div>
        </div>
      )}
    </>
  );
};
function redirectToDashBoard() {
  window.location.href = "http://localhost:3000/";
}
export default SidebarPanel;
