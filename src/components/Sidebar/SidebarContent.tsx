import React, { useEffect, useState } from 'react';
import { Button } from '@material-tailwind/react';
import {
  useHighlighterDispatch,
  useHighlighterState,
} from '../../store/HighlightContext';
import { AnnotationData, Feedback } from '../../types';
type SidebarTab =
  | 'Summary'
  | 'My Notes'
  | 'Highlight Texts'
  | 'Select Assignment'
  | 'Request Feedback';

import { SummaryCard, UnitAssignmentSummary } from './tabs/SummaryCard';
import { CurrentFeedbackSummary } from '../MyNotesSummaryCard';
import AnnotationCard from './AnnotationCard';
import { SelectUnitAssignmentTab } from './tabs/StartAssignmentTab';
import { HighlightingTab } from './tabs/HighlightTextsTab';
import { RateFeedbackTab } from './tabs/RateFeedbackTab';
import { useUserState } from '../../store/UserContext';
import AnnotationService from '../../services/annotation.service';
import config from '../../config.json';
import { ExplainFutherToggle } from './ExplainFutherInput';
import { addLogs, eventType, eventSource } from '../../services/logs.serivce';
import { PdfManagement } from './PdfManagement';
import { RequestFeedbackTab } from './tabs/RequestFeedbackTab';

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
    case 'Summary':
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
    case 'My Notes':
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
                    content: 'Start Highlight',
                    eventSource: eventSource[2],
                  });

                  setCurrentTab('Select Assignment');
                }}
              >
                Start Highlight
              </Button>
            ) : (
              <>
                {highlighterState.records && (
                  <SummaryCard annotationData={highlighterState.records} />
                )}
                {setCurrentTab('Highlight Texts')}
              </>
            )}
          </div>
        </>
      );
    case 'Select Assignment':
      return (
        <div className="mb-4">
          <SelectUnitAssignmentTab
            // units={currentUser.units}
            switchTabFunc={() => {
              {
                highlighterDispatch({
                  type: 'SET_IS_HIGHLIGHTING',
                  payload: true,
                });
              }
              setCurrentTab('Highlight Texts');
            }}
          ></SelectUnitAssignmentTab>
        </div>
      );
    //drop down for summary of feedback the tags
    //assignemnt drop down add a other option from teacher
    case 'Highlight Texts':
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
                    type: 'SET_IS_HIGHLIGHTING',
                    payload: !highlighterState.isHighlighting,
                  });

                  addLogs({
                    eventType: eventType[0],
                    content: !highlighterState.isHighlighting
                      ? 'Continue Highlighting'
                      : 'Stop Highlighting',
                    eventSource: eventSource[0],
                  });
                }}
              >
                {!highlighterState.isHighlighting
                  ? 'Continue Highlighting'
                  : 'Stop Highlighting'}
              </Button>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <span className="text-blue-700 text-sm">
                    ℹ️ <strong>Note:</strong> Please note the highlights you made are visible only on Monash Moodle assessment page.
                  </span>
                </div>
              </div>

              <PdfManagement feedback={feedback} />
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
                        type: 'DELETE_RECORD',
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
              furtherQuestions: feedback?.furtherQuestions || '',
              comment: feedback?.comment || '',
              performance: feedback?.performance || 0,
            }}
          ></RateFeedbackTab>
        </div>
      );
    case 'Request Feedback':
      return <RequestFeedbackTab />;
  }
}

const SidebarPanel = () => {
  const [currentTab, setCurrentTab] = useState('My Notes' as SidebarTab);
  const [feedbacks, setAllFeedbacks] = useState<Feedback[]>([]);

  const [loading, setLoading] = useState(true);
  const annotationService = new AnnotationService();
  const highlighterDispatch = useHighlighterDispatch();
  const highlighterState = useHighlighterState();
  const userState = useUserState();

  useEffect(() => {
    const fetchAnnotations = async () => {
      const feedback = await annotationService.getCurrentPageFeedback();

      // Only initialize if highlighter doesn't exist or needs refresh
      if (!highlighterState.highlighterLib) {
        highlighterDispatch({ type: 'INITIALIZE', payload: feedback });
      }
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
  }, [userState.login, highlighterState.highlighterLib]);

  return (
    <>
      {userState.login && (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <div id="content" className="p-6 text-center relative">
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[600px]">
                <Button
                  className={`font-medium transition-all duration-200 ${
                    currentTab === 'Request Feedback'
                      ? 'bg-black text-white border-2 border-black shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setCurrentTab('Request Feedback');
                    addLogs({
                      eventType: eventType[7],
                      content: JSON.stringify({
                        currentTab,
                        navigateTo: 'Request Feedback',
                      }),
                      eventSource: eventSource[11],
                    });
                  }}
                >
                  Request Feedback
                </Button>

                <Button
                  className={`font-medium transition-all duration-200 ${
                    currentTab != 'Summary' && currentTab != 'Request Feedback'
                      ? 'bg-black text-white border-2 border-black shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setCurrentTab('My Notes');
                    addLogs({
                      eventType: eventType[7],
                      content: JSON.stringify({
                        currentTab,
                        navigateTo: 'My Notes',
                      }),
                      eventSource: eventSource[11],
                    });
                  }}
                >
                  My Notes
                </Button>

                <Button
                  className={`font-medium transition-all duration-200 ${
                    currentTab === 'Summary'
                      ? 'bg-black text-white border-2 border-black shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setCurrentTab('Summary');
                    highlighterDispatch({
                      type: 'SET_IS_HIGHLIGHTING',
                      payload: false,
                    });
                    addLogs({
                      eventType: eventType[7],
                      content: JSON.stringify({
                        currentTab,
                        navigateTo: 'Summary',
                      }),
                      eventSource: eventSource[11],
                    });
                  }}
                >
                  Summary
                </Button>

                <Button
                  className="font-medium transition-all duration-200 bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => {
                    window.open(config.dashboard, '_blank');
                    addLogs({
                      eventType: eventType[7],
                      content: JSON.stringify({
                        currentTab,
                        navigateTo: 'Dashboard',
                      }),
                      eventSource: eventSource[11],
                    });
                  }}
                >
                  Dashboard
                </Button>
              </div>
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
