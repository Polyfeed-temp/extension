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
import AnnotationCard from "./AnnotationCard";
import { SelectUnitAssignmentTab } from "./tabs/StartAssignmentTab";
import { HighlightingTab } from "./tabs/HighlightTextsTab";
import { RateFeedbackTab } from "./tabs/RateFeedbackTab";
import { useUserState } from "../../store/UserContext";
import AnnotationService from "../../services/annotation.service";
import config from "../../config.json";
import { ExplainFutherToggle } from "./ExplainFutherInput";
import { addLogs, eventType, eventSource } from "../../services/logs.serivce";
import { useFileStore } from "../../store/fileStore";
const uploadIcon = require("../../assets/icons/upload.png").default as string;
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

  const {
    createFile,
    fetchFilesByFeedbackId,
    fileList,
    loading,
    setSelectedFile,
    selectedFile,
    fetchingListLoading,
  } = useFileStore();

  useEffect(() => {
    if (feedback) {
      fetchFilesByFeedbackId(feedback.id);
    }
  }, [feedback]);

  const renderLoading = () => {
    return (
      <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
    );
  };

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
      return (
        <div className="mb-4">
          {feedback && (
            <>
              <CurrentFeedbackSummary
                feedback={{ ...feedback, highlights: highlighterState.records }}
              />
              <Button
                fullWidth
                className="bg-black my-4 shadow-md"
                onClick={() => {
                  highlighterDispatch({
                    type: "SET_IS_HIGHLIGHTING",
                    payload: !highlighterState.isHighlighting,
                  });

                  addLogs({
                    eventType: eventType[0],
                    content: !highlighterState.isHighlighting
                      ? "Continue Highlighting On Website"
                      : "Stop Highlighting",
                    eventSource: eventSource[0],
                  });
                }}
              >
                {!highlighterState.isHighlighting
                  ? "Continue Highlighting On Website"
                  : "Stop Highlighting"}
              </Button>

              <div>
                <p className="text-lg font-bold">Manage PDF file</p>
                <div className="flex flex-row overflow-y-hidden mt-2 justify-center items-center">
                  <div
                    className="flex"
                    style={{
                      maxWidth: "80%",
                      marginRight: "10%",
                      overflowX: "auto",
                      padding: 10,
                    }}
                  >
                    {fetchingListLoading && renderLoading()}
                    {/* showing file list here */}

                    {fileList.length > 0 &&
                      fileList.map((file, index) => (
                        <div
                          className={`rounded-md mr-2 cursor-pointer ${
                            selectedFile?.id === file.id
                              ? "bg-black text-white"
                              : "bg-gray-200"
                          }`}
                          style={{
                            minWidth: 100,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 40,
                          }}
                          key={file.id}
                          onClick={() => {
                            if (selectedFile?.id === file.id) {
                              setSelectedFile(null);
                              return;
                            }

                            setSelectedFile(file);
                          }}
                        >
                          {`PDF - ${index + 1}`}
                        </div>
                      ))}
                  </div>

                  <div
                    className="border border-black rounded-full"
                    style={{
                      padding: 5,
                    }}
                  >
                    {loading ? (
                      renderLoading()
                    ) : (
                      <img
                        src={uploadIcon}
                        className="w-6 h-6  cursor-pointer"
                        onClick={() => {
                          // Create hidden file input
                          const fileInput = document.createElement("input");
                          fileInput.type = "file";
                          fileInput.accept = ".pdf";

                          fileInput.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64String = reader.result as string;

                                createFile(
                                  highlighterState?.feedbackInfo?.id || 0,
                                  base64String
                                );
                              };
                              reader.readAsDataURL(file);
                            }
                          };

                          fileInput.click();
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <HighlightingTab />
          {highlighterState.records &&
            highlighterState.records.length > 0 &&
            highlighterState.records
              .sort((a, b) =>
                a.annotation.annotationTag.localeCompare(
                  b.annotation.annotationTag
                )
              )
              .map((record: AnnotationData, index) => (
                <div key={index} className="mb-4">
                  <AnnotationCard
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
                  ></AnnotationCard>
                </div>
              ))}

          <ExplainFutherToggle />
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
      const feedbacks = await annotationService.getAllFeedback();
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
