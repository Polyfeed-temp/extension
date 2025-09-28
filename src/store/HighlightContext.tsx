import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import Highlighter from "web-highlighter";
import HighlightSource from "web-highlighter/dist/model/source";
import AnnotationService from "../services/annotation.service";
import { RenderPop } from "../components/Toolbar";
import {
  Annotation,
  SideBarAction,
  AnnotationData,
  Feedback,
  getClassForTag,
  AnnotationActionPoint,
} from "../types";
import { toast } from "react-toastify";
import { useSidebar } from "../hooks/useSidebar";
import { addLogs, eventSource, eventType } from "../services/logs.serivce";
import { useFileStore } from "./fileStore";

interface HighlightState {
  highlighterLib: Highlighter | null;
  feedbackInfo: Feedback | null;
  records: AnnotationData[];
  isHighlighting: boolean;
  editing: {
    sidebarAction: SideBarAction;
    annotation: Annotation;
  } | null;
  drafting: HighlightSource | null;
  unlabledHighlights: HighlightSource[];
}
interface InitializeAction {
  type: "INITIALIZE";
  payload: Feedback | null;
}

interface AddFeedbackAction {
  type: "ADD_FEEDBACK";
  payload: Feedback;
}
interface AddRecordAction {
  type: "ADD_RECORD";
  payload: AnnotationData;
}

interface SetEditingAction {
  type: "SET_EDITING";
  payload: { sidebarAction: SideBarAction; annotation: Annotation };
}

interface SetIsHighlightingAction {
  type: "SET_IS_HIGHLIGHTING";
  payload: boolean;
}

interface DeleteRecordAction {
  type: "DELETE_RECORD";
  payload: string;
}
interface SetDraftingAction {
  type: "SET_DRAFTING";
  payload: HighlightSource;
}

interface UpdateHighlight {
  type: "UPDATE_HIGHLIGHT_NOTES";
  payload: { id: string; notes: string };
}
interface DeleteAllHighlights {
  type: "DELETE_ALL_HIGHLIGHTS";
}
interface DeleteFeedback {
  type: "DELETE_FEEDBACK";
}
interface AddActionItem {
  type: "ADD_ACTION_ITEM";
  payload: { id: string; actionItem: AnnotationActionPoint };
}
interface CancelHighlighted {
  type: "CANCEL_HIGHLIGHTED";
}
interface UpdateActionItems {
  type: "UPDATE_HIGHLIGHT_ACTION_ITEMS";
  payload: { id: string; actionItems: AnnotationActionPoint[] };
}
interface SyncWithServerAction {
  type: "SYNC_WITH_SERVER";
  payload: Feedback | null;
}
type Action =
  | AddRecordAction
  | SetEditingAction
  | SetIsHighlightingAction
  | DeleteRecordAction
  | InitializeAction
  | SetDraftingAction
  | AddFeedbackAction
  | UpdateHighlight
  | DeleteAllHighlights
  | DeleteFeedback
  | AddActionItem
  | CancelHighlighted
  | UpdateActionItems
  | SyncWithServerAction;

const HighlighterContext = createContext<
  | {
      state: HighlightState;
      dispatch: React.Dispatch<Action>;
      handleDelete: (id: string) => Promise<void>;
    }
  | undefined
>(undefined);

