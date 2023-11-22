import React, {useState} from "react";
import {Button} from "@material-tailwind/react";
import {UnitForm} from "../UnitForm";
import {mockUser} from "../../services/user";
import {
  useHighlighterDispatch,
  useHighlighterState,
} from "../../store/HighlightContext";
import {
  Annotation,
  AnnotationNotes,
  AnnotationData,
  AnnotationActionPoint,
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
const Logo = require("../../assets/logo/PolyFeed_BlackText.png")
  .default as string;
const SidebarPanel = () => {
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const [currentTab, setCurrentTab] = useState("Summary" as SidebarTab);

  function renderTabs(currentTab: SidebarTab) {
    const [unitCode, setUnitCode] = useState("");
    const [assignment, setAssignment] = useState("");
    switch (currentTab) {
      case "Summary":
        return (
          <>
            {mockUser.units.map((unit, index) => (
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
              units={mockUser.units}
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
      case "My Notes":
        return (
          <div className="mb-4">
            {highlighterState.records.map((record: AnnotationData, index) => (
              <div key={index} className="mb-4">
                <AnnotatedCard
                  text={record.annotation.text}
                  onEdit={() => {}}
                  onDelete={() => {}}
                ></AnnotatedCard>
              </div>
            ))}
          </div>
        );
    }
  }

  return (
    <div style={{width: "100%", boxSizing: "border-box"}}>
      <div id="header" className="p-6 border-b border-gray-300 text-xl">
        <img src={Logo} className="h-8 md:h-12" />
      </div>

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
        {renderTabs(currentTab)}
        <hr className="my-4" />
      </div>
    </div>
  );
};
function redirectToDashBoard() {
  window.location.href = "http://localhost:3000/";
}
export default SidebarPanel;
