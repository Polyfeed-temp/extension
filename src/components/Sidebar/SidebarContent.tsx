import React, {useState} from "react";
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
  AnnotationActionPoint,
  User,
} from "../../types";

type SidebarTab =
  | "Summary"
  | "My Notes"
  | "Highlight Texts"
  | "Select Assignment";
import {UnitAssignmentSummary} from "./tabs/SummaryCard";
import AnnotatedCard from "./AnnotatedCard";
import {SelectUnitAssignmentTab} from "./tabs/StartAssignmentTab";
import {HighlightingTab} from "./tabs/HighlightTextsTab";
import {RateFeedbackTab} from "./tabs/RateFeedbackTab";
import {useUserState} from "../../store/UserContext";
import {mockUser as currentUser} from "../../services/user";
function RenderTabs({
  currentUser,
  currentTab,
  setCurrentTab,
}: {
  currentTab: SidebarTab;
  currentUser: User;
  setCurrentTab: (tab: SidebarTab) => void;
}) {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const [unitCode, setUnitCode] = useState("");
  const [assignment, setAssignment] = useState("");
  switch (currentTab) {
    case "Summary":
    case "My Notes":
      return (
        <>
          {currentUser?.units.map((unit, index) => (
            <div key={index} className="mb-4">
              <UnitAssignmentSummary unit={unit}></UnitAssignmentSummary>
            </div>
          ))}
          <hr className="my-4" />

          <div className="mb-4">
            <Button
              fullWidth
              className="bg-black"
              onClick={() => {
                setCurrentTab("Select Assignment");
              }}
            >
              Select Assignment
            </Button>
          </div>
        </>
      );
    case "Select Assignment":
      return (
        <div className="mb-4">
          <SelectUnitAssignmentTab
            units={currentUser.units}
            switchTabFunc={() => {
              highlighterDispatch({
                type: "SET_IS_HIGHLIGHTING",
                payload: !highlighterState.isHighlighting,
              });
              setCurrentTab("Highlight Texts");
            }}
            setUnitCode={setUnitCode}
            setAssignment={setAssignment}
          ></SelectUnitAssignmentTab>
        </div>
      );
    //drop down for summary of feedback the tags
    //assignemnt drop down add a other option from teacher
    case "Highlight Texts":
      return (
        <div className="mb-4">
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
        </div>
      );
  }
}

const SidebarPanel = () => {
  const [currentTab, setCurrentTab] = useState("Summary" as SidebarTab);
  const user = useUserState();

  const currentUser = user?.user;

  return (
    <>
      {currentUser ? (
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
                Home
              </Button>
              <Button className="bg-black" onClick={redirectToDashBoard}>
                Summary Page
              </Button>
            </div>
            <hr className="my-4" />
            <RenderTabs
              currentTab={currentTab}
              currentUser={currentUser}
              setCurrentTab={setCurrentTab}
            ></RenderTabs>
            <hr className="my-4" />
          </div>
        </div>
      ) : null}
    </>
  );
};
function redirectToDashBoard() {
  window.location.href = "http://localhost:3000/";
}
export default SidebarPanel;