const highlighterReducer = (
  state: HighlightState,
  action: Action
): HighlightState => {
  switch (action.type) {
    case "INITIALIZE":
      // Only create a new highlighter if one doesn't exist
      let lib = state.highlighterLib;
      if (!lib) {
        const root = document.getElementById("docos-stream-view") as HTMLElement;
        lib = new Highlighter({
          $root: root ? root : document.documentElement,
          // wrapTag: "span",
          exceptSelectors: ["#react-root", "img", "footer"],
          // "img", "br",
        });
      }

      const initialState: HighlightState = {
        highlighterLib: lib,
        records: action.payload?.highlights ? action.payload.highlights : [],
        editing: null,
        isHighlighting: false,
        feedbackInfo: action.payload,
        drafting: null,
        unlabledHighlights: [],
      };
      if (action.payload) {
        useSidebar().setCollapsed(false);
      }

      return { ...state, ...initialState };
    case "SET_DRAFTING":
      return {
        ...state,
        drafting: action.payload,
        unlabledHighlights: [...state.unlabledHighlights, action.payload],
      };
    case "ADD_RECORD":
      //after adding record to db, add to state and remove from current editing and drafting
      return {
        ...state,
        editing: null,
        drafting: null,
        records: [...state.records, action.payload],
      };
    case "SET_EDITING":
      return { ...state, editing: action.payload };
    case "SET_IS_HIGHLIGHTING":
      action.payload
        ? state.highlighterLib?.run()
        : state.highlighterLib?.stop();
      return { ...state, isHighlighting: action.payload };
    case "DELETE_RECORD":
      const newRecords = state.records.filter(
        (record) => record.annotation.id !== action.payload
      );
      state.highlighterLib?.remove(action.payload);

      // Update PDF viewer
      const { selectedFile, setSelectedFile, setAssociatedHighlights } =
        useFileStore.getState();
      if (selectedFile) {
        // Store current file
        const currentFile = selectedFile;

        // Get the updated feedback to ensure we have the latest highlights
        const annotationService = new AnnotationService();
        annotationService.getCurrentPageFeedback().then((newFeedback) => {
          if (newFeedback?.highlights) {
            // Filter highlights for current file
            const newAssociatedHighlights = newFeedback.highlights.filter(
              (highlight) =>
                highlight?.annotation?.startMeta?.parentTagName ===
                currentFile.id.toString()
            );

            // Temporarily clear selected file and update highlights
            setAssociatedHighlights(newAssociatedHighlights);
            setSelectedFile(null);

            // Reset selected file after a brief delay to trigger reload
            setTimeout(() => {
              setSelectedFile(currentFile);
            }, 100);
          }
        });
      }

      return { ...state, records: newRecords };
    case "ADD_FEEDBACK":
      return { ...state, feedbackInfo: action.payload };
    case "DELETE_ALL_HIGHLIGHTS":
      return { ...state, records: [] };
    case "DELETE_FEEDBACK":
      return { ...state, feedbackInfo: null, records: [] };
    case "ADD_ACTION_ITEM":
      const record = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (record) {
        record.actionItems ??= [];
        record.actionItems.push(action.payload.actionItem);
      }

      return { ...state };
    case "UPDATE_HIGHLIGHT_NOTES":
      const recordToUpdate = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (recordToUpdate) {
        recordToUpdate.annotation.notes = action.payload.notes;
      }
      return { ...state, editing: null, drafting: null };
    case "CANCEL_HIGHLIGHTED":
      state.highlighterLib?.remove(state.drafting?.id || "");
      return { ...state, editing: null, drafting: null };
    case "UPDATE_HIGHLIGHT_ACTION_ITEMS":
      const recordToUpdateAction = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (recordToUpdateAction) {
        recordToUpdateAction.actionItems = action.payload.actionItems;
      }
      return { ...state, editing: null, drafting: null };
    case "SYNC_WITH_SERVER":
      return {
        ...state,
        feedbackInfo: action.payload,
        records: action.payload?.highlights || [],
      };
    default:
      return state;
  }
};

export const HighlighterProvider = ({ children }: { children: ReactNode }) => {
  const initialState: HighlightState = {
    highlighterLib: null,
    records: [],
    editing: null,
    isHighlighting: false,
    drafting: null,
    unlabledHighlights: [],
    feedbackInfo: null,
  };

  const { setCollapsed } = useSidebar();
  const [state, baseDispatch] = useReducer(highlighterReducer, initialState);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<Element | null>(null);
  const [selectedHighlighId, setSelectedHighlightId] = useState<string | null>(
    null
  );

  const [doubleClick, setDoubleClick] = useState(false);
  const service = new AnnotationService();

  const dispatch = async (action: Action) => {
    switch (action.type) {
      case "ADD_RECORD":
        try {
          let sources = action.payload;
          if (state.feedbackInfo) {
            // Store original comprehensive data - now in startMeta
            const originalStartMeta = sources.annotation.startMeta;
            const hasComprehensiveData = (() => {
              try {
                const parsed = JSON.parse(originalStartMeta.parentTagName);
                const isComprehensive = !!(parsed.highlightAreas || parsed.source);
                return isComprehensive;
              } catch {
                return false;
              }
            })();

            if (
              doubleClick ||
              (sources.annotation.endMeta.parentTagName != "P" && !hasComprehensiveData)
            ) {
              // Only overwrite if we don't have comprehensive data
              const fileId = hasComprehensiveData
                ? JSON.parse(originalStartMeta.parentTagName).fileId
                : sources.annotation.endMeta.parentTagName;

              sources = {
                ...sources,
                annotation: {
                  ...sources.annotation,
                  endMeta: {
                    parentIndex: sources.annotation.startMeta.parentIndex,
                    parentTagName: fileId, // Use file ID from comprehensive data or fallback
                    textOffset: sources.annotation.text.length,
                  },
                },
              };
            }

            if (hasComprehensiveData) {
              console.log('[PRESERVE] Comprehensive coordinate data already in startMeta');
            }

            // Log comprehensive data transmission
            console.log('[API] Sending comprehensive annotation data to backend');

            addLogs({
              eventType: eventType[2],
              content: JSON.stringify(sources),
              eventSource: eventSource[0],
            });

            const creationStatus = service.addAnnotations(sources);
            toast.promise(creationStatus, {
              pending: "Saving...",
              success: "Saved",
              error: "Error saving please try again",
            });
            const res = await creationStatus;
            if (res.status !== 200) {
              return;
            }
            baseDispatch({ type: "ADD_RECORD", payload: action.payload });
          } else {
            toast.error("Please select valid assignment");
          }
        } catch (err) {
        }
        break;
      case "DELETE_RECORD":
        try {
          const status = service.deleteAnnotation(action.payload);
          toast.promise(status, {
            pending: "Deleting...",
            success: "Deleted Highlight",
            error: "Error deleting please try again",
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }

          addLogs({
            eventType: eventType[8],
            content: JSON.stringify(action.payload),
            eventSource: eventSource[0],
          });

          baseDispatch({ type: "DELETE_RECORD", payload: action.payload });
        } catch (err) {
        }
        break;
      case "UPDATE_HIGHLIGHT_NOTES":
        try {
          const status = service.updateHighlightNotes(
            action.payload.id,
            action.payload.notes
          );
          toast.promise(status, {
            pending: "Updating...",
            success: "Updated Highlight",
            error: "Error updating please try again",
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }

          addLogs({
            eventType: eventType[3],
            content: JSON.stringify(action.payload),
            eventSource: eventSource[3],
          });

          baseDispatch({
            type: "UPDATE_HIGHLIGHT_NOTES",
            payload: action.payload,
          });
        } catch (err) {
        }

        break;
      case "DELETE_ALL_HIGHLIGHTS":
        try {
          const status = state.feedbackInfo?.id
            ? service.deleteAllHighlights(state.feedbackInfo.id)
            : undefined;
          if (status) {
            toast.promise(status, {
              pending: "Deleting all highlights...",
              success: "Deleted Highlight",
              error: "Error deleting please try again",
            });
            const res = await status;
            if (res.status == 200) {
              addLogs({
                eventType: eventType[8],
                content: "delete all highlights",
                eventSource: eventSource[0],
              });

              state.highlighterLib?.removeAll();
              baseDispatch({ type: "DELETE_ALL_HIGHLIGHTS" });
            }
          }
        } catch (err) {
        }
        break;
      case "DELETE_FEEDBACK":
        try {
          const status = state.feedbackInfo?.id
            ? service.deleteFeedback(state.feedbackInfo.id)
            : undefined;
          if (status) {
            toast.promise(status, {
              pending: "Deleting feedback...",
              success: "Deleted feedback",
              error: "Error deleting please try again",
            });
            const res = await status;
            if (res.status == 200) {
              addLogs({
                eventType: eventType[8],
                content: `${state.feedbackInfo?.id}` || "",
                eventSource: eventSource[0],
              });
              state.highlighterLib?.removeAll();
              baseDispatch({ type: "DELETE_FEEDBACK" });
            }
          }
        } catch (err) {
        }
        break;
      case "ADD_ACTION_ITEM":
        try {
          const status = service.addActionItem(
            action.payload.id,
            action.payload.actionItem
          );
          toast.promise(status, {
            pending: "Adding suggestion...",
            success: "Added suggestion",
            error: "Error adding suggestion please try again",
          });

          addLogs({
            eventType: eventType[2],
            content: JSON.stringify({
              id: action.payload.id,
              actionItem: action.payload.actionItem,
            }),
            eventSource: eventSource[9],
          });

          const res = await status;
          if (res.status == 200) {
            baseDispatch({ type: "ADD_ACTION_ITEM", payload: action.payload });
          }
        } catch (err) {
        }
        break;
      case "UPDATE_HIGHLIGHT_ACTION_ITEMS":
        try {
          const status = service.updateHighlightActionItem(
            action.payload.id,
            action.payload.actionItems
          );

          toast.promise(status, {
            pending: "Updating action plans...",
            success: "Updated action plans",
            error: "Error updating action plans please try again",
          });

          addLogs({
            eventType: eventType[3],
            content: JSON.stringify({
              id: action.payload.id,
              actionItem: action.payload.actionItems,
            }),
            eventSource: eventSource[9],
          });

          const res = await status;
          if (res.status == 200) {
            baseDispatch({
              type: "UPDATE_HIGHLIGHT_ACTION_ITEMS",
              payload: action.payload,
            });

            const feedback = await service.getCurrentPageFeedback();

            baseDispatch({ type: "INITIALIZE", payload: feedback });
          }
        } catch (err) {
        }
        break;
      case "SYNC_WITH_SERVER":
        return { ...state, feedbackInfo: action.payload };
      default:
        baseDispatch(action);
    }
  };

  useEffect(() => {
    addEventListener("click", (event: any) => {
      switch (event.detail) {
        case 1:
          setDoubleClick(false);
          break;
        case 2:
        case 3:
          setDoubleClick(true);
          break;
      }
    });

    const handleCreate = (data: {
      sources: HighlightSource[];
      type: string;
    }) => {
      const id = data.sources[0].id;
      const _node = state.highlighterLib?.getDoms(id)[0];
      if (_node) {
        _node.id = `__highlight-${id}`;
      }

      if (data.type != "from-store") {
        let payload = data.sources[0];

        dispatch({ type: "SET_DRAFTING", payload });
      }
    };

    const handleClick = (data: { id: string }) => {
      const selectedArea = state.highlighterLib?.getDoms(data.id)[0];
      selectedArea ? setSelectedHighlightElement(selectedArea) : null;
      setSelectedHighlightId(data.id);
      // dispatch({type: "SELECT_HIGHLIGHT", payload: data.id});

      setCollapsed(false);
      const hostElement = document.getElementById("sidebar-root");
      const sidebarShadowRoot = hostElement?.shadowRoot;
      //remove selected focus
      sidebarShadowRoot?.querySelectorAll(".selected").forEach((elem) => {
        elem.classList.remove("selected");
      });
      const cardView = sidebarShadowRoot?.getElementById(
        `card-view-${data.id}`
      );
      cardView?.classList.add("selected");
      // const cardView = document.getElementById(`card-view-${data.id}`);

      cardView?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleHover = (data: { id: string }) => {
      const id = data.id;
      state.highlighterLib?.addClass("highlight-hover", id);
    };
    const handleHoverOut = (data: { id: string }) => {
      const id = data.id;
      state.highlighterLib?.removeClass("highlight-hover", id);
    };

    state.highlighterLib?.on(Highlighter.event.CREATE, handleCreate);
    state.highlighterLib?.on(Highlighter.event.CLICK, handleClick);
    state.highlighterLib?.on(Highlighter.event.HOVER_OUT, handleHoverOut);
    state.highlighterLib?.on(Highlighter.event.HOVER, handleHover);

    state.records.map((highlight) => {
      state.highlighterLib?.fromStore(
        highlight.annotation.startMeta,
        highlight.annotation.endMeta,
        highlight.annotation.text,
        highlight.annotation.id
      );

      // if (highlight.annotation.startMeta.parentIndex > 11) {
      //   state.highlighterLib?.fromStore(
      //     {
      //       ...highlight.annotation.startMeta,
      //       parentIndex: highlight.annotation.startMeta.parentIndex + 4,
      //     },
      //     {
      //       ...highlight.annotation.endMeta,
      //       parentIndex: highlight.annotation.endMeta.parentIndex + 4,
      //     },
      //     highlight.annotation.text,
      //     highlight.annotation.id
      //   );
      // }

      state.highlighterLib?.addClass(
        getClassForTag(highlight.annotation.annotationTag),
        highlight.annotation.id
      );
    });

    // Cleanup function to remove the listeners
    return () => {
      state.highlighterLib?.off(Highlighter.event.CREATE, handleCreate);
      state.highlighterLib?.off(Highlighter.event.CLICK, handleClick);
      state.highlighterLib?.off(Highlighter.event.HOVER_OUT, handleHoverOut);
    };
  }, [state]);

  // monitor the expand icon onclick
  useEffect(() => {
    const handleIconClick = (event: any) => {
      state.records.map((highlight) => {
        if (highlight.annotation.startMeta.parentIndex < 11) {
          const pElementAmount = document.querySelectorAll(
            'div[class*="summary_assignfeedback_comments_"] p'
          ).length;


          state.highlighterLib?.fromStore(
            {
              ...highlight.annotation.startMeta,
              parentIndex:
                highlight.annotation.startMeta.parentIndex + pElementAmount,
            },
            {
              ...highlight.annotation.endMeta,
              parentIndex:
                highlight.annotation.endMeta.parentIndex + pElementAmount,
            },
            highlight.annotation.text,
            highlight.annotation.id
          );
        }

        state.highlighterLib?.addClass(
          getClassForTag(highlight.annotation.annotationTag),
          highlight.annotation.id
        );
      });
    };

    // Polling function to wait for elements to be available
    const waitForIcons = setInterval(() => {
      const icons = document.querySelectorAll('i[title][title="View full"]');

      if (icons.length > 0) {
        clearInterval(waitForIcons); // Stop polling once elements are found
        if (icons.length > 1)
          icons[1].addEventListener("click", handleIconClick);
        else icons[0].addEventListener("click", handleIconClick);
      }
    }, 500); // Check every 500ms

    // Cleanup
    return () => {
      clearInterval(waitForIcons); // Ensure to clear the interval on component unmount
      // Remove event listeners if necessary
      const icons = document.querySelectorAll('i[title][title="View full"]');

      if (icons.length > 0) {
        clearInterval(waitForIcons); // Stop polling once elements are found
        if (icons.length > 1)
          icons[1].addEventListener("click", handleIconClick);
        else icons[0].addEventListener("click", handleIconClick);
      }
    };
  }, [state]);

  const handleDelete = async (id: string) => {
    // First delete locally
    dispatch({ type: "DELETE_RECORD", payload: id });

    // Then sync with server
    const annotationService = new AnnotationService();
    const newFeedback = await annotationService.getCurrentPageFeedback();
    dispatch({ type: "SYNC_WITH_SERVER", payload: newFeedback });
  };

  return (
    <HighlighterContext.Provider value={{ state, dispatch, handleDelete }}>
      {children}
      {state.drafting && <RenderPop highlighting={state.drafting}></RenderPop>}
    </HighlighterContext.Provider>
  );
};

export const useHighlighterState = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      "useHighlighterState must be used within a HighlighterProvider"
    );
  }
  return context.state;
};

export const useHighlighterDispatch = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      "useHighlighterDispatch must be used within a HighlighterProvider"
    );
  }
  return context.dispatch;
};

export const useHighlighterDelete = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      "useHighlighterDelete must be used within a HighlighterProvider"
    );
  }
  return context.handleDelete;
};
